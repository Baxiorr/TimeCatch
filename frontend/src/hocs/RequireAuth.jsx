import React from 'react';
// import Navbar from '../components/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthenticated } from '../actions/auth';
import { Outlet, Navigate, useLocation } from 'react-router-dom';


const RequireAuth = () => {

    const credentials = useSelector(state => state.auth)
    const dispatch = useDispatch();
    const location = useLocation();



    if (credentials.access) {
        dispatch(checkAuthenticated(credentials.access, credentials.refresh))
    } 


    return (
        <div>
        {
        credentials.isAuthenticated
            ? <Outlet />
            : <Navigate to="login" state={{ from: location }} replace />
            
        }
        </div>
    );
};

export default RequireAuth;