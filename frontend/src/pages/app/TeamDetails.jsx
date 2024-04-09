import React from 'react'
import axios from 'axios'
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar';
import { useState, useEffect } from 'react';
import { 
    MDBCol, 
    MDBContainer, 
    MDBRow,
    MDBBtn, 
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText, 
    MDBIcon} from 'mdb-react-ui-kit';
import ChangeTeamName from '../../components/Popouts/ChangeTeamName'
import InviteUser from '../../components/Popouts/InviteUser/InviteUser';

const TeamDetails = () => {

    const credentials = useSelector(state => state.auth)
    const location = useLocation();
    const { id, created_by } = location.state
    const [title, setTitle] = useState(location.state.title)
    const [members, setMembers] = useState(location.state.members)
    const [invitationsResponse, setInvitationsResponse] = useState([]) 
    const [invitations, setInvitations] = useState(false)

    const toggleInvitationState = () => {
        setInvitations(!invitations)
    }

    useEffect(() => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
    
        const body = JSON.stringify({
            requested_by: credentials.user.id,
            team_id: id
        });

        async function fetchInvitedList(){
            await axios.post(`${process.env.REACT_APP_API_URL}/api/invite/list_team_invitations/`, body, config)
            .then( (res) => {
                setInvitationsResponse(res.data);
            }, () => {
                console.log("NIE DZIALA")
            });
        };
        fetchInvitedList();  
    }, [invitations])
    

    const setShownTitle = (data) => {
        setTitle(data);
    }

    const [showChangeTeamName, setShowChangeTeamName] = useState(false);
    const toggleChangeTeamName = () => {
        setShowChangeTeamName(!showChangeTeamName);
    };

    const [showInviteUser, setShowInviteUser] = useState(false);
    const toggleInviteUser = () => {
        setShowInviteUser(!showInviteUser);
    };

    const navigate = useNavigate();
    const deleteTeam = async () => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                requested_by: credentials.user.id
            }
        };
        if (window.confirm("Do you want to delete this team")) {
            
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/teams/${id}/`, config)
                .then( (res) => {
                    alert("Deleted");
                    navigate('/app/profile');
                }, (res) => {
                    console.log(res)
                });
        }
    }

    const removeUser = async(memberId) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const body = JSON.stringify({
            requested_by: credentials.user.id,
            team_id: id,
            user_to_remove_id: memberId
        });
        await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/remove_user/`, body, config)
            .then( (res) => {

                setMembers(res.data.members)
            }, () => {
                console.log("NIE DZIALA")
            });
    }

    const isOwner = () => {
        return credentials.user.id === created_by
    }

    return (
        <>
        <Navbar/>
        
        <MDBContainer>
            <MDBRow className='pt-4'>
                <MDBCol md={5}>
                    <Link to={'/app/profile/'}>
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
                    <MDBBtn className='btn btn-info' onClick={toggleInviteUser}>
                        Invite user
                    </MDBBtn>{" "}
                    {
                    showInviteUser && (
                        <InviteUser 
                            isVisible={showInviteUser} 
                            toggleView={toggleInviteUser} 
                            teamId={id} 
                            invitationFunction={toggleInvitationState} 
                        />
                    )
                    }
                    <MDBBtn className='btn btn-warning' onClick={toggleChangeTeamName}>
                        <i className="fas fa-edit"></i>{" "}
                        Edit name
                    </MDBBtn>
                    {
                    showChangeTeamName && (
                        <ChangeTeamName 
                            isVisible={showChangeTeamName} 
                            toggleView={toggleChangeTeamName} 
                            teamId={id} 
                            data={title}
                            setShownTitle={setShownTitle} 
                        />
                    )
                    }
                </MDBCol>                
            </MDBRow>
            : null
            }
            <hr/>
            <MDBRow>
                <MDBCol lg={6}>
                <h2>Members</h2>
                {
                members.map((member) => {
                    return (
                    <MDBCard border="none" key={member.id}>
                        <MDBRow>
                            <MDBCol sm={10}>
                                <MDBCardBody>
                                    <MDBCardTitle>{member.first_name + ' ' + member.last_name}</MDBCardTitle>
                                    <MDBCardText>{member.email}</MDBCardText>
                                </MDBCardBody>
                            </MDBCol>
                            {
                            isOwner() && member.id !== created_by
                            ?
                            <MDBCol sm={1} >
                                <MDBCardBody>
                                    <MDBBtn className='btn btn-danger' onClick={e => removeUser(member.id)}>
                                        <i className="fas fa-user-times"></i>
                                    </MDBBtn>
                                </MDBCardBody>
                            </MDBCol>
                            : null
                            }       
                        </MDBRow>
                    </MDBCard>
                    )
                })
                }
                </MDBCol>
            </MDBRow>
            {
            isOwner()
            ?
            <>
            <MDBRow>           
                <MDBCol lg={4} className='pt-4'>
                    <h3>Invitations</h3>
                </MDBCol>
            </MDBRow>
            {
                invitationsResponse.map((invitation) => {
                    return(
                        <MDBRow key={invitation.id + invitation.date_sent}>           
                            <MDBCol lg={3} className='pt-4' >
                                <MDBCardText>{invitation.email} - {invitation.time_since} ago</MDBCardText>
                            </MDBCol>
                        </MDBRow>
                    )
                })
            }
            
            <MDBRow>           
                <MDBCol lg={3} className='pt-4'>
                    <h3>Owner actions</h3>
                    <MDBBtn className='btn btn-danger' onClick={deleteTeam}>
                        <i className="fas fa-trash"></i>{" "}
                        Delete team
                    </MDBBtn>
                </MDBCol>
            </MDBRow>
            </>
            : null
            }
        </MDBContainer>
        </>
    )
}

export default TeamDetails