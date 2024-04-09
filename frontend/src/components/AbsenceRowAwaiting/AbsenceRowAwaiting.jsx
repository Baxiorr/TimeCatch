import { MDBBadge, MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import React from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux';

const AbsenceRowAwaiting = ( {rowData, changeFunction, teamOwnerId} ) => {
const credentials = useSelector(state => state.auth)
	const changeStatus = async(status) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const body = JSON.stringify({
            status: status,
            absence_id: rowData.id,
            requested_by: credentials.user.id,
        });
        await axios.post(`${process.env.REACT_APP_API_URL}/api/absence/change_status/`, body, config)
            .then( () => {
                changeFunction();
            }, () => {
                console.log("NIE DZIALA")
            });
    }

	const deleteAbsence = async() => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                requested_by: credentials.user.id
            }
        };
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/absence/${rowData.id}/`, config)
            .then( () => {
                changeFunction();
            }, () => {
                console.log("NIE DZIALA")
            });
    }

    const isOwner = () => {
        return credentials.user.id === teamOwnerId;
    }
    const isMyAbsence = () => {
        return credentials.user.id === rowData.user;
    }

    return (
    <tr>
        <td>{rowData.readable_date}</td>
        <td>
            <div>
                <p className='fw-bold mb-1'>{rowData.user_full_name}</p>
                <p className='text-muted mb-0'>{rowData.user_email}</p>
            </div>
        </td>
        <td>{rowData.start_at}</td>
		<td>{rowData.end_at}</td>
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
                rowData.status === 'awaiting' && isMyAbsence() ?
                <MDBBtn color='danger' rounded size='sm' onClick={deleteAbsence}>
                    <MDBIcon fas icon="trash"/>{" "}
                    DELETE
                </MDBBtn>
                : null
                }
        </td>
    </tr>
  )
}

export default AbsenceRowAwaiting