import { GoogleGenAI } from "@google/genai";

// Access window.aistudio safely by casting to any to avoid type declaration conflicts
// with existing environment definitions (e.g. AIStudio interface).

export const checkApiKey = async (): Promise<boolean> => {
  const win = window as any;
  if (win.aistudio) {
    return await win.aistudio.hasSelectedApiKey();
  }
  return true; // Fallback if not running in the specific environment
};

export const promptApiKeySelection = async () => {
  const win = window as any;
  if (win.aistudio) {
    await win.aistudio.openSelectKey();
  }
};

export const generateVeoVideo = async (
  imageBase64: string, 
  mimeType: string, 
  prompt: string
): Promise<string | null> => {
  try {
    // 1. Ensure API Key is selected
    const hasKey = await checkApiKey();
    if (!hasKey) {
      await promptApiKeySelection();
      // Double check after prompt
      const hasKeyAfter = await checkApiKey();
      if (!hasKeyAfter) throw new Error("API Key selection required.");
    }

    // 2. Initialize Client
    // process.env.API_KEY is available after selection
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 3. Start Generation
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Cinematic pan of this scene",
      image: {
        imageBytes: imageBase64,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9' // Landscape as per request
      }
    });

    // 4. Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log('Veo generation status:', operation.metadata);
    }

    // 5. Retrieve result
    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!videoUri) {
        throw new Error("No video URI returned from operation.");
    }

    // 6. Proxy the download with the API key
    // We return the raw URL, but the frontend needs to append the key to play/fetch it.
    // The instructions say: fetch(`${downloadLink}&key=${process.env.API_KEY}`)
    // However, for a <video src="...">, we can just return the string with the key appended.
    return `${videoUri}&key=${process.env.API_KEY}`;

  } catch (error) {
    console.error("Veo Generation Error:", error);
    throw error;
  }
};