import React, { useState } from 'react';
import { List, Button, Table, Tab, Segment, Sticky } from 'semantic-ui-react';
import { specialties } from './Course';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
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
                return moment(course.startDate).diff(moment(), 'seconds') > 0 &&
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
            isShown: (course) => {
                console.log("OWNER_CHECK: ", course.owner, props.logged.id);
                return props.logged.roles.includes(roles.ADMIN) ||
                    props.logged.roles.includes(roles.TEACHER) && course.owner === props.logged.id;
            },
            onClick: (event, course) => {
                history.push(`/courses/${course.id}`);
            }
        }, {
            key: "course-open",
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
        }];

    const buildButtonsList = (course) => {
        return buttons.filter(b => b.isShown(course));
    }

    console.log("BUTTONS: ", buttons.ROLE_STUDENT);
  return (
      <Segment style={{
          maxHeight: '30em',
          overflowY: 'scroll',
      }}>
          <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell singleLine>Name</Table.HeaderCell>
                    <Table.HeaderCell singleLine>Started</Table.HeaderCell>
                    <Table.HeaderCell singleLine>Specialty</Table.HeaderCell>
                    <Table.HeaderCell singleLine>Start date</Table.HeaderCell>
                    <Table.HeaderCell singleLine>Options</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                { props.courses.map(c => 
                <Table.Row>
                    <Table.Cell>{c.name}</Table.Cell>
                    <Table.Cell>{!(moment(c.startDate).diff(moment(), 'seconds') > 0) ? "Yes" : "No"}</Table.Cell>
                    <Table.Cell>{specialties[c.targetSpeciality]}</Table.Cell>
                    <Table.Cell>{moment(c.startDate).format("YYYY-MM-DD")}</Table.Cell>
                    <Table.Cell>{buildButtonsList(c).map(b => b.icon ?
                    <Button
                        color={b.color}
                        onClick={(event) => b.onClick(event, c)}
                        icon={b.icon ? b.icon : "none"}
                        floated={b.floated ? b.floated : false}
                    /> :
                    <Button
                        color={b.color}
                        onClick={(event) => b.onClick(event, c)}
                        content={b.icon ? false : b.name}
                        floated={b.floated ? b.floated : false}
                    />)}</Table.Cell>
                </Table.Row>)
                }
            </Table.Body>
          </Table>
      </Segment>
  );
}