import React,{useState} from 'react';
import {jwtDecode} from "jwt-decode";
const jwtStorage = require('../jwtStorage.js');

function Login()
{
    const bp = require('./Path.js');

    let UserName;
    let Password;
    let UserResetToken;

    const [message,setMessage] = useState('');

    const doLogin = async event =>
    {
        event.preventDefault();

        const js = JSON.stringify({UserName:UserName.value,Password:Password.value});

        document.getElementById('loginError').innerText = '';
        document.getElementById('passwordError').innerText = '';
        document.getElementById('loginResult').innerText = '';

        try
        {
            const response = await fetch(bp.buildPath('api/login'),
            {method:'POST',body:js,headers:{'Content-Type':'application/json'}});

            const res = await response.json();

            if (response.status === 200)
            {
                const {JWT} = res;
                const decoded = jwtDecode(JWT);

                try
                {
                    localStorage.setItem('user_data', JSON.stringify(decoded));

                    jwtStorage.storeJWT(JWT);

                    setMessage('');
                    window.location.href = '/home';
                }
                catch (e)
                {
                    console.log(e.toString());
                    return;
                }
            }
            else if (response.status === 400)
            {
                res.errors.forEach(error =>
                {
                    if (error.path === 'Login')
                    {
                        document.getElementById('loginError').innerText = error.msg;
                    }
                    else if (error.path === 'Password')
                    {
                        document.getElementById('passwordError').innerText = error.msg;
                    }
                });
            }
            else
            {
                setMessage(res.error);
            }
        }
        catch (e)
        {
            console.log(e.toString());
            return;
        }
    };

    const doReset = async event =>
    {
        event.preventDefault();

        const js = JSON.stringify({UserResetToken:UserResetToken.value});

        document.getElementById('resetError').innerText = '';

        try
        {
            const response = await fetch(bp.buildPath('api/sendresettoken'),
            {method:'POST',body:js,headers:{'Content-Type':'application/json'}});

            const res = await response.json();

            if (response.status === 200)
            {
                const {RealResetToken} = res;

                if (UserResetToken === RealResetToken)
                {
                    // ask for password, twice to confirm, then button to click reset

                    // api call to update password
                }
                else
                {
                    // incorrect or expired input token
                }
            }
            else
            {
                setMessage(res.error);
            }
        }
        catch(e)
        {
            console.log(e.toString());
            return;
        }
    };

    const redirectToRegister = () =>
    {
        window.location.href = '/register';
    }

    return(
        <div id="credDiv">
            <div className="credImage">
                <img src="/loginImage.jpeg"/>
            </div>
            <div className="credForm">
                <span id="inner-title">Login</span>
                <div>
                    <span id="text">Don't have an account? </span>
                    <a href="/register" id="registerLink">Create one</a>
                </div>
                <input
                    type="text"
                    id="UserName"
                    placeholder="Username"
                    ref={(c) => (UserName = c)}
                />
                <span className="error" id="loginError"></span>
                <input
                    type="password"
                    id="Password"
                    placeholder="Password"
                    ref={(c) => (Password = c)}
                />
                <span className="error" id="passwordError"></span>
                <div>
                    <span id="text">Forgot your password? </span>
                    <a href="#" id="resetLink" onClick={doReset}>Click here to reset</a>
                    <span id="resetError">{message}</span>
                </div>
                <input
                    type="submit"
                    id="loginButton"
                    className="buttons"
                    value="Login"
                    onClick={doLogin}
                />
                <span id="loginResult">{message}</span>
            </div>
        </div>
    );
}

export default Login;
