import React from "react";
import { Dropdown, Grid, Segment, Input } from "semantic-ui-react";

export const MyFiltersComponent = (props) => {
     console.log(props.teachersList);
    return (
        <React.Fragment>
            <Segment>
                <Grid columns={2}>
                    <Grid.Row columns={1}>
                    <Grid.Column>
                    <Input
                        fluid
                        name="name"
                        label={"Filter by name"}
                        value={props.name}
                        placeholder={"Enter course name here"}
                        onChange={(e, {value}) => {
                            console.log(e.target.value, value);
                            props.setUsernameFilter(value);
                        }}
                    />
                    </Grid.Column></Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                        <Dropdown
                            fluid
                            placeholder={"Select lecturers"}
                            multiple
                            search
                            selection
                            clearable
                            options={props.teachersList.map(lect => ({
                                key: lect.id,
                                text: `${lect.firstName} ${lect.lastName}`,
                                value: lect.id
                            }))}
                            value={props.lecturers}
                            onChange={(e, {value}) => {
                                console.log("ADD/CLEAR_LECTURER: ", value);
                                props.setLecturersFilter(value);
                            }}
                        /></Grid.Column>
                        <Grid.Column>
                        <Dropdown
                            fluid
                            placeholder={"Select owner"}
                            
                            search
                            selection
                            clearable
                            options={props.teachersList.map(lect => ({
                                key: lect.id,
                                text: `${lect.firstName} ${lect.lastName}`,
                                value: lect.id
                            }))}
                            value={props.owner}
                            onChange={(e, {value}) => {
                                console.log("ADD/CLEAR_OWNER: ", value);
                                props.setOwnerFilter(value);
                            }}
                        /></Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        </React.Fragment>
    );
}