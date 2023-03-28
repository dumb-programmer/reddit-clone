import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPost, getCommunityInfo } from "../../firebase";
import CommunityInfo from "../community/CommunityInfo";
import FileIcon from "../icons/FileIcon";
import ImageIcon from "../icons/ImageIcon";
import LinkIcon from "../icons/LinkIcon";
import ImagesUpload from "./ImagesUpload";
import LoadingSVG from "../LoadingSVG";
import "../../styles/CreatePost.css";
import useAuthContext from "../../hooks/useAuthContext";

const CreatePost = () => {
  const [data, setData] = useState({
    title: "",
    content: "",
    link: "",
    media: [],
  });
  const [loading, setLoading] = useState(false);
  const { communityName } = useParams();
  const [community, setCommunity] = useState(null);
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const auth = useAuthContext();

  const handleInput = (e) => {
    if (e.target.name === "title" && e.target.value.length < 301) {
      setData({
        ...data,
        title: e.target.value,
      });
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    if (data.title.length > 0) {
      setLoading(true);
      const postId = await createPost({
        authorId: auth.uid,
        username: localStorage.getItem("username"),
        communityName: communityName,
        ...data,
      });
      navigate(`/r/${communityName}/${postId}`);
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
            <div className="post-creator-header">
              <div
                data-testid="post-tab"
                className={`post-creator-tab ${
                  selected === 0 ? "post-creator-tab__active" : ""
                }`}
                onClick={() => setSelected(0)}
              >
                <FileIcon height={25} width={25} stroke="grey" />
                <p>Post</p>
              </div>
              <div
                data-testid="images-tab"
                className={`post-creator-tab ${
                  selected === 1 ? "post-creator-tab__active" : ""
                }`}
                onClick={() => setSelected(1)}
              >
                <ImageIcon height={25} width={25} stroke="grey" />
                <p>Images</p>
              </div>
              <div
                data-testid="link-tab"
                className={`post-creator-tab ${
                  selected === 2 ? "post-creator-tab__active" : ""
                }`}
                onClick={() => setSelected(2)}
              >
                <LinkIcon height={25} width={25} stroke="grey" />
                <p>Link</p>
              </div>
            </div>
            <div className="post-form" style={{ padding: 10 }}>
              <form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ position: "relative", display: "flex" }}>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    style={{ flex: "2" }}
                    placeholder="Title"
                    maxLength={300}
                    value={data.title}
                    onChange={handleInput}
                    required
                  />
                  <span
                    data-testid="title-remaining-characters"
                    style={{
                      position: "absolute",
                      right: 15,
                      top: 14,
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "#8e9092",
                    }}
                  >
                    {data.title.length}/300
                  </span>
                </div>
                {selected === 0 && (
                  <textarea
                    placeholder="Text(optional"
                    name="content"
                    className="form-input"
                    style={{ height: 100 }}
                    value={data.content}
                    onChange={handleInput}
                  />
                )}
                {selected === 1 && <ImagesUpload setData={setData} />}
                {selected === 2 && (
                  <textarea
                    placeholder="Url"
                    className="form-input"
                    name="link"
                    value={data.link}
                    onChange={handleInput}
                    required
                  />
                )}
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
                data-testid="post-btn"
                className="primary-btn"
                style={{
                  minHeight: 32,
                  minWidth: 60,
                  borderRadius: 23,
                  padding: "4px 16px",
                }}
                onClick={!loading ? handleSubmit : null}
                disabled={loading}
              >
                {!loading ? "Post" : <LoadingSVG />}
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
