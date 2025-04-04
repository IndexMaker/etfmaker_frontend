import React from "react";

export default function Info({ className = "", color = "#797c7d" }) {
  return (
    <svg
      viewBox="3 3 18 18"
      xmlns="http://www.w3.org/2000/svg"
      fill={color}
      className={className}
    >
      <rect
        width="16"
        height="16"
        x="4"
        y="4"
        fill={color}
        rx="2"
      ></rect>
      <path
        fill="#202426"
        d="m12.925 7.5-.163 5.975h-1.524L11.07 7.5h1.854ZM12 17.141a.973.973 0 0 1-.708-.291.952.952 0 0 1-.292-.709.933.933 0 0 1 .292-.7.973.973 0 0 1 .708-.291c.264 0 .496.097.696.291a.956.956 0 0 1 .158 1.205c-.091.15-.212.27-.362.362a.947.947 0 0 1-.492.133Z"
      ></path>
    </svg>
  );
}
