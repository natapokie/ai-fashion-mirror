import axios from 'axios';
import { ProductData } from '../../shared/types';

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
