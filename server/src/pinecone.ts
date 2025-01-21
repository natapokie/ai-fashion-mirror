import dotenv from 'dotenv';
import path from 'path';
import { Pinecone } from '@pinecone-database/pinecone';

// configure .env file to root
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

// Initialize client connection to Pinecone
const pinecone = new Pinecone({
  apiKey: `${process.env.PINECONE_API_KEY}`,
});

const pineconeIndex = pinecone.index(`${process.env.PINECONE_INDEX_NAME}`);

console.debug('initializing pinecone');
console.debug('apikey', process.env.PINECONE_API_KEY);
console.debug('namespace', process.env.PINECONE_INDEX_NAME);

export { pinecone, pineconeIndex };
