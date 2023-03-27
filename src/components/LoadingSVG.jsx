const LoadingSVG = ({
  height = 25,
  width = 25,
  stroke = "#fff",
  strokeWidth = 7,
  ...otherProps
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      {...otherProps}
    >
      <circle
        cx="50"
        cy="50"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        r="30"
        strokeDasharray="113.09733552923255 39.69911184307752"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          repeatCount="indefinite"
          dur="1s"
          values="0 50 50;360 50 50"
          keyTimes="0;1"
        ></animateTransform>
      </circle>
    </svg>
  );
};

export default LoadingSVG;
