import { ResponseData } from "./utils/types";

// Calculate display time based on reading speed
const calculateDisplayTime = (text: string, wordsPerMinute: number = 200): number => {
const words = text.split(' ').length;
const minutesToRead = words / wordsPerMinute;
const secondsToRead = minutesToRead * 60;

// Adding a base display time to ensure very short texts have some minimum display time
const baseDisplayTime = 2; // 2 seconds
  return Math.max(secondsToRead, baseDisplayTime);
};

  // Parse the JSON response and organize it into the structured data
export const parseResponse = (jsonResponse: any): ResponseData => {
  const responseData: ResponseData = {
    comments: [],
    likes: 0,
    views: 0,
    commentsCount: 0,
  };

  // Iterate through the keys of the JSON response
  for (const key in jsonResponse) {
    if (jsonResponse.hasOwnProperty(key)) {
      if (key === 'likes') {
          responseData.likes = jsonResponse[key];
      } else if (key === 'views') {
          responseData.views = jsonResponse[key];
      } else if (key === 'comments') {
          responseData.commentsCount = jsonResponse[key];
      } else {
          const [user, text] = jsonResponse[key].split(': ');
          const displayTime = calculateDisplayTime(text);
          responseData.comments.push({ user, text, displayTime });
      }
    }
  }

  return responseData;
}     
