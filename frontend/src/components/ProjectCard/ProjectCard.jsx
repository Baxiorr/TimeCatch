import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
  MDBCol
} from 'mdb-react-ui-kit';
import { toHoursAndMinutes } from '../../util/Util';

const ProjectCard = ( {projectInfo, teamInfo} ) => {
    const [projectCreator, setProjectCreator] = useState('')
    
    useEffect(() => {
        const getProjectCreator = async() => {
            const config = {
            headers: {
                'Content-Type': 'application/json',
            }
            };
            await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${projectInfo.created_by}/`, config)
            .then( (res) => {
                setProjectCreator(res.data.email);             
            }, () => {
                console.log("NIE DZIALA")
            });
        }

        getProjectCreator()
    }, [])

    
    return (
    <MDBCol lg={4} className='pt-3'>
        <MDBCard border="none" className={'bg-secondary bg-opacity-25'}>
            <MDBCardBody>
                <MDBCardTitle>               
                    {projectInfo.title} 
                </MDBCardTitle>
                <MDBCardText>
                    Owner: {projectCreator}
                </MDBCardText>
                <MDBCardText>
                    Registered time: {toHoursAndMinutes(projectInfo.registered_time)}
                </MDBCardText>
                <Link to={`/app/projects/${projectInfo.id}`} state={{projectInfo, teamInfo}}>
                    <MDBBtn className='btn btn-info'>
                    <i className="far fa-edit"></i>{" "}
                        Details
                    </MDBBtn>
                </Link>
            </MDBCardBody>
        </MDBCard>    
    </MDBCol>
    )
}

export default ProjectCard