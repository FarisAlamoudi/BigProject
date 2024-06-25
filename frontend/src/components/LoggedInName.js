import React from 'react';

function LoggedInName()
{
    const user = JSON.parse(localStorage.getItem('user_data'));
    
    const doLogout = event =>
    {
        event.preventDefault();
        
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };

    return(
        <div id="loggedInDiv">
            <span id="userName">Logged In As {user.FirstName} {user.LastName}</span><br />
            <button type="button" id="logoutButton" className="buttons"
                onClick={doLogout}> Log Out </button>
        </div>
    );
};

export default LoggedInName;