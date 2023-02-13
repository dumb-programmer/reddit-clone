import AppleButton from "./AppleButton";
import GoogleButton from "./GoogleButton";
import LoginAndSignUpLayout from "./LoginAndSignUpLayout";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import {
  createAccountUsingEmail,
  usernameAvailable,
  emailNotRegistered,
} from "../firebase";
import randomWords from "random-words";
import LoadingSVG from "./LoadingSVG";
import { useNavigate } from "react-router-dom";
import AlreadyLoggedInMessage from "./AlreadyLoggedInMessage";
import AuthContext from "../context/AuthContext";
import "../styles/SignupForm.css";

const generateUsernames = () => {
  return Array.from({ length: 5 }).map(
    () => randomWords() + "_" + randomWords() + Math.ceil(Math.random() * 1000)
  );
};

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
  const [suggestedUsername, setSuggestedUsernames] = useState(
    generateUsernames()
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authenticated = useContext(AuthContext);

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
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
    setLoading(true);
    if (await emailNotRegistered(e.target.email.value)) {
      setContinueClicked(true);
    } else {
      setError({
        ...error,
        emailAlreadyRegistered: true,
      });
      setLoading(false);
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
  }, [authenticated]);

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
          />
          {error.emailAlreadyRegistered && (
            <div className="error-message">This email is already taken</div>
          )}
          <button
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
            onChange={handleInput}
            onBlur={handleUsernameBlur}
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
            onChange={handleInput}
            onBlur={handlePasswordBlur}
          />
          {error.passwordTooShort && (
            <div className="error-message">
              Password must be at least 8 characters long
            </div>
          )}
        </form>
        <div className="username-suggestions">
          <p>
            Here are some username suggestions{" "}
            <button
              id="generate-usernames-btn"
              onClick={() => {
                setSuggestedUsernames(generateUsernames());
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0079d3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-refresh-cw"
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
          </p>
          {suggestedUsername.map((suggestion, idx) => (
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
