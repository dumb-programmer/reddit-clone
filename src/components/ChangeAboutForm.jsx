import { useState } from "react";
import { updateAbout } from "../firebase";

const ChangeAboutForm = ({ onSuccess }) => {
  const [about, setAbout] = useState(localStorage.getItem("about") || "");

  const handleBlur = async () => {
    await updateAbout(about);
    localStorage.setItem("about", about);
    onSuccess();
  };

  return (
    <>
      <div>
        <h4>About (optional)</h4>
        <p className="small-text">
          A brief description of yourself shown on your profile.
        </p>
      </div>
      <div>
        <textarea
          className="form-input"
          type="text"
          placeholder="About (optional)"
          style={{ width: "100%", minHeight: 120 }}
          value={about}
          onChange={(e) => {
            if (e.target.value.length < 201) {
              setAbout(e.target.value);
            }
          }}
          onBlur={handleBlur}
        />
        <p className="small-text">{200 - about.length} Characters remaining</p>
      </div>
    </>
  );
};

export default ChangeAboutForm;
