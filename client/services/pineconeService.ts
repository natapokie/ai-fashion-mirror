import axios from 'axios';

interface PineconeResponse {
  success: boolean;
  matches?: Array<{
    id: string;
    score: number;
    metadata?: Record<string, unknown>;
  }>;
}

export const queryPinecone = async (query: number[], topK?: number): Promise<PineconeResponse> => {
  try {
    const response = await axios.post(`${process.env.SERVER_BASE_URL}/pinecone/query`, {
      query,
      topK,
    });

    if (response.status !== 200) {
      throw new Error('status code not 200');
    } else if (!response.data.matches) {
      throw new Error('response returns no matches');
    }

    return response.data;
  } catch (error) {
    console.error('Error in queryPinecone:', error);
    throw error;
  }
};
