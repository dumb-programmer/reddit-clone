import React from "react";
import CommentsIcon from "./icons/CommentsIcon";

const EmptyComments = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        marginTop: 80,
      }}
    >
      <CommentsIcon height={30} width={30} fill="#99c9ed" />
      <p style={{ fontWeight: "bolder", color: "#b0b0b0" }}>No Comments Yet</p>
      <p
        style={{
          fontWeight: "bolder",
          color: "#b0b0b0",
          padding: 0,
          margin: 0,
        }}
      >
        Be the first to share what you think!
      </p>
    </div>
  );
};

export default EmptyComments;
