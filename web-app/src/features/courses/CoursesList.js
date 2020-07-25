import React, { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
import { CoursesListView } from "./CoursesListView";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectLogged } from '../loggin/loginSlice';
import { domain } from '../../api/server.connection';
import { MyFiltersComponent } from './MyFiltersComponent';
import { roles } from '../register/Register';
import { Segment, Modal, Dropdown, Button, Icon, Header, Message } from 'semantic-ui-react';
import { cancelEnrolmentIntoCourse, enrolIntoCourse, transferCourse, deleteCourse, modifyCourse } from '../../api/courses.api';
import moment from 'moment';

export function CoursesList(props) {

  const [transferDetails, setTransferDetails] = useState(null);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const [filterByLecturers, setFilterByLecturers] = useState([]);
  const [filterByName, setFilterByName] = useState("");
  const [filterByOwner, setFilterByOwner] = useState("");

  const logged = useSelector(selectLogged);

  useEffect(() => {
  
    const loadUsers = async () => {
      try {
        if (!usersLoaded) {
          setUsersLoaded(true);
          const config = { headers: {Authorization: `Bearer ${logged.token}`}};
          const response = await axios(`${domain}/api/users`, config);
          console.log(response.data);
          setUsers(response.data);
        }
      } catch (err) {
        setPeriodError(err)
        setUsersLoaded(false);
      }
    }
  
    loadUsers();
  }, []);

  const loadCourses = async () => {
    try {
      if (!coursesLoaded) {
        setCoursesLoaded(true);
        const config = { headers: {Authorization: `Bearer ${logged.token}`}};
        const response = await axios(`${domain}/api/courses`, config);
        console.log(response.data);
        setCourses(response.data);
      }
    } catch (err) {
      setPeriodError(err)
      setCoursesLoaded(false);
    }
  }

  loadCourses();


  // const handleEnrollment = async (studentId, courseId) => {
  //     // try {
  //     //   const modifiedCourse = await enrollIntoCourse(studentId, courseId);
  //     //   setCourses(courses.map(c => c.id === modifiedCourse.id ? modifiedCourse : c));
  //     // } catch (err) {

  //     // }
  // };

  // const handleEnrollmentCanceling = async (studentId, courseId) => {

  // };

  const handlefilterByLecturer = (courses) => {
    console.log(courses, filterByLecturers);
    if (filterByLecturers.length === 0) {
      return courses;
    }
    return courses.filter(c => filterByLecturers.every(l => c.lecturers.includes(l)));
  };

  const handlefilterByOwner = (courses) => {
    console.log(courses, filterByOwner);
    if (filterByOwner === "") {
      return courses;
    }
    return courses.filter(c => c.owner === filterByOwner);
  }

  const handlefilterByCourseName = (courses) => {
    console.log(courses, filterByName);
    if (filterByName === "") {
      return courses;
    }
    return courses.filter(c => c.name.toLowerCase().includes(filterByName.toLowerCase()));
  };

  const handleCourseTransferModalOpen = (course) => {
    const result = {...course};
    result.toUser = course.owner;
    setTransferDetails(result);
  }

  const handleCourseTransfer = async (courseId, userFrom, userTo) => {
      try {
        const enrolled = await transferCourse(courseId, userFrom, userTo, logged.token);
        const newCourses = courses.map(c => c.id === courseId
          ? {
            ...c,
            owner: userTo,
          }
          : c)
          setCourses(newCourses);
      } catch(err) {
        setPeriodError(err)
        console.log(err);
      }
  };

  const handleCourseEnrol = async (userId, courseId) => {
      try {
        const enrolled = await enrolIntoCourse(userId, courseId, logged.token);
        const newCourses = courses.map(c => c.id === courseId
          ? {
            ...c,
            enrolments: [userId].concat(c.enrolments),
          }
          : c)
          setCourses(newCourses);
      } catch(err) {
        setPeriodError(err)
        console.log(err);
      }
  };

  const handleCancelCourseEnrol = async (userId, courseId) => {
      try {
        const canceled = await cancelEnrolmentIntoCourse(userId, courseId, logged.token);
        const newCourses = courses.map(c => c.id === courseId
          ? {
            ...c,
            enrolments: c.enrolments.filter(e => e !== userId),
          }
          : c)
        setCourses(newCourses);
      } catch(err) {
        setPeriodError(err)
        console.log(err);
      }
  };

  const handleCourseRemoval = async (course) => {
    try {
      await deleteCourse(course.id, logged.id, logged.token);
      setCourses(courses.filter(c => c.id !== course.id));
    } catch (err) {
      setPeriodError(err)
      console.log(err);
    }
  }

  const handleCourseEnd = async (course) => {
    try {
      course.endDate = moment();
      const modifiedData = await modifyCourse(course, course.owner, logged.token);
      setCourses(courses.map(c => c.id !== course.id ? c : modifiedData));
    } catch (err) {

    }
  }

  const setPeriodError = (error) => {
    setError(error);
    setTimeout(() => {
      setError(null);
    }, 4000);
  }

  return (
    <React.Fragment>
      <Modal
        open={transferDetails !== null} closeIcon onClose={() => setTransferDetails(null)}>
        <Header icon='browser' content={transferDetails ? transferDetails.name : undefined} />
        <Modal.Content>
          <h3>Transfer this course to user below</h3>
          <Dropdown
              fluid
              placeholder={"Transfer to"}
              search
              selection
              options={users.map(u => ({
                  key: u.id,
                  text: `${u.firstName} ${u.lastName}`,
                  value: u.id
              }))}
              value={transferDetails ? transferDetails.toUser : undefined}
              onChange={(e, {value}) => {
                  console.log("ADD/CLEAR_LECTURER: ", value);
                  const newTransferDetails = {...transferDetails};
                  newTransferDetails.toUser = value;
                  setTransferDetails(newTransferDetails);
              }}
          />
        </Modal.Content>
          <Modal.Actions>
            <Button color='blue' onClick={() => {
              handleCourseTransfer(transferDetails.id, transferDetails.owner, transferDetails.toUser);
              setTransferDetails(null);
            }} inverted>
              <Icon name='checkmark' /> Transfer
            </Button>
          </Modal.Actions>
      </Modal>
      <Segment>
        <h1>Courses</h1>
        <MyFiltersComponent
          teachersList={users.filter(u => u.roles.includes(roles.TEACHER))}
          lecturers={filterByLecturers}
          owner={filterByOwner}
          name={filterByName}

          setLecturersFilter={setFilterByLecturers}
          setOwnerFilter={setFilterByOwner}
          setUsernameFilter={setFilterByName}
        />
      </Segment>
      <CoursesListView
        {...props}
        logged={logged}
        courses={handlefilterByCourseName(handlefilterByLecturer(handlefilterByOwner(courses)))}
        onOpenTransferModal={handleCourseTransferModalOpen}
        onCourseEnrol={handleCourseEnrol}
        onCancelCourseEnrol={handleCancelCourseEnrol}
        onRemoveCourse={handleCourseRemoval}
        onEndCourse={handleCourseEnd}
      />
      { error &&
        <Message negative>
          <Message.Header>{error.message}</Message.Header>
        </Message>
      }
    </React.Fragment>
  );
}


CoursesListView.defaultProps = {
  courses: [{
      name: "AI",
  }, {
      name: "Discrete Maths",
  }]
};