import React, { useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
import { CoursesListView } from "./CoursesListView";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectLogged } from '../loggin/loginSlice';
import { domain } from '../../api/server.connection';
import { MyFiltersComponent } from './MyFiltersComponent';
import { roles } from '../register/Register';
import { Segment, Modal, Dropdown, Button, Icon, Header } from 'semantic-ui-react';

export function CoursesList(props) {

  const [transferDetails, setTransferDetails] = useState(null);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);

  const [filterByLecturers, setFilterByLecturers] = useState([]);
  const [filterByName, setFilterByName] = useState("");
  const [filterByOwner, setFilterByOwner] = useState("");

  const logged = useSelector(selectLogged);

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
      setUsersLoaded(false);
    }
  }

  loadUsers();

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
            <Button color='blue' onClick={() => setTransferDetails(null)} inverted>
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
        onCourseEnroll={() => {}}
        onCancelCourseEnroll={() => {}}
        onOpenTransferModal={handleCourseTransferModalOpen}
      />
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