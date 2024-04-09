import React from 'react'
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import axios from 'axios'
import { 
    MDBContainer,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalBody,
    MDBModalHeader,
    MDBBtn } from 'mdb-react-ui-kit';
import { Form } from 'react-bootstrap';

const StopTimeTrack = ( {isVisible, toggleView, disableTracking, teamInfo} ) => {
    const credentials = useSelector(state => state.auth)
    const [timeString, setTimeString] = useState("");
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");


    const submitTimeToProject = async(e)  => {
        e.preventDefault();
        getTime();
    }

    useEffect(() => {
        
        const saveTime = async () => {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            const body = JSON.stringify({
                time: timeString,
                project: selectedProject,
                requested_by: credentials.user.id
            });
            await axios.post(`${process.env.REACT_APP_API_URL}/api/entry/save_untracked_entry/`, body, config)
            .then(() => {
                alert("Added");
                toggleView();
                disableTracking();
            }, (res) => {
                console.log(res)
            })    
        }
        
        if (timeString !== "") {
            saveTime();
        }
    }, [timeString])

    const getTime = async() => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const body = JSON.stringify({requested_by: credentials.user.id});
        await axios.post(`${process.env.REACT_APP_API_URL}/api/entry/get_untracked_time/`, body, config)
            .then( (res) => {
                setTimeString(timer(res.data.time_since));
                console.log(timer(res.data.time_since));
                return timer(res.data.time_since);
            }, (res) => {
                if(res.response.status !== 404)
                    console.log(res)
                    return;
            });
    }

    const timer = (seconds) => {
		let hour_string = ("0" + Math.floor((seconds / 3600) % 60)).slice(-2);
		let minutes_string = ("0" + Math.floor((seconds / 60) % 60)).slice(-2);
		let seconds_string = ("0" + Math.floor(seconds % 60)).slice(-2);
		return (`${hour_string}:${minutes_string}:${seconds_string}`);
	}

    useEffect(() => {
        const getProjectsForActiveTeam = async() => {
            if(teamInfo == null) {
                return;
            }
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            const body = JSON.stringify({
                team_id: teamInfo.id,
                requested_by: credentials.user.id
            });
            await axios.post(`${process.env.REACT_APP_API_URL}/api/projects/get_projects_for_team/`, body, config)
            .then( (res) => {
                setProjects([...res.data]);
                setSelectedProject(projects[0]);
            }, (res) => {
                console.log(res)
            });
        };

        getProjectsForActiveTeam();
    }, [])


    const discardEntry = async() => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                requested_by: credentials.user.id
            }
        };
            
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/entry/discard_untracked_entry/`, config)
            .then( (res) => {
                alert("Discarded");
                toggleView();
                disableTracking();
            }, (res) => {
                console.log(res)
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
                            <h2 className="fw-bold mb-3">Assign Time</h2>
                            <Form.Select value={selectedProject} onChange={e => {
                                setSelectedProject(e.target.value);
                            }} 
                            className="mb-3">
                                <option value="" disabled hidden>Choose project</option>
                                {
                                projects.map((x) => {
                                    return(<option value={x.id} key={x.id}>{x.title}</option>)
                                })
                                }
                                                            
                            </Form.Select>
                            <MDBBtn className="btn-success px-4 mx-1 w-30" onClick={submitTimeToProject}>Submit time to project</MDBBtn>
                            <MDBBtn className="btn-danger px-4 mx-1 w-30" onClick={discardEntry}>Discard time</MDBBtn>
                        </MDBContainer>
                    </MDBModalBody>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    )
}

export default StopTimeTrack