import { useEffect, useState } from "react";
import LinkIcon from "./icons/LinkIcon";
import "../styles/LinkPreview.css";

const LinkPreview = ({ link }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetch(
      `https://api.linkpreview.net/?key=a7a74075abfe123ca4d1084902d30f4d&q=${link}`
    ).then((data) => data.json().then((data) => setPreview(data)));
  }, [link]);

  return (
    <div className="link-preview" onClick={() => window.open(link)}>
      {!preview ? (
        <LinkIcon height={20} width={20} stroke="#0079d3" />
      ) : (
        <img
          src={preview.image}
          alt={preview.description}
          height={120}
          width={150}
        />
      )}
    </div>
  );
};

export default LinkPreview;
