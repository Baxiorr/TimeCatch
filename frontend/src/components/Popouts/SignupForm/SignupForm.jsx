import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import './SignupForm.css';
import { signup } from '../../../actions/auth';
import {
    MDBBtn,
    MDBInput,
    MDBRow,
    MDBCol,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalBody,
  }
  from 'mdb-react-ui-kit';
import { Container } from 'react-bootstrap';

const SignupForm = ({ isVisible, onClose }) => {
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        repeatPassword: ''
      });

    const { firstName, lastName, email, password, repeatPassword } = formData;
    const dispatch = useDispatch();
    const handleChange = event => {
        const { name, value } = event.target;
        setFormData({
          ...formData,
          [name]: value
        });
      };

    const handleSubmit = e => {
        e.preventDefault();

        if (password === repeatPassword) {
            dispatch(signup(firstName, lastName, email, password, repeatPassword))
                .then(
                    () => {
                        console.log('Acc created');
                        alert('Account created');
                        onClose();
                    },
                    (reason) => {
                        Object.values(reason.data)[0].forEach(text => {
                            console.log(text);
                            alert(text.charAt(0).toUpperCase() + text.slice(1)); 
                        });
                        console.log('Acc NOT created');
                    }
                );
        }
    };


    return (
    <MDBModal tabIndex='-1' staticBackdrop show={isVisible}>
        <MDBModalDialog centered>
            <MDBModalContent >
                <MDBModalHeader>
                    <MDBBtn className='btn-close' color='none' onClick={onClose}></MDBBtn>
                </MDBModalHeader>
                <MDBModalBody>
                    <Container fluid className='p-5 text-center'>

                            <h2 className="fw-bold mb-5">Sign up now</h2>
                            <form onSubmit={handleSubmit}>
                                <MDBRow>
                                <MDBCol col='6'>
                                    <MDBInput 
                                    wrapperClass='mb-4' 
                                    label='First name' 
                                    type='text'
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    />
                                </MDBCol>

                                <MDBCol col='6'>
                                    <MDBInput 
                                        wrapperClass='mb-4' 
                                        label='Last name' 
                                        type='text'
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </MDBCol>
                                </MDBRow>

                                <MDBInput 
                                    wrapperClass='mb-4' 
                                    label='Email' 
                                    type='email'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <MDBInput 
                                    wrapperClass='mb-4' 
                                    label='Password' 
                                    type='password'
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <MDBInput 
                                    wrapperClass='mb-4' 
                                    label='Reapeat password' 
                                    type='password'
                                    name="repeatPassword"
                                    value={formData.repeatPassword}
                                    onChange={handleChange}
                                    required
                                />

                                <MDBBtn className='w-100 mb-4' size='md' type='submit'>sign up</MDBBtn>
                            </form>

                    </Container>
                </MDBModalBody>
            </MDBModalContent>
        </MDBModalDialog>
    </MDBModal>
    );

};

export default SignupForm;