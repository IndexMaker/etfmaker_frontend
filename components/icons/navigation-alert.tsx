import React from "react";

export default function NavigationAlert({ className = "" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.3999 19.2002L17.3999 19.2002C19.0568 19.2002 20.3999 17.857 20.3999 16.2002L20.3999 7.80019C20.3999 6.14334 19.0568 4.80019 17.3999 4.80019L14.3999 4.80019M14.3999 19.2002L6.59991 19.2002C4.94305 19.2002 3.5999 17.857 3.5999 16.2002L3.5999 7.80019C3.5999 6.14334 4.94305 4.80019 6.5999 4.80019L14.3999 4.80019M14.3999 19.2002L14.3999 4.80019"
        stroke="currentColor"
        strokeWidth="1.5"
      ></path>
      <circle cx="19" cy="5" r="3" fill="#C73E59"></circle>
    </svg>
  );
}
