import AppleButton from "./AppleButton";
import GoogleButton from "./GoogleButton";
import LoginAndSignUpLayout from "./LoginAndSignUpLayout";
import { Link } from "react-router-dom";

const SignupForm = () => {
    return (
        <LoginAndSignUpLayout>
            <h4>Sign up</h4>
            <form className="login-form">
                <p className="user-agreement smaller">
                    By continuing, you are setting up a Reddit account and agree to our
                    User Agreement and Privacy Policy.
                </p>
                <GoogleButton />
                <AppleButton />
                <input type="text" id="email-input" placeholder="Email" />
                <button className="submit-btn">Continue</button>
                <p className="smaller">Already a redditor? <Link to="/login">Log in</Link> </p>
            </form>
        </LoginAndSignUpLayout>
    );
}

export default SignupForm;