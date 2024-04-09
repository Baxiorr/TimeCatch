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

const EditProject = ( {isVisible, toggleView, projectId, setShownTitle} ) => {
    const credentials = useSelector(state => state.auth)
    const [projectName, setProjectName] = useState('');
    const onChange = e => {
        setProjectName( e.target.value );
    }

    const editProject = async (e) => {
        e.preventDefault();

        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const body = JSON.stringify({
            title: projectName,
            project_id: projectId,
            requested_by: credentials.user.id
        });
        await axios.post(`${process.env.REACT_APP_API_URL}/api/projects/edit_name/`, body, config)
            .then( (res) => {
                toggleView();
                setShownTitle(res.data.title)
            }, () => {
                console.log("NIE DZIALA")
            });
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
                                <h2 className="fw-bold mb-3">Change project name</h2>
                                <form onSubmit={editProject}>
                                <MDBInput 
                                    wrapperClass='mb-3 w-20' 
                                    label='Set new name' 
                                    type='projectName'
                                    name='projectName' 
                                    value={projectName}
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

export default EditProject