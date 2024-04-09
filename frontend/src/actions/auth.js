import axios from 'axios';
import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    USER_LOADED_SUCCESS,
    USER_LOADED_FAIL,
    AUTHENTICATED_SUCCESS,
    SIGNUP_SUCCESS,
    SIGNUP_FAIL,
    LOGOUT,
    REFRESH_SUCCESS
} from './types';


export const login = (email, password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const body = JSON.stringify({ email, password });

    await axios.post(`${process.env.REACT_APP_API_URL}/auth/jwt/create/`, body, config)
        .then( (res) => {
            dispatch({
                type: LOGIN_SUCCESS,
                payload: res.data
            });
            dispatch(load_user(res.data.access));
        }, (res) => {
            dispatch({
                type: LOGIN_FAIL
            })
            throw res.response
        });

};

export const logout = () => async dispatch => {
    dispatch({
        type: LOGOUT
    });
};

export const load_user = ( accessToken ) => async dispatch => {
    if (accessToken) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${accessToken}`,
                'Accept': 'application/json'
            }
        }; 

        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users/me/`, config);
    
            dispatch({
                type: USER_LOADED_SUCCESS,
                payload: res.data,
            });

        } catch (err) {
            dispatch({
                type: USER_LOADED_FAIL
            });
            throw err
        }
    } else {
        dispatch({
            type: USER_LOADED_FAIL
        });
        throw Object.assign(
            new Error("Access token not found")
        );
    }
};

export const refresh = ( refreshToken ) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }; 

    const body = JSON.stringify({ refresh: refreshToken });

    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/jwt/refresh/`, body, config);
        dispatch({
            type: REFRESH_SUCCESS,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: LOGOUT
        });
    }


}

export const checkAuthenticated = ( accessToken, refreshToken ) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }; 

    const body = JSON.stringify({ token: accessToken });
    await axios.post(`${process.env.REACT_APP_API_URL}/auth/jwt/verify/`, body, config)
    .then( () => {
        dispatch({
            type: AUTHENTICATED_SUCCESS
        });
    }, 
    () => {
        dispatch(refresh(refreshToken))
    });
    
};


export const signup = (first_name, last_name, email, password, re_password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ first_name, last_name, email, password, re_password });

    await axios.post(`${process.env.REACT_APP_API_URL}/auth/users/`, body, config)
        .then( 
            (res) => {
                dispatch({
                    type: SIGNUP_SUCCESS,
                    payload: res.data
                })
            }, 
            (res) => {
                dispatch({
                    type: SIGNUP_FAIL
                })
                //console.log(res.response.data)
                throw res.response
            })
};

