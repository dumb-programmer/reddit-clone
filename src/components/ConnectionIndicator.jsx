import React from "react";

const ConnectionIndicator = ({ status }) => {
  return (
    <div
      style={{
        backgroundColor: status === "online" ? "#00a268" : "#121212",
        position: "sticky",
        top: 55,
        width: "100%",
        zIndex: "2",
        color: "#fff",
        padding: "10px 20px",
      }}
    >
      {status === "online" ? "Back online" : "Lost connection"}
    </div>
  );
};

export default ConnectionIndicator;
