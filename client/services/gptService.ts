import axios from 'axios';
import { ProductData } from '../../shared/types';

export const sendToGpt = async (formData: FormData): Promise<ProductData[]> => {
  try {
    console.log('Sending image to GPT for full processing...');

    const response = await axios.post(
      `${process.env.SERVER_BASE_URL}/gpt/process-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to process image');
    }

    console.log('Final GPT response: ', response.data);

    // ensure the data exists and is an array
    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error('Invalid response format from GPT');
    }

    return response.data.data; // final recommendations list
  } catch (error) {
    console.error('Error in sendToGpt: ', error);
    return []; // return an ematy array if request fails
  }
};
