import { useState } from "react";
import { Link } from "react-router-dom";
import AppleButton from "./AppleButton";
import GoogleButton from "./GoogleButton";
import LoadingSVG from "./LoadingSVG";
import LoginAndSignUpLayout from "./LoginAndSignUpLayout";
import { loginUsingUsernameAndPassword } from "../firebase";

const LoginForm = () => {
    const [data, setData] = useState({
        username: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        usernameNotFound: false,
        incorrectPassword: false
    });

    const handleInput = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Hello");
        try {
            const val = await loginUsingUsernameAndPassword(data);
            console.log(val);
            if (val === -1) {
                setError({
                    ...error,
                    usernameNotFound: true,
                });
            }
        }
        catch (error) {
            setError({
                ...error,
                incorrectPassword: true
            });
        }
        setLoading(false);
    };

    const handleUsernameBlur = async (e) => {
        setError({
            ...error,
            usernameNotFound: false
        });
    };

    const handlePasswordBlur = (e) => {
        setError({
            incorrectPassword: false
        })
    };

    const disableLoginBtn = Object.values(error).some(error => error);

    return (
        <LoginAndSignUpLayout>
            <h4>Log in</h4>
            <p className="user-agreement smaller">
                By continuing, you agree to our User Agreement and Privacy Policy.
            </p>
            <form className="login-form" onSubmit={!(loading || disableLoginBtn) ? handleFormSubmit : (e) => { e.preventDefault(); }}>
                <GoogleButton />
                <AppleButton />
                <input className={`form-input ${error.usernameNotFound ? "form-input__error" : ""}`} type="text" name="username" placeholder="Username" value={data.username} onChange={handleInput} onBlur={handleUsernameBlur} />
                {error.usernameNotFound && <div className="error-message">Incorrect username</div>}
                <input className={`form-input ${error.incorrectPassword ? "form-input__error" : ""}`} type="password" name="password" placeholder="Password" value={data.password} onChange={handleInput} onBlur={handlePasswordBlur} />
                {error.incorrectPassword && <div className="error-message">Incorrect password</div>}
                <button className={`submit-btn ${loading ? "btn__loading" : ""}`} disabled={error.emailAlreadyRegistered}>{
                    !loading ? "Log In" : <LoadingSVG />
                }</button>
                <p className="smaller">Forgot your username or password ?</p>
                <p className="smaller">New to Reddit? <Link to="/signup">Sign up</Link></p>
            </form>
        </LoginAndSignUpLayout >
    );
}

export default LoginForm;