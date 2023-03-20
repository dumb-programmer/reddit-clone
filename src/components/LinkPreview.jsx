import { useEffect, useState } from "react";
import LinkIcon from "./icons/LinkIcon";
import "../styles/LinkPreview.css";

const LinkPreview = ({ link }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetch(
      `https://api.linkpreview.net/?key=${process.env.REACT_APP_LINK_PREVIEW_API_KEY}&q=${link}`
    ).then((data) => data.json().then((data) => setPreview(data)));
  }, [link]);

  return (
    <div
      className="link-preview"
      data-testid="link-preview"
      onClick={() => window.open(link)}
    >
      {preview && preview.image ? (
        <img
          src={preview.image}
          alt={preview.description}
          height={120}
          width={150}
        />
      ) : (
        <LinkIcon height={20} width={20} stroke="#0079d3" />
      )}
    </div>
  );
};

export default LinkPreview;
