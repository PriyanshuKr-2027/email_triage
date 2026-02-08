import axios from 'axios';
import { TriageResult } from '@/app/types';
import Groq from 'groq-sdk';

const SCALEDOWN_API_URL = "https://api.scaledown.xyz/compress/raw/";

export interface SimplifiedEmail {
    id: string;
    from: string;
    subject: string;
    body: string;
}

export async function processEmailWithScaleDown(email: SimplifiedEmail, groqApiKey: string): Promise<TriageResult> {
    if (!groqApiKey) throw new Error("Missing Groq API Key");

    // Use the same key for ScaleDown as requested by user
    const scaleDownApiKey = groqApiKey;
    const groq = new Groq({ apiKey: groqApiKey });

    const prompt = `
    You are an expert email triage assistant. 
    Analyze the following email and provide a JSON response with the following fields:
    - category: (Urgent, Work, Personal, Newsletter, Spam)
    - summary: A brief 1-sentence summary of the content.
    - suggestedResponse: A suggested response if a reply is needed, otherwise null.
    - action: Recommended action (Reply, Archive, Delete, Review).
    
    IMPORTANT: Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json. Ensure "summary" is always populated.

    Email Subject: ${email.subject}
    Email Sender: ${email.from}
    Email Body:
    ${email.body.substring(0, 5000)} 
    `;

    // Default to using the original prompt
    let finalPrompt = prompt;

    // 1. Attempt Compression with ScaleDown (only for longer emails)
    if (email.body.length > 500) {
        const payload = {
            "context": "Email Triage and Categorization. usage: JSON output only.",
            "prompt": prompt,
            "model": "gpt-4o",
            "scaledown": {
                "rate": "auto"
            }
        };

        try {
            console.log(`[ScaleDown] Compressing email ${email.id}...`);
            const scaleDownResponse = await axios.post(SCALEDOWN_API_URL, payload, {
                headers: {
                    'x-api-key': scaleDownApiKey,
                    'Content-Type': 'application/json'
                }
            });

            const compressed = scaleDownResponse.data?.results?.compressed_prompt;

            if (compressed && compressed.length > 50) {
                console.log(`[ScaleDown] Success. Original tokens: ${scaleDownResponse.data.results.original_prompt_tokens} -> Compressed tokens: ${scaleDownResponse.data.results.compressed_prompt_tokens}`);
                finalPrompt = compressed;
            } else {
                console.warn("[ScaleDown] Compressed prompt was empty or suspicious. Using original prompt.");
            }

        } catch (error) {
            console.warn("[ScaleDown] Compression failed (using original prompt):", error instanceof Error ? error.message : String(error));
        }
    } else {
        console.log(`[ScaleDown] Skipping compression for short email ${email.id}`);
    }

    try {
        // 2. Infer with Groq
        console.log(`[Groq] Inferring with openai/gpt-oss-120b...`);
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "user",
                    content: finalPrompt
                }
            ],
            temperature: 0.3, // Lower temp for more deterministic JSON
            max_completion_tokens: 8192,
            top_p: 1,
            reasoning_effort: "medium" as any,
            stop: null
        });

        const content = completion.choices[0]?.message?.content || "";

        // 3. Parse JSON
        let jsonContent = content;
        // Clean up markdown code blocks if present
        if (typeof jsonContent === 'string') {
            jsonContent = jsonContent.replace(/```json/g, '').replace(/```/g, '').trim();
            // Attempt to find the first '{' and last '}'
            const firstBrace = jsonContent.indexOf('{');
            const lastBrace = jsonContent.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
            }
        }

        try {
            const parsed = JSON.parse(jsonContent);
            return {
                emailId: email.id,
                ...parsed,
                // Ensure required fields exist even if AI missed them
                category: parsed.category || 'Review',
                summary: parsed.summary || 'No summary generated.',
                action: parsed.action || 'Review',
                suggestedResponse: parsed.suggestedResponse || undefined
            };
        } catch (e) {
            console.error("Failed to parse JSON from AI response", content);
            return {
                emailId: email.id,
                category: 'Review',
                summary: 'Failed to process AI response: ' + content.substring(0, 100),
                action: 'Review',
                suggestedResponse: undefined
            };
        }

    } catch (error) {
        console.error("AI Processing Error:", error);
        throw error;
    }
}
