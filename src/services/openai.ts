import OpenAI from "openai";

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function choose(text: string): Promise<string | null> {
  if (!openai) return null;
  try {
    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: text }],
      max_tokens: 5,
      temperature: 0,
    });
    return r.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.warn("OpenAI choose() error:", err);
    return null;
  }
}
