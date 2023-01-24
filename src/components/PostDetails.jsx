import React from "react";
import Vote from "./Vote";
import "../styles/PostDetails.css";

const PostDetails = () => {
  return (
    <div className="content-container">
      <div className="content">
        <div
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <div className="post-sidebar">
            <Vote />
          </div>
          <div className="post-container">
            <div className="post-header">
              <p>Posted by u/Viedowulff 8 hours ago</p>
            </div>
            <h1>Title</h1>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laborum
              corporis quidem nemo eum, itaque quisquam doloremque facilis quae
              unde eveniet libero suscipit voluptatum dolorum a eaque optio
              magni assumenda consequuntur illum doloribus velit ullam culpa
              vero? Saepe, labore! Aliquam dolor, id provident porro aliquid
              natus eaque quasi dignissimos fugit ipsa, sequi deserunt soluta,
              fugiat consectetur. Eius, consectetur ad voluptates illo impedit
              veniam culpa non quaerat molestiae accusamus, facere soluta in!
              Perferendis, necessitatibus? Quae a debitis dolores nam. Est illo,
              inventore distinctio odit officia maxime amet unde doloremque
              incidunt consequuntur. Tempora minima quae id possimus ad eos
              eligendi, nostrum nesciunt soluta!
            </p>
            <div>
              <textarea
                className="comment-box"
                placeholder="What are your thoughts?"
              ></textarea>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 10,
                }}
              >
                <button className="primary-btn">Comment</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex" }}>
            <img
              src="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png"
              alt="avatar"
              height="30"
              width="30"
              style={{ borderRadius: "50%" }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: 10,
              }}
            >
              <div>
                <span style={{ fontSize: 14, fontWeight: "bold" }}>
                  lurkinislife
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#a4a7a8",
                    marginLeft: 10,
                  }}
                >
                  11 hr ago
                </span>
              </div>
              <p>You should seal that in resin, save it for posterity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
