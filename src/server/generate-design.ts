import { createServerFn } from "@tanstack/react-start";

type GenerateInput = { prompt: string };
type GenerateResult = {
  description: string;
  imageDataUrl: string;
};

/**
 * Generates a crochet design from a user prompt.
 * Returns BOTH a written description (Gemini text) AND an image (Gemini image).
 * Calls run server-side so the LOVABLE_API_KEY never leaves the server.
 */
export const generateDesign = createServerFn({ method: "POST" })
  .inputValidator((input: GenerateInput) => {
    if (!input?.prompt || typeof input.prompt !== "string") {
      throw new Error("Prompt is required.");
    }
    const trimmed = input.prompt.trim();
    if (trimmed.length < 3) throw new Error("Prompt is too short.");
    if (trimmed.length > 500) throw new Error("Prompt is too long (max 500 chars).");
    return { prompt: trimmed };
  })
  .handler(async ({ data }): Promise<GenerateResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured. LOVABLE_API_KEY missing.");

    const url = "https://ai.gateway.lovable.dev/v1/chat/completions";

    const styleBrief = `You are a master crochet pattern designer. The user described what they want; reply with a warm, evocative product description (2 short paragraphs, <120 words total) and then a "Pattern notes" line listing: stitch style, suggested yarn weight, suggested colors, approximate finished size, and difficulty (Beginner/Intermediate/Advanced). Format as plain prose, no markdown headings, no asterisks.`;

    // Run text + image in parallel.
    const [textRes, imageRes] = await Promise.all([
      fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: styleBrief },
            { role: "user", content: data.prompt },
          ],
        }),
      }),
      fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: `Generate a single product photograph of a handmade crochet item: ${data.prompt}. Style: warm natural light, oatmeal linen background, editorial flat-lay aesthetic, shallow depth of field, no text or logos.`,
            },
          ],
        }),
      }),
    ]);

    if (textRes.status === 429 || imageRes.status === 429) {
      throw new Error("Rate limit reached — please try again in a moment.");
    }
    if (textRes.status === 402 || imageRes.status === 402) {
      throw new Error("AI credits exhausted. Add credits in workspace settings.");
    }
    if (!textRes.ok) {
      throw new Error(`Text generation failed (${textRes.status}).`);
    }
    if (!imageRes.ok) {
      throw new Error(`Image generation failed (${imageRes.status}).`);
    }

    const textJson = await textRes.json();
    const imageJson = await imageRes.json();

    const description: string =
      textJson?.choices?.[0]?.message?.content?.trim() ?? "A bespoke handmade crochet piece.";
    const imageDataUrl: string | undefined =
      imageJson?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageDataUrl) {
      throw new Error("Image was not returned by the model. Try a more descriptive prompt.");
    }

    return { description, imageDataUrl };
  });
