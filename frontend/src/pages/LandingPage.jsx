import bgImage from "@/Assets/Images/store.jpg";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="relative h-screen w-full flex items-center justify-center text-white">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden
      />
      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 opacity-70 pointer-events-none" aria-hidden />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center px-6"
      >
        <motion.h1
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-6xl font-bold drop-shadow-lg"
        >
          Smart Inventory & Forecast System.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-lg md:text-xl opacity-90"
        >
          Manage Products • Track Sales • Predict Demand • Optimize Stock
        </motion.p>

        <Link to="/login">
          <motion.button
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 px-8 py-3 bg-white text-purple-700 font-semibold rounded-full shadow-xl flex items-center gap-2 hover:bg-purple-100 transition"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
