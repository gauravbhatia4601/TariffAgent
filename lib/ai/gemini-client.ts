/**
 * Gemini API Client for TariffAgent
 * Initializes and configures Google Gemini API for HS code classification
 */

import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';

// Configuration
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
const TEMPERATURE = parseFloat(process.env.GEMINI_TEMPERATURE || '0.1');
const MAX_OUTPUT_TOKENS = parseInt(process.env.GEMINI_MAX_TOKENS || '2048', 10);

// Singleton instance
let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

/**
 * Get or create the Gemini AI client
 */
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY not found in environment variables. ' +
        'Please set it in your .env.local file.'
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Get the configured Gemini model
 */
export function getModel(): GenerativeModel {
  if (!model) {
    model = getGenAI().getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: TEMPERATURE,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        responseMimeType: 'application/json',
      },
    });
  }
  return model;
}

/**
 * Generate content using Gemini API
 * @param prompt - The prompt to send to Gemini
 * @returns Generated text response
 */
export async function generateContent(prompt: string): Promise<string> {
  const geminiModel = getModel();

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes('429')) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('403')) {
        throw new Error('API key invalid or unauthorized.');
      }
      if (error.message.includes('500')) {
        throw new Error('Gemini API server error. Please try again.');
      }
    }
    throw error;
  }
}

/**
 * Generate content with vision (image input)
 * Used for invoice/document image processing
 * @param prompt - The prompt to send to Gemini
 * @param imageBase64 - Base64 encoded image data
 * @param mimeType - Image MIME type (default: image/jpeg)
 * @returns Generated text response
 */
export async function generateWithVision(
  prompt: string,
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const geminiModel = getModel();

  // Prepare image part
  const imagePart: Part = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType,
    },
  };

  try {
    const result = await geminiModel.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes('429')) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('403')) {
        throw new Error('API key invalid or unauthorized.');
      }
      if (error.message.includes('500')) {
        throw new Error('Gemini API server error. Please try again.');
      }
    }
    throw error;
  }
}

/**
 * Test API connection
 * @returns true if API is accessible
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await generateContent('Respond with {"status": "ok"}');
    return result.includes('ok');
  } catch {
    return false;
  }
}

/**
 * Get current model configuration
 */
export function getModelConfig() {
  return {
    model: GEMINI_MODEL,
    temperature: TEMPERATURE,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  };
}
