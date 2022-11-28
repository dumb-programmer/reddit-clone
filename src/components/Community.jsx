import Header from "./Header";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCommunity } from "../firebase";
import "../styles/Community.css";

const Community = ({ username }) => {
    const [data, setData] = useState(null);
    const { communityName } = useParams();

    useEffect(() => {
        let ignore = false;
        getCommunity(communityName).then(snapshot => {
            if (!ignore) {
                if (snapshot) {
                    setData(snapshot);
                }
            }
        });

        return () => {
            ignore = true;
        }
    }, [communityName]);

    if (data) {
        return (
            <>
                <Header username={username} />
                <div className="community-header">
                    <div className="community-banner" />
                    <div className="community-info" style={{ marginLeft: 90 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" height="70" width="70" style={{ marginTop: -20, fill: "#0079d3", backgroundColor: "#fff", borderRadius: "50%", padding: 5 }}>
                            <path d="M16.5,2.924,11.264,15.551H9.91L15.461,2.139h.074a9.721,9.721,0,1,0,.967.785ZM8.475,8.435a1.635,1.635,0,0,0-.233.868v4.2H6.629V6.2H8.174v.93h.041a2.927,2.927,0,0,1,1.008-.745,3.384,3.384,0,0,1,1.453-.294,3.244,3.244,0,0,1,.7.068,1.931,1.931,0,0,1,.458.151l-.656,1.558a2.174,2.174,0,0,0-1.067-.246,2.159,2.159,0,0,0-.981.215A1.59,1.59,0,0,0,8.475,8.435Z"></path>
                        </svg>
                        <h2>{data.name}</h2>
                        <span style={{ position: "absolute", top: 50, left: 98, fontSize: 12, color: "#afafaf", fontWeight: "bolder" }}>r/{data.name}</span>
                        <button className="primary-btn" style={{ width: 80 }}>Join</button>
                    </div>
                </div>
                <main className="posts-container">
                    <div className="posts" style={{ marginTop: 15 }}>
                        {Array.from({ length: 10 }).map((idx) => (
                            <div key={idx} className="post">
                                <div className="post-sidebar">
                                    <button className="upvote-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg></button>
                                    <p>26.4k</p>
                                    <button className="downvote-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg></button>
                                </div>
                                <div className="post-main">
                                    <div className="post-header">
                                        <p>
                                            <b>r/AskReddit</b>
                                            <span> Posted by u/dog_red472 15 hrs ago </span>
                                        </p>
                                    </div>
                                    <div className="post-title"><h3>Hello There</h3></div>
                                    <div className="post-body"></div>
                                </div>
                            </div>))}
                    </div>
                    <aside className="community-sidebar">
                        <div className="community-sidebar__header"><b>About Community</b></div>
                        <div className="community-description">
                            <p style={{ fontSize: 16, wordWrap: "break-word" }}>{data.description}</p>
                            <span style={{ color: "#818589" }}>Created {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(data.createdOn.toMillis()))}</span>
                            <p>{new Intl.NumberFormat("en-US", { notation: "compact" }).format(data.members)} Members</p>
                            <button className="primary-btn" style={{ width: "100%", marginLeft: -5 }}>Create Post</button>
                        </div>
                    </aside>
                </main>
            </>
        );
    }
};

export default Community;