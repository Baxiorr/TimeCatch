import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBIcon, MDBInput, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import React from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import EditProject from '../../components/Popouts/EditProject/EditProject';
import { useState, useEffect } from 'react';
import ProjectRow from '../../components/ProjectRow/ProjectRow';


const ProjectDetails = () => {
    const credentials = useSelector(state => state.auth)
    const location = useLocation();
    const { id, team, created_by } = location.state.projectInfo

    const [entries, setEntries] = useState([])
    const [changed, setChanged] = useState(false)
    const toggleChanged = () => {
        setChanged(!changed);
    };

    const [time, setTime] = useState("")
    const [date, setDate] = useState("")

    const [title, setTitle] = useState(location.state.projectInfo.title)
    const setShownTitle = (data) => {
        setTitle(data);
    }

    const [showEditProject, setShowEditProject] = useState(false);
    const toggleEditProject = () => {
        setShowEditProject(!showEditProject);
    };

    const navigate = useNavigate();
    const deleteProject = async () => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                requested_by: credentials.user.id
            }
        };
        if (window.confirm("Do you want to delete this project")) {
            
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/projects/${id}/`, config)
                .then( (res) => {
                    alert("Deleted");
                    navigate('/app/projects');
                }, (res) => {
                    console.log(res)
                });
        }
    }



    const isOwner = () => {
        return credentials.user.id === created_by || credentials.user.id === location.state.teamInfo.created_by;
    }

    useEffect(() => {
        const getEntries = async () => {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            const body = JSON.stringify({
                project_id: id,
                requested_by: credentials.user.id,
            });
            await axios.post(`${process.env.REACT_APP_API_URL}/api/entry/get_entries/`, body, config)
                .then( (res) => {
                    setEntries([...res.data]);
                    console.log(res.data);
                }, () => {
                    console.log("NIE DZIALA");
                });
        }

        getEntries();
    }, [changed])
    

    const addTime = async (e) => {
        e.preventDefault();
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const body = JSON.stringify({
            time: time,
            date: date,
            team_id: location.state.teamInfo.id,
            project_id: id,
            requested_by: credentials.user.id,
        });
        await axios.post(`${process.env.REACT_APP_API_URL}/api/entry/add/`, body, config)
            .then( (res) => {
                console.log(res.data);
                setEntries([...entries, res.data]);
            }, () => {
                console.log("NIE DZIALA")
            });
    }

  return (
    <>
        <Navbar/>
        <MDBContainer>
            <MDBRow className='pt-4'>
                <MDBCol md={5}>
                    <Link to={'/app/projects/'}>
                        <MDBBtn className='btn btn-danger float-left mb-3' size='lg' >
                            <MDBIcon fas icon="angle-left" />{" "}
                        </MDBBtn>
                    </Link>{' '}
                    <h1 className='mb-3' style={{display: 'inline-block'}}>{title}</h1>
                </MDBCol>
            </MDBRow>
            {
            isOwner()
            ?
            <MDBRow>
                <MDBCol lg={3}>
                    <MDBBtn className='btn btn-warning mb-4' onClick={toggleEditProject}>
                        <MDBIcon fas icon="edit"/>{" "}
                        Edit name
                    </MDBBtn>{" "}
                    {
                    showEditProject && (
                        <EditProject 
                            isVisible={showEditProject} 
                            toggleView={toggleEditProject} 
                            projectId={id}
                            setShownTitle={setShownTitle} 
                        />
                    )
                    }
                    <MDBBtn className='btn btn-danger mb-4' onClick={deleteProject}>
                        <MDBIcon fas icon="trash"/>{" "}
                        Delete project
                    </MDBBtn>
                </MDBCol>                
            </MDBRow>
            : null
            }
            <MDBRow>
                <MDBCol lg={3} md={6}>
                    <h2>Register time</h2>
                    <form onSubmit={addTime}>
                        <MDBInput wrapperClass='mb-4 w-70' type='time' onChange={(e) => {setTime(e.target.value)}}/>
                        <MDBInput wrapperClass='mb-4 w-70' type='date' onChange={(e) => {setDate(e.target.value)}}/>
                        <MDBBtn className='w-70 mb-4 btn-success' size='md' type='submit'>Add time</MDBBtn>
                    </form>
                </MDBCol>
            </MDBRow>
            <MDBRow>
                <MDBCol lg={12}>
                    <h2>Recenet entries</h2>
                </MDBCol>
            </MDBRow>
            <MDBRow>
                <MDBCol md={12}>
                    <MDBTable>
                        <MDBTableHead>
                            <tr>
                                <th>Date</th>
                                <th>User</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </MDBTableHead>
                        <MDBTableBody>
                            {
                                entries.map((x) => {
                                    return(
                                        <ProjectRow
                                        rowData={x}
                                        changeFunction={toggleChanged}
                                        projectOwnerId={created_by}
                                        teamOwnerId={location.state.teamInfo.created_by}
                                        key={x.id}
                                        />
                                    )
                                })
                            }
                        </MDBTableBody>
                    </MDBTable>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    </>
    
  )
}

export default ProjectDetails