import React, { useState } from 'react';
import { List, Button, Table, Tab, Segment, Sticky } from 'semantic-ui-react';
import { specialties } from './Course';
import moment from 'moment';
import { NavLink, useHistory } from "react-router-dom";
import { roles } from '../register/Register';
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

    const history = useHistory();
    const buttons = [{
            key: "course-enroll",
            name: "Enrol",
            color: "green",
            isShown: (course) => {
                return course.enrolments.length < course.enrolmentLimit &&
                    moment(course.startDate).diff(moment(), 'seconds') > 0 &&
                    moment(course.endDate).diff(moment(), 'seconds') > 0 &&
                    props.logged.roles.includes(roles.STUDENT) && !course.enrolments.includes(props.logged.id);
            },
            onClick: (event, course) => {
                props.onCourseEnrol(props.logged.id, course.id);
            },
        }, {
            key: "course-cancel-enroll",
            name: "Cancel",
            color: "red",
            isShown: (course) => {
                return moment(course.startDate).diff(moment(), 'seconds') > 0 &&
                props.logged.roles.includes(roles.STUDENT) && course.enrolments.includes(props.logged.id);
            },
            onClick: (event, course) => {
                props.onCancelCourseEnrol(props.logged.id, course.id);
            }
        },{
            key: "course-open",
            name: "Open",
            color: "grey",
            icon: 'eye',
            isShown: (course) => {
                console.log("OWNER_CHECK: ", course.owner, props.logged.id);
                return true;
            },
            onClick: (event, course) => {
                history.push(`/courses/${course.id}`);
            }
        }, {
            key: "course-transfer",
            name: "Transfer",
            color: "blue",
            isShown: (course) => {
                console.log("OWNER_CHECK: ", course.owner, props.logged.id);
                return props.logged.roles.includes(roles.ADMIN) ||
                    props.logged.roles.includes(roles.TEACHER) && course.owner === props.logged.id;
            },
            onClick: (event, course) => {
                props.onOpenTransferModal(course);
            }
        }, {
            key: "course-remove",
            name: "Remove",
            color: "yellow",
            icon: "trash alternate",
            floated: 'right',
            isShown: (course) => {
                console.log("OWNER_CHECK: ", course.owner, props.logged.id);
                return props.logged.roles.includes(roles.ADMIN) ||
                    props.logged.roles.includes(roles.TEACHER) && course.owner === props.logged.id;
            },
            onClick: (event, course) => {
                props.onRemoveCourse(course);
            }
        }, {
            key: "course-end",
            name: "End",
            color: "black",
            icon: "stop red",
            floated: 'right',
            isShown: (course) => {
                console.log("OWNER_CHECK: ", course.owner, props.logged.id);
                return moment().diff(moment(course.startDate), 'seconds') > 0 &&
                (!course.endDate || moment(course.endDate).diff(moment(), 'seconds') > 0) &&
                    (props.logged.roles.includes(roles.ADMIN) || course.owner === props.logged.id);
            },
            onClick: (event, course) => {
                props.onEndCourse(course);
            }
        }];

    const buildButtonsList = (course) => {
        return buttons.filter(b => b.isShown(course));
    }

    console.log("BUTTONS: ", buttons.ROLE_STUDENT);
  return (
    <Segment>
      <Segment style={{
          maxHeight: '30em',
          overflowY: 'scroll',
      }}>
          <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell singleLine>Name</Table.HeaderCell>
                    <Table.HeaderCell singleLine>Started</Table.HeaderCell>
                    <Table.HeaderCell singleLine>Ended</Table.HeaderCell>
                    <Table.HeaderCell singleLine>Specialty</Table.HeaderCell>
                    <Table.HeaderCell singleLine>Start date</Table.HeaderCell>
                    <Table.HeaderCell singleLine>Free places</Table.HeaderCell>
                    <Table.HeaderCell singleLine>Options</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                { props.courses.map(c => 
                <Table.Row key={`course-${c.id}`}>
                    <Table.Cell>{c.name}</Table.Cell>
                    <Table.Cell>{!(moment(c.startDate).diff(moment(), 'seconds') > 0) ? "YES" : "NO"}</Table.Cell>
                    <Table.Cell>{c.endDate ? (!(moment(c.endDate).diff(moment(), 'seconds') > 0) ? "YES" : "NO") : "NO"}</Table.Cell>
                    <Table.Cell>{specialties[c.targetSpeciality]}</Table.Cell>
                    <Table.Cell>{moment(c.startDate).format("YYYY-MM-DD")}</Table.Cell>
                    <Table.Cell>{`${c.enrolmentLimit - c.enrolments.length}/${c.enrolmentLimit}`}</Table.Cell>
                    <Table.Cell>{buildButtonsList(c).map(b => b.icon ?
                    <Button
                        key={b.key}
                        color={b.color}
                        onClick={(event) => b.onClick(event, c)}
                        icon={b.icon ? b.icon : "none"}
                        floated={b.floated ? b.floated : 'left'}
                    /> :
                    <Button
                        key={b.key}
                        color={b.color}
                        onClick={(event) => b.onClick(event, c)}
                        content={b.icon ? false : b.name}
                        floated={b.floated ? b.floated : 'left'}
                    />)}</Table.Cell>
                </Table.Row>)
                }
            </Table.Body>
          </Table>
      </Segment>
        <Table style={{
            border: 'none'
        }}>
            <Table.Body>
            { (props.logged.roles.includes(roles.TEACHER) || props.logged.roles.includes(roles.ADMIN)) &&
                <Table.Row>
                    <Table.Cell colspan={2}>
                        <NavLink to={"/courses/create"}> <Button fluid icon={"plus"} /></NavLink></Table.Cell>
                </Table.Row>
            }
            </Table.Body>
        </Table>
    </Segment>
  );
}