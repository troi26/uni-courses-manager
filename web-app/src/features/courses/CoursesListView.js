import React, { useState } from 'react';
import { List, Button } from 'semantic-ui-react';
// import { useSelector, useDispatch } from 'react-redux';
// import {
//   decrement,
//   increment,
//   incrementByAmount,
//   incrementAsync,
//   selectCount,
// } from './counterSlice';
// import styles from './Counter.module.css';

export function CoursesListView(props) {
    const buttons = {
        "ROLE_STUDENT": [
            {
                key: "course-enroll",
                name: "Enrol",
                isShown: (course, studentId) => {
                    return !course.enrolments.includes(studentId);
                },
                onClick: (event, studentId, courseId) => {
                    props.onCourseEnroll(studentId, courseId);
                },
            }, {
                key: "course-cancel-enroll",
                name: "Cancel",
                isShown: (course, studentId) => {
                    return course.enrolments.includes(studentId);
                },
                onClick: (event, studentId, courseId) => {
                    props.onCancelCourseEnroll(studentId, courseId);
                }
            }
        ],
        "ROLE_TEACHER": [{
            key: "course-cancel-enroll",
            name: "Cancel",
            isShown: (course, studentId) => {
                return course.enrolments.includes(studentId);
            },
            onClick: (event, studentId, courseId) => {
                props.onCancelCourseEnroll(studentId, courseId);
            }
        }, {
            key: "course-cancel-enroll",
            name: "Cancel",
            isShown: (course, studentId) => {
                return course.enrolments.includes(studentId);
            },
            onClick: (event, studentId, courseId) => {
                props.onCancelCourseEnroll(studentId, courseId);
            }
        }],
        "ROLE_ADMIN": {

        }
    };

    console.log("BUTTONS: ", buttons.ROLE_STUDENT);
  return (
    <List divided verticalAlign='middle' inverted className={"courses-list"}>
        {props.courses.map(c => <List.Item inverted style={{
             padding: "5px"
        }}>
            <List.Content floated='right'>
                {
                    buttons.ROLE_STUDENT.filter(b => b.isShown({enrolments: ["123"]}, "123")).map(b => 
                        <Button 
                            key={b.key}
                            onClick={(event) => b.onClick("124", "123")}
                        >{b.name}</Button>
                        )
                }
            </List.Content>
            <List.Content style={{
                color: "white",
                textAlign: 'left'
                }}>{c.name}
            </List.Content>
            </List.Item>)
        }
    </List>
  );
}