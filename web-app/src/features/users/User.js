import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Segment, List, Dimmer, Loader, Table, Button, Input, Modal, Header, Icon, Divider, Tab } from 'semantic-ui-react';
import { loadUserById, modifyUser, passwordChange } from '../../api/users.api';
import moment from 'moment';
import { Logger } from 'mongodb';
import { useSelector, useDispatch } from 'react-redux';
import { selectLogged, changeToken } from '../loggin/loginSlice';
import { loadCoursesOfStudent } from '../../api/courses.api';

const invertedRoles = {
    ROLE_ADMIN: "Admin",
    ROLE_TEACHER: "Teacher",
    ROLE_STUDENT: "Student",
}
export const User = () => {

    const dispatch = useDispatch();
    const logged = useSelector(selectLogged);
    const { userId } = useParams();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState();
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [passwordChangeModal, setPasswordChange] = useState(null);

    useEffect(() => {

        const loadUser = async () => {
            try {
                const user = await loadUserById(userId, logged.token);
                setUser(user);
                setError(null);
                const courses = await loadCoursesOfStudent(userId, logged.token);
                setCourses(courses);
                setError(null);
                setLoading(false);
            } catch (err) {
                console.log(error);
                setError(err);
                setLoading(false);
            }
        } 

        loadUser();
    }, []);

    const handlePasswordChange = async () => {
        try {
            await passwordChange({
                current: passwordChangeModal.current,
                new: passwordChangeModal.new
            }, logged.id, logged.token);
            dispatch(changeToken(logged.token));
            setPasswordChange(null);
            setPasswordError(null);
        } catch (err) {
            console.log("PASSWORD ERROR: ", err);
            setPasswordError(err);
        }
    }

    return (
        <Segment>
            <Modal open={passwordChangeModal !== null} closeIcon onClose={() => setPasswordChange(null)}>
                <Header icon='browser' content={"Password change"} />
                <Modal.Content>
                    { passwordChangeModal &&
                    <React.Fragment>
                        <Input error={passwordError} value={passwordChangeModal.current} 
                            onChange={(e, { value }) => {
                                setPasswordChange({
                                    ...passwordChangeModal,
                                    current: value,
                                })
                            }}
                        type={'password'} label={'Current'} />
                        <Input value={passwordChangeModal.new} 
                            onChange={(e, { value }) => {
                                setPasswordChange({
                                    ...passwordChangeModal,
                                    new: value,
                                })
                            }}
                        type={"password"} label={'New password'} />
                        <Input value={passwordChangeModal.confirm} 
                            onChange={(e, { value }) => {
                                setPasswordChange({
                                    ...passwordChangeModal,
                                    confirm: value,
                                })
                            }}
                        type={'password'} label={'Confirm passwords'} />
                    </React.Fragment>
                    }
                </Modal.Content>
                <Modal.Actions>
                    <Button color='blue' onClick={() => {
                            handlePasswordChange();
                        }} inverted>
                        <Icon name='checkmark' /> Confirm
                    </Button>
                </Modal.Actions>
            </Modal>
            <h1>Account data</h1>
            { user && !loading &&
            <React.Fragment>
                <Table>
                    <Table.Header>
                        <Table.HeaderCell>
                            First Name
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Last Name
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Username
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Registered on
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Roles
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Options
                        </Table.HeaderCell>
                    </Table.Header>
                    <Table.Body>
                        <Table.Cell>{user.firstName}</Table.Cell>
                        <Table.Cell>{user.lastName}</Table.Cell>
                        <Table.Cell>{user.username}</Table.Cell>
                        <Table.Cell>{moment(user.createdDate).format("YYYY-MM-DD")}</Table.Cell>
                        <Table.Cell>{user.roles.map(r => invertedRoles[r])}</Table.Cell>
                        <Table.Cell><Button color={"yellow"}
                            onClick={() => {
                                setPasswordChange({
                                    current: "",
                                    new: "",
                                    confirm: ""
                                });
                            }}
                        >Change password</Button></Table.Cell>
                    </Table.Body>
                </Table>
                    <h1>Enroled courses</h1>
                <Table>
                    <Table.Header>
                        <Table.HeaderCell>Course name</Table.HeaderCell>
                        <Table.HeaderCell>Grade</Table.HeaderCell>
                    </Table.Header>
                    <Table.Body>
                        { courses.map(c => 
                        <Table.Row key={`course-${c.id}`}>
                            <Table.Cell>{c.name}</Table.Cell>
                            <Table.Cell>{c.grade ? c.grade.value : "-"}</Table.Cell>
                        </Table.Row>
                        )}
                    </Table.Body>
                </Table>
                </React.Fragment>
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
        </Segment>
    );
};