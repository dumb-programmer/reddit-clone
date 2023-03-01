import React, { useEffect, useState } from "react";
import { getMediaUrl } from "../firebase";
import ChevronLeft from "./icons/ChevronLeft";
import ChevronRight from "./icons/ChevronRight";
import "../styles/MediaCarousal.css";
import ContentLoader from "react-content-loader";

const MediaCarousal = ({ paths }) => {
  const [media, setMedia] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchMedia = async () => {
    const urls = [];
    for (const path of paths) {
      const url = await getMediaUrl(path);
      urls.push(url);
    }
    setMedia(urls);
    console.log(urls);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  if (!media) {
    return (
      <div>
        <ContentLoader
          speed={2}
          width={800}
          height={500}
          viewBox="0 0 800 500"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="80" y="3" rx="0" ry="0" width="450" height="500" />
        </ContentLoader>
      </div>
    );
  }

  return (
    <div className="media-carousal">
      <div className="media-carousal-info">
        <p>{selectedIndex + 1 + "/" + media.length}</p>
      </div>
      <div className="media-carousal-navigation">
        {selectedIndex > 0 && (
          <button
            className="media-carousal-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((idx) => --idx);
            }}
          >
            <ChevronLeft style={{ height: 30, width: 30, stroke: "#878a8c" }} />
          </button>
        )}
      </div>
      <div className="media-carousal-content">
        {media.length !== 0 && (
          <img
            key={media[selectedIndex]}
            src={media[selectedIndex]}
            width="100%"
            alt="test"
          />
        )}
      </div>
      <div className="media-carousal-navigation">
        {selectedIndex < media.length - 1 && (
          <button
            className="media-carousal-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((idx) => ++idx);
            }}
          >
            <ChevronRight
              style={{ height: 30, width: 30, stroke: "#878a8c" }}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default MediaCarousal;
