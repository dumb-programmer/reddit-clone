import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createPost, getCommunityInfo } from "../firebase";
import CommunityInfo from "./CommunityInfo";

const CreatePost = () => {
  const [data, setData] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const { communityName } = useParams();
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [community, setCommunity] = useState(null);

  const handleInput = (e) => {
    if (e.target.name === "title" && e.target.value.length < 301) {
      setData({
        ...data,
        title: e.target.value,
      });
    } else {
      setData({
        ...data,
        content: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    if (data.title.length > 0) {
      setLoading(true);
      await createPost({
        ...data,
        username: username,
        communityName: communityName,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    getCommunityInfo(communityName).then((data) => {
      if (!ignore) {
        setCommunity(data);
      }
    });

    return () => {
      ignore = true;
    };
  }, [communityName]);

  return (
    <>
      <div
        style={{
          paddingTop: 100,
          height: "100%",
          backgroundColor: "#dae0e6",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "1rem",
        }}
      >
        <div style={{ width: 700 }}>
          <h2
            style={{
              fontSize: 18,
              borderBottom: "1.5px solid #edeff1",
              paddingBottom: 20,
              paddingLeft: 10,
            }}
          >
            Create a post
          </h2>
          <div
            style={{
              backgroundColor: "#fff",
              paddingBottom: 10,
              borderRadius: 5,
            }}
          >
            <div className="post-creator-header"></div>
            <div className="post-form" style={{ padding: 10 }}>
              <form>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    style={{ width: "89%", marginBottom: 20, paddingRight: 65 }}
                    placeholder="Title"
                    maxLength={300}
                    value={data.title}
                    onChange={handleInput}
                    required
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: 5,
                      top: 14,
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "#8e9092",
                    }}
                  >
                    {data.title.length}/300
                  </span>
                </div>
                <textarea
                  placeholder="Text(optional)"
                  name="content"
                  className="form-input"
                  style={{ width: "96.5%", height: 100 }}
                  value={data.content}
                  onChange={handleInput}
                />
              </form>
            </div>
            <div
              className="post-creator-footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginRight: 10,
              }}
            >
              <button className="secondary-btn">Cancel</button>
              <button
                className="primary-btn"
                style={{ width: 70 }}
                onClick={!loading ? handleSubmit : null}
                disabled={loading}
              >
                Post
              </button>
            </div>
          </div>
        </div>
        <CommunityInfo data={community} />
      </div>
    </>
  );
};

export default CreatePost;
