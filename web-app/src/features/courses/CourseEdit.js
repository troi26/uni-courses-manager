import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import { Grid, Table, Segment, Card, Button, Dimmer, Loader } from "semantic-ui-react";
import { loadCourseById } from "../../api/courses.api";

import moment from 'moment';
import { loadAllUsers, loadUserById } from "../../api/users.api";
import { useSelector } from "react-redux";
import { selectLogged } from "../loggin/loginSlice";

export const specialties = {
    CS: "Computer Sciences",
    I: "Informatics",
    M: "Mathematics",
    SE: "Software Engineering",
    IS: "Informational Systems",
    AM: "Applied Mathematics"
};

export const Course = () => {

    // const history = useHistory();
    const { courseId } = useParams();
    console.log(courseId);
    // console.log("COURSE: ", props);
    const logged = useSelector(selectLogged);
    const [course, setCourse] = useState(null); 
    const [error, setError] = useState(null);
    const [isCourseLoaded, setIsLoaded] = useState(false);
    const [loading, setLoadind] = useState(true);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const response = await loadCourseById(courseId, logged.token);
                console.log(response);
                const courseData = response;
                const responseOwner = await loadUserById(courseData.owner, logged.token);
                const responseUsers = await loadAllUsers(logged.token);
                const courseOwner = responseOwner;
                console.log("OWNER: ", courseOwner);
                const coursEnrolments = responseUsers.filter(u => courseData.enrolments.includes(u.id))
                console.log("USERS: ", coursEnrolments);
                console.log("COURSE LOADED: ", response);
                courseData.enrolmentsUsers = coursEnrolments;
                courseData.ownerUser = courseOwner;
                setCourse(courseData);
                // setIsLoaded(true);
                setLoadind(false);
            } catch (err) {
                console.log(err);
                // setIsLoaded(true);
                setError(err.response);
                setLoadind(false);
            }
        }

        loadCourse();
    }, [])

    return (
        <React.Fragment>
            { course && !loading &&
                <Grid style={{
                    margin: 0
                }}>
                    <Grid.Row columns={1}>
                        <Grid.Column>
                        <h1 style={{
                            color: 'white'
                        }}>{course.name}</h1>
                        </Grid.Column>
                    </Grid.Row>
                    <Table celled padded inverted>
                        <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell singleLine>Owner</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Enrolments limit</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Specialty</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Start date</Table.HeaderCell>
                        </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>
                                    <Card>
                                    <Card.Content>
                                        <Card.Header>{`${course.ownerUser.firstName}${course.ownerUser.lastName}`}</Card.Header>
                                        <Card.Description>
                                            {`${course.ownerUser.username}`}
                                        </Card.Description>
                                    </Card.Content>
                                    </Card>
                                    </Table.Cell>
                                <Table.Cell>{course.enrolmentLimit}</Table.Cell>
                                <Table.Cell>{specialties[course.targetSpeciality]}</Table.Cell>
                                <Table.Cell>{ course.startDate ? moment(course.startDate).format("YYYY-MM-DD") : "NA" }</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                </Grid>
            }
            { loading &&
                <React.Fragment>
                    <Dimmer active>
                        <Loader content={"LOADING..."}/>
                    </Dimmer>
                </React.Fragment>
            }
            { !loading && error &&
                <Segment inverted style={{
                    color: 'white',
                }}>
                    SOMETHING WENT WRONG. PLEASE RELOAD PAGE
                </Segment>
            }
        </React.Fragment>
    );
};