import React from 'react'
import axios from 'axios'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { 
    MDBContainer,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalBody,
    MDBModalHeader,
    MDBBtn,
    MDBInput } from 'mdb-react-ui-kit';

const CreateProject = ( {isVisible, toggleView, teamInfo} ) => {
    const credentials = useSelector(state => state.auth)
    const [projectName, setProjectName] = useState('');

    const addProject = async(e) => {
        e.preventDefault();

        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const body = JSON.stringify({
            team_id: teamInfo.id,
            title: projectName,
            requested_by: credentials.user.id,
        });
        await axios.post(`${process.env.REACT_APP_API_URL}/api/projects/add/`, body, config)
            .then( (res) => {
                toggleView();
                alert(res.data.title);
            }, () => {
                console.log("NIE DZIALA")
            });
    }

    const onChange = e => {
        setProjectName( e.target.value );
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
                            <h2 className="fw-bold mb-3">Create new project</h2>
                            <form onSubmit={addProject}>
                            <MDBInput 
                                wrapperClass='mb-3 w-20' 
                                label='Name your team' 
                                type='projectName'
                                name='projectName' 
                                value={projectName}
                                onChange={onChange}
                                required
                            />
                            <MDBBtn className="btn-success px-4 w-30" type='submit'>Add project</MDBBtn>
                            </form>
                    </MDBContainer>
                </MDBModalBody>
            </MDBModalContent>
        </MDBModalDialog>
    </MDBModal>
    )
}

export default CreateProject