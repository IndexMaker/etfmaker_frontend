import React from "react";

export default function Feedback({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 13"
      fill="none"
      className={className}
      color="var(--colors-text-tertiary)"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M.334 2.177V8.21c0 1.11.895 2.01 2 2.01h2v.268c0 1.44 1.687 2.209 2.764 1.26l1.737-1.527h2.832c1.105 0 2-.9 2-2.011V2.177c0-1.11-.895-2.01-2-2.01H2.334c-1.105 0-2 .9-2 2.01Zm4 6.703c.508 0 .949.285 1.174.705l.01.02a1.338 1.338 0 0 1 .15.616v.267c0 .288.337.442.552.252l1.737-1.528a1.33 1.33 0 0 1 .878-.332h2.832c.369 0 .667-.3.667-.67V2.177c0-.37-.298-.67-.667-.67H2.334c-.368 0-.667.3-.667.67V8.21c0 .37.299.67.667.67h2Zm2.691-6.713a.8.8 0 0 0-.8.832l.15 1.751a.65.65 0 0 0 1.3 0L7.825 3a.8.8 0 0 0-.8-.833Zm-.958 5.187a.937.937 0 1 1 1.875 0 .937.937 0 0 1-1.875 0Z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
