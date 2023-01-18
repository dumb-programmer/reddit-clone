import { useState } from "react";
import { downvote, upvote } from "../firebase";

const Post = ({ data }) => {
    const [vote, setVote] = useState(data.votes);

    const handleUpvote = async () => {
        if (vote === 1) {
            setVote((prevState) => --prevState);
        }
        else {
            setVote((prevState) => ++prevState);
            upvote(data.id);
        }
    };

    const handleDownvote = async () => {
        if (vote === -1) {
            setVote((prevState) => ++prevState);
        }
        else {
            setVote((prevState) => --prevState);
            downvote(data.id);
        }
    };

    return (
        <div className="post">
            <div className="post-sidebar" >
                <button className={`upvote-btn ${vote === 1 ? "upvote-btn__clicked" : ""}`} onClick={handleUpvote}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg></button>
                <p style={(vote === 1 || vote === -1) ? { color: vote === 1 ? "#ff4500" : "#7193ff" } : null}>{vote}</p>
                <button className={`downvote-btn ${vote === -1 ? "downvote-btn__clicked" : ""}`} onClick={handleDownvote}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg></button>
            </div>
            <div className="post-main">
                <div className="post-header">
                    <p>
                        <b>r/{data.communityName}</b>
                        <span> Posted by u/{data.author} {new Date() - new Date(data.createdOn.toMillis())} ago </span>
                    </p>
                </div>
                <div className="post-title"><h3>{data.title}</h3></div>
                <div className="post-body">{data.content}</div>
            </div>
        </div>
    );
};

export default Post;