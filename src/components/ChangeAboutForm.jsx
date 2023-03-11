import { useEffect, useState } from "react";
import { subscribeToUserDoc, updateAbout } from "../firebase";
import useAuthContext from "../hooks/useAuthContext";

const ChangeAboutForm = ({ onSuccess }) => {
  const [about, setAbout] = useState(localStorage.getItem("about") || "");
  const auth = useAuthContext();

  const hasChanged =
    localStorage.getItem("about") !== about && about.length > 0;

  const handleBlur = async () => {
    if (hasChanged) {
      await updateAbout(about);
      localStorage.setItem("about", about);
      onSuccess();
    }
  };

  useEffect(() => {
    const unsubUser = subscribeToUserDoc(auth.uid, (doc) => {
      setAbout(doc.data().about);
    });

    return () => {
      unsubUser();
    };
  }, [auth]);

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
