import axios, { AxiosResponse } from "axios";
import { SocialMediaComments } from "../utils/types";

const URL = "https://pre.cm/scribe.php";

export const sendToApi = async (buffer: Buffer): Promise<SocialMediaComments> => {
    try {
        console.log('sending to API')
        // format http body
        const imgBlob = new Blob([buffer], { type: 'image/jpeg' });
    
        const form = new FormData();
        form.append('imagepageim[]', imgBlob);
        form.append('socialfollow', '1000000');
        form.append('socialtype', 'fashion');
        form.append('api', 'api');
        form.append('submit', 'submit');

        console.log('Waiting for response...')
        const response: AxiosResponse = await axios.post(URL, form, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        console.log('response', response)
        if (response.status === 200) {
            return response.data as SocialMediaComments;
        } else {
            throw new Error(`Upload failed. Status code: ${response.status}`)
        }
    } catch (err) {
        console.error(`Error sending request to API`);
        throw err;
    }
}