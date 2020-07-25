import { domain } from "./server.connection"
import axios from 'axios';
import { buildTokenAuthHeader, buildPOSTWithJWTConfig } from "./utils";

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
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
}

export const loginCall = async (data) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        const endpoint = `${domain}/api/users/auth/login`;

        const response = await axios.post(endpoint, data, headers);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
}

export const loadAllUsers = async (token) => {
    try {
        const endpoint = `${domain}/api/users`;
        const response = await axios.get(endpoint, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        console.log("ERROR: ", err);
        throw err.response.data;
    }
}

export const loadUserById = async (userId, token) => {
    try {
        const endpoint = `${domain}/api/users/${userId}`;
        const response = await axios.get(endpoint, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        console.log("ERROR: ", err);
        throw err.response.data;
    }
}

export const modifyUser = async (data, userId, token) => {
    try {
        const endpoint = `${domain}/api/users/${userId}`;
        const response = await axios.post(endpoint, data, buildPOSTWithJWTConfig(token));
        return response.data;
    } catch (err) {
        console.log("MODIFY ERROR: ", err);
        throw err.response.data;
    }
}

export async function passwordChange (data, userId, token) {
    try {
        const endpoint = `${domain}/api/users/auth/passwordchange/${userId}/${data.current}/${data.new}`;
        const response = await axios.patch(endpoint, data, buildPOSTWithJWTConfig(token));
        return response.data;
    } catch (err) {
        console.log("MODIFY ERROR: ", err);
        throw err.response.data;
    }
}