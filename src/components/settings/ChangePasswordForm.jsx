import { useState } from "react";
import { reauthenticate, updateUserPassword } from "../../firebase";
import LoadingSVG from "../LoadingSVG";

const ChangePassword = ({ onFinish }) => {
  const [data, setData] = useState({
    password: "",
    new_password: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    new_password: "",
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
    if (data.password && data.new_password) {
      setLoading(true);
      const { error, message } = await reauthenticate(data.password);
      if (error) {
        setErrors({
          ...errors,
          password: message,
        });
      } else {
        if (data.new_password.length < 8) {
          setErrors({
            ...errors,
            new_password: "Password should be atleast 8 characters",
          });
        } else {
          await updateUserPassword(data.new_password);
          onFinish();
        }
      }
      setLoading(false);
    }
  };

  const disabled =
    !data.password ||
    !data.new_password ||
    Object.values(errors).some((error) => error);

  return (
    <form onSubmit={!loading ? handleSubmit : (e) => e.preventDefault()}>
      <p>
        Changing your password logs you out of all browsers on your device(s).
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
          type="password"
          name="new_password"
          className={`form-input ${
            errors.new_password ? "form-input__error" : ""
          }`}
          placeholder="NEW PASSWORD"
          onChange={handleInput}
          onBlur={handleBlur}
          required
        />
        {errors.new_password && (
          <div className="error-message">{errors.new_password}</div>
        )}
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
            height: 20,
            width: 80,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          disabled={disabled}
        >
          {loading ? <LoadingSVG height={25} width={25} /> : "Save"}
        </button>
      </div>
    </form>
  );
};

export default ChangePassword;
