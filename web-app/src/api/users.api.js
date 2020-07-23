import { domain } from "./server.connection"
import axios from 'axios';

export const createPostRequest = (data) => ({
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
});

export const registerCall = async (data) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        const endpoint = `${domain}/api/users/auth/register`;

        const response = await axios.post(endpoint, data, headers);
        return response;
    } catch (err) {
        throw err;
    }
}