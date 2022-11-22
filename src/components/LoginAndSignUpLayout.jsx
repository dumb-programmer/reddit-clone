import "../styles/LoginAndSignup.css";

const LoginAndSignUpLayout = ({ children }) => {
    return (
        <div className="login-page">
            <aside></aside>
            <main>{children}</main>
        </div>
    );
}

export default LoginAndSignUpLayout;