"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import Image from "next/image";
import { motion } from "framer-motion";
import Logo from "@/components/icons/logo";
import { cn } from "@/lib/utils";

const logo = "/frames/frame52.png";

const desktopImages = [
  "/frames/frame24.png",
  "/frames/frame27.png",
  "/frames/frame30.png",
  "/frames/frame31.png",
  "/frames/frame26.png",
  "/frames/frame25.png",
];

const mobileImages = [
  "/frames/frame30.png",
  "/frames/frame27.png",
  "/frames/frame24.png",
  "/frames/frame25.png",
];

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const isMobile = useMediaQuery({ maxWidth: 1024 });
  const images = isMobile ? mobileImages : desktopImages;
  const [startExit, setStartExit] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [readyToAnimate, setReadyToAnimate] = useState(false);

  useEffect(() => {
    if (imagesLoaded === images.length) {
      setReadyToAnimate(true);
    }
  }, [imagesLoaded, images.length]);

  useEffect(() => {
    const timeout = setTimeout(() => setStartExit(true), 2000);
    const finish = setTimeout(() => onFinish(), 2000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(finish);
    };
  }, [readyToAnimate, onFinish]);
  const handleImageLoad = () => {
    setImagesLoaded((prev) => prev + 1);
  };
  const imageVariants: any = (i: number) => ({
    hidden: {
      opacity: 0,
      scale: 0.3,
      x: Math.cos((i / images.length) * 2 * Math.PI) * 400,
      y: Math.sin((i / images.length) * 2 * Math.PI) * 400,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: i * 0.1, // faster stagger
      },
    },
  });

  const logoVariants = {
    enter: {
      opacity: 0,
      scale: 0.8,
    },
    center: {
      opacity: 1,
      scale: 1,
      transition: { delay: images.length * 0.1 + 0.3 }, // shorter delay
    },
    exit: {
      opacity: 0,
      scale: 0.1,
      rotate: 180,
      transition: { duration: 0.4, ease: "easeInOut" }, // quicker exit
    },
  };

  return (
    <div className={`w-screen h-screen bg-background flex items-center justify-center overflow-hidden`}>
      <div className={`flex flex-col ${isMobile ? "mt-[-40vh]" : "items-center "}`}>
        <div
          className={`grid gap-3 ${
            isMobile
              ? "grid-cols-2 w-[80vw] max-w-[320px]"
              : "grid-cols-3 w-[90vw] max-w-[720px]"
          }`}
          style={{
            gridTemplateRows: isMobile ? "repeat(2, auto)" : "repeat(2, auto)",
          }}
        >
          {images.map((src, i) => (
            <motion.div
              key={i}
              className="relative aspect-square w-full"
              variants={imageVariants(i)}
              initial="hidden"
              animate={"visible"}
            >
              <Image src={src} alt={`img-${i}`} fill className="object-cover" />
            </motion.div>
          ))}
        </div>

        {/* Logo below the grid */}
        <motion.div
          className="mt-6"
          variants={logoVariants as any}
          initial="enter"
          animate={"center"}
        >
          <Image src={logo} alt="Logo" width={300} height={160} />
        </motion.div>
      </div>
    </div>
  );
}
