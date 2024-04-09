import React from 'react'
import {
  Routes, Route
} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

import Home from './pages/Home'
import Login from './pages/Login';
import Layout from './hocs/Layout';


import RequireAuth from './hocs/RequireAuth';

import TimeCatch from './pages/app/TimeCatch';
import Profile from './pages/app/Profile';
import TeamDetails from './pages/app/TeamDetails';
import Projects from './pages/app/Projects';
import ProjectDetails from './pages/app/ProjectDetails';
import Absences from './pages/app/Absences';
import Reports from './pages/app/Reports';





function App() {
  return (
        <Routes>
          <Route element={<Layout />}>
            <Route exact path='/' element={<Home />} />
            <Route exact path='/login' element={<Login />}/>
          </Route>
          
          <Route element={<RequireAuth />}>
            <Route path='/app' element={<TimeCatch />} />
            <Route path='/app/projects' element={<Projects />} />
            <Route path="/app/projects/:projectId" element={<ProjectDetails />} />
            <Route path='/app/absences' element={<Absences />} />
            <Route path='/app/reports' element={<Reports />} />
            <Route path='/app/profile' element={<Profile />} />
            <Route path="/app/team/:teamId" element={<TeamDetails />} />
          </Route>
        </Routes>
  );
}

export default App;
