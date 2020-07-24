import { domain } from "./server.connection";
import axios from 'axios'; 
import { buildTokenAuthHeader } from "./utils";

export const loadGradesByCourse = async (courseId, token) => {
    const endpoint = `${domain}/api/grades/bycourse/${courseId}`;
    try {
        const response = await axios(endpoint, buildTokenAuthHeader(token));
        if (response.ok) {

        }
        return response.data;
    } catch (err) {
        throw err;
    }
};