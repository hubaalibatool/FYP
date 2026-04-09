import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function CreateAccount() {
  return (
    <div className="relative flex flex-col h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-400  to-blue-300 overflow-hidden">
      
    {/* Floating Symbols in Background */}
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-blue-400/80 select-none"
          style={{
            fontSize: 20 + Math.random() * 40,       // random size
            left: `${Math.random() * 100}%`,         // random x position
          }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-20vh", opacity: [0, 0.8, 0] }}
          transition={{
            duration: 20 + Math.random() * 20,       // gentle, slow motion
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 10,               // random delay
          }}
        >
          {["∑", "√", "π", "∞", "x²", "-", "Δ", "θ", "Ω", "µ","x²","x²","x²"][
            Math.floor(Math.random() * 10)           // random symbol
          ]}
        </motion.span>
      ))}



      {/* Heading */}
      <motion.h1
        className="text-4xl font-extrabold text-blue-700 mb-2 drop-shadow-lg"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1}}
      >
        Create Account
      </motion.h1>
      <motion.p
        className="text-gray-600 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 2}}
      >
        Join MathVision and start solving!
      </motion.p>

      {/* Form */}
      <motion.form
        className="flex flex-col space-y-4 w-80 bg-white/30 backdrop-blur-lg p-6 rounded-xl shadow-xl border border-white/40"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Name */}
        <motion.input
          type="text"
          placeholder="Enter your name"
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          whileFocus={{ scale: 1.03 }}
        />
        {/* Email */}
        <motion.input
          type="email"
          placeholder="Email"
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          whileFocus={{ scale: 1.03 }}
        />
        {/* Password */}
        <motion.input
          type="password"
          placeholder="Password"
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          whileFocus={{ scale: 1.03 }}
        />

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-green-600 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign Up
        </motion.button>

        {/* Already have an account */}
        <p className="text-sm text-gray-700 text-center mt-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-700 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
