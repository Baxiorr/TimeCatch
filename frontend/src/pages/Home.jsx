import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
    <div className='container'>
        <div className='jumbotron mt-5'>
            <h1 className='display-4'>Welcome!</h1>
            <hr className='my-4' />
            <p>Click button below to start using TimeCatch</p>
            <Link className='btn btn-primary btn-lg' to='/login' role='button'>Click Here</Link>
        </div>
    </div>
);

export default Home;