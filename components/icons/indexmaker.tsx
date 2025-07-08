import React from "react";

export default function IndexMaker({ className = "", color = "#E2E0FF" }) {
  const fillColor = className.includes("text-muted") ? "currentColor" : color;
  return (
    <svg
      className={className}
      width="172"
      height="125"
      viewBox="0 0 172 125"
      fill={fillColor}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M56.2792 123.687L55.9841 124.189ZM85.9977 0L69.0284 24.3827L85.9977 48.4698L102.967 24.3827L85.9977 0ZM112.086 37.505L95.8842 62.5083L138.913 123.657H171.966L112.057 37.505H112.086ZM85.9977 77.8176L56.2792 123.657H115.716L85.9977 77.8176ZM116.041 124.159L115.746 123.657ZM59.9092 37.5345L0 123.687H33.0533L76.0817 62.5378L59.8797 37.5641L59.9092 37.5345Z"
        fill={fillColor}
      />
    </svg>
  );
}
