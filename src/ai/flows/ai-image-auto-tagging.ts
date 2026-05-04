'use server';
/**
 * @fileOverview An AI agent for automatically suggesting tags and captions for images.
 *
 * - aiImageAutoTagging - A function that handles the image auto-tagging and captioning process.
 * - AiImageAutoTaggingInput - The input type for the aiImageAutoTagging function.
 * - AiImageAutoTaggingOutput - The return type for the aiImageAutoTagging function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiImageAutoTaggingInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of an image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiImageAutoTaggingInput = z.infer<typeof AiImageAutoTaggingInputSchema>;

const AiImageAutoTaggingOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of relevant tags for the image.'),
  caption: z.string().describe('A concise initial caption for the image.'),
});
export type AiImageAutoTaggingOutput = z.infer<typeof AiImageAutoTaggingOutputSchema>;

export async function aiImageAutoTagging(input: AiImageAutoTaggingInput): Promise<AiImageAutoTaggingOutput> {
  return aiImageAutoTaggingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiImageAutoTaggingPrompt',
  input: {schema: AiImageAutoTaggingInputSchema},
  output: {schema: AiImageAutoTaggingOutputSchema},
  prompt: `You are an expert image analyst. Based on the provided image, suggest relevant tags and a concise initial caption.

Image: {{media url=imageDataUri}}`,
});

const aiImageAutoTaggingFlow = ai.defineFlow(
  {
    name: 'aiImageAutoTaggingFlow',
    inputSchema: AiImageAutoTaggingInputSchema,
    outputSchema: AiImageAutoTaggingOutputSchema,
  },
  async input => {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (err: any) {
        attempts++;
        const errorMessage = err.message || String(err);
        
        // Retry on 503 (Service Unavailable), 429 (Rate Limit), or general high demand errors
        const isRetryable = 
          errorMessage.includes('503') || 
          errorMessage.includes('429') || 
          errorMessage.includes('Service Unavailable') || 
          errorMessage.includes('high demand');
          
        if (isRetryable && attempts < maxAttempts) {
          // Exponential backoff: wait 2s, then 4s...
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
          continue;
        }
        
        // If not retryable or we've exhausted attempts, rethrow
        throw err;
      }
    }
    throw new Error('AI Auto-tagging failed after multiple attempts');
  }
);
