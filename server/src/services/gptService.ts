import axios from 'axios';
import dotenv from 'dotenv';
import { GptResponse } from '../../../shared/types';
import { gptSystemContext } from '../utils/gptServiceHelper';
dotenv.config();

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

  // public async sendToGpt(buffer: Buffer): Promise<GptResponse> {
  public async sendToGpt(base64Img: string): Promise<GptResponse> {
    try {
      // console.log('sending to chatgpt...');
      // if (!buffer) {
      //   throw new Error('No image buffer');
      // }

      // const base64Image = buffer.toString('base64');
      const base64Image = base64Img;
      const requestData = {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: gptSystemContext,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
                // type: 'text',
                // text: gptPrompt,
              },
            ],
          },
        ],
        max_tokens: 4096,
      };

      const config = {
        method: 'post',
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        data: requestData,
        validateStatus: (status: number): boolean => status < 500,
      };

      const response = await axios.request(config);

      if (response.status !== 200) {
        console.error('API Error:', response.data);
        throw new Error(`API returned status ${response.status}: ${JSON.stringify(response.data)}`);
      }
      console.log('called chatgpt:\n', response.data.choices[0].message.content);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Full error response:', error.response?.data);
      }
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
}
