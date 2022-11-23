import AppleButton from "./AppleButton";
import GoogleButton from "./GoogleButton";
import LoginAndSignUpLayout from "./LoginAndSignUpLayout";
import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/SignupForm.css";

const SignupForm = () => {
    const [data, setData] = useState("");
    const [continueClicked, setContinueClicked] = useState(false);

    const handleInput = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

    };

    const handleContinue = () => {
        setContinueClicked(true);
    };

    const handleBack = () => {
        setContinueClicked(false);
    }

    if (!continueClicked) {
        return (
            <LoginAndSignUpLayout>
                <h4>Sign up</h4>
                <form className="login-form" onSubmit={handleFormSubmit}>
                    <p className="user-agreement smaller">
                        By continuing, you are setting up a Reddit account and agree to our
                        User Agreement and Privacy Policy.
                    </p>
                    <GoogleButton />
                    <AppleButton />
                    <input name="email" type="text" id="email-input" placeholder="Email" value={data.email} onChange={handleInput} />
                    <button className="submit-btn" onClick={handleContinue}>Continue</button>
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
                    <input className="form-input" name="username" type="text" placeholder="Choose a username" />
                    <input className="form-input" name="password" type="password" placeholder="Password" />
                </form>
            </main>
            <footer className="sign-up-form__footer">
                <Link to="/signup" className="back-link" onClick={handleBack}>Back</Link>
                <button className="primary-btn">Sign up</button>
            </footer>
        </div>
    )
}

export default SignupForm;