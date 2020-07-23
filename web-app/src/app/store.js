import { configureStore, applyMiddleware } from '@reduxjs/toolkit';

import thunk from 'redux-thunk';

import loginReducer from '../features/loggin/loginSlice';

export default configureStore({
  reducer: {
    login: loginReducer,
  },
}, applyMiddleware(thunk));
