import React, { useState } from 'react';


function Dashboard() {
    const bp = require('./Path.js');

    const [searchResults, setResults] = useState('');
    const [reservationList, setList] = useState('');

    const refreshReservation = async event => {
        event.preventDefault();

        const userData = JSON.parse(localStorage.getItem('user_data'));
        var jwtStorage = require('../jwtStorage');

        var js = JSON.stringify({ userData: userData, JWT: jwtStorage.retrieveJWT() });

        try {
            const response = await fetch(bp.buildPath('api/myreservations'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

            const responseData = await response.json();

            if (response.status === 200){
                setResults(responseData.numOfReservations + ' reservation(s) found.');
                setList(JSON.stringify(responseData.reservations));
                jwtStorage.storeJWT(responseData.JWT);
            }
            else if (response.status === 401){
                setResults('Error: ' + responseData);
                setList();
            }
            else{
                setResults('UNKNOWN Error: ' + responseData);
                setList('');
            }
        }
        catch (e) {
            console.log(e.toString());
            setResults(e.toString());
            setList('');
        }

    }

    return (
        <div id="dashboardDIV">
            <h2 id="title">Dashboard</h2>
            <button type="button" id="refreshReservation" class="buttons" onClick={refreshReservation}> Refresh Reservation</button><br />
            <span id="searchResults">{searchResults}</span>
            <p id="reservationList">{reservationList}</p><br /><br />
        </div>
    );
};

export default Dashboard;