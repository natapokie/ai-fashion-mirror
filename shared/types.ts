export interface SocialMediaComments {
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
