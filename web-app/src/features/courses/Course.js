import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import { Grid, Table, Segment, Card, Button, Dimmer, Loader, Input, Dropdown, List, Checkbox, TextArea, Label, SegmentInline } from "semantic-ui-react";
import { loadCourseById } from "../../api/courses.api";

import moment from 'moment';
import { loadAllUsers, loadUserById } from "../../api/users.api";
import { useSelector } from "react-redux";
import { selectLogged } from "../loggin/loginSlice";
import { loadGradesByCourse } from "../../api/grades.api";

export const specialties = {
    CS: "Computer Sciences",
    I: "Informatics",
    M: "Mathematics",
    SE: "Software Engineering",
    IS: "Informational Systems",
    AM: "Applied Mathematics"
};

export const constraints = {
    maxNameLen: 15,
    maxDescriptionLen: 512,
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
    const [editedField, setEditField] = useState("");
    const [editingData, setEditingData] = useState({});
    const [editedValues, setEditedValues] = useState({});
    const [grades, setGrades] = useState([]);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const response = await loadCourseById(courseId, logged.token);
                console.log(response);
                const courseData = response;
                const responseOwner = await loadUserById(courseData.owner, logged.token);
                const responseUsers = await loadAllUsers(logged.token);
                const grades = await loadGradesByCourse(courseData.id, logged.token);
                console.log("GRADES LOADED: ", grades);
                const courseOwner = responseOwner;
                console.log("OWNER: ", courseOwner);
                const coursEnrolments = responseUsers.filter(u => courseData.enrolments.includes(u.id))
                    .map(u => {
                        const grade = grades.find(g => g.userId === u.id);
                        return grade ? { ...u, grade} : { ...u, grade: undefined };
                    });
                const coursLecturers = responseUsers.filter(u => courseData.lecturers.includes(u.id))
                console.log("USERS: ", coursEnrolments);
                console.log("COURSE LOADED: ", response);
                courseData.enrolmentsUsers = coursEnrolments;
                courseData.lecturersUsers = coursLecturers;
                courseData.ownerUser = courseOwner;
                setCourse(courseData);
                setEditedValues(courseData);
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

    const isChanged = () => {
        console.log(editedValues.targetSpeciality === course.targetSpeciality);
        if (course.enrolmentLimit !== editedValues.enrolmentLimit ||
            course.description !== editedValues.description ||
            (moment(course.startDate).diff(moment(editedValues.startDate), 'days') !== 0) ||
            course.targetSpeciality !== editedValues.targetSpeciality ||
            course.name !== editedValues.name ||
            !(course.lecturers.length === editedValues.lecturers.length &&
                course.lecturers.every(l => editedValues.lecturers.includes(l))) ||
            !(course.enrolments.length === editedValues.enrolments.length &&
                course.enrolments.every(e => editedValues.enrolments.includes(e))) ||
            course.hasEntranceTest !== editedValues.hasEntranceTest
            ) {
                console.log("HERE!!!");
                return true;
        }
        return false;
    };

    const rederEnrolments = () => {
        return editedValues.enrolmentsUsers.map(e => {
            const grade = grades.find(g => g.courseId === course.id && g.userId === e.id);
            return (<List.Item key={`user-${e.id}`}>
                <Card fluid>
                    <Card.Content>
                        <Card.Header>{`${e.firstName}${e.lastName}`}</Card.Header>
                        <Card.Description>
                            {`${e.username}`}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <Segment padded={'small'}>
                            {e.grade ? e.grade.value : "-"}
                            <Button floated={'right'} color={"red"} icon={"pencil alternate"}></Button>
                        </Segment>
                        <Button fluid floated={"right"} color={"red"} icon={"delete"}></Button>
                    </Card.Content>
                </Card>
            </List.Item>)
        })
    }

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
                        }}>{course.name}
                        <Button floated={"right"} icon={"edit"} onClick={() => {
                            setEditingData({
                                value: editedValues.name
                            })
                            setEditField("name")
                        }}></Button></h1>
                        </Grid.Column>
                    </Grid.Row>
                    <Table celled padded inverted>
                        <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell singleLine>Owner</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Enrolments limit</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Specialty</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Start date</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Entrance test</Table.HeaderCell>
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
                                <Table.Cell>{ editedField !== "enrolmentLimit"
                                    ? <React.Fragment>{editedValues.enrolmentLimit}
                                        <Button floated={"right"} icon={"edit"} onClick={() => {
                                            setEditingData({
                                                value: editedValues.enrolmentLimit
                                            })
                                            setEditField("enrolmentLimit")
                                        }}></Button>
                                    </React.Fragment>
                                    : <React.Fragment>
                                        <Input type={"number"} value={editingData.value} onChange={(e, {value}) => {
                                            if (parseInt(value) > 0) {
                                                setEditingData({
                                                    value: parseInt(value),
                                                });
                                            }
                                        }}/>
                                        <Button floated={"right"} color={"green"} icon={"check"} onClick={() => {
                                            setEditedValues({
                                                ...editedValues,
                                                enrolmentLimit: editingData.value
                                            })
                                            setEditingData(null)
                                            setEditField("")
                                        }}></Button>
                                        <Button floated={"right"} color={"red"} icon={"close"} onClick={() => {
                                            setEditedValues({
                                                ...editedValues,
                                                enrolmentLimit: editedValues.enrolmentLimit
                                            })
                                            setEditingData(null)
                                            setEditField("")
                                        }}></Button>
                                    </React.Fragment>}
                                </Table.Cell>

                                <Table.Cell>{ editedField !== "targetSpeciality"
                                    ? <React.Fragment>{specialties[editedValues.targetSpeciality]}
                                        <Button floated={"right"} icon={"edit"} onClick={() => {
                                            setEditingData({
                                                value: editedValues.targetSpeciality
                                            });
                                            setEditField("targetSpeciality")
                                        }}></Button>
                                    </React.Fragment>
                                    : <React.Fragment>
                                        <Dropdown
                                            placeholder='Select specialty'
                                            search
                                            selection
                                            value={editingData.value}
                                            options={Object.entries(specialties).map(([key, value]) => ({ key: key, value: key, text: value }))}
                                            onChange={(e, {value}) => {
                                                setEditingData({
                                                    value: value
                                                });
                                            }}
                                        />
                                        <Button floated={"right"} color={"green"} icon={"check"} onClick={() => {
                                            setEditedValues({
                                                ...editedValues,
                                                targetSpeciality: editingData.value
                                            })
                                            setEditingData(null)
                                            setEditField("")
                                        }}></Button>
                                        <Button floated={"right"} color={"red"} icon={"close"} onClick={() => {
                                            setEditedValues({
                                                ...editedValues,
                                                targetSpeciality: editedValues.targetSpeciality
                                            })
                                            setEditingData(null)
                                            setEditField("")
                                        }}></Button>
                                    </React.Fragment>}
                                </Table.Cell>

                                <Table.Cell>{ editedField !== "startDate" 
                                    ? <React.Fragment>{ editedValues.startDate ? moment(editedValues.startDate).format("YYYY-MM-DD") : "NA" }
                                        <Button floated={"right"} icon={"edit"} onClick={() => {
                                            setEditingData({
                                                value: moment(editedValues.startDate)
                                            })
                                            setEditField("startDate")
                                        }}></Button>
                                    </React.Fragment>
                                    : <React.Fragment>
                                        <Input
                                            type={"date"}
                                            value={editingData.value.format("YYYY-MM-DD")}
                                            onChange={(e, {value}) => {
                                                setEditingData({
                                                    value: moment(value),
                                                });
                                            }}
                                        />
                                        <Button floated={"right"} color={"green"} icon={"check"} onClick={() => {
                                            setEditedValues({
                                                ...editedValues,
                                                startDate: editingData.value
                                            })
                                            setEditingData(null)
                                            setEditField("")
                                        }}></Button>
                                        <Button floated={"right"} color={"red"} icon={"close"} onClick={() => {
                                            setEditedValues({
                                                ...editedValues,
                                                startDate: editedValues.startDate
                                            })
                                            setEditingData(null)
                                            setEditField("")
                                        }}></Button>
                                    </React.Fragment>}
                                </Table.Cell>
                                <Table.Cell textAlign={"center"}>
                                    <Checkbox checked={editedValues.hasEntranceTest}
                                        onChange={(e, { checked }) => {
                                            setEditedValues({
                                                ...editedValues,
                                                hasEntranceTest: checked,
                                            })
                                    }}/>
                                </Table.Cell>
                            </Table.Row>
                        </Table.Body>
                        <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell singleLine>Lecturers</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Enroled students</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Description</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Name</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Options</Table.HeaderCell>
                        </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>
                                    <List style={{
                                        maxHeight: "20em",
                                        overflowY: 'scroll',
                                    }}>
                                        { editedValues.lecturersUsers.map(lect => <List.Item key={`lect-${lect}`}>
                                            <Card fluid>
                                                <Card.Content>
                                                    <Card.Header>{`${lect.firstName}${lect.lastName}`}</Card.Header>
                                                    <Card.Description>
                                                        {`${lect.username}`}
                                                    </Card.Description>
                                                </Card.Content>
                                                <Card.Content extra>
                                                    <Button floated={"right"} color={"red"} icon={"delete"}></Button>
                                                </Card.Content>
                                            </Card>
                                        </List.Item>)
                                        }
                                    </List>
                                </Table.Cell>
                                <Table.Cell>
                                    <List style={{
                                        maxHeight: "20em",
                                        overflowY: 'scroll',
                                    }}>
                                        { rederEnrolments()
                                        }
                                    </List>
                                </Table.Cell>
                                <Table.Cell>{ editedField !== "description"
                                    ? <React.Fragment>{`${editedValues.description.substr(0, 64)}...`}
                                        <Button floated={"right"} icon={"edit"} onClick={() => {
                                            setEditingData({
                                                value: editedValues.description
                                            })
                                            setEditField("description")
                                        }}></Button>
                                    </React.Fragment>
                                    : <React.Fragment>
                                        <Label>{`${editingData.value.length}/${constraints.maxDescriptionLen}`}</Label>
                                        <br/>
                                        <TextArea rows={5} type={"text"} value={editingData.value} onChange={(e, {value}) => {
                                            if (value.length <= constraints.maxDescriptionLen) {
                                                setEditingData({
                                                    value
                                                });
                                            }
                                        }}/>
                                        <Button floated={"right"} color={"green"} icon={"check"} onClick={() => {
                                            setEditedValues({
                                                ...editedValues,
                                                description: editingData.value
                                            })
                                            setEditingData(null)
                                            setEditField("")
                                        }}></Button>
                                        <Button floated={"right"} color={"red"} icon={"close"} onClick={() => {
                                            setEditedValues({
                                                ...editedValues,
                                                description: editedValues.description
                                            })
                                            setEditingData(null)
                                            setEditField("")
                                        }}></Button>
                                    </React.Fragment>
                                }
                                </Table.Cell>
                                <Table.Cell>{ editedField !== "name"
                                    ? <React.Fragment>{editedValues.name}
                                        <Button floated={"right"} icon={"edit"} onClick={() => {
                                            setEditingData({
                                                value: editedValues.name
                                            })
                                            setEditField("name")
                                        }}></Button>
                                    </React.Fragment>
                                    : <React.Fragment>
                                        <Input label={`${editingData.value.length}/${constraints.maxNameLen}`} type={"text"} value={editingData.value} onChange={(e, {value}) => {
                                            if (value.length <= constraints.maxNameLen) {
                                                setEditingData({
                                                    value
                                                });
                                            }
                                        }}/>
                                        <Button floated={"right"} color={"green"} icon={"check"} onClick={() => {
                                            setEditedValues({
                                                ...editedValues,
                                                name: editingData.value
                                            })
                                            setEditingData(null)
                                            setEditField("")
                                        }}></Button>
                                        <Button floated={"right"} color={"red"} icon={"close"} onClick={() => {
                                            setEditedValues({
                                                ...editedValues,
                                                name: editedValues.name
                                            })
                                            setEditingData(null)
                                            setEditField("")
                                        }}></Button>
                                    </React.Fragment>
                                }
                                </Table.Cell>
                                <Table.Cell>
                                    <Button color={"blue"} icon={"save"} floated={"right"} disabled={!isChanged()}/>
                                    <Button color={"grey"} icon={"undo"} floated={"right"} disabled={!isChanged()}
                                        onClick={() => {
                                            setEditedValues({
                                                ...course
                                            });
                                    }}/>
                                </Table.Cell>
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