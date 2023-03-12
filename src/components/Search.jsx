import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  searchComments,
  searchCommunities,
  searchPosts,
  searchUsers,
} from "../firebase";
import { uuidv4 } from "@firebase/util";
import NoResultsFound from "./NoResultsFound";
import CommunityLinkSkeleton from "./CommunityLinkSkeleton";
import CommunityLink from "./CommunityLink";
import ProfileLinkSkeleton from "./ProfileLinkSkeleton";
import ProfileLink from "./ProfileLink";
import PostLink from "./PostLink";
import PostLinkSkeleton from "./PostLinkSkeleton";
import SearchComment from "./SearchComment";
import SearchCommentSkeleton from "./SearchCommentSkeleton";
import "../styles/Search.css";

const Search = () => {
  const [URLSearchParams] = useSearchParams();
  const q = URLSearchParams.get("q");
  const type = URLSearchParams.get("type");
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const tabs = useMemo(
    () => [
      { id: uuidv4(), link: `/search?q=${q}&type=posts`, caption: "Posts" },
      {
        id: uuidv4(),
        link: `/search?q=${q}&type=comments`,
        caption: "Comments",
      },
      {
        id: uuidv4(),
        link: `/search?q=${q}&type=communities`,
        caption: "Communities",
      },
      { id: uuidv4(), link: `/search?q=${q}&type=people`, caption: "People" },
    ],
    [q]
  );

  const handleTabClick = (e, link) => {
    setResult(null);
    e.preventDefault();
    navigate(link);
  };

  useEffect(() => {
    let ignore = false;
    if (type === "posts") {
      searchPosts(q).then((posts) => {
        if (!ignore) {
          setResult(posts);
        }
      });
    } else if (type === "comments") {
      searchComments(q).then((comments) => {
        if (!ignore) {
          setResult(comments);
        }
      });
    } else if (type === "communities") {
      searchCommunities(q).then((communities) => {
        if (!ignore) {
          setResult(communities);
        }
      });
    } else if (type === "people") {
      searchUsers(q).then((users) => {
        if (!ignore) {
          setResult(users);
        }
      });
    }

    return () => {
      ignore = true;
    };
  }, [q, type]);

  console.log(result);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        marginTop: 20,
        // height: "100%",
      }}
    >
      <div style={{ minWidth: 800 }}>
        <div className="search-header">
          {tabs.map((tab, idx) => (
            <a
              key={tab.id}
              href={tab.link}
              className={`search-tab ${
                type === tab.caption.toLowerCase() ? "search-tab__active" : ""
              }`}
              onClick={(e) => handleTabClick(e, tab.link)}
            >
              {tab.caption}
            </a>
          ))}
        </div>
        <div className="search-body">
          {type === "posts" &&
            !result &&
            Array.from({ length: 10 }).map((_, idx) => (
              <PostLinkSkeleton key={idx} />
            ))}
          {type === "comments" &&
            !result &&
            Array.from({ length: 10 }).map((_, idx) => (
              <SearchCommentSkeleton key={idx} />
            ))}
          {type === "communities" &&
            !result &&
            Array.from({ length: 10 }).map((_, idx) => (
              <CommunityLinkSkeleton key={idx} />
            ))}
          {type === "people" &&
            !result &&
            Array.from({ length: 10 }).map((_, idx) => (
              <ProfileLinkSkeleton key={idx} />
            ))}
          {type === "posts" &&
            result &&
            result.map((post) => <PostLink id={post.id} post={post} />)}
          {type === "comments" &&
            result &&
            result.map((comment) => (
              <SearchComment id={comment.id} comment={comment} />
            ))}
          {type === "communities" &&
            result &&
            result.map((community) => (
              <CommunityLink id={community.id} community={community} />
            ))}
          {type === "people" &&
            result &&
            result.map((user) => <ProfileLink key={user.id} user={user} />)}
          {result && result.length === 0 && <NoResultsFound query={q} />}
        </div>
      </div>
    </div>
  );
};

export default Search;
