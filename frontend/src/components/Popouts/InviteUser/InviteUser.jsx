import React from 'react'
import { useSelector } from 'react-redux';
import { useState } from 'react';
import axios from 'axios'
import { 
    MDBContainer,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalBody,
    MDBModalHeader,
    MDBBtn,
    MDBInput } from 'mdb-react-ui-kit';

const InviteUser = ( {isVisible, toggleView, teamId, invitationFunction} ) => {
    const credentials = useSelector(state => state.auth)
    const [userEmail, setUserEmail] = useState('');


    const inviteUser = async(e) => {
        e.preventDefault();

        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const body = JSON.stringify({
            email: userEmail.toLocaleLowerCase(),
            requested_by: credentials.user.id
        });
        await axios.post(`${process.env.REACT_APP_API_URL}/api/invite/${teamId}/invite/`, body, config)
            .then( (res) => {
                toggleView();
                invitationFunction();
            }, () => {
                console.log("NIE DZIALA")
            });
    }

    const onChange = e => {
        setUserEmail( e.target.value );
    }

    return (
        <MDBModal tabIndex='-1' staticBackdrop show={isVisible}>
            <MDBModalDialog centered>
                <MDBModalContent >
                    <MDBModalHeader>
                        <MDBBtn className='btn-close' color='none' onClick={toggleView}></MDBBtn>
                    </MDBModalHeader>
                    <MDBModalBody>
                        <MDBContainer fluid className='p-3 text-center'>
                                <h2 className="fw-bold mb-3">Invite user</h2>
                                <form onSubmit={inviteUser}>
                                <MDBInput 
                                    wrapperClass='mb-3 w-20' 
                                    label='Invite user' 
                                    type='userEmail'
                                    name='userEmail' 
                                    value={userEmail}
                                    onChange={onChange}
                                    required
                                />
                                <MDBBtn className="btn-success px-4 w-30" type='submit'>Invite</MDBBtn>
                                </form>
                        </MDBContainer>
                    </MDBModalBody>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    )
}

export default InviteUser