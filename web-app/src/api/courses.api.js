import { domain } from "./server.connection";
import axios from 'axios'; 
import { buildTokenAuthHeader } from "./utils";

// export const enrollIntoCourse = async (stuentId, courseId, token) => {
//     const endpoint = `${domain}/enroll/${courseId}/${stuentId}`;
//     try {
//         fetch(endpoint, {
//             method: "PATCH",
//         }).then(res => {
//             if (res.ok) {
//                 return res.json();
//             } else {
//                 throw res.json();
//             }
//         }).then(data => {
//             return data;
//         }).catch(err => {
//             throw err;
//         });
    
//         // return modifiedCourse;
//     } catch (err) {
//         console.log(err);
//     }
// }

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