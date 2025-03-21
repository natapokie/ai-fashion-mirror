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
      // console.log('Extrarcting user features from image...');
      const userFeatures = await gptService.gptExtractFeatures(req.file.buffer.toString('base64'));
      // console.log('Extracted user features:', userFeatures);

      // mar 4: hardcoding eri's features for getting slides for demo
      // const userFeatures =
      //   'Opt for jewel tones, pastels, and cool neutrals to complement your fair complexion and dark features, while balancing your pear-shaped body with structured or detailed tops, V-necklines, high-waisted bottoms, A-line skirts, wrap dresses, silver jewelry, statement earrings, waist belts, and pointed-toe or chunky-heeled shoes for a flattering and stylish look.';

      const featuresOnly = JSON.parse(userFeatures).features;
      const userFeaturesStr = JSON.stringify(featuresOnly);
      console.log('Feature to be embedded:', userFeaturesStr);

      // step 2: generate embeddings for extracted user features
      // console.log('Generating embeddings for user features...');
      const featureEmbeddings = await gptService.createEmbeddings(userFeaturesStr);

      // step 3: query pinecone for the top relevant (recommended) products
      let gender: string = 'male';
      try {
        gender = JSON.parse(userFeatures).gender;
        console.log('gender: ', gender);
      } catch (err) {
        console.error('Error parsing', err);
      }
      const filter = {
        gender: { $eq: gender },
      };

      // console.log('Querying Pinecone database...');
      const queryResults = await PineconeService.executeQuery(featureEmbeddings, 10, filter);
      // console.log('Pinecone Query Results:', queryResults);

      // step 4: extract metadata from pinecone results
      const queriedProducts = queryResults.matches.map((match) => {
        const metadata: ProductMetadata = match.metadata || {};
        return {
          id: match.id,
          metadata: metadata,
        };
      });
      // console.log('Queried Products:', queriedProducts);

      // step 5: call gpt with rag for recommendation reasonings (feedback)
      // console.log('Calling GPT with RAG for feedback...');
      const recommendations = await gptService.gptRAGFeedback(userFeaturesStr, queriedProducts);

      // TODO: remove later, shuffle code for testing
      const shuffle = [...recommendations].sort(() => Math.random() - 0.5);

      // console.log('Recommendations with feedback:', recommendations);

      res.status(200).json({ success: true, recommendations: shuffle });
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
