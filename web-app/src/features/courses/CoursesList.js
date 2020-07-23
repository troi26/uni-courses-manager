import React, { useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
import { CoursesListView } from "./CoursesListView";
import { enrollIntoCourse } from "../../api/courses.api";
// import {
//   decrement,
//   increment,
//   incrementByAmount,
//   incrementAsync,
//   selectCount,
// } from './counterSlice';
// import styles from './Counter.module.css';

export function CoursesList(props) {
  // const count = useSelector(selectCount);
  // const dispatch = useDispatch();
  // const [incrementAmount, setIncrementAmount] = useState('2');

  const [courses, setCourses] = useState([]);

  const [filterByLecturers, setFilterByLecturers] = useState([]);
  const [filterByName, setFilterByName] = useState("");
  const [filterByOwner, setFilterByOwner] = useState("");

  const handleEnrollment = async (studentId, courseId) => {
      try {
        const modifiedCourse = await enrollIntoCourse(studentId, courseId);
        setCourses(courses.map(c => c.id === modifiedCourse.id ? modifiedCourse : c));
      } catch (err) {

      }
  };

  const handleEnrollmentCanceling = async (studentId, courseId) => {

  };

  const handlefilterByLecturer = () => {
    return props.courses.filter(c => filterByLecturers.any(l => c.lecturers.includes(l)));
  };

  const handlefilterByOwner = () => {
    return props.courses.filter(c => c.owner === filterByOwner);
  }

  const handlefilterByCourseName = () => {
    return props.courses.filter(c => c.name.toLowercase().includes(filterByName));
  };

  return (
      <CoursesListView
        {...props}
        onCourseEnroll={handleEnrollment}
        onCancelCourseEnroll={handleEnrollmentCanceling}
      />
  );
}


CoursesListView.defaultProps = {
  courses: [{
      name: "AI",
  }, {
      name: "Discrete Maths",
  }]
};