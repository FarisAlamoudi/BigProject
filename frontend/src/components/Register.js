import React,{useState} from 'react';

function Register()
{
    const bp = require('./Path.js');

    let FirstName;
    let LastName
    let Login;
    let Password;
    let Email;
    let Phone;

    const [message,setMessage] = useState('');

    const doRegister = async event =>
    {
        event.preventDefault();

        const js = JSON.stringify(
        {
            FirstName:FirstName.value,LastName:LastName.value,
            Login:Login.value,Password:Password.value,
            Email:Email.value,Phone:Phone.value
        });

        document.getElementById('firstError').innerText = '';
        document.getElementById('lastError').innerText = '';
        document.getElementById('loginError').innerText = '';
        document.getElementById('passwordError').innerText = '';
        document.getElementById('emailError').innerText = '';
        document.getElementById('phoneError').innerText = '';
        document.getElementById('registerResult').innerText = '';

        try
        {
            const response = await fetch(bp.buildPath('api/register'),
            {method:'POST',body:js,headers:{'Content-Type':'application/json'}});

            const res = await response.json();

            if (response.status === 201)
            {
                setMessage(res.success);
            }
            else if (response.status === 400)
            {
                res.errors.forEach(error =>
                {
                    if (error.path === 'FirstName')
                    {
                        document.getElementById('firstError').innerText = error.msg;
                    }
                    else if (error.path === 'LastName')
                    {
                        document.getElementById('lastError').innerText = error.msg;
                    }
                    else if (error.path === 'Login')
                    {
                        document.getElementById('loginError').innerText = error.msg;
                    }
                    else if (error.path === 'Password')
                    {
                        document.getElementById('passwordError').innerText = error.msg;
                    }
                    else if (error.path === 'Email')
                    {
                        document.getElementById('emailError').innerText = error.msg;
                    }
                    else if (error.path === 'Phone')
                    {
                        document.getElementById('phoneError').innerText = error.msg;
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

    const redirectToLogin = () =>
    {
        window.location.href = '/';
    }

    return(
        <div id="registerDiv">
            <span id="inner-title">REGISTER A NEW USER</span><br/>
            <input
                type="text"
                id="FirstName"
                placeholder="First name"
                ref={(c) => (FirstName = c)}
            />
            <span className="error" id="firstError"></span>
            <input
                type="text"
                id="LastName"
                placeholder="Last name"
                ref={(c) => (LastName = c)}
            />
            <span className="error" id="lastError"></span>
            <input
                type="text"
                id="Login"
                placeholder="User name"
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
                type="text"
                id="Email"
                placeholder="Email address"
                ref={(c) => (Email = c)}
            />
            <span className="error" id="emailError"></span>
            <input
                type="password"
                id="Phone"
                placeholder="Phone number"
                ref={(c) => (Phone = c)}
            />
            <span className="error" id="phoneError"></span>
            <input
                type="submit"
                id="registerButton"
                className="buttons"
                value="Register"
                onClick={doRegister}
            />
            <span id="registerResult">{message}</span>
            <span id="text">OR</span>
            <input
                type="submit"
                id="backButton"
                className="buttons"
                value="Back"
                onClick={redirectToLogin}
            />
        </div>
    );
}

export default Register;