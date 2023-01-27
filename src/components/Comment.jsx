import React from "react";
import MessageIcon from "./MessageIcon";
import Vote from "./Vote";
import "../styles/Comment.css";
import getRelativeDateTime from "../utils/getRelativeDateTime";

const Comment = ({ data }) => {
  return (
    <div className="comment-container">
      <div className="comment">
        <img
          src="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png"
          alt="avatar"
          className="avatar"
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingLeft: 10,
          }}
        >
          <div className="comment-header">
            <span>{data.author}</span>
            <span
              style={{
                color: "#a4a7a8",
                marginLeft: 10,
              }}
            >
              {data.createdOn > 0
                ? getRelativeDateTime(data.createdOn.toMillis())
                : "Just Now"}
            </span>
          </div>
          <p>{data.comment}</p>
        </div>
      </div>
      <div className="comment-footer">
        <Vote data={data} type="comment" />
        <button className="reply-btn">
          <MessageIcon height={24} width={24} stroke="black" />
          <span>Reply</span>
        </button>
      </div>
    </div>
  );
};

export default Comment;
