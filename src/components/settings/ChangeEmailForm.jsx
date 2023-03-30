import { useState } from "react";
import {
  isEmailAvailable,
  reauthenticate,
  updateUserEmail,
} from "../../firebase";
import LoadingSVG from "../LoadingSVG";

const ChangeEmailForm = ({ onFinish }) => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleBlur = (e) => {
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

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
    if (data.email && data.password) {
      setLoading(true);
      const { error, message } = await reauthenticate(data.password);
      if (error) {
        setErrors({
          ...errors,
          password: message,
        });
      } else {
        if (!(await isEmailAvailable(data.email))) {
          setErrors({
            ...errors,
            email: "This email is already taken",
          });
        } else {
          await updateUserEmail(data.email);
          onFinish();
        }
      }
      setLoading(false);
    }
  };

  const disabled =
    !data.email ||
    !data.password ||
    Object.values(errors).some((error) => error);

  return (
    <form onSubmit={!loading ? handleSubmit : (e) => e.preventDefault()}>
      <p>
        Update your email below. There will be a new verification email sent
        that you will need to use to verify this new email.
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <input
          type="password"
          name="password"
          className={`form-input ${errors.password ? "form-input__error" : ""}`}
          placeholder="CURRENT PASSWORD"
          onChange={handleInput}
          onBlur={handleBlur}
          required
        />
        {errors.password && (
          <div className="error-message">{errors.password}</div>
        )}

        <input
          type="email"
          name="email"
          className={`form-input ${errors.email ? "form-input__error" : ""}`}
          placeholder="NEW EMAIL"
          autoComplete="off"
          onChange={handleInput}
          onBlur={handleBlur}
          required
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
          padding: "10px 0",
        }}
      >
        <button
          className="primary-btn"
          style={{
            padding: "7px 10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          disabled={disabled}
        >
          {loading ? <LoadingSVG height={25} width={25} /> : "Save Email"}
        </button>
      </div>
    </form>
  );
};

export default ChangeEmailForm;
