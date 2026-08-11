import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeaturesSection = () => {
  return (
    <section className="py-20 relative z-10" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tight"
          >
            Built for Speed. Built for You.
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link 
              to="/login"
              className="bg-[#BAF72B] hover:bg-[#a5db25] text-black px-8 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105"
            >
              Buy Crypto
            </Link>
            <a 
              href="https://t.me/Criptpay"
              target="_blank"
              className="border-2 border-white/20 hover:border-white text-white px-8 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105"
            >
              Join Community
            </a>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 bg-[#050505] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl"
        >
          {/* Left Column */}
          <div className="p-8 md:p-12 lg:border-r border-white/5 flex flex-col justify-end min-h-[400px] lg:min-h-[500px] group hover:bg-white/[0.02] transition-colors duration-300 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:border-[#BAF72B]/30 transition-all duration-300">
                <img src="/Zero-KYC.png" alt="Zero KYC Hassle" className="w-full h-full object-cover rounded-full" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Zero KYC Hassle</h3>
              <p className="text-gray-400 text-lg leading-relaxed font-light">
                No passport. No utility bill. No lengthy verification. Convert up to $10,000 with just your bank details. Want to save them for next time? Sign up with your email and password.
              </p>
            </div>
          </div>

          {/* Right Column (2 Rows) */}
          <div className="grid grid-rows-1 lg:grid-rows-2">
            
            {/* Top Row */}
            <div className="p-8 md:p-12 lg:border-b border-white/5 flex flex-col justify-center group hover:bg-white/[0.02] transition-colors duration-300 relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:border-[#BAF72B]/30 transition-all duration-300">
                  <img src="/Instant-Payouts.png" alt="Instant Payouts" className="w-full h-full object-cover rounded-full" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Instant Payouts</h3>
                <p className="text-gray-400 leading-relaxed font-light">
                  The moment your crypto hits our wallet, your Naira is on its way. No delays, no "processing", no refresh-and-pray. Just fast, reliable payouts — every single time.
                </p>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="p-8 md:p-12 flex flex-col justify-center group hover:bg-white/[0.02] transition-colors duration-300 relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:border-[#BAF72B]/30 transition-all duration-300">
                  <img src="/Scam-Free.png" alt="Safe, Direct & Scam-Free" className="w-full h-full object-cover rounded-full" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Safe, Direct & Scam-Free</h3>
                <p className="text-gray-400 leading-relaxed font-light">
                  Forget unreliable P2P traders and the anxiety that comes with them. Criptpay is direct — you send to a verified wallet, we send to your bank. Transparent, secure, and 100% in your control.
                </p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
