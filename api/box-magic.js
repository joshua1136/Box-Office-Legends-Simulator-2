import { ai } from 'hatchable';

export const access = 'public';
export const methods = ['POST'];

export default async function (req, res) {
  const body = req.body || {};
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
  const genre = typeof body.genre === 'string' ? body.genre.trim().slice(0, 60) : 'Drama';
  const tone = typeof body.tone === 'string' ? body.tone.trim().slice(0, 60) : 'Emotional';
  const currentHook = typeof body.hook === 'string' ? body.hook.trim().slice(0, 600) : '';

  const prompt = `Create 3 distinct movie story-hook options for a movie simulator.
Title: ${title || 'Untitled Film'}
Genre: ${genre}
Tone: ${tone}
Current hook: ${currentHook || '(none)'}

Rules:
- Each option must be 1-2 sentences.
- Make them cinematic, specific, memorable, and easy to understand.
- Do not write a full synopsis.
- Avoid cliches and generic phrases.
- Keep each option under 45 words.
- Return exactly 3 options, one per line, numbered 1., 2., 3.`;

  try {
    const result = await ai.generateText({
      model: 'gpt',
      purpose: 'box-magic-hook',
      system: 'You are Box Magic, a concise creative development assistant inside a movie-making simulator. Help players discover strong hooks without taking creative control away from them.',
      prompt,
      maxTokens: 300,
    });

    if (result.finishReason === 'length') {
      return res.status(502).json({ error: 'Box Magic response was truncated. Please try again.' });
    }

    const options = result.text
      .split(/\n+/)
      .map(x => x.trim().replace(/^\d+[.)]\s*/, ''))
      .filter(Boolean)
      .slice(0, 3);

    res.json({ options, model: 'ChatGPT', usage: result.usage || null });
  } catch (error) {
    console.error('Box Magic failed:', error);
    res.status(502).json({ error: 'Box Magic is unavailable right now. Try again in a moment.' });
  }
}