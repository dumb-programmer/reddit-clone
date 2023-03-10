import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import Trash2Icon from "./icons/Trash2Icon";
import DeleteAccountModal from "./DeleteAccountModal";
import ChangeEmailModal from "./ChangeEmailModal";
import ToastNotification from "./ToastNotification";
import ChnagePasswordModal from "./ChangePasswordModal";
import "../styles/Settings.css";

const Settings = () => {
  const auth = useContext(AuthContext);
  const [modal, setModal] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");

  return (
    <div
      style={{
        height: "100%",
        backgroundColor: "#fff",
        paddingLeft: 100,
        paddingTop: 33,
        paddingBottom: 33,
      }}
    >
      <h2>User Settings</h2>
      <section className="settings-section">
        <div className="section-header">
          <p>Account Preferences</p>
        </div>
        <div className="section-body">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h4>Email Address</h4>
              <p className="small-text">{auth.email}</p>
            </div>
            <button
              className="secondary-btn"
              style={{ height: 20, width: 80 }}
              onClick={() => setModal(0)}
            >
              Change
            </button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h4>Change Password</h4>
              <p className="small-text">
                Password must be at least 8 characters long
              </p>
            </div>
            <button
              className="secondary-btn"
              style={{ height: 20, width: 80 }}
              onClick={() => setModal(1)}
            >
              Change
            </button>
          </div>
        </div>
      </section>
      <section className="settings-section">
        <div className="section-header">
          <p>Profile Information</p>
        </div>
        <div className="section-body">
          <div>
            <h4>Display name (optional)</h4>
            <p className="small-text">
              Set a display name. This does not change your username
            </p>
          </div>
          <div>
            <input
              className="form-input"
              type="text"
              placeholder="Display name (optional)"
              style={{ width: "100%" }}
            />
            <p className="small-text">30 characters remaining</p>
          </div>
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
            />
            <p className="small-text">200 Characters remaining</p>
          </div>
        </div>
      </section>
      <section className="settings-section">
        <div className="section-header">
          <p>Delete Account</p>
        </div>
        <div
          className="section-body"
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <button className="delete-account-btn" onClick={() => setModal(2)}>
            <Trash2Icon
              height={20}
              width={20}
              stroke="#ff585b"
              strokeWidth={3}
            />
            <p>Delete Account</p>
          </button>
        </div>
      </section>
      {modal === 0 && (
        <ChangeEmailModal
          showToast={() => {
            setToastText("Email updated successfully");
            setShowToast(true);
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 1 && (
        <ChnagePasswordModal
          showToast={() => {
            setToastText("Password updated successfully");
            setShowToast(true);
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 2 && <DeleteAccountModal onClose={() => setModal(null)} />}
      {showToast && (
        <ToastNotification
          text={toastText}
          onHide={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Settings;
