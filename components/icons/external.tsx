import React from "react";

export default function External({ className = "" }) {
  return (
    <svg
      width="4"
      height="5"
      viewBox="0 0 8 9"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      color="inherit"
      className={className}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0.175736 8.65825C0.410051 8.89256 0.78995 8.89256 1.02426 8.65825L6.8 2.88251V7.43398C6.8 7.76536 7.06863 8.03398 7.4 8.03398C7.73137 8.03398 8 7.76536 8 7.43398V1.43398C8 1.10261 7.73137 0.833984 7.4 0.833984H1.4C1.06863 0.833984 0.8 1.10261 0.8 1.43398C0.8 1.76535 1.06863 2.03398 1.4 2.03398H5.95147L0.175736 7.80972C-0.0585786 8.04403 -0.0585786 8.42393 0.175736 8.65825Z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
