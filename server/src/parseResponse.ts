import { ResponseData, SocialMediaComments } from "./utils/types";
import { WORDS_PER_MS, MIN_DISPLAY_TIME } from "./utils/constants";

const calculateDisplayTime = (text: string): number => {
  // Ensure text is a string and not empty or undefined
  if (typeof text !== 'string' || text.trim() === '') {
    console.error('Invalid or empty text provided');
    return MIN_DISPLAY_TIME;  // Return the minimum display time if input is invalid
  }
  
  const words = text.split(' ').length;
  const millisecToRead = Math.round(words/WORDS_PER_MS);

  return Math.max(millisecToRead, MIN_DISPLAY_TIME);
};

export const parseResponse = (jsonResponse: SocialMediaComments): ResponseData => {
  const responseData: ResponseData = {
    comments: [],
    likes: 0,
    views: 0,
    commentsCount: 0,
  };

  for (const key in jsonResponse) {
    if (jsonResponse.hasOwnProperty(key)) {
      if (key === 'likes') {
          responseData.likes = jsonResponse.likes;
      } else if (key === 'views') {
          responseData.views = jsonResponse.views;
      } else if (key === 'comments') {
          responseData.commentsCount = jsonResponse.comments;
      } else {
          const [user, text] = jsonResponse[key].split(': ');
          const displayTime = calculateDisplayTime(text);
          responseData.comments.push({ user, text, displayTime });
      }
    }
  }

  return responseData;
}     
