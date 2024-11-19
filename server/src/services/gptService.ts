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
import { GptResponse } from '../../../shared/types';
import { gptSystemContext } from '../utils/gptServiceHelper';
import dotenv from 'dotenv';
dotenv.config();

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

  public async sendToGpt(base64Img: string): Promise<GptResponse> {
    const openai = new OpenAI();
    const base64Image = base64Img;
    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        { role: 'system', content: `${gptSystemContext}. Make sure the image url ends in "jpg" ` },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        },
      ],
      response_format: zodResponseFormat(FullRecommendation, 'full_response'),
    });

    const full_response = completion;
    console.log(full_response);
    return full_response;
  }
}
