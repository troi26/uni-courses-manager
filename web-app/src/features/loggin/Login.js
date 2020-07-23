import {Field, Form, Formik, FormikProps} from "formik";
import {Button, Form as FormSemantic, Message, Grid, Segment} from "semantic-ui-react";
import React from "react";
import {useHistory} from "react-router";
import { useState } from 'react';
import { useDispatch } from "react-redux";

import { loginAttempt } from "./loginSlice"


const MyUsernameInput = ({field, form, ...props}) => {
    console.log(field, form, props);
    return (
        <FormSemantic.Input
            fluid
            label='Username'
            placeholder={"Enter username"}
            error={form.errors.username ? {content: form.errors.username, pointing: "below"} : false}
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
            error={form.errors.password ? {content: form.errors.password, pointing: "below"} : false}
            value={form.values.password}
            onChange={e => form.setFieldValue('password', e.target.value)}
        />
    )
};

export const Login = () => {
    const [errors, setErrors] = useState(null);

    const history = useHistory();
    const dispatch = useDispatch();

    return (
            <Formik
                initialValues={{
                    username: "",
                    password: "",
                }}
                onSubmit={(values, actions) => {
                    dispatch(loginAttempt(values));
                }}
            >{(props: FormikProps<any>) => {
                console.log(props);
                return (
                    <Grid textAlign="center"
                    >
                        <Grid.Column>
                            <h1 style={{color: 'white'}}>Login</h1>
                            <Form style={{
                                width: '50%',
                                margin: 'auto',
                            }}>
                                { errors &&
                                <Message attached='bottom' error>
                                    {errors}
                                </Message>
                                }
                                <FormSemantic inverted>
                                    <Field name={"username"} component={MyUsernameInput}/>
                                    <Field name={"password"} component={MyPasswordInput}/>
                                    <Button type={"submit"} color={"blue"}>Sing in</Button>
                                </FormSemantic>
                            </Form>
                        </Grid.Column>
                    </Grid>
                )
            }}
            </Formik>
    );
};