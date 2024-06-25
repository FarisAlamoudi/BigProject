import React,{useState} from 'react';
import {jwtDecode} from "jwt-decode";

function Login()
{
    const bp = require('./Path.js');

    let Login;
    let Password;

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
            console.log(res);

            if (response.status === 200)
            {
                const {JWT} = res;
                const decoded = jwtDecode(JWT);

                try
                {
                    localStorage.setItem('user_data', JSON.stringify(decoded));
                    setMessage('');
                    window.location.href = '/cards';
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

    return(
        <div id="loginDiv">
            <span id="inner-title">PLEASE LOG IN</span><br/>
            <input
                type="text"
                id="Login"
                placeholder="Username"
                ref={(c) => (Login = c)}
            />
            <span className="error" id="loginError"></span>
            <input
                type="password"
                id="Password"
                placeholder="Password"
                ref={(c) => (Password = c)}
            />
            <span className="error" id="passwordError"></span>
            <input
                type="submit"
                id="loginButton"
                className="buttons"
                value="Login"
                onClick={doLogin}
            />
            <span id="loginResult">{message}</span>
            <span id="text">OR</span>
            <input
                type="submit"
                id="registerButton"
                className="buttons"
                value="Register"
                onClick={doLogin}
            />
        </div>
    );
}

export default Login;