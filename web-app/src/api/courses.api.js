import { domain } from "./server.connection";
import axios from 'axios'; 
import { buildTokenAuthHeader, buildPOSTWithJWTConfig } from "./utils";
import { buildEndpoint } from './grades.api';

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
        const response = await axios.patch(endpoint, {}, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        throw err;
    }
}

export const cancelEnrolmentIntoCourse = async (userId, courseId, token) => {
    try {
        const endpoint = `${domain}/api/courses/cancelenrolment/${courseId}/${userId}`;
        const response = await axios.patch(endpoint, {}, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        throw err;
    }
}

export const transferCourse = async (courseId, userFrom, userTo, token) => {
    try {
        const endpoint = `${domain}/api/courses/transfer/${courseId}/${userFrom}/${userTo}/`;
        const response = await axios.patch(endpoint, {}, buildTokenAuthHeader(token));
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

export async function addCourse (data, token) {
    try {
        const endpoint = `${domain}/api/courses`;
        const response = await axios.post(endpoint, data, buildPOSTWithJWTConfig(token));
        console.log(response);
        return {
            location: response.headers.location.replace("/api", ""),
            data: response.data,
        };
    } catch (err) {
        throw err;
    }
}

export async function deleteCourse (courseId, ownerId, token) {
    try {
        const endpoint = `${domain}/api/courses/${ownerId}/${courseId}`;
        const response = await axios.delete(endpoint, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        throw err;
    }
}

export const loadCoursesOfStudent = async (userId, token) => {
    const endpoint = buildEndpoint(`/api/courses/user/enroled/${userId}`);
    try {
        const response = await axios.get(endpoint, buildTokenAuthHeader(token));
        return response.data;
    } catch (err) {
        throw err;
    }
}