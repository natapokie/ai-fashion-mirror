import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';

import { featureExtractionContext, generateRAGPrompt } from '../utils/gptPrompts';
import { GptResponse, ProductData, QueriedProduct } from '../utils/types';

const ProductInfo = z.object({
  image: z.string(),
  name: z.string(),
  feedback: z.string(),
});

const FullRecommendation = z.object({
  product_list: z.array(ProductInfo),
});

export class GptService {
  // step 1: call gpt to extract user features from image
  async gptExtractFeatures(base64Img: string): Promise<GptResponse> {
    const openai = new OpenAI();
    const base64Image = base64Img;

    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        // { role: 'system', content: `${gptSystemContext}. Make sure the image url ends in "jpg" ` },
        { role: 'system', content: `${featureExtractionContext}` }, // feb2: used for feature extraction
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        },
      ],
      // response_format: zodResponseFormat(FullRecommendation, 'full_response'), //feb 2: not used for feature extraction
    });

    const full_response = completion;
    console.log(full_response);

    // validate the response format to be json
    try {
      JSON.parse(JSON.stringify(full_response)); // Serialize and parse to ensure valid JSON
    } catch {
      throw new Error('Invalid response format (not valid JSON)');
    }

    console.log('gpt response: ', full_response);

    // --------------------------------------
    // feb 2: attempt to embed the features from the response
    const features = full_response.choices[0].message.content;
    console.log('Features:', features);
    // const embedding = await openai.embeddings.create({
    //   model: 'text-embedding-ada-002',
    //   input: String(features),
    //   encoding_format: 'float',
    // });
    // console.log('Embeddings:', embedding.data[0].embedding);
    // --------------------------------------

    // DEBUG: save the response for debug purposes
    const dir = path.join(__dirname, '../../__uploads');
    const filePath = path.join(dir, `${Date.now()}.json`);
    // Write the JSON content to the file
    fs.writeFile(filePath, JSON.stringify(full_response, null, 2), (err) => {
      if (err) {
        console.error('Error writing JSON to file:', err);
      } else {
        console.log(`JSON file saved to ${filePath}`);
      }
    });

    return full_response;
  }

  // step 2: call gpt to generate embeddings for querying
  async createEmbeddings(text: string): Promise<number[]> {
    try {
      const openai = new OpenAI();
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: String(text),
        encoding_format: 'float',
      });
      return embedding.data[0].embedding;
    } catch (error) {
      console.error('Error creating embeddings:', error);
      throw error;
    }
  }

  // step 3: query pinecone

  // step 4: call gpt with RAG to get recommendation reasonings (feedback)
  async gptRAGFeedback(
    userFeatures: string,
    queriedProducts: QueriedProduct[],
  ): Promise<ProductData[]> {
    const openai = new OpenAI();

    // Generate the RAG prompt using extracted features
    const ragPrompt = generateRAGPrompt(userFeatures, queriedProducts);

    // Call OpenAI with RAG prompt
    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        { role: 'system', content: 'You are a fashion recommendation assistant.' },
        { role: 'user', content: ragPrompt },
      ],
      response_format: zodResponseFormat(FullRecommendation, 'full_response'),
    });

    console.log('Completion Response:', completion);

    // Ensure choices exist
    // const gptResponse = completion.choices?.[0]?.message?.parsed?.product_list;
    const gptResponse = completion.choices?.[0]?.message?.parsed?.product_list ?? [];

    if (!gptResponse) {
      console.error('Error: RAG GPT response is null or malformed.');
      return []; // Return empty array to prevent crashes
    }

    // Convert response to expected ProductData format
    return gptResponse.map((product: z.infer<typeof ProductInfo>) => ({
      name: product.name,
      image: product.image ?? 'MISSING Image URL', // Ensure it is the correct image URL
      feedback: product.feedback ?? 'No specific feedback provided',
    }));
  }
}
