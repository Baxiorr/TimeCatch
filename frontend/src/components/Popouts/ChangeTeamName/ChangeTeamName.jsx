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

const ChangeTeamName = ( {isVisible, toggleView, teamId, setShownTitle} ) => {
    const credentials = useSelector(state => state.auth)
    const [teamName, setTeamName] = useState('');


    const editTeam = async(e) => {
        e.preventDefault();

        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const body = JSON.stringify({
            title: teamName,
            team_id: teamId,
            requested_by: credentials.user.id
        });
        await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/edit_name/`, body, config)
            .then( (res) => {
                toggleView();
                setShownTitle(res.data.title)
            }, () => {
                console.log("NIE DZIALA")
            });
    }

    const onChange = e => {
        setTeamName( e.target.value );
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
                                <h2 className="fw-bold mb-3">Change team name</h2>
                                <form onSubmit={editTeam}>
                                <MDBInput 
                                    wrapperClass='mb-3 w-20' 
                                    label='Set new name' 
                                    type='teamName'
                                    name='teamName' 
                                    value={teamName}
                                    onChange={onChange}
                                    required
                                />
                                <MDBBtn className="btn-success px-4 w-30" type='submit'>Change name</MDBBtn>
                                </form>
                        </MDBContainer>
                    </MDBModalBody>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    )
}

export default ChangeTeamName