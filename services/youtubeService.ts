import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
}

export async function searchExerciseVideos(exercise: string): Promise<YouTubeVideo[]> {
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List top 5 YouTube tutorial IDs for "${exercise}". Return JSON array of objects: {id, title, channel}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              channel: { type: Type.STRING }
            },
            required: ["id", "title", "channel"]
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as YouTubeVideo[];
    }
  } catch (error) {
    console.error("Error searching for exercise videos:", error);
  }

  return [];
}
