import { EmbeddingsList, PineconeRecord, RecordValues } from '@pinecone-database/pinecone';
import { pinecone, pineconeIndex } from '../pinecone';

export class PineconeService {
  static model = 'multilingual-e5-large';
  static namespace = 'ns1';

  static fetchRecords = async (ids: string[]) => {
    const records = await pineconeIndex.namespace(this.namespace).fetch(ids);
    console.debug('ids', ids, typeof ids);
    console.debug('results', records);
    return records;
  };

  static createEmbeddings = async (inputs: string[]): Promise<EmbeddingsList> => {
    // returns embeddings created with Pinecone
    const embeddings = await pinecone.inference.embed(this.model, inputs, {
      inputType: 'passage',
      truncate: 'END',
    });

    return embeddings;
  };

  static upsertData = async (vectors: PineconeRecord[]) => {
    await pineconeIndex.namespace(this.namespace).upsert(vectors);
  };

  static checkIndex = async () => {
    // Use the describe_index_stats operation to check if the current vector count matches the number of vectors you upserted (6)
    const stats = await pineconeIndex.describeIndexStats();
    return stats;
  };

  static executeQuery = async (query: string[], topK: number = 10) => {
    // Use Pinecone Inference to convert a text query into a query vector
    const embedding = await this.createEmbeddings(query);

    // Query the ns1 namespace for the three vectors that are most similar to the query vector, i.e., the vectors that represent the most relevant answers to your question:
    if (embedding) {
      const queryResponse = await pineconeIndex.namespace(this.namespace).query({
        topK: topK,
        vector: embedding[0].values as RecordValues,
        includeValues: false,
        includeMetadata: true,
      });

      console.log('\nTopk relevant:');
      console.log(queryResponse);
    }
  };
}