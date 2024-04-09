import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../../components/Navbar'
import { useSelector } from 'react-redux';
import { MDBCol, MDBContainer, MDBRow, MDBTable, MDBTableBody, MDBTableHead, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import AbsenceRow from '../../components/AbsenceRow';
import AbsenceRowAwaiting from '../../components/AbsenceRowAwaiting';

const Absences = () => {
    const credentials = useSelector(state => state.auth)
    const [dateStart, setDateStart] = useState("")
    const [dateEnd, setDateEnd] = useState("")
    const [activeTeamOwner, setActiveTeamOwner] = useState(null)
    const [absencesAwaitingAbsences, setAwaitingAbsences] = useState([])
    const [acceptedAbsences, setAcceptedAbsences] = useState([])

    const [changed, setChanged] = useState(false)
    const toggleChanged = () => {
        setChanged(!changed);
    };

    const addAbsence = async (e) => { 
        e.preventDefault();
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const body = JSON.stringify({
            requested_by: credentials.user.id,
            start_at: dateStart,
            end_at: dateEnd
        });
        await axios.post(`${process.env.REACT_APP_API_URL}/api/absence/`, body, config)
            .then( (res) => {
                toggleChanged();
            }, () => {
                console.log("NIE DZIALA")
            });
    }

    const isOwner = () => {
        return credentials.user.id === activeTeamOwner;
    }

    useEffect(() => {
        const getAbsences = async () => { 
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            const body = JSON.stringify({
                requested_by: credentials.user.id,
            });
            await axios.post(`${process.env.REACT_APP_API_URL}/api/absence/get_absences/`, body, config)
                .then( (res) => {
                    setAwaitingAbsences(res.data);
                }, () => {
                    console.log("NIE DZIALA")
                });
        }

        const getAcceptedAbsences = async () => { 
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            const body = JSON.stringify({
                status: 'accepted',
                requested_by: credentials.user.id
            });
            await axios.post(`${process.env.REACT_APP_API_URL}/api/absence/get_absences/`, body, config)
                .then( (res) => {
                    setAcceptedAbsences(res.data);
                }, () => {
                    console.log("NIE DZIALA")
                });
        }

        const getActiveTeam = async () => {
			const config = {
				headers: {
					'Content-Type': 'application/json',
				}
			};
			const body = JSON.stringify({requested_by: credentials.user.id});
			await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/get_active_team/`, body, config)
				.then( (res) => {
					setActiveTeamOwner(res.data.created_by)
				}, () => {
					console.log("NIE DZIALA")
				});
		}

		getActiveTeam();
        getAbsences();
        getAcceptedAbsences();
    }, [changed])
    

  return (
    <>
    <div className='absence-wrapper'>
    <Navbar />
    <MDBContainer>
        <MDBRow className='pt-4'>
            <MDBCol lg={3} md={6}>
                <h2>Add absence</h2>
                <form onSubmit={addAbsence} className='pt-2'>
                    <MDBInput label='Start Date' wrapperClass='mb-4 w-70' type='date' onChange={(e) => {setDateStart(e.target.value)}}/>
                    <MDBInput label='End Date' wrapperClass='mb-4 w-70' type='date' onChange={(e) => {setDateEnd(e.target.value)}}/>
                    <MDBBtn className='w-70 mb-4 btn-success' size='md' type='submit'>Add absence</MDBBtn>
                </form>
            </MDBCol>
        </MDBRow>
        <MDBRow>
            <MDBCol lg={12}>
                <h2>Absences in team</h2>
                <MDBTable>
                    <MDBTableHead>
                        <tr>
                            <th>From</th>
                            <th>To</th>
                            <th>User</th>
                        </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                        {
                        acceptedAbsences.map((x) => {
                            return(
                                <AbsenceRow
                                rowData={x}
                                key={x.id}
                                />
                            )
                        })
                        }
                    </MDBTableBody>
                </MDBTable>
            </MDBCol>
        </MDBRow>
        <MDBRow className='pt-4'>
            <MDBCol lg={12}>
                {
                isOwner() ?
                <h2>Waiting for acceptance / Issued absences</h2>
                : 
                <>
                <h2 style={{display: 'inline'}}>Issued absences</h2>{' '}
                <p className='text-muted mb-0' style={{display: 'inline'}}>(Last 30 days)</p>
                </>
                }
                
                <MDBTable>
                    <MDBTableHead>
                        <tr>
                            <th>Issue date</th>
                            <th>User</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                        {
                        absencesAwaitingAbsences.map((x) => {
                            return(
                                <AbsenceRowAwaiting
                                rowData={x}
                                changeFunction={toggleChanged}
                                teamOwnerId={activeTeamOwner}
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
        </div>
    </>
  )
}

export default Absences