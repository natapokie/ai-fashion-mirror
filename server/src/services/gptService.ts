// NOTE for self:
// follow format of apiService.ts
// 1. put interface GptResponse in shared/types.ts

import axios from 'axios';
// import fs from 'fs';
// import path from 'path';
import dotenv from 'dotenv';
import { GptResponse } from '../../../shared/types';
import { gptSystemContext } from '../utils/gptServiceHelper';
dotenv.config();

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

export const sendToGpt = async (buffer: Buffer): Promise<GptResponse> => {
  try {
    console.log('sending to chatgpt...');
    const imgBlob = new Blob([buffer], { type: 'image/jpeg' });
    const base64Image = await blobToBase64(imgBlob);

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
            },
          ],
        },
      ],
      max_tokens: 500,
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
