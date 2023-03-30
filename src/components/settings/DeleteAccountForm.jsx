import { useState } from "react";
import {
  deleteAccount,
  isUsernameCorrect,
  reauthenticate,
} from "../../firebase";
import LoadingSVG from "../LoadingSVG";
import useRedirect from "../../hooks/useRedirect";

const DeleteAccountForm = ({ onCancel }) => {
  const [data, setData] = useState({
    username: "",
    password: "",
    checkbox: false,
  });

  const [errors, setErrors] = useState({
    password: "",
    username: "",
    checkbox: "",
  });

  const [loading, setLoading] = useState(false);
  const navigateToHome = useRedirect("/", "Account deleted successfully");

  const handleInput = (e) => {
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.username && data.password && data.checkbox) {
      setLoading(true);
      const usernameCorrect = await isUsernameCorrect(data.username);
      if (!usernameCorrect) {
        setErrors({
          ...errors,
          username: "That's not your username",
        });
      }
      if (usernameCorrect) {
        const { error, message } = await reauthenticate(data.password);
        if (error) {
          setErrors({
            ...errors,
            password: message,
          });
        } else {
          await deleteAccount();
          navigateToHome();
        }
      }
      setLoading(false);
    }
  };

  const handleBlur = (e) => {
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const disabled = errors.username || errors.password || !data.checkbox;

  return (
    <form onSubmit={!loading ? handleSubmit : (e) => e.preventDefault()}>
      <h4>We're sorry to see you go </h4>
      <p>
        Once you delete your account, your profile and username are permanently
        removed from Reddit and your posts, comments, and messages are
        disassociated (not deleted) from your account unless you delete them
        beforehand
      </p>
      <p className="section-header" style={{ border: "none" }}>
        Verify your identity
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <input
          type="text"
          name="username"
          className={`form-input ${errors.username ? "form-input__error" : ""}`}
          placeholder="USERNAME"
          autoComplete="off"
          onChange={handleInput}
          onBlur={handleBlur}
          required
        />
        {errors.username && (
          <div className="error-message">{errors.username}</div>
        )}
        <input
          type="password"
          name="password"
          className={`form-input ${errors.password ? "form-input__error" : ""}`}
          placeholder="PASSWORD"
          onChange={handleInput}
          onBlur={handleBlur}
          required
        />
        {errors.password && (
          <div className="error-message">{errors.password}</div>
        )}
      </div>
      <p>
        <input
          type="checkbox"
          onChange={(e) => {
            setData({ ...data, checkbox: e.target.checked });
          }}
        />{" "}
        I understand that deleted accounts aren't recoverable
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
          paddingBottom: 10,
        }}
      >
        <button
          data-testid="cancel-btn"
          className="secondary-btn"
          style={{ width: 80 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          data-testid="delete-btn"
          className="primary-btn"
          style={{
            width: 80,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          disabled={disabled}
        >
          {loading ? <LoadingSVG height={25} width={25} /> : "Delete"}
        </button>
      </div>
    </form>
  );
};

export default DeleteAccountForm;
