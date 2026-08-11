import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TransferForm from "@/components/myComponents/TransferForm";
import { useState } from "react";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMakeConversion = () => {
    setIsSubmitting(true);
    navigate("/transfer");
  };

  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#BAF72B] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
              Convert Crypto to Naira <span className="text-gray-400">—</span>{" "}
              <br /> Instantly.
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 font-light">
              No P2P drama. No long KYC. No waiting. Just send your USDT, USDC,
              or cNGN and watch Naira land in your bank account in seconds. Any
              day, any hour.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                type="button"
                onClick={handleMakeConversion}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-[#BAF72B] hover:bg-[#a5db25] text-black px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(186,247,43,0.3)] text-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving details..." : "Convert Now"}
              </button>
              <a
                href="https://t.me/Criptpay"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto bg-transparent border-2 border-gray-600 hover:border-white text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 text-center"
              >
                Join Community
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-6 relative"
          >
            <div className="w-full max-w-lg mx-auto">
              <TransferForm />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
