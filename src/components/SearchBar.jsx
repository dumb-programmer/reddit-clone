import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import useRedirect from "../hooks/useRedirect";
import SearchIcon from "./icons/SearchIcon";

const SearchBar = () => {
  const [URLSearchParams] = useSearchParams();
  const q = URLSearchParams.get("q");
  const [query, setQuery] = useState(q || "");
  const redirectToSearch = useRedirect(`/search?q=${query}&type=posts`);
  return (
    <div
      style={{ minWidth: "50%", position: "relative", display: "flex" }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          redirectToSearch();
        }
      }}
    >
      <SearchIcon
        style={{
          height: 20,
          width: 20,
          stroke: "#898c8e",
          position: "absolute",
          top: 8,
          left: 10,
        }}
      />
      <input
        type="text"
        id="search-bar"
        placeholder="Search Reddit"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
