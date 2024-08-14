
export interface SocialMediaComments {
    [key: number]: string;
    likes: number;
    views: number;
    comments: number;
}

export interface Comment {
    user: string;
    text: string;
    displayTime: number; // time in seconds
  }

  export interface ResponseData {
    comments: Comment[];
    likes: number;
    views: number;
    commentsCount: number;
  }