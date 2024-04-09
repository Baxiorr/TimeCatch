import React from 'react'
import axios from 'axios'
import Navbar from '../../components/Navbar'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import CreateProject from '../../components/Popouts/CreateProject'
import ProjectCard from '../../components/ProjectCard'
import { 
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBBtn, 
    MDBCardText
    } from 'mdb-react-ui-kit'

const Projects = () => {
    const credentials = useSelector(state => state.auth)
    const [showCreateProject, setShowCreateProject] = useState(false)
    const [projectResponseArray, setProjectResponseArray] = useState([])
    const [teamInfo, setTeamInfo] = useState(null)
    const toggleCreateProject = () => {
        setShowCreateProject(!showCreateProject)
    }

    useEffect(() => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
    
        const body = JSON.stringify({requested_by: credentials.user.id});
        async function getActiveTeam(){
            await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/get_active_team/`, body, config)
            .then( (res) => {
                setTeamInfo(res.data);             
            }, () => {
                console.log("NIE DZIALA")
            });
        };
        
        getActiveTeam();
    }, [])

    useEffect(() => {
        async function getProjectsForActiveTeam(){
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
                setProjectResponseArray([...res.data]);
            }, () => {
                console.log("NIE DZIALA")
            });
        };
        getProjectsForActiveTeam();
    }, [teamInfo, showCreateProject])


    return (
    <>
    <Navbar />
    
    <MDBContainer fluid>
        <MDBContainer>
            <MDBRow >
                <MDBCol lg={3} className="pt-3">
                    <h2 className="subtitle">Projects</h2>
                    <MDBBtn className="btn-success px-5 w-90" onClick={toggleCreateProject}>Create project</MDBBtn>
                    {
                    showCreateProject && (
                        <CreateProject isVisible={showCreateProject} toggleView={toggleCreateProject} teamInfo={teamInfo}/>
                    )
                    }
                </MDBCol>
            </MDBRow>
            <MDBRow >
            {
            projectResponseArray.length === 0 ?
            <MDBCol className='pt-4'><MDBCardText>No projects...</MDBCardText></MDBCol>
            :
            projectResponseArray.map((x) => {
                    return( <ProjectCard 
                        projectInfo={x} 
                        teamInfo={teamInfo}
                        key={x.id}
                    /> 
                    )
            })
            }
            </MDBRow>
        </MDBContainer>
    </MDBContainer>
    </>

    )
}

export default Projects