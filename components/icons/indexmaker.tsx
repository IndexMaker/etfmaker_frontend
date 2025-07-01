import React from "react";

export default function IndexMaker({ className = "", color='#E2E0FF' }) {
  const fillColor = className.includes('text-muted') ? 'currentColor' : color;
  return (
    <svg
      className={className}
      width="1374"
      height="553"
      viewBox="0 0 1374 553"
      fill={fillColor}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M685.722 0L389.548 351.615L537.635 552.955H838.915L992.108 351.615L685.722 0Z"
        fill={fillColor}
      />
      <path
        d="M1371.44 0L1075.27 351.615L1223.36 552.955H1374L1371.44 0Z"
        fill={fillColor}
      />
      <path
        d="M306.387 351.615L0 0L2.55322 552.955H153.193L306.387 351.615Z"
        fill={fillColor}
      />
      <path
        d="M1033.26 395.383L1163.4 552.953H903.114L1033.26 395.383Z"
        fill={fillColor}
      />
      <path
        d="M347.527 395.383L477.669 552.953H217.385L347.527 395.383Z"
        fill={fillColor}
      />
    </svg>
  );
}
