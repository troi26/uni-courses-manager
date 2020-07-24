import { domain } from "./server.connection"
import axios from 'axios';
import { buildTokenAuthHeader } from "./utils";

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

export const loadUserById = async (userId, token) => {
    try {
        const endpoint = `${domain}/api/users/${userId}`;
        const response = await axios(endpoint, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        throw err;
    }
}

export const loadAllUsers = async (token) => {
    try {
        const endpoint = `${domain}/api/users`;
        const response = await axios(endpoint, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        console.log("ERROR: ", err);
        throw err;
    }
}