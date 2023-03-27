import CheckSVG from "./CheckSVG";
import LoadingSVG from "./LoadingSVG";
import "../styles/ProgressToast.css";

const findIcon = (status) => {
  switch (status) {
    case "uploading":
      return (
        <LoadingSVG height={30} width={30} stroke="#0079d3" strokeWidth={10} />
      );
    case "success":
      return <CheckSVG height={30} width={30} />;
    default:
      return null;
  }
};

const ProgressToast = ({ progress, status, text }) => {
  const StatusIcon = findIcon(status); // optimization: call this function only when status changes

  return (
    <div className="notification-container">
      <div style={{ display: "flex" }}>
        <div className="notification-status">{StatusIcon}</div>
        <p>{text}</p>
      </div>
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

export default ProgressToast;
