import { createSlice } from '@reduxjs/toolkit';
import { domain } from '../../api/server.connection';
import { getStore, checkForStore, getStoreSlice, createStoreSlice } from '../../app/storage/localeStorageAPI';

const storage = getStore();
export const loginSlice = createSlice({
  name: 'login',
  initialState: {
    logged: null,
    loaded: false,
    errors: {
        has: false,
        message: ""
    },
  },
  reducers: {
    
    loadLogged: state => {
        const loggedUserStore = getStoreSlice("Logged");
        if (loggedUserStore) {
            state.loaded = true;
            state.logged = loggedUserStore;
        } else {
            createStoreSlice("Logged");
        }
    },
    login: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      
      // TODO: Sign in logic here
      if (checkForStore("Logged")) {
        storage.set("Logged", action.payload);
      } else {
        createStoreSlice("Logged");
        storage.set("Logged", action.payload);
      }
      console.log("LOGIN REDUCER: ", action.payload);
      state.logged = action.payload;
    },
    logout: state => {
        // TODO: Sign out logic here
        if (checkForStore("Logged")) {
            const loggedStore = getStoreSlice("Logged");
            storage.set("Logged", null);
        }

        state.errors = {
            has: false,
            message: "",
        };
        state.logged = null;
    },
    addError: (state, action) => {
        console.log("ERR", action);
        state.errors = {
            has: true,
            message: action.payload,
        };
    }
  },
});

export const { login, logout, addError, loadLogged } = loginSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const loginAttempt = loginData => dispatch => {
//   setTimeout(() => {
//     dispatch(login(loginData));
//   }, 1000);
    console.log("LOGIN: ", loginData);
    const endPoint = `${domain}/api/users/auth/login`
    fetch(endPoint, {
        method: "POST",
        headers: {
            "Content-Type": 'application/json',
        },
        body: JSON.stringify(loginData),
    }).then(res => {
        console.log(res);
        if (res.ok) {
            return res.json();
        }
        throw res.json();
    }).then(data => {
        console.log("DATA:", data);
        dispatch(login(data));
    }).catch(err => {
        dispatch(addError(err));
    });
};

export const selectLogged = state => state.login.logged;
export const selectLoaded = state => state.login.loaded;

export default loginSlice.reducer;
