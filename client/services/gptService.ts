import axios from 'axios';
import { ProductData, QueriedProduct } from '../../shared/types';

export const gptEmbeddings = async (text: string): Promise<number[]> => {
  try {
    const response = await axios.post(`${process.env.SERVER_BASE_URL}/gpt/embeddings`, {
      text,
    });

    if (response.status !== 200) {
      throw new Error('Failed to get embeddings');
    }

    return response.data.embeddings;
  } catch (error) {
    console.error('Error getting embeddings:', error);
    throw error;
  }
};

export const sendImageToGpt = async (formData: FormData): Promise<ProductData[]> => {
  try {
    const response = await axios.post(`${process.env.SERVER_BASE_URL}/api/request`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to process image');
    }

    const fullResponse = response.data;
    console.log('GPT Response:', fullResponse);

    // nov 18 note:
    // modified to use parsed.product_list instead of content due to changes in gptService.ts
    const content: ProductData[] = fullResponse.data.choices[0].message.parsed.product_list;
    console.log('Response Content:', content);

    return content;
  } catch (error) {
    console.error('Error in sendImageToGpt:', error);
    throw error;
  }
};

export const sendRAGToGpt = async (
  userFeatures: string,
  queriedProducts: QueriedProduct[],
): Promise<ProductData[]> => {
  try {
    console.log('Sending RAG request to GPT...');

    const response = await axios.post(`${process.env.SERVER_BASE_URL}/gpt/request-rag`, {
      userFeatures,
      queriedProducts,
    });

    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to process image with RAG');
    }

    console.log('!!RAG GPT Response:', response.data);

    // Ensure `data` exists and has a valid array before mapping
    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error('Invalid response format from GPT');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error in sendRAGToGpt:', error);
    return []; // Return an empty array if the request fails
  }
};
