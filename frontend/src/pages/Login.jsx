import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../actions/auth';
import {MDBContainer, MDBCol, MDBRow, MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import SignupForm from '../components/Popouts/SignupForm';
import { AuthButton } from '../util/Util';



const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '' 
    });
    const [showSignUpForm, setShowSignUpForm] = useState(false);

    const { email, password } = formData;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onChange = e => setFormData({ 
        ...formData, 
        [e.target.name]: e.target.value
    });

    const onSubmit = async(e) => {
        e.preventDefault();
        dispatch(login(email.toLocaleLowerCase(), password))
            .then(
                () => {
                    navigate('/app');
                },
                (reason) => {
                    try {
                        console.log(reason);
                        Object.values(reason.data).forEach(text => {
                            console.log(text);
                            alert(text.charAt(0).toUpperCase() + text.slice(1));
                        });
                        
                    } catch (error) {
                        alert("Server Error")
                    } finally {
                        alert("CANNOT LOG IN");
                    }
                }
            );
    };

    const handleSignUpClick = () => {
        setShowSignUpForm(true);
    };

    const handleClose = () => {
        setShowSignUpForm(false);
    };
    

    return (
        <MDBContainer fluid className="p-3 my-5 h-custom">

      <MDBRow>

        <MDBCol col='10' lg='6'>
          <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp" className="img-fluid" alt="" />
        </MDBCol>

        <MDBCol col='2' lg='6'>

        <div className='d-flex flex-column justify-content-center w-75 pt-4'>

            <h3 className="fw-normal mb-3 ps-5 pb-3" style={{letterSpacing: '1px'}}>Log in</h3>
            <form onSubmit={onSubmit}>
                <MDBInput 
                    wrapperClass='mb-4 mx-5 w-100' 
                    label='Email address' 
                    type='email'
                    name='email' 
                    size="lg" 
                    value={email}
                    onChange={e => onChange(e)}
                />
                <MDBInput 
                    wrapperClass='mb-4 mx-5 w-100' 
                    label='Password' 
                    type='password' 
                    name='password'
                    size="lg" 
                    value={password}
                    onChange={e => onChange(e)}
                    minLength='6'
                    required
                />

                <MDBBtn className="mb-4 px-5 mx-5 w-100" size='lg' type='submit'>Login</MDBBtn>
            </form>
            <p className='ms-5'>Don't have an account? <span className='link-info hover' onClick={handleSignUpClick}>Register here</span></p>
            
            {showSignUpForm && (
            <SignupForm isVisible={showSignUpForm} onClose={handleClose} />
            )}
        </div>
        </MDBCol>
      </MDBRow>
      
    </MDBContainer>
    );
};


export default Login;
