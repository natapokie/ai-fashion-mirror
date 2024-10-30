export interface PREAPIResponse {
  [key: number]: string;
  likes: number;
  views: number;
  comments: number;
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

export interface ProductData {
  image: string;
  name: string;
  feedback: string;
}
