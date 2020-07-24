import { domain } from "./server.connection";
import axios from 'axios'; 
import { buildTokenAuthHeader, buildPOSTWithJWTConfig } from "./utils";

export const loadCourseById = async (courseId, token) => {
    try {
        const endpoint = `${domain}/api/courses/${courseId}`;
        const response = await axios(endpoint, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        throw err;
    }
}

export const enrolIntoCourse = async (userId, courseId, token) => {
    try {
        const endpoint = `${domain}/api/courses/enrol/${courseId}/${userId}`;
        const response = await axios.patch(endpoint, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        throw err;
    }
}

export const cancelEnrolmentIntoCourse = async (userId, courseId, token) => {
    try {
        const endpoint = `${domain}/api/courses/cancelenrolment/${courseId}/${userId}`;
        const response = await axios.patch(endpoint, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        throw err;
    }
}

export const transferCourse = async (courseId, userFrom, userTo, token) => {
    try {
        const endpoint = `${domain}/api/courses/transfer/${courseId}/${userFrom}/${userTo}/`;
        const response = await axios.patch(endpoint, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        throw err;
    }
}

export async function modifyCourse (course, userId, token) {
    try {
        const endpoint = `${domain}/api/courses/${userId}/${course.id}`;
        const response = await axios.put(endpoint, course, buildPOSTWithJWTConfig(token));
        return response.data;
    } catch (err) {
        throw err;
    }
}