import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import BackToTopButton from "./BackToTopButton";
import "../styles/MainLayout.css";

const MainLayout = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", (e) => {
      if (window.scrollY > 500) {
        setVisible(true);
      } else if (window.scrollY < 500) {
        setVisible(false);
      }
    });
  }, []);

  return (
    <>
      <Header />
      <div className="main">
        <Outlet />
      </div>
      <BackToTopButton visible={visible} />
    </>
  );
};

export default MainLayout;
