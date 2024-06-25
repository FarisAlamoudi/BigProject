import React from 'react';
import {BrowserRouter,Routes,Route} from "react-router-dom";
import './App.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReservationPage from './pages/ReservationPage';
import VerificationPage from './pages/VerificationPage'

function App()
{
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage/>}/>
        <Route path="/verify" element={<VerificationPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path="/reserve" element={<ReservationPage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

