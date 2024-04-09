import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import React from 'react'
import { useSelector } from 'react-redux';

const AbsenceRow = ( {rowData} ) => {
    return (
    <tr>
        <td>{rowData.start_at}</td>
        <td>{rowData.end_at}</td>
        <td>
            <div>
                <p className='fw-bold mb-1'>{rowData.user_full_name}</p>
                <p className='text-muted mb-0'>{rowData.user_email}</p>
            </div>
        </td>
    </tr>
  )
}

export default AbsenceRow