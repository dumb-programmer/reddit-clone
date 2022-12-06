const LoadingSVG = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
            <circle cx="50" cy="50" fill="none" stroke="#ffffff" strokeWidth="5" r="24" strokeDasharray="113.09733552923255 39.69911184307752">
                <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
            </circle>
        </svg>
    );
}

export default LoadingSVG;