import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk';
import authReducer from './reducers/auth'

const initialState = {};

const middleware = [thunk];

const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    initialState: initialState,
    middleware: middleware
})

export default store;