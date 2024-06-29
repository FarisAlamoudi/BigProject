import React,{useState} from 'react';
import {jwtDecode} from "jwt-decode";

function Login()
{
    const bp = require('./Path.js');

    let Login;
    let Password;
    let UserResetToken;

    const [message,setMessage] = useState('');

    const doLogin = async event =>
    {
        event.preventDefault();

        const js = JSON.stringify({Login:Login.value,Password:Password.value});

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
                    setMessage('');
                    window.location.href = '/resources';
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
        <div id="loginDiv">
            <div className="loginImage">
                <img src="temp.jpg"/>
            </div>
            <div className="loginForm">
                <span id="inner-title">Login</span><br/>
                <span id="text">Don't have an account? </span>
                <input
                    type="submit"
                    id="registerButton"
                    className="buttons"
                    value="Create one"
                    onClick={redirectToRegister}
                />
                <br/>
                <input
                    type="text"
                    id="Login"
                    placeholder="Username"
                    ref={(c) => (Login = c)}
                />
                <span className="error" id="loginError"></span>
                <br/>
                <input
                    type="password"
                    id="Password"
                    placeholder="Password"
                    ref={(c) => (Password = c)}
                />
                <span className="error" id="passwordError"></span>
                <br/>
                <span id="text">Forgot your password? </span>
                <input
                    type="submit"
                    id="registerButton"
                    className="buttons"
                    value="Click here to reset"
                    onClick={doReset}
                />
                <span id="resetError">{message}</span>
                <br/>
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
