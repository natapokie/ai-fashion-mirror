import axios from 'axios';
import fs from 'fs';
// import path from 'path';
import dotenv from 'dotenv';
import { gptSystemContext } from '../utils/gptServiceHelper';

dotenv.config();

interface GptResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
}

export const sendToGpt = async (photoPath: string): Promise<GptResponse> => {
  try {
    const imageBuffer = fs.readFileSync(photoPath);
    const base64Image = imageBuffer.toString('base64');

    const requestData = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: gptSystemContext,
          // ask for feedback that has activity/weather context
          // include fashion trend
          // integrate with store products, use mockData for testing
          // may be able to prompt chatgpt to search store website
          // return in JSON
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    };

    const config = {
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions', // This is the standard endpoint
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Replace with your actual API key
      },
      data: requestData,
      validateStatus: (status: number): boolean => status < 500, // Optional: to get full error messages
    };

    const response = await axios.request(config);

    // Add error handling for API-level errors
    if (response.status !== 200) {
      console.error('API Error:', response.data);
      throw new Error(`API returned status ${response.status}: ${JSON.stringify(response.data)}`);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Full error response:', error.response?.data);
    }
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};
