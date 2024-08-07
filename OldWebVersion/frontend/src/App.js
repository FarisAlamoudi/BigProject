import React from 'react';
import {BrowserRouter,Routes,Route} from "react-router-dom";
import './App.css';

import LoginPage from './pages/LoginPage';
import ResetPage from './pages/ResetPage';
import RegisterPage from './pages/RegisterPage';
import ReservationPage from './pages/ReservationPage';
import VerificationPage from './pages/VerificationPage';
import HomePage from './pages/HomePage';


function App()
{
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />}/>
        <Route path="/reset" element={<ResetPage />}/>
        <Route path="/verify" element={<VerificationPage />}/>
        <Route path="/register" element={<RegisterPage />}/>
        <Route path="/home" element={<HomePage />}/>
        <Route path="/reserve" element={<ReservationPage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

