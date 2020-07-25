import {Field, Form, Formik, FormikProps} from "formik";
import {Button, Form as FormSemantic, Message, Grid, Segment, Checkbox} from "semantic-ui-react";
import React from "react";
import axios from 'axios';
import { useHistory } from "react-router-dom";
import { useState } from 'react';
import { registerCall } from "../../api/users.api";

export const userConstraints = {
    PASSWORD_MIN_LENGTH: 8,
    USERNAME_MAX_LENGTH: 15,
    PASSWORD_PATTERN: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/,
};

export const roles = {
    ADMIN: "ROLE_ADMIN",
    TEACHER: "ROLE_TEACHER",
    STUDENT: "ROLE_STUDENT",
};

const MyUsernameInput = ({field, form, ...props}) => {
    console.log(field, form, props);
    return (
        <FormSemantic.Input
            fluid
            label='Username'
            placeholder={"Enter username"}
            error={form.errors.username ? {content: form.errors.username}
                : props.errors ? props.errors.properties.message : false}
            value={form.values.username}
            onChange={e => form.setFieldValue('username', e.target.value)}
        />
    )
};


const MyPasswordInput = ({field, form, ...props}) => {
    console.log(field, form.errors, props);
    return (
        <FormSemantic.Input
            fluid
            label='Password'
            type={"password"}
            placeholder={"Enter password"}
            error={form.errors.password ? {content: form.errors.password}
            : props.errors ? props.errors.properties.message : false}
            value={form.values.password}
            onChange={e => form.setFieldValue('password', e.target.value)}
        />
    )
};


const MyFirstNameInput = ({field, form, ...props}) => {
    console.log(field, form, props);
    return (
        <FormSemantic.Input
            fluid
            label='First name'
            type={"text"}
            placeholder={"e.g: Dimitar"}
            error={form.errors.firstName ? {content: form.errors.firstName}
            : props.errors ? props.errors.properties.message : false}
            value={form.values.firstName}
            onChange={e => form.setFieldValue('firstName', e.target.value)}
        />
    )
};

function validateUsername(value) {
    let error;
    if (value.length > userConstraints.USERNAME_MAX_LENGTH) {
        error = `Username max length is: ${userConstraints.USERNAME_MAX_LENGTH}`;
    }
    return error;
}

function validatePassword(value) {
    let error;
    if (value.length < userConstraints.PASSWORD_MIN_LENGTH) {
        error = `Password have to be at least ${userConstraints.PASSWORD_MIN_LENGTH} characters long`;
    } else if (!value.match(userConstraints.PASSWORD_PATTERN)) {
        error = `Password have to contain at least one digit and one special character[!,@,#,$,%,^,&,*]`;
    }
    return error;
}

const MyLastNameInput = ({field, form, ...props}) => {
    console.log(field, form, props);
    return (
        <FormSemantic.Input
            fluid
            label='Last name'
            type={"text"}
            placeholder={"e.g: Kolev"}
            error={form.errors.lastName ? {content: form.errors.lastName}
            : props.errors ? props.errors.properties.message : false}
            value={form.values.lastName}
            onChange={e => form.setFieldValue('lastName', e.target.value)}
        />
    )
};

const MyRolesInput = ({field, form, ...props}) => {

    console.log(field, form, props);
    return (
        <Segment inverted>
            <Segment compact inverted>
            <Checkbox inverted
                id='role-Admin'
                checked={form.values.roles.includes(roles.ADMIN)}
                label='Admin'
                onChange={(event) => {
                    if (!event.target.checked) {
                        form.setFieldValue("roles", form.values.roles.filter(r => r !== roles.ADMIN))
                    } else {
                        form.setFieldValue("roles", [roles.ADMIN].concat(form.values.roles))
                    }
                }}
            />
            </Segment>
            <Segment compact inverted>
            <Checkbox inverted
                id='role-Teacher'
                checked={form.values.roles.includes(roles.TEACHER)}
                label='Teacher'
                onChange={(event) => {
                    if (!event.target.checked) {
                        form.setFieldValue("roles", form.values.roles.filter(r => r !== roles.TEACHER))
                    } else {
                        form.setFieldValue("roles", [roles.TEACHER].concat(form.values.roles))
                    }
                }}
            />
            </Segment>
            <Segment compact inverted>
            <Checkbox inverted
                id='role-Student'
                checked={form.values.roles.includes(roles.STUDENT)}
                label='Student'
                onChange={(event) => {
                    if (!event.target.checked) {
                        form.setFieldValue("roles", form.values.roles.filter(r => r !== roles.STUDENT))
                    } else {
                        form.setFieldValue("roles", [roles.STUDENT].concat(form.values.roles))
                    }
                }}
            />
            </Segment>
        </Segment>
    )
};

export const Register = () => {
    const [errors, setErrors] = useState(null);

    const history = useHistory();
    // const dispatch = useDispatch();

    const handleRegister = async (data) => {
        try {
            const response = await registerCall(data);
            console.log("REGISTER SUCCESS: ", response);
            history.push("/auth/login");
        } catch (err) {
            console.log("REGISTER ERROR: ", err);
            setErrors(err.errors);
        }
    };

    return (
            <Formik
                initialValues={{
                    // Once the username is set wont be able to change
                    id: null,
                    username: "",
                    password: "",
                    firstName: "",
                    lastName: "",
                    roles: [],
                }}
                onSubmit={(values, actions) => {
                    handleRegister(values);
                }}
            >{(props) => {
                // console.log(props);
                return (
                    <Grid textAlign="center"
                    >
                        <Grid.Column>
                            <h1 style={{color: 'white'}}>Register</h1>
                            <Form style={{
                                width: '50%',
                                margin: 'auto',
                            }}>
                                <FormSemantic inverted>
                                    <Field name={"firstName"} component={MyFirstNameInput} errors={errors ? errors["firstName"] : null} />
                                    <Field name={"lastName"} component={MyLastNameInput} errors={errors ? errors["lastName"] : null} />
                                    <Field name={"username"} component={MyUsernameInput} errors={errors ? errors["username"] : null} validate={validateUsername}/>
                                    <Field name={"password"} component={MyPasswordInput} errors={errors ? errors["password"] : null} validate={validatePassword}/>
                                    <Field name={"roles"} component={MyRolesInput} />
                                    <Button type={"submit"} color={"blue"}>Sing up</Button>
                                </FormSemantic>
                            </Form>
                        </Grid.Column>
                    </Grid>
                )
            }}
            </Formik>
    );
};