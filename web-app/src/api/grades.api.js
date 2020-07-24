import { domain } from "./server.connection";
import axios from 'axios'; 
import { buildTokenAuthHeader, buildPOSTWithJWTConfig } from "./utils";
import { createPostRequest } from "./users.api";

const buildEndpoint = (apiroute) => {
    return `${domain}${apiroute}`;
}

export const loadGradesByCourse = async (courseId, token) => {
    const endpoint = buildEndpoint(`/api/grades/bycourse/${courseId}`);
    try {
        const response = await axios(endpoint, buildTokenAuthHeader(token));
        // if (response.ok) {
            return response.data;
        // }
    } catch (err) {
        throw err;
    }
};

export const modifyGrade = async (data, token) => {
    const endpoint = buildEndpoint(`/api/grades/${data.userId}/${data.id}`);
    try {
        const response = await axios.put(endpoint, data, buildPOSTWithJWTConfig(token));
        // if (response.ok) {
            return response.data;
        // }
    } catch (err) {
        throw err;
    }
}

export const addGrade = async (data, token) => {
    const endpoint = buildEndpoint(`/api/grades`);
    try {
        const response = await axios.post(endpoint, data, buildPOSTWithJWTConfig(token));
        // if (response.ok) {
            return response.data;
        // }
    } catch (err) {
        throw err;
    }
}

export const removeGrade = async (gradeId, token) => {
    const endpoint = buildEndpoint(`/api/grades/${gradeId}`);
    try {
        const response = await axios.delete(endpoint, buildPOSTWithJWTConfig(token));
        // if (response.ok) {
            return response.data;
        // }
    } catch (err) {
        throw err;
    }
}