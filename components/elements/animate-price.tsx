"use client";
import { useSpring, animated } from "@react-spring/web";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  currency?: string;
  decimals?: number;
  className?: string;
}

export default function AnimatedPrice({
  value,
  currency = "USDC",
  decimals = 2,
  className,
}: Props) {
  const prevValueRef = useRef<number>(value);
  const [change, setChange] = useState<null | number>(null);

  const { number } = useSpring({
    from: { number: prevValueRef.current },
    to: { number: value },
    config: { tension: 140, friction: 18 },
    onRest: () => {
      prevValueRef.current = value;
    },
  });

  useEffect(() => {
    if (value !== prevValueRef.current) {
      const delta = value - prevValueRef.current;
      const percent = (delta / prevValueRef.current) * 100;
      if (!isNaN(percent) && isFinite(percent)) {
        setChange(percent);
      }
    }
  }, [value]);

  const changeClass =
    change !== null ? (change >= 0 ? "text-green-500" : "text-red-500") : "";

  return (
    <span className={clsx("inline-flex items-center gap-1", className, changeClass)}>
      <animated.span>
        {number.to((val) => `${val.toFixed(decimals)} ${currency}`)}
      </animated.span>
      {change !== null && (
        <span className={clsx("text-[10px] text-bold", changeClass)}>
          ({change >= 0 ? "+" : ""}
          {change.toFixed(4)}%)
        </span>
      )}
    </span>
  );
}
