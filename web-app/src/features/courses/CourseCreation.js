import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Grid, Table, Segment, Card, Button, Dimmer, Loader, Input, Dropdown, List, Checkbox, TextArea, Label, Modal, Header, Icon } from "semantic-ui-react";
import { loadCourseById, modifyCourse, addCourse } from "../../api/courses.api";

import moment from 'moment';
import { loadAllUsers, loadUserById } from "../../api/users.api";
import { useSelector } from "react-redux";
import { selectLogged } from "../loggin/loginSlice";
import { loadGradesByCourse, addGrade, modifyGrade, removeGrade } from "../../api/grades.api";
import { roles } from "../register/Register";

export const specialties = {
    CS: "Computer Sciences",
    I: "Informatics",
    M: "Mathematics",
    SE: "Software Engineering",
    IS: "Informational Systems",
    AM: "Applied Mathematics"
};

export const constraints = {
    maxNameLen: 100,
    maxDescriptionLen: 512,
};

export const CourseCreator = () => {

    const history = useHistory();
    const { courseId } = useParams();
    console.log(courseId);
    // console.log("COURSE: ", props);
    const logged = useSelector(selectLogged);
    const [course, setCourse] = useState({
        id: null,
        name: "",
        owner: logged.id,
        ownerUser: logged,
        description: "",
        lecturers: [],
        lecturersUsers: [],
        enrolmentLimit: 30,
        hasEntranceTest: false,
        targetSpeciality: "I",
        enrolments: [],
        enrolmentsUsers: [],
        startDate: moment().add(1, 'days').startOf('day').format("YYYY-MM-DD"),
    }); 
    const [teachers, setTeachers] = useState(null);
    const [error, setError] = useState(null);
    const [isCourseLoaded, setIsLoaded] = useState(false);
    const [loading, setLoadind] = useState(true);
    const [editedField, setEditField] = useState("");
    const [editingData, setEditingData] = useState({});
    const [editedValues, setEditedValues] = useState({
        id: null,
        name: "",
        owner: logged.id,
        ownerUser: logged,
        description: "",
        lecturers: [],
        lecturersUsers: [],
        enrolmentLimit: 30,
        hasEntranceTest: false,
        targetSpeciality: "I",
        enrolments: [],
        enrolmentsUsers: [],
        startDate: moment().add(1, 'days').startOf('day').format("YYYY-MM-DD"),
    });
    const [grades, setGrades] = useState([]);
    const [gradingDetails, setGradingDetails] = useState(null);
    const [lecturerAddition, setLecturerAddition] = useState(null);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const responseUsers = await loadAllUsers(logged.token);
                setTeachers(responseUsers.filter(u => u.roles.includes(roles.TEACHER)));
                setLoadind(false);
            } catch (err) {
                console.log(err);
                setError(err.response);
                setLoadind(false);
            }
        }

        loadCourse();
    }, [])

    const isChanged = () => {
        if (editedValues.name === "" ||
            editedValues.enrolments.length !== 0
            ) {
                console.log("HERE!!!");
                return false;
        }
        return true;
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
                            <Button floated={'right'} color={"red"} icon={"pencil alternate"}
                                onClick={() => {
                                    setGradingDetails({
                                        userId: e.id,
                                        courseId: course.id,
                                        firstName: e.firstName,
                                        lastName: e.lastName,
                                        grade: e.grade ? e.grade.value : -1,
                                        gradeId: e.grade ? e.grade.id : null,
                                    })
                                }}></Button>
                        </Segment>
                        <Button fluid floated={"right"} color={"red"} icon={"delete"}></Button>
                    </Card.Content>
                </Card>
            </List.Item>)
        })
    }

    const gradeStudent = async (details) => {
        if (details.grade > 0) {
            if (details.gradeId) {
                const data = {
                    id: details.gradeId,
                    userId: details.userId,
                    courseId: details.courseId,
                    value: details.grade
                };
                const modified = await modifyGrade(data, logged.token);
                console.log("MODIFIED_GRADE: ", modified, course.enrolmentsUsers);
                setCourse({
                    ...course,
                    enrolmentsUsers: course.enrolmentsUsers.map(u => 
                        u.id === modified.userId ? {...u, grade: modified} : u)
                })
                setEditedValues({
                    ...editedValues,
                    enrolmentsUsers: editedValues.enrolmentsUsers.map(u => 
                        u.id === modified.userId ? {...u, grade: modified} : u)
                })
            } else {
                const data = {
                    userId: details.userId,
                    courseId: details.courseId,
                    value: details.grade
                };
                const created = await addGrade(data, logged.token);
                console.log("NEW_GRADE: ", created, course.enrolmentsUsers);
                setCourse({
                    ...course,
                    enrolmentsUsers: course.enrolmentsUsers.map(u => 
                        u.id === created.userId ? {...u, grade: created} : u)
                })
                setEditedValues({
                    ...editedValues,
                    enrolmentsUsers: editedValues.enrolmentsUsers.map(u => 
                        u.id === created.userId ? {...u, grade: created} : u)
                })
            }
        } else {
            if (details.gradeId) {
                const deleted = await removeGrade(details.gradeId, logged.token);
                setCourse({
                    ...course,
                    enrolmentsUsers: course.enrolmentsUsers.map(u => 
                        u.id === deleted.userId ? {...u, grade: undefined} : u)
                })
                setEditedValues({
                    ...editedValues,
                    enrolmentsUsers: editedValues.enrolmentsUsers.map(u => 
                        u.id === deleted.userId ? {...u, grade: undefined} : u)
                })
            }
        }
    }

    const handleLecturerAddition = async (newLecturerId) => {
        try {
            console.log("NEW_LECTURER: ", newLecturerId);
            // const response = await addLecturerToCourse(course.id, newLecturerId, logged.token);
            const modified = {
                id: editedValues.id,
                name: editedValues.name,
                owner: editedValues.owner,
                description: editedValues.description,
                enrolmentLimit: course.enrolmentLimit,
                hasEntranceTest: editedValues.hasEntranceTest,
                targetSpeciality: editedValues.targetSpeciality,
                enrolments: editedValues.enrolments,
                startDate: editedValues.startDate,
                lecturers: [newLecturerId].concat(editedValues.lecturers),
            };
            // console.log("MOD_COURSE: ", modified);
            // const response = await modifyCourse(modified, logged.id, logged.token);
            setEditedValues({
                ...editedValues,
                lecturers: modified.lecturers,
                lecturersUsers: [teachers.find(u => u.id === newLecturerId)].concat(editedValues.lecturersUsers),
            });
        } catch (err) {
            console.error(err);
        }
    }

    const handleLecturerDeletion = (remLecturerId) => {
        try {
            console.log("REMOVED_LECTURER: ", remLecturerId);
            // const response = await addLecturerToCourse(course.id, newLecturerId, logged.token);
            const modified = {
                id: editedValues.id,
                name: editedValues.name,
                owner: editedValues.owner,
                description: editedValues.description,
                enrolmentLimit: course.enrolmentLimit,
                hasEntranceTest: editedValues.hasEntranceTest,
                targetSpeciality: editedValues.targetSpeciality,
                enrolments: editedValues.enrolments,
                startDate: editedValues.startDate,
                lecturers: editedValues.lecturers.filter(lId => lId !== remLecturerId),
            };
            // console.log("MOD_COURSE: ", modified);
            // const response = await modifyCourse(modified, logged.id, logged.token);
            setEditedValues({
                ...editedValues,
                lecturers: modified.lecturers,
                lecturersUsers: editedValues.lecturersUsers.filter(u => u.id !== remLecturerId)
            });
        } catch (err) {
            console.error(err);
        }
    }

    const saveCourseChanges = async () => {
        try {
            const modified = {
                id: editedValues.id,
                name: editedValues.name,
                owner: editedValues.owner,
                description: editedValues.description,
                enrolmentLimit: editedValues.enrolmentLimit,
                hasEntranceTest: editedValues.hasEntranceTest,
                targetSpeciality: editedValues.targetSpeciality,
                enrolments: editedValues.enrolments,
                startDate: editedValues.startDate,
                lecturers: editedValues.lecturers,
            };
            const response = await addCourse(modified, logged.token);
            console.log("RESPONSE: ", response);
            history.push(response.location);
        } catch (err) {
            console.error(err);
        }

    };

    return (
        <React.Fragment>
            <Modal
                open={gradingDetails !== null} closeIcon onClose={() => setGradingDetails(null)}>
                <Header icon='browser' content={"Grading"} />
                <Modal.Content>
                    { gradingDetails &&
                    <React.Fragment>
                        <h3>{`Enter ${gradingDetails.firstName} ${gradingDetails.lastName}\`s grade`}</h3>
                        <Dropdown
                            fluid
                            placeholder={"Select a grade"}
                            search
                            selection
                            options={[-1, 2, 3, 4, 5, 6].map(u => ({
                                key: u,
                                text: u > 0 ? u : "-",
                                value: u
                            }))}
                            value={gradingDetails ? gradingDetails.grade : -1}
                            onChange={(e, {value}) => {
                                console.log("ADD/CLEAR_LECTURER: ", value);
                                const newGradingDetails = {...gradingDetails};
                                newGradingDetails.grade = value;
                                setGradingDetails(newGradingDetails);
                            }}
                        /></React.Fragment>
                    }
                </Modal.Content>
                <Modal.Actions>
                    <Button color='blue' onClick={() => {
                            gradeStudent(gradingDetails);
                            setGradingDetails(null);
                        }} inverted>
                        <Icon name='checkmark' /> Grade
                    </Button>
                </Modal.Actions>
            </Modal>
            <Modal
                open={ lecturerAddition !== null } closeIcon onClose={() => setLecturerAddition(null)}>
                <Header icon='browser' content={"Add lecturer"} />
                <Modal.Content>
                    { lecturerAddition &&
                    <React.Fragment>
                        <h3>{`Select new lecturer below`}</h3>
                        <Dropdown
                            fluid
                            placeholder={"Select new lecturer"}
                            search
                            selection
                            options={teachers.map(u => ({
                                key: u.id,
                                text: `${u.firstName} ${u.lastName}`,
                                value: u.id
                            }))}
                            value={lecturerAddition ? lecturerAddition.new : null}
                            onChange={(e, {value}) => {
                                console.log("ADD/CLEAR_LECTURER: ", value);
                                const newLecturer = {...lecturerAddition, new: value};
                                setLecturerAddition(newLecturer);
                            }}
                        /></React.Fragment>
                    }
                </Modal.Content>
                <Modal.Actions>
                    <Button color='blue' onClick={() => {
                            handleLecturerAddition(lecturerAddition.new);
                            setLecturerAddition(null);
                        }} inverted>
                        <Icon name='checkmark' /> Add
                    </Button>
                </Modal.Actions>
            </Modal>
            { course && !loading &&
                <Segment inverted>
                <Grid style={{
                    margin: 0
                }}>
                    <Grid.Row columns={1}>
                        <Grid.Column>
                        <h1 style={{
                            color: 'white'
                        }}>{editedValues.name}</h1>
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
                                                    <Button floated={"right"} color={"red"} icon={"delete"}
                                                        onClick={() => {
                                                            handleLecturerDeletion(lect.id);
                                                        }}
                                                    ></Button>
                                                </Card.Content>
                                            </Card>
                                        </List.Item>)
                                        }
                                        <List.Item key={`lect-add`}>
                                            <Button icon={"plus"} fluid color={"blue"} onClick={() => {
                                                setLecturerAddition({});
                                            }} />
                                        </List.Item>
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
                                    <Button color={"blue"} icon={"save"} floated={"right"} disabled={!isChanged()}
                                        onClick={() => {
                                            saveCourseChanges();
                                        }}
                                    />
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
                </Segment>
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