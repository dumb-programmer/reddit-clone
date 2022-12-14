import Header from "./Header";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCommunity } from "../firebase";
import "../styles/Community.css";
import Post from "./Post";

const Community = ({ username }) => {
    const [data, setData] = useState({});
    const [communityNotFound, setCommunityNotFound] = useState(false);
    const { communityName } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        let ignore = false;
        getCommunity(communityName).then(snapshot => {
            if (!ignore) {
                if (snapshot) {
                    setData(snapshot);
                }
                else {
                    setCommunityNotFound(true);
                }
            }
        });

        return () => {
            ignore = true;
        }
    }, [communityName]);

    if (communityNotFound) {
        return (
            <>
                <Header />
                <main style={{ backgroundColor: "#dae0e6", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                    <h2>Sorry, there aren't any communities with that name.</h2>
                    <h5>This community may have been banned or the community name is incorrect</h5>
                </main>
            </>);
    }

    const loading = Object.keys(data).length === 0;

    return (
        <>
            <Header username={username} />
            {
                !loading && <div className="community-header">
                    <div className="community-banner" />
                    <div className="community-info" style={{ marginLeft: 90 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" height="70" width="70" style={{ marginTop: -20, fill: "#0079d3", backgroundColor: "#fff", borderRadius: "50%", padding: 5 }}>
                            <path d="M16.5,2.924,11.264,15.551H9.91L15.461,2.139h.074a9.721,9.721,0,1,0,.967.785ZM8.475,8.435a1.635,1.635,0,0,0-.233.868v4.2H6.629V6.2H8.174v.93h.041a2.927,2.927,0,0,1,1.008-.745,3.384,3.384,0,0,1,1.453-.294,3.244,3.244,0,0,1,.7.068,1.931,1.931,0,0,1,.458.151l-.656,1.558a2.174,2.174,0,0,0-1.067-.246,2.159,2.159,0,0,0-.981.215A1.59,1.59,0,0,0,8.475,8.435Z"></path>
                        </svg>
                        <h2>{data?.name}</h2>
                        <span style={{ position: "absolute", top: 50, left: 98, fontSize: 12, color: "#afafaf", fontWeight: "bolder" }}>r/{data.name}</span>
                        <button className="primary-btn" style={{ width: 80 }}>Join</button>
                    </div>
                </div>
            }
            <main className="posts-container">
                {
                    !loading && <div className="posts" style={{ marginTop: 15 }}>
                        {data.posts.map((post) => (<Post key={post.id} data={post} />))}
                    </div>
                }
                {
                    !loading && <aside className="community-sidebar">
                        <div className="community-sidebar__header"><b>About Community</b></div>
                        <div className="community-description">
                            <p style={{ fontSize: 16, wordWrap: "break-word" }}>{data.description}</p>
                            <span style={{ color: "#818589" }}>Created {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(data.createdOn.toMillis()))}</span>
                            <p>{new Intl.NumberFormat("en-US", { notation: "compact" }).format(data.members)} Members</p>
                            <button className="primary-btn" style={{ width: "100%", marginLeft: -5 }} onClick={() => navigate(`/r/${communityName}/submit`)}>Create Post</button>
                        </div>
                    </aside>
                }
            </main>
        </>
    );
};

export default Community;