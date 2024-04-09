import React from 'react'
import axios from 'axios'
import {
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBBtn,
    MDBCol
  } from 'mdb-react-ui-kit';
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

function TeamCard({teamInfo, isActive, activeFunction}) {

  const credentials = useSelector(state => state.auth)

  const activateTeam = async() => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const body = JSON.stringify({
            requested_by: credentials.user.id,
            team_id: teamInfo.id
        });
        await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/activate/`, body, config)
        .then( (res) => {    
            activeFunction()
        }, () => {
            console.log("NIE DZIALA")
        });
   
    }

    const isOwner = () => {
        return credentials.user.id === teamInfo.created_by
    }

  return (
    <MDBCol lg={4} className='pt-3'>
        <MDBCard border="none" className={
            isActive ? 'bg-success bg-opacity-25' : 'bg-secondary bg-opacity-25'
        }>
            <MDBCardBody>
                <MDBCardTitle>               
                    {teamInfo.title + " "} 
                </MDBCardTitle>
                <MDBCardText>
                    {isOwner() ? "Owner" : "Member"}
                </MDBCardText>
            <Link to={`/app/team/${teamInfo.id}`} state={teamInfo}>
                <MDBBtn className='btn btn-info' >
                <i className="far fa-edit"></i>{" "}
                    Details
                </MDBBtn>
            </Link>{' '}
            {
            !isActive 
            ?
            <MDBBtn className='btn btn-primary' onClick={activateTeam}>
                <i className="far fa-edit"></i>{" "}
                Activate
            </MDBBtn>
            : null
            }
            </MDBCardBody>
        </MDBCard>    
    </MDBCol>

  )
}

export default TeamCard