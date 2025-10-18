import { SERVER_ERROR, BASE_BACKEND_URL } from '../Constants/constants';

export async function fetchWrapper({
    endPoint,
    method = 'GET',
    credentials = 'omit',
    signal = null,
    body = null,
    aim,
    type = 'json',
}) {
    try {
        const options = { method, credentials, signal };

        if (body) {
            if (type === 'formData') {
                options.body = body;
            } else {
                options.headers = { 'Content-Type': 'application/json' };
                options.body = JSON.stringify(body);
            }
        }

        const res = await fetch(BASE_BACKEND_URL + endPoint, options);

        const data = await res.json();
        console.log(data);

        if (res.status === SERVER_ERROR) throw new Error(data.message);
        else return data;
    } catch (err) {
        if (err.name === 'AbortError') {
            // console.log(`${aim} request aborted.`);
        } else {
            // console.error(`error in ${aim} service`, err.message);
            throw err;
        }
    }
}
