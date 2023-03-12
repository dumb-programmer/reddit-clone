import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../firebase";
import useRedirect from "../hooks/useRedirect";
import "../styles/Header.css";
import LogoutIcon from "./icons/LogoutIcon";
import RedditIcon from "./icons/RedditIcon";
import SettingsIcon from "./icons/SettingsIcon";
import UserIcon from "./icons/UserIcon";
import SearchBar from "./SearchBar";

const Header = () => {
  const [logoutDisabled, setLogoutDisabled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const redirectToHome = useRedirect("/");

  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.stopPropagation();
    setLogoutDisabled(true);
    await logout();
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    });
  }, [showDropdown]);

  return (
    <header className="nav-bar">
      <div
        className="logo"
        onClick={redirectToHome}
        style={{ cursor: "pointer" }}
      >
        <RedditIcon height={35} width={35} />
      </div>
      <SearchBar />
      <div className="user-controls">
        {localStorage.getItem("username") ? (
          <>
            <div
              className="user-info"
              styles={{ marginRight: "5px" }}
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown((prev) => !prev);
              }}
            >
              <img
                src={localStorage.getItem("profilePicture")}
                height="30px"
                width="30px"
                alt="user-avatar"
              />
              <span>{localStorage.getItem("username")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#888b8d"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-chevron-down"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {showDropdown && (
              <div className="dropdown">
                <ul>
                  <a
                    href={`/user/${localStorage.getItem("username")}`}
                    className="dropdown-link"
                  >
                    <UserIcon height={20} width={20} />
                    Profile
                  </a>
                  <a href={`/settings`} className="dropdown-link">
                    <SettingsIcon height={20} width={20} />
                    Settings
                  </a>
                  <li
                    className="dropdown-link"
                    onClick={!logoutDisabled ? handleLogout : null}
                  >
                    <LogoutIcon height={20} width={20} />
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            <button
              className="btn"
              id="sign-up-btn"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
            <button
              className="btn"
              id="login-btn"
              onClick={() => navigate("/login")}
            >
              Log In
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
