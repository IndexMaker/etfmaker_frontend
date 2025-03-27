import React from "react";

export default function Navigation({ className = "" }) {
  return (
    <svg
      viewBox="0 0 19 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7 1H4C2.34315 1 1 2.34315 1 4V12.4C1 14.0569 2.34315 15.4 4 15.4H7M7 1H14.8C16.4569 1 17.8 2.34315 17.8 4V12.4C17.8 14.0569 16.4569 15.4 14.8 15.4H7M7 1V15.4"
        stroke="currentColor"
        strokeWidth="1.5"
      ></path>
    </svg>
  );
}
