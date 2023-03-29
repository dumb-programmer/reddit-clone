import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import BackToTopButton from "./BackToTopButton";
import "../styles/MainLayout.css";
import ConnectionIndicator from "./ConnectionIndicator";

const MainLayout = () => {
  const [visible, setVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    window.addEventListener("scroll", (e) => {
      if (window.scrollY > 500) {
        setVisible(true);
      } else if (window.scrollY < 500) {
        setVisible(false);
      }
    });
    window.addEventListener("online", () => {
      setConnectionStatus("online");
      setTimeout(() => setConnectionStatus(null), 1000);
    });
    window.addEventListener("offline", () => {
      setConnectionStatus("offline");
    });
  }, []);

  return (
    <>
      <Header />
      <div className="main">
        {connectionStatus && <ConnectionIndicator status={connectionStatus} />}
        <Outlet />
      </div>
      <BackToTopButton visible={visible} />
    </>
  );
};

export default MainLayout;
