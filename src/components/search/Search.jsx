import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  searchComments,
  searchCommunities,
  searchPosts,
  searchUsers,
} from "../../firebase";
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
import "../../styles/Search.css";

const Search = () => {
  const [URLSearchParams] = useSearchParams();
  const q = URLSearchParams.get("q");
  const type = URLSearchParams.get("type");
  const [results, setResults] = useState(null);

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

  useEffect(() => {
    let ignore = false;
    if (type === "posts") {
      searchPosts(q).then((posts) => {
        if (!ignore) {
          setResults(posts);
        }
      });
    } else if (type === "comments") {
      searchComments(q).then((comments) => {
        if (!ignore) {
          setResults(comments);
        }
      });
    } else if (type === "communities") {
      searchCommunities(q).then((communities) => {
        if (!ignore) {
          setResults(communities);
        }
      });
    } else if (type === "people") {
      searchUsers(q).then((users) => {
        if (!ignore) {
          setResults(users);
        }
      });
    }

    return () => {
      ignore = true;
    };
  }, [q, type]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        marginTop: 20,
      }}
    >
      <div className="search-container">
        <div className="search-header">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.link}
              className={`search-tab ${
                type === tab.caption.toLowerCase() ? "search-tab__active" : ""
              }`}
              onClick={() => setResults(null)}
            >
              {tab.caption}
            </Link>
          ))}
        </div>
        <div className="search-body">
          {type === "posts" &&
            !results &&
            Array.from({ length: 10 }).map((_, idx) => (
              <PostLinkSkeleton key={idx} />
            ))}
          {type === "comments" &&
            !results &&
            Array.from({ length: 10 }).map((_, idx) => (
              <SearchCommentSkeleton key={idx} />
            ))}
          {type === "communities" &&
            !results &&
            Array.from({ length: 10 }).map((_, idx) => (
              <CommunityLinkSkeleton key={idx} />
            ))}
          {type === "people" &&
            !results &&
            Array.from({ length: 10 }).map((_, idx) => (
              <ProfileLinkSkeleton key={idx} />
            ))}
          {type === "posts" &&
            results &&
            results.map((post) => <PostLink key={post.id} post={post} />)}
          {type === "comments" &&
            results &&
            results.map((comment) => (
              <SearchComment key={comment.id} comment={comment} />
            ))}
          {type === "communities" &&
            results &&
            results.map((community) => (
              <CommunityLink key={community.name} community={community} />
            ))}
          {type === "people" &&
            results &&
            results.map((user) => <ProfileLink key={user.id} user={user} />)}
          {results && results.length === 0 && <NoResultsFound query={q} />}
        </div>
      </div>
    </div>
  );
};

export default Search;
