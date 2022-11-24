import AppleButton from "./AppleButton";
import GoogleButton from "./GoogleButton";
import LoginAndSignUpLayout from "./LoginAndSignUpLayout";
import { Link } from "react-router-dom";
import { useState } from "react";
import { createAccountUsingEmail, usernameAvailable, emailNotRegistered } from "../firebase";
import "../styles/SignupForm.css";

const SignupForm = () => {
    const [data, setData] = useState({
        email: "",
        username: "",
        password: ""
    });

    const [continueClicked, setContinueClicked] = useState(false);
    const [error, setError] = useState({
        usernameTaken: false,
        passwordTooShort: false,
        emailAlreadyRegistered: false
    });

    const handleInput = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        });
        if (error.emailAlreadyRegistered && e.target.name === "email") {
            setError({
                ...error,
                emailAlreadyRegistered: false
            })
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!(Object.values(error).some(error => error))) {
            if (data.password < 8 && !(await usernameAvailable(data.username))) {
                setError({
                    ...error,
                    usernameTaken: true,
                    passwordTooShort: true
                })
            }
            else if (data.password < 8) {
                setError({
                    ...error,
                    passwordTooShort: true
                });
            }
            else if (!(await usernameAvailable(data.username))) {
                setError({
                    ...error,
                    usernameTaken: true
                })
            }
            else {
                createAccountUsingEmail(data);
            }
        }
    };

    const handleContinue = async (e) => {
        e.preventDefault();
        if (await emailNotRegistered(e.target.email.value)) {
            setContinueClicked(true);
        }
        else {
            setError({
                ...error,
                emailAlreadyRegistered: true,
            })
        }
    };

    const handleBack = () => {
        setContinueClicked(false);
    };

    const handleUsernameBlur = async (e) => {
        if (!(await usernameAvailable(e.target.value))) {
            setError({
                ...error,
                usernameTaken: true
            })
        }
        else {
            setError({
                ...error,
                usernameTaken: false
            });
        }
    };

    const handlePasswordBlur = (e) => {
        if (e.target.value.length < 8) {
            setError({
                ...error,
                passwordTooShort: true
            })
        }
        else {
            setError({
                ...error,
                passwordTooShort: false
            });
        }
    };

    const submitBtnDisabled = (Object.values(error).some(error => error));

    if (!continueClicked) {
        return (
            <LoginAndSignUpLayout>
                <h4>Sign up</h4>
                <form className="login-form" onSubmit={!error.emailAlreadyRegistered ? handleContinue : null}>
                    <p className="user-agreement smaller">
                        By continuing, you are setting up a Reddit account and agree to our
                        User Agreement and Privacy Policy.
                    </p>
                    <GoogleButton />
                    <AppleButton />
                    <input className={`form-input ${error.emailAlreadyRegistered ? "form-input__error" : ""}`} name="email" type="email" placeholder="Email" value={data.email} onChange={handleInput} />
                    {error.emailAlreadyRegistered && <div className="error-message">This email is already taken</div>}
                    <button className="submit-btn" disabled={error.emailAlreadyRegistered}>Continue</button>
                    <p className="smaller">Already a redditor? <Link to="/login">Log in</Link> </p>
                </form>
            </LoginAndSignUpLayout>
        );
    }

    return (
        <div className="sign-up-form__layout">
            <header className="sign-up-form__header">
                <h3>Choose your username</h3>
                <p className="smaller"> Your username is how other community members will see you. This name will be used to credit you for things you share on Reddit. What should we call you? </p>
            </header>
            <main className="sign-up-form__main">
                <form className="sign-up-form">
                    <input className={`form-input ${error.usernameTaken ? "form-input__error" : ""}`} name="username" type="text" placeholder="Choose a username" value={data.username} onChange={handleInput} onBlur={handleUsernameBlur} />
                    {error.usernameTaken && <div className="error-message">That username is already taken</div>}
                    <input className={`form-input ${error.passwordTooShort ? "form-input__error" : ""}`} name="password" type="password" placeholder="Password" value={data.password} onChange={handleInput} onBlur={handlePasswordBlur} />
                    {error.passwordTooShort && <div className="error-message">Password must be at least 8 characters long</div>}
                </form>
            </main>
            <footer className="sign-up-form__footer">
                <Link to="/signup" className="back-link" onClick={handleBack}>Back</Link>
                <button className="primary-btn" type="submit" onClick={!submitBtnDisabled ? handleFormSubmit : null} disabled={submitBtnDisabled}>Sign up</button>
            </footer>
        </div>
    )
}

export default SignupForm;