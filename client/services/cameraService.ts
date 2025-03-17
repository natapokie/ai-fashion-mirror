import axios from 'axios';

export const saveImage = async (formdata: FormData) => {
  try {
    console.log('Sending FormData to server:', formdata.get('image'));
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/camera/save`,
      formdata,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    console.log('Upload success', response.data);
  } catch (error) {
    console.log('Error saving image', error);
  }
};
