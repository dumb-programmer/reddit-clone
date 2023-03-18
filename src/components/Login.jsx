import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppleButton from "./AppleButton";
import GoogleButton from "./GoogleButton";
import LoadingSVG from "./LoadingSVG";
import LoginAndSignUpLayout from "./LoginAndSignUpLayout";
import { loginUsingUsernameAndPassword } from "../firebase";
import AlreadyLoggedInMessage from "./AlreadyLoggedInMessage";
import useAuthContext from "../hooks/useAuthContext";

const Login = () => {
  const [data, setData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    usernameNotFound: false,
    incorrectPassword: false,
  });
  const navigate = useNavigate();
  const authenticated = useAuthContext();

  const handleInput = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const val = await loginUsingUsernameAndPassword(data);
    if (val === -1) {
      setError({
        ...error,
        usernameNotFound: true,
      });
    } else if (val === -2) {
      setError({
        ...error,
        incorrectPassword: true,
      });
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  const handleUsernameBlur = (e) => {
    setError({
      ...error,
      usernameNotFound: false,
    });
  };

  const handlePasswordBlur = (e) => {
    setError({
      incorrectPassword: false,
    });
  };

  useEffect(() => {
    if (authenticated) {
      setTimeout(() => navigate("/"), 1000);
    }
  }, [authenticated, navigate]);

  const disableLoginBtn = Object.values(error).some((error) => error);

  if (authenticated) {
    return (
      <LoginAndSignUpLayout>
        <AlreadyLoggedInMessage />
      </LoginAndSignUpLayout>
    );
  }

  return (
    <LoginAndSignUpLayout>
      <h4>Log in</h4>
      <p className="user-agreement smaller">
        By continuing, you agree to our User Agreement and Privacy Policy.
      </p>
      <form
        className="login-form"
        onSubmit={
          !(loading || disableLoginBtn)
            ? handleFormSubmit
            : (e) => {
                e.preventDefault();
              }
        }
      >
        <GoogleButton />
        <AppleButton />
        <input
          className={`form-input ${
            error.usernameNotFound ? "form-input__error" : ""
          }`}
          type="text"
          name="username"
          placeholder="Username"
          value={data.username}
          onChange={handleInput}
          onBlur={handleUsernameBlur}
          required
        />
        {error.usernameNotFound && (
          <div className="error-message">Incorrect username</div>
        )}
        <input
          className={`form-input ${
            error.incorrectPassword ? "form-input__error" : ""
          }`}
          type="password"
          name="password"
          placeholder="Password"
          value={data.password}
          onChange={handleInput}
          onBlur={handlePasswordBlur}
          required
        />
        {error.incorrectPassword && (
          <div className="error-message">Incorrect password</div>
        )}
        <button
          data-testid="login-btn"
          className={`submit-btn ${loading ? "btn__loading" : ""}`}
          disabled={error.emailAlreadyRegistered}
        >
          {!loading ? "Log In" : <LoadingSVG height={35} width={35} />}
        </button>
        <p className="smaller">Forgot your username or password ?</p>
        <p className="smaller">
          New to Reddit? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </LoginAndSignUpLayout>
  );
};

export default Login;
