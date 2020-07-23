import React, { Component, useState } from 'react'
import { Menu, Segment, Sticky } from 'semantic-ui-react';
import {NavLink, useHistory} from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { selectLogged, logout } from '../loggin/loginSlice';
import { roles } from '../register/Register';

export const HeaderMenu = (props) => {
    const [activeItem, setActiveItem] = useState('login');

    const logged = useSelector(selectLogged);

    const dispatch = useDispatch();

    const history = useHistory();
    const handleLogout = () => {
        dispatch(logout());
        history.push("/auth/login");
        setActiveItem("login");
    };

    return (
        <Sticky onTop>
            <Menu inverted pointing secondary>
                { !logged &&
                <React.Fragment>
                    <NavLink to={"/auth/login"}>
                    <Menu.Item
                        name='login'
                        active={activeItem === 'login'}
                        onClick={setActiveItem}
                    >Login</Menu.Item>
                    </NavLink>
                    <NavLink to={"/auth/register"}>
                    <Menu.Item
                        name='register'
                        active={activeItem === 'register'}
                        onClick={setActiveItem}
                        >Register</Menu.Item>
                    </NavLink>
                </React.Fragment>
                }
                { logged &&
                    <React.Fragment>
                        <NavLink to={"/courses"}>
                            <Menu.Item
                                name='login'
                                active={activeItem === 'login'}
                                onClick={setActiveItem}
                            >Courses</Menu.Item>
                        </NavLink>
                        <NavLink to={"/courses/:userId"}>
                            <Menu.Item
                                name='my-courses'
                                active={activeItem === 'my-courses'}
                                onClick={setActiveItem}
                            >Courses</Menu.Item>
                        </NavLink>
                        <Menu.Menu position='right'>
                            <Menu.Item
                                name='logout'
                                active={activeItem === 'logout'}
                                onClick={handleLogout}
                            />
                        </Menu.Menu>
                    </React.Fragment>
                }
                {/* <Menu.Item
                name='friends'
                active={activeItem === 'friends'}
                onClick={this.handleItemClick}
                /> */}
                {/* <Menu.Menu position='right'>
                <Menu.Item
                    name='logout'
                    active={activeItem === 'logout'}
                    onClick={this.handleItemClick}
                />
                </Menu.Menu> */}
            </Menu>
        </Sticky>
    )
}