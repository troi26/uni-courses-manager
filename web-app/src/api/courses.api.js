import { domain } from "./server.connection";


export const enrollIntoCourse = async (stuentId, courseId) => {
    const endpoint = `${domain}/enroll/${courseId}/${stuentId}`;
    try {
        fetch(endpoint, {
            method: "PATCH",
        }).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw res.json();
            }
        }).then(data => {
            return data;
        }).catch(err => {
            throw err;
        });
    
        // return modifiedCourse;
    } catch (err) {
        console.log(err);
    }
}