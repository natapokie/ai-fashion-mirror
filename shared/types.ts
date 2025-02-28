export interface PREAPIResponse {
  [key: number]: string;
  likes: number;
  views: number;
  comments: number;
}

export interface GptResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string | null;
    };
    finish_reason: string;
    index: number;
  }>;
}

export interface CommentType {
  user: string;
  text: string;
  displayTime: number; // time in seconds
}

export interface ResponseData {
  comments: CommentType[];
  likes: number;
  views: number;
  commentsCount: number;
}

export interface PhotoData {
  apiResponse?: PREAPIResponse | 'Person not found!';
  encodedImg: string;
  errorMsg?: string;
}

export interface ProductMetadata {
  colorName?: string;
  embeddingTags?: string;
  fabricTechnology?: string;
  fsProductDescriptionShort?: string;
  fsProductName?: string;
  gender?: string;
  lengthDescription?: string;
  modelImageUrl?: string;
  otherProductImageUrl?: string;
}

export interface QueriedProduct {
  id: string;
  metadata?: ProductMetadata;
}

export interface ProductData {
  name: string;
  image: string;
  feedback: string;
}

export interface ErrorMessage {
  success: boolean;
  message: string;
  error: string;
}
