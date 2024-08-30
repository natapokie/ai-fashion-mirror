import axios, { AxiosResponse } from 'axios';
import { PREAPIResponse } from '../../../shared/types';

export const sendToApi = async (buffer: Buffer): Promise<PREAPIResponse> => {
  try {
    console.log('sending to API');
    // format http body
    const imgBlob = new Blob([buffer], { type: 'image/jpeg' });

    const form = new FormData();
    form.append('imagepageim[]', imgBlob);
    form.append('socialfollow', '1000000');
    form.append('socialtype', 'fashion');
    form.append('api', 'api');
    form.append('submit', 'submit');

    console.log('Waiting for response...');
    const response: AxiosResponse = await axios.post(`${process.env.PREAPI_URL}`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('response', response);
    if (response.status === 200) {
      return response.data as PREAPIResponse;
    } else {
      throw new Error(`Upload failed. Status code: ${response.status}`);
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error(`Axios error: ${err.message}`);
      console.error(`Response status: ${err.response?.status}`);
      throw `${err.message}\n${err.response?.data}`;
    } else {
      console.error(`Unexpected error: ${err}`);
      throw err;
    }
  }
};
