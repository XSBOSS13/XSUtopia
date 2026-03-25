export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  // Basic CORS support for local testing or split frontend/backend setups.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      reply: 'Method not allowed. Use POST.'
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      reply: 'Server is missing OPENAI_API_KEY.'
    });
  }

  try {
    const {
      model = 'gpt-4.1-mini',
      systemPrompt = 'You are XS Navigator, a calm and refined guide for XS Utopia.',
      message = '',
      temperature,
      max_output_tokens
    } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        reply: 'Missing "message" in request body.'
      });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature,
        max_output_tokens,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: systemPrompt
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: message
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        reply: data?.error?.message || 'OpenAI request failed.',
        error: data?.error || data
      });
    }

    const reply =
      data.output_text ||
      (Array.isArray(data.output)
        ? data.output
            .flatMap(item => Array.isArray(item.content) ? item.content : [])
            .map(item => item.text || '')
            .join('\n')
            .trim()
        : '');

    return res.status(200).json({
      reply: reply || 'No response text returned.',
      id: data.id,
      model: data.model
    });
  } catch (error) {
    return res.status(500).json({
      reply: 'Unexpected server error.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
// update
