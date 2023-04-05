import AppleButton from "./login/AppleButton";
import GoogleButton from "./login/GoogleButton";
import LoginAndSignUpLayout from "./LoginAndSignUpLayout";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  createAccountUsingEmail,
  usernameAvailable,
  isEmailAvailable,
} from "../firebase";
import LoadingSVG from "./LoadingSVG";
import { useNavigate } from "react-router-dom";
import AlreadyLoggedInMessage from "./login/AlreadyLoggedInMessage";
import useAuthContext from "../hooks/useAuthContext";
import generateUsernames from "../utils/generateUsernames";
import RefreshIcon from "./icons/RefreshIcon";
import "../styles/SignupForm.css";

const Signup = () => {
  const [data, setData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [continueClicked, setContinueClicked] = useState(false);
  const [error, setError] = useState({
    usernameTaken: false,
    passwordTooShort: false,
    emailAlreadyRegistered: false,
  });
  const [suggestedUsernames, setSuggestedUsernames] = useState(
    generateUsernames()
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authenticated = useAuthContext();
  const usernameRef = useRef();
  const passwordRef = useRef();

  const handleInput = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    if (error.emailAlreadyRegistered && e.target.name === "email") {
      setError({
        ...error,
        emailAlreadyRegistered: false,
      });
    }
  };

  const handleFormSubmit = async () => {
    if (!usernameRef.current.checkValidity()) {
      usernameRef.current.reportValidity();
      return;
    } else if (!passwordRef.current.checkValidity()) {
      passwordRef.current.reportValidity();
      return;
    }

    setLoading(true);
    if (!Object.values(error).some((error) => error)) {
      if (data.password < 8 && !(await usernameAvailable(data.username))) {
        setError({
          ...error,
          usernameTaken: true,
          passwordTooShort: true,
        });
      } else if (data.password < 8) {
        setError({
          ...error,
          passwordTooShort: true,
        });
      } else if (!(await usernameAvailable(data.username))) {
        setError({
          ...error,
          usernameTaken: true,
        });
      } else {
        await createAccountUsingEmail(data);
      }
      setLoading(false);
    }
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    if (data.email) {
      setLoading(true);
      if (await isEmailAvailable(data.email)) {
        setContinueClicked(true);
      } else {
        setError({
          ...error,
          emailAlreadyRegistered: true,
        });
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setContinueClicked(false);
  };

  const handleUsernameBlur = async (e) => {
    if (!(await usernameAvailable(e.target.value))) {
      setError({
        ...error,
        usernameTaken: true,
      });
    } else {
      setError({
        ...error,
        usernameTaken: false,
      });
    }
  };

  const handlePasswordBlur = (e) => {
    if (e.target.value.length < 8) {
      setError({
        ...error,
        passwordTooShort: true,
      });
    } else {
      setError({
        ...error,
        passwordTooShort: false,
      });
    }
  };

  const submitBtnDisabled = Object.values(error).some((error) => error);

  useEffect(() => {
    if (continueClicked) {
      setLoading(false);
    }
  }, [continueClicked]);

  useEffect(() => {
    if (authenticated) {
      setTimeout(() => navigate("/"), 1000);
    }
  }, [authenticated, navigate]);

  if (authenticated) {
    return (
      <LoginAndSignUpLayout>
        <AlreadyLoggedInMessage />
      </LoginAndSignUpLayout>
    );
  }

  if (!continueClicked) {
    return (
      <LoginAndSignUpLayout>
        <h4>Sign up</h4>
        <form
          className="login-form"
          onSubmit={
            !(error.emailAlreadyRegistered || loading)
              ? handleContinue
              : (e) => {
                  e.preventDefault();
                }
          }
        >
          <p className="user-agreement smaller">
            By continuing, you are setting up a Reddit account and agree to our
            User Agreement and Privacy Policy.
          </p>
          <GoogleButton />
          <AppleButton />
          <input
            className={`form-input ${
              error.emailAlreadyRegistered ? "form-input__error" : ""
            }`}
            name="email"
            type="email"
            placeholder="Email"
            value={data.email}
            onChange={handleInput}
            required
          />
          {error.emailAlreadyRegistered && (
            <div className="error-message">This email is already taken</div>
          )}
          <button
            data-testid="continue-btn"
            className={`submit-btn ${loading ? "btn__loading" : ""}`}
            disabled={error.emailAlreadyRegistered}
          >
            {!loading ? "Continue" : <LoadingSVG height={35} width={35} />}
          </button>
          <p className="smaller">
            Already a redditor? <Link to="/login">Log in</Link>{" "}
          </p>
        </form>
      </LoginAndSignUpLayout>
    );
  }

  return (
    <div className="sign-up-form__layout">
      <header className="sign-up-form__header">
        <h3>Choose your username</h3>
        <p className="smaller">
          {" "}
          Your username is how other community members will see you. This name
          will be used to credit you for things you share on Reddit. What should
          we call you?{" "}
        </p>
      </header>
      <main className="sign-up-form__main">
        <form className="sign-up-form">
          <input
            className={`form-input ${
              error.usernameTaken ? "form-input__error" : ""
            }`}
            name="username"
            type="text"
            placeholder="Choose a username"
            value={data.username}
            ref={usernameRef}
            onChange={handleInput}
            onBlur={handleUsernameBlur}
            required
          />
          {error.usernameTaken && (
            <div className="error-message">That username is already taken</div>
          )}
          <input
            className={`form-input ${
              error.passwordTooShort ? "form-input__error" : ""
            }`}
            name="password"
            type="password"
            placeholder="Password"
            value={data.password}
            ref={passwordRef}
            onChange={handleInput}
            onBlur={handlePasswordBlur}
            required
          />
          {error.passwordTooShort && (
            <div className="error-message">
              Password must be at least 8 characters long
            </div>
          )}
        </form>
        <div
          className="username-suggestions"
          data-testid="username-suggestions"
        >
          <p>
            Here are some username suggestions{" "}
            <button
              id="generate-usernames-btn"
              onClick={() => {
                setSuggestedUsernames(generateUsernames());
              }}
            >
              <RefreshIcon
                style={{ height: 16, width: 16, stroke: "#0079d3" }}
              />
            </button>
          </p>
          {suggestedUsernames.map((suggestion, idx) => (
            <p
              key={idx}
              className="username-suggestion"
              onClick={() => setData({ ...data, username: suggestion })}
            >
              {suggestion}
            </p>
          ))}
        </div>
      </main>
      <footer className="sign-up-form__footer">
        <Link to="/signup" className="back-link" onClick={handleBack}>
          Back
        </Link>
        <button
          className={`submit-btn ${loading ? "btn__loading" : ""}`}
          type="submit"
          onClick={!(submitBtnDisabled || loading) ? handleFormSubmit : null}
          disabled={submitBtnDisabled}
        >
          {!loading ? "Sign up" : <LoadingSVG height={35} width={35} />}
        </button>
      </footer>
    </div>
  );
};

export default Signup;
