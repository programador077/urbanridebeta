import { GoogleGenAI, Type } from "@google/genai";
import { GeminiSource, VehicleType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to extract sources from Grounding Metadata
 */
const extractSources = (response: any): GeminiSource[] => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return chunks.map((c: any) => {
    if (c.web) return { title: c.web.title, uri: c.web.uri };
    if (c.maps) return { title: c.maps.title, uri: c.maps.uri }; 
    return null;
  }).filter((s: GeminiSource | null) => s !== null) as GeminiSource[];
};

/**
 * Uses Maps Grounding to find location details or places.
 */
export const findPlace = async (query: string, userLat?: number, userLng?: number): Promise<{ text: string, sources: GeminiSource[] }> => {
  try {
    const modelId = "gemini-2.5-flash";
    const toolConfig = (userLat && userLng) ? {
      retrievalConfig: {
        latLng: {
          latitude: userLat,
          longitude: userLng
        }
      }
    } : undefined;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Busca información sobre este lugar: ${query}. Devuelve un resumen corto en español sobre la dirección o lugar.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: toolConfig,
      },
    });

    return {
      text: response.text || "Detalles de ubicación encontrados.",
      sources: extractSources(response)
    };
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    return { text: "No se pudieron encontrar detalles de la ubicación en este momento.", sources: [] };
  }
};

/**
 * Uses Search Grounding to check for traffic or route conditions.
 */
export const checkTrafficConditions = async (origin: string, destination: string): Promise<{ text: string, sources: GeminiSource[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `¿Cuáles son las condiciones de tráfico actuales o el mejor consejo de ruta para ir en auto desde ${origin} hasta ${destination} en La Rioja, Argentina? Responde en español y sé conciso.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    return {
      text: response.text || "Información de tráfico no disponible.",
      sources: extractSources(response)
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return { text: "No se pudo obtener el tráfico en tiempo real.", sources: [] };
  }
};

/**
 * Uses General Intelligence to analyze pricing or give driver tips.
 */
export const analyzeRidePrice = async (distanceKm: number, timeMin: number, vehicleType: VehicleType = 'auto'): Promise<{ analysis: string, suggestedPrice: number }> => {
  try {
    const prompt = `
      Actúa como un algoritmo de precios de viajes compartidos para Argentina.
      Tipo de vehículo: ${vehicleType}.
      Distancia: ${distanceKm} km.
      Tiempo: ${timeMin} minutos.
      Tarifa base aproximada (auto): 800 ARS. Costo por km (auto): 400 ARS.
      Moto es 30% más barato. Envíos Flash es 10% más barato.
      
      1. Calcula un precio justo en ARS.
      2. Da una explicación de 1 oración en ESPAÑOL sobre el aumento o descuento de precio basado en la hora del día (asume que está concurrido) y el tipo de vehículo.
      
      Return JSON: { "analysis": string, "suggestedPrice": number }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            suggestedPrice: { type: Type.NUMBER },
          },
        },
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Price Analysis Error:", error);
    // Fallback calculation
    let base = 800 + (distanceKm * 400);
    if (vehicleType === 'moto') base *= 0.7;
    if (vehicleType === 'flash') base *= 0.9;
    return {
      analysis: "Cálculo estándar basado en distancia.",
      suggestedPrice: Math.round(base)
    };
  }
};

/**
 * Generates a smart reply for the driver chat based on ride status.
 */
export const generateSmartReply = async (message: string, rideStatus: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Eres un conductor de Uber/rideshare amigable. El pasajero te envió: "${message}". Estado del viaje: ${rideStatus}. Responde con un mensaje corto, útil y profesional en español (máximo 10 palabras).`,
    });
    return response.text || "Ok, entendido.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Ok.";
  }
};