"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import Image from "next/image";

const topTitle = "/frames/frame53.svg";
const bottomTitle = "/frames/frame52.svg";

const svgs = [
  "/frames/1.svg", // Left
  "/frames/2.svg", // Middle
  "/frames/3.svg", // Right (desktop only)
];

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const visibleSvgs = isMobile ? svgs.slice(0, 2) : svgs;

  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loaded === visibleSvgs.length) setReady(true);
  }, [loaded, visibleSvgs.length]);

  useEffect(() => {
    if (!ready) return;
    const timeout = setTimeout(() => onFinish(), 2500);
    return () => clearTimeout(timeout);
  }, [ready, onFinish]);

  const handleLoad = () => setLoaded((prev) => prev + 1);

  const fadeVariants = (i: number) => ({
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.5 + 0.4,
        type: "spring",
        stiffness: 80,
        damping: 18,
      },
    },
  });

  return (
    <div className="w-screen h-screen bg-white flex flex-col justify-center items-center px-4 md:px-12 py-8 md:py-12">
      {/* Top Title aligned inside container */}
      <div
        className={`w-full max-w-[720px] flex ${
          isMobile ? "justify-center mt-[-100px]" : "justify-start"
        } mb-4`}
      >
        <motion.div
          className="relative w-[450px] md:w-[400px] h-[60px] md:h-[80px]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
        >
          <Image
            src={topTitle}
            alt="Top Title"
            fill
            className="object-contain"
          />
        </motion.div>
      </div>

      {/* SVG Cards with responsive sizing */}
      <div className="w-full max-w-[720px] flex justify-center gap-4 md:gap-6">
        {visibleSvgs.map((src, i) => (
          <motion.div
            key={i}
            variants={fadeVariants(i) as any}
            initial="hidden"
            animate="visible"
            className="flex-1 max-w-[220px] aspect-[3/4] relative"
          >
            <Image
              src={src}
              alt={`svg-${i}`}
              fill
              className="object-contain"
              onLoadingComplete={handleLoad}
            />
          </motion.div>
        ))}
      </div>

      {/* Bottom Logo */}
      <motion.div
        className={`flex justify-center mt-8 ${
          isMobile ? "absolute bottom-15" : ""
        }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1, transition: { delay: 1.8 } }}
      >
        <div className="relative w-[360px] md:w-[40vw] h-[80px]">
          <Image
            src={bottomTitle}
            alt="Bottom Title"
            fill
            className="object-contain"
          />
        </div>
      </motion.div>
    </div>
  );
}
