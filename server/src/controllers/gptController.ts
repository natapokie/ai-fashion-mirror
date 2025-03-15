import { Request, Response } from 'express';
import { GptService } from '../services/gptService';
import { PineconeService } from '../services/pineconeService';
import { ProductMetadata } from '../utils/types';

export const GptController = {
  async processRequest(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
      }

      const gptService = new GptService();

      // step 1: extract user features from image
      console.log('Extrarcting user features from image...');
      const userFeatures = await gptService.gptExtractFeatures(req.file.buffer.toString('base64'));
      console.log('Extracted user features:', userFeatures);

      const userFeaturesStr = JSON.stringify(userFeatures);

      // step 2: generate embeddings for extracted user features
      console.log('Generating embeddings for user features...');
      const featureEmbeddings = await gptService.createEmbeddings(userFeaturesStr);
      console.log('Feature Embeddings:', featureEmbeddings);

      // step 3: query pinecone for the top relevant (recommended) products
      console.log('Querying Pinecone database...');
      const queryResults = await PineconeService.executeQuery(featureEmbeddings, 10);
      console.log('Pinecone Query Results:', queryResults);

      // step 4: extract metadata from pinecone results
      const queriedProducts = queryResults.matches.map((match) => {
        const metadata: ProductMetadata = match.metadata || {};
        return {
          id: match.id,
          metadata: metadata,
        };
      });
      console.log('Queried Products:', queriedProducts);

      // step 5: call gpt with rag for recommendation reasonings (feedback)
      console.log('Calling GPT with RAG for feedback...');
      const recommendations = await gptService.gptRAGFeedback(userFeaturesStr, queriedProducts);
      console.log('Recommendations with feedback:', recommendations);

      res.status(200).json({ success: true, recommendations });
    } catch (err) {
      console.error('Error in processRequest:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to process request',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  },
};
