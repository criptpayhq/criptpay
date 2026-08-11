import { motion } from 'framer-motion';
import { Coins, Banknote, Landmark, Wallet } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Coins size={32} className="text-[#BAF72B]" />,
      title: "Select Asset & Network",
      description: "Choose USDT, USDC, or cNGN — then pick the blockchain you're holding it on. Ethereum, Base, Solana, Tron, Polygon, Arbitrum, Optimism... we cover 12+ networks.",
      imageName: "/Select-Asset.png"
    },
    {
      icon: <Banknote size={32} className="text-[#BAF72B]" />,
      title: "Enter Your Amount",
      description: "Type in how much crypto you want to convert, up to $10,000 with zero KYC. The exact Naira equivalent updates in real time, so you always know what you're getting before you commit.",
      imageName: "/Instant-Payouts.png"
    },
    {
      icon: <Landmark size={32} className="text-[#BAF72B]" />,
      title: "Add Your Bank Details",
      description: "Enter your Nigerian bank account number and we'll take it from there. First time? It takes seconds. Returning user? Your details are already saved.",
      imageName: "/Bank-Details.png"
    },
    {
      icon: <Wallet size={32} className="text-[#BAF72B]" />,
      title: "Send Crypto, Get Paid",
      description: "We generate a unique wallet address for your transaction. Send your crypto to it — the moment we confirm it on-chain, your Naira lands in your bank. Not hours later. Right now.",
      imageName: "/Crypto-Wallet.png"
    }
  ];

  return (
    <section className="py-20 lg:py-32 relative z-10 bg-white/[0.02]" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4"
          >
            A <span className="text-[#BAF72B]">simplified process</span> to help you<br className="hidden md:block" /> convert crypto to cash hassle free
          </motion.h2>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-[#050505] border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden"
        >
          {/* Inner Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 divide-white/5 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`p-8 sm:p-12 flex flex-col sm:flex-row gap-6 sm:gap-8 group hover:bg-white/[0.02] transition-colors duration-300
                  ${index % 2 === 0 ? 'lg:border-r border-white/5' : ''} 
                  ${index < 2 ? 'lg:border-b border-white/5' : ''}
                `}
              >
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:border-[#BAF72B]/30 transition-all duration-300">
                    <img src={step.imageName} alt={step.title} className="w-full h-full object-cover rounded-full" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
