import { useState } from "react";
import { Link } from "react-router-dom";
import AppleButton from "./AppleButton";
import GoogleButton from "./GoogleButton";
import LoginAndSignUpLayout from "./LoginAndSignUpLayout";

const LoginForm = () => {
    const [data, setData] = useState({
        username: "",
        password: ""
    })

    const handleInput = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <LoginAndSignUpLayout>
            <h4>Log in</h4>
            <p className="user-agreement smaller">
                By continuing, you agree to our User Agreement and Privacy Policy.
            </p>
            <form className="login-form" onSubmit={handleFormSubmit}>
                <GoogleButton />
                <AppleButton />
                <input className="form-input" type="text" name="username" id="login-username" placeholder="Username" value={data.username} onChange={handleInput} />
                <input className="form-input" type="password" name="password" id="login-password" placeholder="Password" value={data.password} onChange={handleInput} />
                <button className="submit-btn" type="submit">Log In</button>
                <p className="smaller">Forgot your username or password ?</p>
                <p className="smaller">New to Reddit? <Link to="/signup">Sign up</Link></p>
            </form>
        </LoginAndSignUpLayout>
    );
}

export default LoginForm;