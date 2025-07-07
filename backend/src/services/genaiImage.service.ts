import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Modality } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class GenAIImageService {
  private ai: GoogleGenAI;
  private model: string;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    // Use the correct Gemini 2.0 image generation model name
    this.model = 'gemini-2.0-flash-preview-image-generation';
  }

  async generateImage(
    prompt: string,
  ): Promise<{ buffer: Buffer; ext: string }> {
    console.log('[GenAIImageService] Generating image for prompt:', prompt);
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });
    // Find the first image part in the response
    const candidates = response.candidates || [];
    if (
      !candidates.length ||
      !candidates[0].content ||
      !candidates[0].content.parts
    ) {
      console.error(
        '[GenAIImageService] No candidates or parts in Gemini response:',
        response,
      );
      throw new Error('No candidates or parts in Gemini response');
    }
    const parts = candidates[0].content.parts;
    for (const part of parts) {
      if (
        part.inlineData &&
        typeof part.inlineData.data === 'string' &&
        typeof part.inlineData.mimeType === 'string'
      ) {
        const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
        const ext = part.inlineData.mimeType.split('/')[1] || 'png';
        console.log(
          '[GenAIImageService] Image buffer created, size:',
          imageBuffer.length,
          'ext:',
          ext,
        );
        return { buffer: imageBuffer, ext };
      }
    }
    console.error(
      '[GenAIImageService] No image data returned from Gemini:',
      response,
    );
    throw new Error('No image data returned from Gemini');
  }
}
