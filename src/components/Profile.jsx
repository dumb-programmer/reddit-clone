import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import { getProfile } from "../firebase";
import CakeIcon from "./icons/CakeIcon";
import Post from "./Post";

const Profile = () => {
  const [data, setData] = useState(null);
  const user = useContext(AuthContext);

  useEffect(() => {
    let ignore = false;
    getProfile(user.uid, localStorage.getItem("username")).then((snap) => {
      if (!ignore) {
        setData(snap);
      }
    });

    return () => {
      ignore = true;
    };
  }, [user]);

  const loading = data === null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "1rem",
        paddingTop: 100,
      }}
    >
      <div style={{ width: 800 }}>
        {!loading &&
          data?.posts.map((post) => (
            <Post key={post.id} data={post.data()} id={post.id} />
          ))}
      </div>
      <aside
        style={{
          backgroundColor: "#fff",
          maxHeight: 325,
          width: 300,
          borderRadius: "0.5rem",
        }}
      >
        <div style={{ backgroundColor: "#33a8ff", height: 50 }}></div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 15,
          }}
        >
          <img
            src="https://preview.redd.it/j6n0dp5c5bu71.png?width=256&format=png&auto=webp&s=e6ce31875458e6f094b997ea4fbf32e93dc4af81"
            alt="profile"
            height={100}
            width={100}
          />
          <h3>{data && data.username}</h3>
          <span
            style={{
              color: "#7c7c7c",
              fontWeight: "bolder",
              fontSize: 12,
              marginTop: -15,
            }}
          >
            u/{data && data.username}{" "}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            paddingLeft: 50,
          }}
        >
          <p style={{ margin: 0, fontSize: 14, fontWeight: "bold" }}>
            Cake day :
          </p>
          <p style={{ marign: 0 }}>
            <CakeIcon height={18} width={18} color="#24a0ed" />
          </p>
          <span
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: "bold",
              color: "#afafaf",
            }}
          >
            {data &&
              Intl.DateTimeFormat("en-us", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(data.joined_on.toMillis())}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button className="primary-btn" style={{ width: "80%" }}>
            New Post
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Profile;
