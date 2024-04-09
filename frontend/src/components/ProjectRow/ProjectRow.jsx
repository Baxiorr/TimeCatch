import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { MDBBadge, MDBBtn, MDBIcon } from 'mdb-react-ui-kit'
import { toHoursAndMinutes } from '../../util/Util';

const ProjectRow = ( {rowData, changeFunction, projectOwnerId, teamOwnerId} ) => {
    const credentials = useSelector(state => state.auth)
    const [entryCreatorName, setEntryCreatorName] = useState('')
    const [entryCreatorEmail, setEntryCreatorEmail] = useState('')
    //const [status, setStatus] = useState('')

    const changeStatus = async(status) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const body = JSON.stringify({
            status: status,
            entry_id: rowData.id,
            project_id: rowData.project,
            requested_by: credentials.user.id,
        });
        await axios.post(`${process.env.REACT_APP_API_URL}/api/entry/change_status/`, body, config)
            .then( () => {
                changeFunction();
            }, () => {
                console.log("NIE DZIALA")
            });
    }

    const deleteEntry = async() => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                requested_by: credentials.user.id
            }
        };
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/entry/${rowData.id}/`, config)
            .then( () => {
                changeFunction();
            }, () => {
                console.log("NIE DZIALA")
            });
    }
    
    useEffect(() => {
        const getProjectCreator = async() => {
            const config = {
            headers: {
                'Content-Type': 'application/json',
            }
            };
            await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${rowData.created_by}/`, config)
            .then( (res) => {
                setEntryCreatorName(res.data.first_name + ' ' + res.data.last_name)
                setEntryCreatorEmail(res.data.email);             
            }, () => {
                console.log("NIE DZIALA")
            });
        }

        getProjectCreator()
    }, [])

    const isOwner = () => {
        return credentials.user.id === projectOwnerId || credentials.user.id === teamOwnerId;
    }

    const isMyEntry = () => {
        return credentials.user.id === rowData.created_by;
    }

    return (
        <tr>
            <td>{rowData.readable_date}</td>
            <td>
            <div>
                <p className='fw-bold mb-1'>{entryCreatorName}</p>
                <p className='text-muted mb-0'>{entryCreatorEmail}</p>
            </div>
            </td>
            <td>{toHoursAndMinutes(rowData.minutes)}</td>
            <td>
                {
                rowData.status === 'accepted' ? 
                <MDBBadge color='success' pill>
                Accepted
                </MDBBadge>
                : 
                rowData.status === 'awaiting' ? 
                <MDBBadge color='warning' pill>
                Awaiting
                </MDBBadge>
                :
                <MDBBadge color='danger' pill>
                Denied
                </MDBBadge>
                }
            </td>
            <td>
                {
                rowData.status === 'awaiting' && isOwner() ?
                <>
                <MDBBtn color='success' rounded size='sm' onClick={() => {changeStatus('accepted')}}>ACCEPT</MDBBtn>{' '}
                <MDBBtn color='danger' rounded size='sm' onClick={() => {changeStatus('denied')}}>DENY</MDBBtn>{' '}
                </>
                : null
                }
                {
                rowData.status === 'awaiting' && isMyEntry() ?
                <MDBBtn color='danger' rounded size='sm' onClick={deleteEntry}>
                    <MDBIcon fas icon="trash"/>{" "}
                    DELETE
                </MDBBtn>
                : null
                }
            </td>
        </tr>
    )
}

export default ProjectRow