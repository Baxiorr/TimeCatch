import React from 'react'
import axios, { all } from 'axios'
import Navbar from '../../components/Navbar'

import { useSelector } from 'react-redux';
import { MDBBtn, MDBContainer } from 'mdb-react-ui-kit'
import { Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { MultiSelect } from 'react-multi-select-component';

const Reports = () => {
    const credentials = useSelector(state => state.auth)
    const [disabled, setDisabled] = useState(false)
    const [teamInfo, setTeamInfo] = useState(null)
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
    
        const body = JSON.stringify({requested_by: credentials.user.id});
        const getActiveTeam = async () => {
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
                createProjects([...res.data]);
                createMembers([...teamInfo.members]);
            }, (res) => {
                console.log(res)
            });
        };
        getProjectsForActiveTeam();
    }, [teamInfo])

    const isOwner = () => {
        if(teamInfo == null) {
            return false;
        }
        return credentials.user.id === teamInfo.created_by;
    }

    const createMembers = (members) => {
        let allMembers = []
        members.map((member) => {
            allMembers.push({label: member.email, value: member.id})
        })
        setMembers([...allMembers])
    }

    const createProjects = (projects) => {
        let allProjects = []
        projects.map((project) => {
            allProjects.push({label: project.title, value: project.id})
        })
        setProjects([...allProjects])
    }

    const submitExport = async (e) => {
        e.preventDefault();
        let type = e.nativeEvent.submitter.name;
        let membersIds = ""
        selectedMembers.map((member) => {
            membersIds += member.value; 
            membersIds += ',';
        })
        let projectsIds = ""
        selectedProject.map((project) => {
            projectsIds += project.value; 
            projectsIds += ',';
        })
        if (membersIds === "") {
            membersIds += credentials.user.id;
        }
        download(membersIds, projectsIds, type);
    }

    const download = async(membersIds, projectsIds, type) => {
		const config = {
			responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*'
            }
		};
		await axios.get(`${process.env.REACT_APP_API_URL}/api/report/download/?members=${membersIds}&projects=${projectsIds}&team=${teamInfo.id}&type=${type}`, config)
			.then( (response) => {
				const url = window.URL.createObjectURL(new Blob([response.data]));
				let link = document.createElement("a");
				link.href = url;
				link.setAttribute('download', `file.${type}`);
				document.body.appendChild(link);
				link.click();
			}, (res) => {
				console.log(res);
			});
	}

    return (
        <>
        <Navbar/>
        <MDBContainer className='p-3'>
            <h2 className="fw-bold mb-3">EXPORT</h2>
            <Form onSubmit={submitExport}>
                <Form.Label>Project</Form.Label>
                <MultiSelect 
                    options={projects} 
                    hasSelectAll 
                    value={selectedProject} 
                    onChange={setSelectedProject} 
                    labelledBy="Select projects"
                    valueRenderer={() => {
                        if(!selectedProject.length) {
                            return "Select project";
                        }
                    }}
                />                                                     
                {
                isOwner() ?
                <MultiSelect 
                    options={members} 
                    hasSelectAll 
                    value={selectedMembers} 
                    onChange={setSelectedMembers} 
                    labelledBy="Select Members"
                    valueRenderer={() => {
                        if(!selectedMembers.length) {
                            return "Select member";
                        }
                    }}
                />
                : <></>
                }
                
                <MDBBtn name="pdf" outline color='danger' className="px-4 mx-1 w-30 mt-3" type='submit'>Submit PDF</MDBBtn>
                <MDBBtn name="csv" outline color='success' className="px-4 mx-1 w-30 mt-3" type='submit'>Submit CSV</MDBBtn>
            </Form>
        </MDBContainer>
        </>
    )
}

export default Reports