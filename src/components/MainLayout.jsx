import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import "../styles/MainLayout.css";

const MainLayout = () => {
  return (
    <>
      <Header />
      <div className="main">
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
