import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Simple in-memory cache for demo performance and rate-limit prevention
const explanationCache = new Map();

/**
 * Generate a 1-sentence plain-English explanation of triggered fraud signals using OpenRouter LLM.
 * @param {string} nodeId - Node ID (e.g. "C7", "A7")
 * @param {string} nodeName - Node display name (e.g. "Elite Wellness Clinic")
 * @param {Array<string>} triggeredPatterns - Array of triggered pattern tags (e.g. ["shared_bank_account"])
 * @returns {Promise<string>}
 */
export async function generateExplanation(nodeId, nodeName, triggeredPatterns = []) {
  const entityLabel = nodeName || nodeId || 'This entity';

  if (!triggeredPatterns || triggeredPatterns.length === 0) {
    return `No fraud patterns detected for ${entityLabel}. Entity exhibits standard operational metrics and verified registry credentials.`;
  }

  // Generate cache key based on node ID and sorted patterns
  const cacheKey = `${nodeId || 'unknown'}_${[...triggeredPatterns].sort().join('_')}`;

  if (explanationCache.has(cacheKey)) {
    console.log(`⚡ [AI Cache Hit] Returning cached explanation for node '${nodeId}'`);
    return explanationCache.get(cacheKey);
  }

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';

  const signalsText = triggeredPatterns.map(p => p.replace(/_/g, ' ')).join(', ');
  const prompt = `Act as an expert healthcare fraud analyst. Explain in ONE direct, plain-English sentence why entity "${entityLabel}" is flagged for risk, given these specific graph fraud signals: ${signalsText}. Be concise, factual, and direct without preamble or disclaimers.`;

  const fallbackText = `Risk factors detected for ${entityLabel}: ${signalsText}.`;

  if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your-key')) {
    try {
      const endpoint = process.env.GROQ_API_KEY && !process.env.OPENROUTER_API_KEY
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://openrouter.ai/api/v1/chat/completions';

      const response = await axios.post(
        endpoint,
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a healthcare fraud analyst assistant providing direct 1-sentence explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 100
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'Med-Fraud-Intelligence-Graph',
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );

      const aiText = response.data?.choices?.[0]?.message?.content?.trim();
      if (aiText) {
        // Strip quotes if LLM wraps in quotes
        const cleanedText = aiText.replace(/^["']|["']$/g, '');
        explanationCache.set(cacheKey, cleanedText);
        return cleanedText;
      }
    } catch (err) {
      console.warn(`⚠️ OpenRouter AI explanation API call failed (${err.message}). Using safe fallback.`);
    }
  }

  // Store fallback in cache
  explanationCache.set(cacheKey, fallbackText);
  return fallbackText;
}

export function clearExplanationCache() {
  explanationCache.clear();
}
