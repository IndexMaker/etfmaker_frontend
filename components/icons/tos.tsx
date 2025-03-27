import React from "react";

export default function TOS({ className = "" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="0.75"
        y="0.75"
        width="14.5"
        height="14.5"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.5"
      ></rect>
      <rect x="4" y="4.5" width="8" height="1.4" fill="currentColor"></rect>
      <rect x="4" y="7.29999" width="4" height="1.4" fill="currentColor"></rect>
      <rect
        x="4"
        y="10.1"
        width="6.66667"
        height="1.4"
        fill="currentColor"
      ></rect>
    </svg>
  );
}
