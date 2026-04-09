import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const baseSymbols = ["∑", "√", "π", "∞", "x²", "-", "Δ", "θ", "Ω", "µ","√"];
  const [items, setItems] = useState([]);

  // Random positions across the screen
  useEffect(() => {
    const newItems = Array.from({ length: 60 }).map(() => ({
      symbol: baseSymbols[Math.floor(Math.random() * baseSymbols.length)],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 20 + Math.random() * 35,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
    }));
    setItems(newItems);
  }, []);

  return (
    <div className="relative flex flex-col h-screen w-screen items-center justify-center 
      bg-gradient-to-r bg-blue-300 foverflow-hidden">

      {/* Floating Math Symbols moving everywhere */}
      {items.map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-blue-500/50 select-none"
          style={{ fontSize: item.size }}
          initial={{ x: item.x, y: item.y, opacity: 0 }}
          animate={{
            x: [item.x, item.x + (Math.random() * 200 - 100)],
            y: [item.y, item.y + (Math.random() * 200 - 100)],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          {item.symbol}
        </motion.span>
      ))}

      {/* Title */}
      <motion.h1
        className="text-6xl font-extrabold text-blue-700 mb-4 drop-shadow-lg text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        MathVision
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-lg text-gray-700 mb-8 italic text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        Solving Math at the speed of Sight
      </motion.p>

      {/* Button */}
      <div className="space-x-6">
        <Link
          to="/CreateAccount"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md 
          hover:bg-blue-700 hover:scale-110 hover:shadow-xl transition-all duration-300"
        >
          Let’s Solve
        </Link>
      </div>
    </div>
  );
}
