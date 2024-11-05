import axios from 'axios';

export const saveImage = async (formdata: FormData) => {
  try {
    const response = await axios.post(`${process.env.SERVER_BASE_URL}/camera/save`, formdata, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload success', response.data);
  } catch (error) {
    console.log('Error saving image', error);
  }
};
