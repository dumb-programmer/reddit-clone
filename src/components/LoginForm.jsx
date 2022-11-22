import { Link } from "react-router-dom";
import AppleButton from "./AppleButton";
import GoogleButton from "./GoogleButton";
import LoginAndSignUpLayout from "./LoginAndSignUpLayout";

const LoginForm = () => {
    return (
        <LoginAndSignUpLayout>
            <h4>Log in</h4>
            <p className="user-agreement smaller">
                By continuing, you agree to our User Agreement and Privacy Policy.
            </p>
            <form className="login-form">
                <GoogleButton />
                <AppleButton />
                <input type="text" id="login-username" placeholder="Username" />
                <input type="text" id="login-password" placeholder="Password" />
                <button className="submit-btn">Log In</button>
                <p className="smaller">Forgot your username or password ?</p>
                <p className="smaller">New to Reddit? <Link to="/signup">Sign up</Link></p>
            </form>
        </LoginAndSignUpLayout>
    );
}

export default LoginForm;