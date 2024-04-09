import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { logout } from '../../actions/auth'
import { Navbar, Nav, NavDropdown, Container, Col } from 'react-bootstrap'
import StopTimeTrack from '../Popouts/StopTimeTrack'
import './Navbar.css'

import { useDispatch, useSelector } from 'react-redux';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit'

const NavbarComponent = () => {

	const credentials = useSelector(state => state.auth)
	const dispatch = useDispatch();

	const [teamInfo, setTeamInfo] = useState(null)
	const [showStopTimeTrack, setShowStopTimeTrack] = useState(false);
	const toggleStopTimeTrack = () => {
		setShowStopTimeTrack(!showStopTimeTrack);
	}

	const [activeTeamName, setActiveTeamName] = useState('')
	const [time, setTime] = useState(1);
	const [navbarTime, setNavbarTime] = useState('00:00:00')
	const [tryAgain, setTryAgain] = useState(false)
	const toggleTryAgain = () => {
		setTryAgain(!tryAgain)
	}
	const [isTracking, setIsTracking] = useState(false)
	const disableTracking = () => {
		setIsTracking(false);
	}

	useEffect(() => {
		const getActiveTeam = async () => {
			const config = {
				headers: {
					'Content-Type': 'application/json',
				}
			};
			if (credentials.user == null){
				setTryAgain(!tryAgain)
				return
			}
			const body = JSON.stringify({requested_by: credentials.user.id});
			await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/get_active_team/`, body, config)
				.then( (res) => {
					setActiveTeamName(res.data.title)
					setTeamInfo(res.data)
				}, () => {
					console.log("NIE DZIALA NAVABR")
				});
		}

		const resumeTimer = async() => {
			const config = {
				headers: {
					'Content-Type': 'application/json',
				}
			};
			if (credentials.user == null){
				toggleTryAgain();
				return
			}
			const body = JSON.stringify({requested_by: credentials.user.id});
			await axios.post(`${process.env.REACT_APP_API_URL}/api/entry/get_untracked_time/`, body, config)
				.then( (res) => {
					if(res.status === 204)
						return
					setIsTracking(true);
					setTime(res.data.time_since);
					timer(res.data.time_since - 1);
				});
		}

		resumeTimer();
		getActiveTeam();
	}, [tryAgain])
	
	useEffect(() => {
		let interval = null;

		if(isTracking) {
			interval = setInterval(() => {
				setTime((time) => time + 1);
				timer(time);
			}, 1000)
		} else {
			clearInterval(interval);
			setNavbarTime('00:00:00');
		}
		return () => {
			clearInterval(interval);
		}
	}, [time])

	const timer = (seconds) => {
		let hour_string = ("0" + Math.floor((seconds / 3600) % 60)).slice(-2);
		let minutes_string = ("0" + Math.floor((seconds / 60) % 60)).slice(-2);
		let seconds_string = ("0" + Math.floor(seconds % 60)).slice(-2);
		setNavbarTime(`${hour_string}:${minutes_string}:${seconds_string}`);
		//console.log(`${hour_string}:${minutes_string}:${seconds_string}`);
	}

	const onLogout = async() => {
		dispatch(logout());
	}

	const startTracking = async() => {
		const config = {
			headers: {
				'Content-Type': 'application/json',
			}
		};
		const body = JSON.stringify({
			requested_by: credentials.user.id
		});
		await axios.post(`${process.env.REACT_APP_API_URL}/api/entry/create_untracked_entry/`, body, config)
			.then( () => {
				setTime(0);
				setIsTracking(true);
			}, (res) => {
				alert(res.response.data.message);
			});
	}

	const stopwatchClicked = async() => {
		toggleStopTimeTrack();
	}

	return (
	<>
	<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" className='sticky-nav'>
		<Container fluid>
		<Navbar.Brand as={Link} to="/app">
				TimeCatch{' '}
		</Navbar.Brand>
		<Col>
		<Navbar.Text>
		{
		credentials.user ?
		activeTeamName
		: null
		}
		</Navbar.Text>
		</Col>
		<Navbar.Toggle aria-controls="responsive-navbar-nav" />
		<Navbar.Collapse className="justify-content-end" id="responsive-navbar-nav">
			<Nav className="text-center" >
			{
			isTracking ? 
			<Nav.Link>
				<MDBBtn color='warning' size='sm' onClick={stopwatchClicked}>
					<MDBIcon fas icon="stopwatch"/>{' '}{navbarTime}
				</MDBBtn>
			</Nav.Link>
			: 
			<Nav.Link>
			<MDBBtn color='success' size='sm' onClick={startTracking}>
				<MDBIcon fas icon="stopwatch"/>{' '}Start time
			</MDBBtn>
			</Nav.Link>
			}
			
			<Nav.Link as={Link} to="/app/projects" >Projects</Nav.Link>
			<Nav.Link as={Link} to="/app/absences">Absences</Nav.Link>
			<Nav.Link as={Link} to="/app/reports">Reports</Nav.Link>
			<Nav.Link as={Link} to="/app/profile">
				<i className="fa-regular fa-user" />{' '}
				{credentials.user ? credentials.user.first_name + ' ' + credentials.user.last_name : "UnloggedUser" }
			</Nav.Link>
			<Nav.Link as={Link} to="/login">
			
			<button className='btn btn-danger btn-sm' onClick={onLogout}>
				<i className="fas fa-sign-out-alt"/>{'  '}Log out
			</button>
			</Nav.Link>
			</Nav>
		</Navbar.Collapse>
		</Container>
	</Navbar>
	{
		showStopTimeTrack && (
			<StopTimeTrack isVisible={showStopTimeTrack} toggleView={toggleStopTimeTrack} disableTracking={disableTracking} teamInfo={teamInfo}/>
		)
    }

	</>
	)
}

export default NavbarComponent