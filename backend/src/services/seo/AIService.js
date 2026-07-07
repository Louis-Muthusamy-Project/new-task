// Uses global fetch (Node.js 18+) — no external dependency required.

exports.generateJSON = async (prompt, systemPrompt = '', provider = 'gemini') => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  try {
    if (provider === 'gemini' && geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );
      if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } 
    
    if (provider === 'claude' && anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (!response.ok) throw new Error(`Anthropic API error: ${response.statusText}`);
      const data = await response.json();
      const text = data.content[0].text;
      // Extract JSON block if present
      const jsonMatch = text.match(/\{[\s\S]*\}/) || text.match(/\[[\s\S]*\]/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    }

    if (provider === 'openai' && openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ]
        })
      });
      if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    }

    // Default Fallback Mock Data if no keys or unsupported provider
    console.warn(`No API keys configured for SEO AI Service or unknown provider '${provider}'. Falling back to mock generator.`);
    return null;
  } catch (error) {
    console.error('AIService Error:', error);
    return null;
  }
};

exports.humanizeText = async (text, brandVoiceNotes = '') => {
  const systemPrompt = `You are a professional brand-voice SEO editor. Rewrite the provided text to make it read naturally, align with the brand guidelines, enhance E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness), and eliminate obvious AI writing tells (like "delve", "testament", "realm", repetitive structures). Keep the core message, layout and markdown structures intact.`;
  const prompt = `Brand Voice Guidelines: ${brandVoiceNotes || 'Friendly, professional, clear, direct'}\n\nText to humanize:\n${text}`;

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  
  // Decide provider
  const provider = anthropicKey ? 'claude' : geminiKey ? 'gemini' : 'mock';

  if (provider === 'claude') {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.content[0].text;
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (provider === 'gemini') {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Fallback
  return text + `\n\n*(Humanized with brand voice: ${brandVoiceNotes || 'Default friendly'} - simulated review)*`;
};
