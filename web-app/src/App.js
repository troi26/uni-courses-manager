import React from 'react';
import './App.css';
// import Route from "react-router-dom/es/Route";
import Switch from "react-router-dom/es/Switch";
import {BrowserRouter, Redirect, Route} from "react-router-dom";
import { HeaderMenu } from './features/menu/Menu';
import { Segment } from 'semantic-ui-react';
import { Login } from './features/loggin/Login';
import { Register } from './features/register/Register';
import 'semantic-ui-css/semantic.min.css';
import { CoursesList } from "./features/courses/CoursesList";
import { selectLogged, loadLogged, selectLoaded } from './features/loggin/loginSlice';
import { useSelector, useDispatch } from 'react-redux';
import { Course } from './features/courses/Course';
import { CourseCreator } from './features/courses/CourseCreation';
import { User } from './features/users/User';
// import {createBrowserHistory} from "history";

// export const history = createBrowserHistory();

function App() {
  const dispatch = useDispatch();
  const isLoaded = useSelector(selectLoaded);
  if (!isLoaded) {
    dispatch(loadLogged());
  }
  const logged = useSelector(selectLogged);
  console.log("LOGGED_APP: ", logged);

  return (
    <div className="App">
      <BrowserRouter>
        <Segment inverted>
          <HeaderMenu />
        </Segment>
        <Switch>
          <Route exact path="/auth/login" >
            { !logged
              ? <Login />
              : <Redirect to={"/courses"} />
            }
          </Route>
          <Route exact path="/auth/register" >
            { !logged
              ? <Register />
              : <Redirect to={"/courses"} />
            }
          </Route>
          <Route exact path="/courses/create" >
            { !logged
              ? <Redirect to={"/auth/login"} />
              : <CourseCreator />
            }
          </Route>
          <Route exact path="/courses/:courseId" >
            { !logged
              ? <Redirect to={"/auth/login"} />
              : <Course />
            }
          </Route>
          <Route exact path="/courses" >
            { !logged
              ? <Redirect to={"/auth/login"} />
              : <CoursesList />
            }
          </Route>
          <Route exact path="/users/:userId" >
            { !logged
              ? <Redirect to={"/auth/login"} />
              : <User />
            }
          </Route>
          <Route path="/*">
            { !logged
              ? <Redirect to={"/auth/login"} />
              : <Redirect to={"/courses"} />
            }
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
