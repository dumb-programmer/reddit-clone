import { useEffect } from "react";
import "../styles/ToastNotification.css";

const ToastNotification = ({ text, showUndo, onHide }) => {
  useEffect(() => {
    const timeId = setTimeout(() => onHide(), 3000);
    return () => clearInterval(timeId);
  }, [onHide]);

  return (
    <div className="notification-container">
      <div className="notification-side"></div>
      <div className="notification-content">
        <p>{text}</p>
        {showUndo && <button className="undo-btn">Undo</button>}
      </div>
    </div>
  );
};

export default ToastNotification;
