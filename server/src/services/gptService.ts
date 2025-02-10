// import axios from 'axios';
// import dotenv from 'dotenv';
// import { GptResponse } from '../../../shared/types';
// import { gptSystemContext } from '../utils/gptServiceHelper';
// dotenv.config();

// export class GptService {
//   private async blobToBase64(blob: Blob): Promise<string> {
//     const arrayBuffer = await blob.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     return buffer.toString('base64');
//   }

//   public async doSomething(str: string): Promise<string> {
//     console.log('inside the gpt service');
//     console.log(str);
//     return str;
//   }

//   // public async sendToGpt(buffer: Buffer): Promise<GptResponse> {
//   public async sendToGpt(base64Img: string): Promise<GptResponse> {
//     try {
//       // console.log('sending to chatgpt...');
//       // if (!buffer) {
//       //   throw new Error('No image buffer');
//       // }

//       // const base64Image = buffer.toString('base64');
//       const base64Image = base64Img;
//       const requestData = {
//         model: 'gpt-4o',
//         messages: [
//           {
//             role: 'system',
//             content: `${gptSystemContext}. Always return a JSON array. Do not include any additional text or explanations.`,
//           },
//           {
//             role: 'user',
//             content: [
//               {
//                 type: 'image_url',
//                 image_url: {
//                   url: `data:image/jpeg;base64,${base64Image}`,
//                 },
//                 // type: 'text',
//                 // text: gptPrompt,
//               },
//             ],
//           },
//         ],
//         max_tokens: 4096,
//       };

//       const config = {
//         method: 'post',
//         url: 'https://api.openai.com/v1/chat/completions',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//         },
//         data: requestData,
//         validateStatus: (status: number): boolean => status < 500,
//       };

//       const response = await axios.request(config);

//       if (response.status !== 200) {
//         console.error('API Error:', response.data);
//         throw new Error(`API returned status ${response.status}: ${JSON.stringify(response.data)}`);
//       }
//       console.log('called chatgpt:\n', response.data.choices[0].message.content);
//       return response.data;
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         console.error('Full error response:', error.response?.data);
//       }
//       console.error('Error calling OpenAI API:', error);
//       throw error;
//     }
//   }
// }

// nov 18 note:
// modified to use structured output, see https://platform.openai.com/docs/guides/structured-outputs?context=with_parse#how-to-use
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

import OpenAI from 'openai';
import { GptResponse, ProductData, QueriedProduct } from '../../../shared/types';
import { featureExtractionContext } from '../utils/gptServiceHelper';
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';

import { generateRAGPrompt } from '../utils/gptServiceHelper';

const ProductInfo = z.object({
  image: z.string(),
  name: z.string(),
  feedback: z.string(),
});

const FullRecommendation = z.object({
  product_list: z.array(ProductInfo),
});

export class GptService {
  private async blobToBase64(blob: Blob): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
  }

  public async doSomething(str: string): Promise<string> {
    console.log('inside the gpt service');
    console.log(str);
    return str;
  }

  public async createEmbeddings(text: string): Promise<number[]> {
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

  public async sendToGpt(base64Img: string): Promise<GptResponse> {
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

  public async sendToGptWithRAG(
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
      feedback: product.feedback,
    }));
  }
}
