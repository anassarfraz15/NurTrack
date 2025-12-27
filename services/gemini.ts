import { GoogleGenAI, Type } from "@google/genai";

export async function getSpiritualMotivation(
  streak: number, 
  performance: string, 
  lastMissed?: string
) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User stats: Current Streak ${streak} days, Performance: ${performance}. Last missed prayer: ${lastMissed || 'None'}. Provide a brief, beautiful, and motivating Islamic message (Ayah or Hadith) with an encouraging reflection. Keep it peaceful and inspiring, not guilt-tripping.`,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            source: { type: Type.STRING },
            reflection: { type: Type.STRING }
          },
          required: ["message", "source", "reflection"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      message: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.",
      source: "Prophet Muhammad (ﷺ)",
      reflection: "Keep moving forward, one prayer at a time."
    };
  }
}

export async function getIslamicCalendarData() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const today = new Date().toISOString();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Current date is ${today}. Provide a list of the next 3 significant Islamic events (e.g., Ramadan start, Eid al-Fitr, Eid al-Adha, Islamic New Year). For each, provide the name, expected Hijri date, and the estimated Gregorian date. Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hijriDate: { type: Type.STRING },
                  gregorianDate: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "hijriDate", "gregorianDate"]
              }
            }
          },
          required: ["events"]
        }
      }
    });
    return JSON.parse(response.text || '{"events":[]}');
  } catch (error) {
    console.error("Calendar Sync Error:", error);
    return { events: [] };
  }
}

export async function getPrayerInsights(logs: any[]) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these prayer logs: ${JSON.stringify(logs)}. Identify trends like 'Most missed prayer' or 'Best prayer consistency' and provide 3 actionable, friendly improvement tips based on Islamic productivity principles.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["summary", "tips"]
        }
      }
    });
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}
