import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, RenovationConfig, RenovationAnalysis, RoomType } from "../types";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // ignore
  }
  return undefined;
};

const getAiClient = async () => {
  let apiKey = getApiKey();
  try {
    const sysDoc = await getDoc(doc(db, "system", "config"));
    if (sysDoc.exists() && sysDoc.data().apiKey) {
      apiKey = sysDoc.data().apiKey;
    }
  } catch (e) {
    // Ignore error
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

const cleanBase64Data = (base64Str: string): { mimeType: string; data: string } => {
  const match = base64Str.match(/^data:([^;]+);base64,(.+)$/);
  let mimeType = 'image/jpeg';
  let cleanBase64 = '';

  if (match) {
    mimeType = match[1];
    cleanBase64 = match[2];
  } else {
    const parts = base64Str.split(',');
    if (parts.length === 2) {
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
      cleanBase64 = parts[1];
    } else {
      cleanBase64 = base64Str;
    }
  }
  return {
    mimeType,
    data: cleanBase64.replace(/[\s\r\n]+/g, '')
  };
};

const getBestAspectRatio = async (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      const supported = [
        { id: "1:1", value: 1.0 },
        { id: "3:4", value: 3/4 }, 
        { id: "4:3", value: 4/3 }, 
        { id: "9:16", value: 9/16 }, 
        { id: "16:9", value: 16/9 }
      ];
      const closest = supported.reduce((prev, curr) => {
        return (Math.abs(curr.value - ratio) < Math.abs(prev.value - ratio) ? curr : prev);
      });
      resolve(closest.id);
    };
    img.onerror = () => {
      resolve("4:3");
    };
    img.src = base64Str;
  });
};

/**
 * Retries an async operation with exponential backoff if it fails with transient errors (503, 500).
 * Supports both standard Error objects and stringified JSON errors.
 * Increased retries to 5 for Nano Banana Pro stability.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 3000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errString = JSON.stringify(error, null, 2);
    const errMsg = (error?.message || '').toLowerCase();
    
    // Detailed check for 503/500/Overloaded in various formats
    const isRetryable = 
      error?.status === 503 || 
      error?.code === 503 || 
      error?.status === 500 || 
      error?.code === 500 ||
      errMsg.includes('overloaded') ||
      errMsg.includes('internal error') ||
      errMsg.includes('503') ||
      errMsg.includes('500') ||
      errString.includes('"code":503') ||
      errString.includes('"status":"UNAVAILABLE"') ||
      errString.includes('"code":500');
    
    if (isRetryable && retries > 0) {
      console.warn(`API Error (${error?.status || '503/500'}). Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(r => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2); // Double the delay for next retry
    }
    throw error;
  }
}

export const generateRenovation = async (
  base64Image: string,
  config: RenovationConfig
): Promise<string> => {
  const ai = await getAiClient();
  const { mimeType, data } = cleanBase64Data(base64Image);
  const aspectRatio = await getBestAspectRatio(base64Image);

  let furnitureInstruction = "";
  if (config.selectedFurniture && config.selectedFurniture.length > 0) {
    furnitureInstruction = `- Required Furniture Elements: ${config.selectedFurniture.join(', ')}. Place these naturally within the existing layout, respecting the room's scale.`;
  }

  const colorInstruction = config.colorPreference && config.colorPreference.length > 0 
    ? `Color Palette: ${config.colorPreference.join(', ')}`
    : 'Color Palette: Neutral and harmonious';

  const roomDescription = config.roomType === RoomType.Other && config.customRoomType 
    ? config.customRoomType 
    : config.roomType;

  // Use Dimensions in generation prompt if available to help with scale
  let dimensionContext = "";
  if (config.dimensions) {
    if (config.dimensions.area) dimensionContext += `Approximate Area: ${config.dimensions.area} m². `;
  }

  const prompt = `
    You are Podmayak AI, an expert architectural visualization engine using "Image-to-Image" transformation.
    
    CRITICAL INSTRUCTION: PRESERVE THE CAMERA ANGLE AND ROOM GEOMETRY 100%.
    Your task is to renovate the EXACT room shown in the input image. You act as a texturing engine, applying materials to the EXISTING surfaces.
    
    STRICT CONSTRAINTS (ZERO TOLERANCE FOR DEVIATION):
    1. CAMERA: DO NOT change the camera angle, perspective, or focal length. The output must perfectly align with the input image. If the photo is taken from the side, the output MUST be from the side.
    2. GEOMETRY: DO NOT move, remove, or reshape walls, windows, doors, or ceiling beams. The structural shell must be identical.
    3. SCALE: DO NOT resize the room. Keep the existing floor area and ceiling height exactly as they are.
    4. VIEW: DO NOT hallucinate a different view (e.g., if input is a corner view, do not output a front view).
    
    RENNOVATION SPECS:
    - Target Room: ${roomDescription}
    - Style: ${config.style}
    - ${colorInstruction}
    - Flooring: Cover the existing floor surface with ${config.flooring}.
    - Walls: Finish the existing raw walls with paint/wallpaper suitable for ${config.style}.
    - Ceiling: Finish the existing ceiling cleanly.
    ${furnitureInstruction}
    
    Use the input image as the absolute ground truth for structure. Only change the "skin" (materials) and add furniture within the existing empty space.
    Output quality: 8k resolution, photorealistic.
  `;

  // Nano Banana Pro = 'gemini-3-pro-image-preview'
  // Strictly enforce this model as requested by user.
  const modelName = 'gemini-3-pro-image-preview';

  try {
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: modelName,
      // Strictly format contents as an array of parts to ensure SDK compliance
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data } }
        ],
      }],
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: config.size,
        },
      },
    }));

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");

  } catch (error) {
    console.error("Renovation generation failed on Pro model:", error);
    throw error;
  }
};

export const editRenovation = async (
  originalImage: string,
  maskImage: string,
  editPrompt: string
): Promise<string> => {
  const ai = await getAiClient();
  const original = cleanBase64Data(originalImage);
  const mask = cleanBase64Data(maskImage);
  const aspectRatio = await getBestAspectRatio(originalImage);
  
  const prompt = `
    TASK: Edit the provided image based on the mask and user instruction.
    USER INSTRUCTION: ${editPrompt}
    
    CONSTRAINTS:
    1. Only modify the area highlighted by the white pixels in the provided mask image.
    2. The rest of the image (black pixels in mask) MUST remain exactly identical.
    3. Blend the edits seamlessly with the lighting and perspective of the room.
    4. Maintain high photorealism.
  `;

  try {
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // Supports masking/multimodal editing
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: original.mimeType, data: original.data } },
          { inlineData: { mimeType: mask.mimeType, data: mask.data } } // Sending mask as second image
        ],
      }],
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: '1K',
        },
      },
    }));

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image generated.");
  } catch (error) {
    console.error("Magic Edit failed:", error);
    throw error;
  }
};

export const analyzeRenovationPlan = async (
  originalImage: string,
  generatedImage: string,
  config: RenovationConfig
): Promise<RenovationAnalysis> => {
  const ai = await getAiClient();
  
  const original = cleanBase64Data(originalImage);
  const generated = cleanBase64Data(generatedImage);

  const countryContext = config.country ? `Context: The renovation is taking place in ${config.country}.` : "";
  const currencyContext = config.country === 'Azerbaijan' 
    ? "Provide budget estimates in Azerbaijani Manat (AZN)." 
    : `Provide budget estimates in the local currency of ${config.country}.`;

  // Include Dimensions in context
  let dimensionContext = "";
  if (config.dimensions) {
    if (config.dimensions.area) dimensionContext += `Room Area: ${config.dimensions.area} m². `;
    if (config.dimensions.width && config.dimensions.length) dimensionContext += `Dimensions: ${config.dimensions.width}m x ${config.dimensions.length}m. `;
  }
  if (!dimensionContext) dimensionContext = "Estimate area based on visual cues.";

  const prompt = `
    Sən Podmayak AI, peşəkar tikinti mühəndisi və interyer dizaynerisən.
    Bu iki şəklə bax: 
    1. "Before" (Podmayak/Təmirsiz).
    2. "After" (Dizayn edilmiş).

    ${countryContext}
    ${dimensionContext}
    
    Azərbaycan dilində JSON formatında təmir planı hazırla.
    
    YALNIZ bu strukturda JSON qaytar:
    {
      "estimatedBudgetRange": "string (məs: 5,000 - 8,000 AZN)",
      "difficultyLevel": "Asan" | "Orta" | "Çətin",
      "materials": ["string", "string"],
      "furnitureToBuy": ["string", "string"],
      "designTips": ["string", "string"],
      "steps": ["string", "string"]
    }
    
    Tələblər:
    - Büdcəni ${config.country || 'Azərbaycan'} bazar qiymətlərinə uyğun hesablla, sahəni nəzərə al.
    - ${currencyContext}
    - "After" şəklində istifadə olunan konkret materialları müəyyən et.
    - Təmir addımlarını ardıcıllıqla yaz.
  `;

  const tryAnalyze = async (model: string) => {
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: model,
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: original.mimeType, data: original.data } },
          { inlineData: { mimeType: generated.mimeType, data: generated.data } }
        ]
      }],
      config: {
        responseMimeType: "application/json"
      }
    }));

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No analysis generated");

    return JSON.parse(text) as RenovationAnalysis;
  };

  try {
    return await tryAnalyze('gemini-3-pro-preview');
  } catch (error) {
    console.warn("Analysis Pro model failed, falling back to Flash...", error);
    try {
      return await tryAnalyze('gemini-2.5-flash');
    } catch (fallbackError) {
      console.error("Analysis fallback failed", fallbackError);
      return {
        estimatedBudgetRange: "Hesablamaq mümkün olmadı",
        difficultyLevel: "Orta",
        materials: ["Boya", "Laminat", "İşıqlandırma"],
        furnitureToBuy: ["Şəkildə görünən mebellər"],
        designTips: ["Dəqiq qiymət üçün ustaya müraciət edin."],
        steps: ["Otağı təmizləyin", "Elektrik işləri", "Divarlar", "Döşəmə"]
      };
    }
  }
};

export const streamChatResponse = async (
  history: ChatMessage[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<void> => {
  const ai = await getAiClient();
  
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "Sən Podmayak AI, peşəkar interyer dizayner və təmir ustasısan. İstifadəçilərə 'podmayak' mənzillərin təmiri, dizayn üslubları, material seçimi və büdcə planlaması barədə Azərbaycan dilində məsləhət verirsən. Cavabların səmimi, praktiki və köməkçi olmalıdır.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            onChunk(c.text);
        }
    }
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};
