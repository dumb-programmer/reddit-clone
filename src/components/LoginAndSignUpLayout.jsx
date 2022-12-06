import "../styles/LoginAndSignup.css";

const LoginAndSignUpLayout = ({ children }) => {
    return (
        <div className="login-page">
            <aside className="artwork"></aside>
            <main className="login-and-signup">{children}</main>
        </div>
    );
}

export default LoginAndSignUpLayout;