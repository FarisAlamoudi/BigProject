import React from 'react';

function PageTitle()
{
    const redirectToLogin = () =>
    {
        window.location.href = '/';
    }
    
    const redirectToRegister = () =>
    {
        window.location.href = '/register';
    }
    
    return(
        <h1 id="title">ReserveSmart</h1>
        <input
            type="submit"
            id="registerButton"
            className="buttons"
            value="Login"
            onClick={redirectToLogin}
        />
        <input
            type="submit"
            id="registerButton"
            className="buttons"
            value="Sign up"
            onClick={redirectToRegister}
        />
    );
};

export default PageTitle;
