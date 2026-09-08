import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generate a plain-English explanation of flagged fraud signals using OpenRouter AI or fallback engine.
 * @param {Array<string>} triggeredPatterns 
 * @returns {Promise<string>}
 */
export async function generateExplanation(triggeredPatterns = []) {
  if (!triggeredPatterns || triggeredPatterns.length === 0) {
    return 'No fraud patterns detected. Entity displays clean operational metrics.';
  }

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';

  const signalsText = triggeredPatterns.join(', ').replace(/_/g, ' ');
  const prompt = `Explain in one plain-English sentence why an entity is flagged as high risk, given these fraud signals: ${signalsText}. Be direct and concise.`;

  if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your-key') && !apiKey.includes('your-openrouter')) {
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
              content: 'You are a healthcare fraud analyst providing concise 1-sentence explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 150
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'Med-Fraud-Intelligence-Graph',
            'Content-Type': 'application/json'
          }
        }
      );

      const explanation = response.data?.choices?.[0]?.message?.content?.trim();
      if (explanation) {
        return explanation;
      }
    } catch (err) {
      console.warn('⚠️ AI Explanation API call failed, using rule-based fallback:', err.message);
    }
  }

  // Fallback 1-sentence explanation generator
  return `Flagged for suspicious graph activity including ${signalsText}, indicating potential collusion or registry manipulation.`;
}
