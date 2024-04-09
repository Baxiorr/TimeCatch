import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    access: '',
    refresh: '',
    isAuthenticated: null,
    user: null,
};

export const authSlice = createSlice({
    name:'auth',
    initialState: initialState,
    reducers: {
        loginSuccess: (state, action) => {
            const { access, refresh } = action.payload
            state.access = access;
            state.refresh = refresh;
            state.isAuthenticated = true;
            state.user = null;
        },
        userLoadSuccess: (state, action) => {
            state.user = action.payload;
        },
        authSuccess: (state, action) => {
            state.isAuthenticated = true;
        },
        refreshSuccess: (state, action) => {
            const { access } = action.payload
            state.access = access;
            state.isAuthenticated = true;
        },
        signupSuccess: (state, action) => {
            state.access = null;
            state.refresh = null; 
            state.isAuthenticated = false;
            state.user = action.payload;
        },
        authFail: (state, action) => {
            state.isAuthenticated = false;
        },
        clearData: (state, action) => {
            state.access = null;
            state.refresh = null;
            state.isAuthenticated = false;
            state.user = null;
        }        
    }
})
export const { 
    authSuccess, 
    loginSuccess, 
    signupSuccess, 
    userLoadSuccess, 
    refeshSuccess,
    authFail,  
    clearData 
} = authSlice.actions

export default authSlice.reducer
