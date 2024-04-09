import React from 'react'
import axios from 'axios'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import Navbar from '../../components/Navbar'
import { useState, useEffect } from 'react'
import TeamCard from '../../components/TeamCard'
import { useSelector } from 'react-redux'
import { MDBBtn, MDBRow, MDBCol, MDBCardText, MDBContainer, MDBIcon } from 'mdb-react-ui-kit';
import CreateTeam from '../../components/Popouts/CreateTeam'
import { useCallback } from 'react'



const Profile = () => {
    const credentials = useSelector(state => state.auth)

    const [teamResponseArray, setTeamResponseArray] = useState([])
    const [userInfo, setUserInfo] = useState(null)
    const [inviteInfo, setInviteInfo] = useState([])

    const [showCreateTeam, setShowCreateTeam] = useState(false);
    
    const toggleCreateTeam = () => {
        setShowCreateTeam(!showCreateTeam);
    };
    
    const [activationState, setActivationState] = useState(false);
    const toggleActivationState = () => {
        setActivationState(!activationState)
    }


    useEffect(() => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
    
        const body = JSON.stringify({requested_by: credentials.user.id});
        async function fetchTeamData(){
            await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/my_teams/`, body, config)
            .then( (res) => {
                setTeamResponseArray([...res.data]);
                
            }, () => {
                console.log("NIE DZIALA")
            });
        };

        async function fetchUserInfo(){
            await axios.post(`${process.env.REACT_APP_API_URL}/api/users/info/`, body, config)
            .then( (res) => {
                setUserInfo(res.data);
                
            }, () => {
                console.log("NIE DZIALA")
            });
        };

        async function fetchInviteInfo(){
            await axios.post(`${process.env.REACT_APP_API_URL}/api/invite/list_my_invites/`, body, config)
            .then( (res) => {
                setInviteInfo(res.data);
                
            }, () => {
                console.log("NIE DZIALA")
            });
        };
        fetchInviteInfo();
        fetchUserInfo();
        fetchTeamData();  
    }, [showCreateTeam, activationState])

    const acceptInvitation = (invite) => async () => { 
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
    
        const body = JSON.stringify({requested_by: credentials.user.id});
        await axios.post(`${process.env.REACT_APP_API_URL}/api/invite/${invite.id}/accept_invitation/`, body, config)
            .then( (res) => {
                toggleActivationState();
            }, () => {
                console.log("NIE DZIALA")
            });
    }

    const declineInvitation = (invite) => async () => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
    
        const body = JSON.stringify({requested_by: credentials.user.id});
        await axios.post(`${process.env.REACT_APP_API_URL}/api/invite/${invite.id}/decline_invitation/`, body, config)
            .then( (res) => {
                toggleActivationState();
            }, () => {
                console.log("NIE DZIALA")
            });
    }
    
    const styles = {
        cardStyle:{
           'flexDirection': 'row',
           'alignItems': 'center',
           'border': 'none'
        },
        cardImgStyle: {
            width: '64px',
            height: '64px',
        }
    }

  return (
    <>
    <Navbar />
    <MDBContainer>
    <Row>
        <Col lg={3}>
            <Card style={styles.cardStyle}>
                <Card.Body>

                    <Card.Title>{credentials.user.first_name + ' ' + credentials.user.last_name}</Card.Title>
                    <Card.Text>{credentials.user.email}</Card.Text>

                </Card.Body>
            </Card>
            <Button className='btn btn-primary'>
                <i className="far fa-edit"></i>{" "}
                Edit profile
            </Button>
        </Col>
    </Row>
    <hr/>
    <Row>
        <Col lg={3} className="pt-3">
            <h2 className="subtitle">Teams</h2>
            <MDBBtn className="btn-success px-5 w-90" onClick={toggleCreateTeam}>Create new team</MDBBtn>
            {
            showCreateTeam && (
                <CreateTeam isVisible={showCreateTeam} toggleView={toggleCreateTeam} />
            )
            }
        </Col>
    </Row>
    <Row>
        <Col lg={4} className="pt-3">
            <h2 className="subtitle">Invites</h2>
        </Col>
    </Row>
    <MDBRow >
    {
        inviteInfo.map((invitation) => {
            return(         
                <MDBCol lg={4} className='pt-3 mb-2' key={invitation.id + invitation.date_sent + invitation.team}>
                    <MDBCardText>{invitation.team_name} - {invitation.time_since} ago</MDBCardText>
                        <MDBBtn color='success' className='text-center' onClick={acceptInvitation(invitation)}>
                            <MDBIcon fas fixed icon='check'/>
                        </MDBBtn>
                        {" "}
                        <MDBBtn color='danger' className='text-center' onClick={declineInvitation(invitation)}>
                            <MDBIcon fas fixed icon='times'/>
                        </MDBBtn>
                </MDBCol>
            )
        })

    }
    </MDBRow>
    <Row>
    {
        teamResponseArray.map((x) => {
            if(userInfo.active_team_id === x.id) {
                return <TeamCard 
                    teamInfo={x} 
                    isActive={true} 
                    key={x.id}
                />
            } 
        })
    }  
    {
        teamResponseArray.map((x) => {
            if(userInfo.active_team_id !== x.id) {
                return <TeamCard 
                    teamInfo={x} 
                    isActive={false} 
                    activeFunction={toggleActivationState} 
                    key={x.id}
                />
            }
        })
    }
    </Row>
    </MDBContainer>
    </>

  )
}

export default Profile