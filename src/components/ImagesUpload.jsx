import { useEffect, useRef, useState } from "react";
import AddIcon from "./icons/AddIcon";
import "../styles/ImageUpload.css";
import CrossIcon from "./icons/CrossIcon";

const ImagesUpload = ({ setData }) => {
  const fileInput = useRef();
  const [thumbs, setThumbs] = useState([]);

  const handleFileUpload = (e) => {
    e.preventDefault();
    fileInput.current.click();
  };

  const loadImages = (files) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbs((thumbs) => [
          ...thumbs,
          { src: e.target.result, alt: file.name },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (index) => {
    const dt = new DataTransfer();
    const files = fileInput.current.files;
    for (let i = 0; i < files.length; i++) {
      if (i === index) continue;
      const file = files[i];
      dt.items.add(file);
    }

    fileInput.current.files = dt.files;
    setThumbs(thumbs.filter((_, idx) => idx !== index));
    setData((data) => {
      return { ...data, media: data.media.filter((_, idx) => idx !== index) };
    });
  };

  useEffect(() => {
    setData((data) => {
      return { ...data, media: [] };
    });
  }, []);

  return (
    <div style={{ border: "2px solid #f0f2f4", borderRadius: 5, padding: 10 }}>
      <input
        ref={fileInput}
        type="file"
        accept="image/png, image/gif,image/jpeg, image/webp, video/mp4, video/quicktime"
        style={{ display: "none" }}
        onChange={(e) => {
          setData((data) => {
            return { ...data, media: [...data.media, ...e.target.files] };
          });
          loadImages(Array.from(e.target.files));
        }}
        multiple
      />
      {thumbs.length === 0 ? (
        <div
          style={{
            minHeight: 280,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p style={{ color: "#0079d3" }}>
            Drag and drop images{" "}
            <button
              className="secondary-btn"
              style={{
                minHeight: 20,
                minWidth: 32,
                fontSize: 14,
                fontWeight: 700,
                padding: "4px 16px",
                borderRadius: 9999,
                marginLeft: 10,
              }}
              onClick={handleFileUpload}
            >
              Upload
            </button>
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {thumbs.map((thumb, index) => (
            <div className="media-preview">
              <button
                className="delete-media-btn"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(index);
                }}
              >
                <CrossIcon
                  height={18}
                  width={18}
                  stroke="#fff"
                  strokeWidth={4}
                />
              </button>
              <img src={thumb.src} alt={thumb.alt} className="thumbnail" />
            </div>
          ))}
          <button className="add-media-btn" onClick={handleFileUpload}>
            <AddIcon height={30} width={30} stroke="#a0a0a0" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImagesUpload;
