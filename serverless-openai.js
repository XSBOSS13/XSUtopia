
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ reply: 'Method not allowed' });
    return;
  }

  try {
    const { model = 'gpt-4.1-mini', systemPrompt = '', message = '' } = req.body || {};

    const openaiRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: systemPrompt || 'You are XS Navigator, a guide for XS Utopia.' },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await openaiRes.json();
    const reply =
      data.output_text ||
      data.output?.map(item => item?.content?.map(c => c?.text).join(' ')).join(' ') ||
      'No response text available';

    res.status(200).json({ reply, raw: data });
  } catch (error) {
    res.status(500).json({ reply: 'Server error', error: error.message });
  }
}
