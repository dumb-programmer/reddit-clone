import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppleButton from "./AppleButton";
import GoogleButton from "./GoogleButton";
import LoadingSVG from "../LoadingSVG";
import LoginAndSignUpLayout from "../LoginAndSignUpLayout";
import { loginUsingUsernameAndPassword } from "../../firebase";
import AlreadyLoggedInMessage from "./AlreadyLoggedInMessage";
import useAuthContext from "../../hooks/useAuthContext";

const Login = () => {
  const [data, setData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: false,
    password: false,
  });
  const navigate = useNavigate();
  const authenticated = useAuthContext();

  const handleInput = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    setErrors({
      [e.target.name]: false,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const val = await loginUsingUsernameAndPassword(data);
    if (val === -1) {
      setErrors({
        ...errors,
        username: true,
      });
    } else if (val === -2) {
      setErrors({
        ...errors,
        password: true,
      });
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  const handleUsernameBlur = (e) => {
    setErrors({
      ...errors,
      username: false,
    });
  };

  const handlePasswordBlur = (e) => {
    setErrors({
      password: false,
    });
  };

  useEffect(() => {
    if (authenticated) {
      setTimeout(() => navigate("/"), 1000);
    }
  }, [authenticated, navigate]);

  const disableLoginBtn = Object.values(errors).some((error) => error);

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
          className={`form-input ${errors.username ? "form-input__error" : ""}`}
          type="text"
          name="username"
          placeholder="Username"
          value={data.username}
          onChange={handleInput}
          onBlur={handleUsernameBlur}
          autoComplete="off"
          required
        />
        {errors.username && (
          <div className="error-message">Incorrect username</div>
        )}
        <input
          className={`form-input ${errors.password ? "form-input__error" : ""}`}
          type="password"
          name="password"
          placeholder="Password"
          value={data.password}
          onChange={handleInput}
          onBlur={handlePasswordBlur}
          required
        />
        {errors.password && (
          <div className="error-message">Incorrect password</div>
        )}
        <button
          type="submit"
          data-testid="login-btn"
          className={`submit-btn ${loading ? "btn__loading" : ""}`}
          disabled={errors.emailAlreadyRegistered}
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
