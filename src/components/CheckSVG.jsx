import "../styles/CheckSVG.css";

const CheckSVG = ({ height, width }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 133 133"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="check-group"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
      >
        <circle
          id="filled-circle"
          fill="#0079d3"
          cx="66.5"
          cy="66.5"
          r="54.5"
        />
        <circle id="white-circle" fill="#FFFFFF" cx="66.5" cy="66.5" r="55.5" />
        <circle
          id="outline"
          stroke="#0079d3"
          strokeWidth="4"
          cx="66.5"
          cy="66.5"
          r="54.5"
        />
        <polyline
          id="check"
          stroke="#FFFFFF"
          strokeWidth="5.5"
          points="41 70 56 85 92 49"
        />
      </g>
    </svg>
  );
};

export default CheckSVG;
