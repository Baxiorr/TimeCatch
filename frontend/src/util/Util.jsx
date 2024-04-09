import React from 'react'
import { useSelector } from 'react-redux';

const AuthButton = ( {place} ) => {
    
  const credentials = useSelector(state => state.auth)  
     
  return (
    <button className='btn btn-warning' onClick={() => {
        console.log(place);
        console.log(credentials);
    }
    }>
        SHOW CREDENTIALS
    </button>
  )
}

const toHoursAndMinutes = (totalMinutes) => {
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`;
}

const padTo2Digits = (num) => {
  return num.toString().padStart(2, '0');
}

export {
    AuthButton,
    toHoursAndMinutes
}
