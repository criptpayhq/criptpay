import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "How does Criptpay work?",
    answer: "No. You can start converting immediately — no sign-up required. But creating an account (just email + password) lets you save your bank details and view your transaction history for a faster experience next time."
  },
  {
    question: "How fast is the payout?",
    answer: "Our payouts are processed instantly. Once your crypto transaction is confirmed on the blockchain, the Naira is sent to your bank account within 2 seconds."
  },
  {
    question: "Which blockchain networks are supported?",
    answer: "We support over 12+ networks including Ethereum, Base, Solana, Tron, Polygon, Arbitrum, and Optimism."
  },
  {
    question: "Which coins can I convert?",
    answer: "You can convert USDT, USDC, and cNGN directly to Naira."
  },
  {
    question: "Is KYC required?",
    answer: "You can convert up to $10,000 without any KYC. Just provide your bank details and you're good to go."
  },
  {
    question: "How do I know my money is safe?",
    answer: "Criptpay is non-custodial and direct. You send to a verified wallet, and we send the fiat directly to your bank. No P2P traders, no holding your funds."
  },
  {
    question: "Which banks are supported?",
    answer: "We support all major Nigerian banks and mobile money operators."
  },
  {
    question: "What if something goes wrong with my transaction?",
    answer: "Our support team is available 24/7 to resolve any issues. Just reach out to us with your transaction hash."
  }
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-20 lg:py-32 relative z-10" id="faqs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-24 items-start">
          
          {/* Left Column - FAQ Accordion */}
          <div className="w-full lg:w-3/5">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="border border-white/5 rounded-[2rem] overflow-hidden bg-[#050505] shadow-2xl"
            >
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border-b border-white/5 last:border-b-0 cursor-pointer transition-colors duration-300 ${openIndex === index ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'}`}
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                >
                  <div className="p-6 md:p-8">
                    <h3 className={`text-lg md:text-xl font-bold transition-colors duration-300 tracking-tight ${openIndex === index ? 'text-white' : 'text-gray-300'}`}>
                      {faq.question}
                    </h3>
                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-400 mt-4 leading-relaxed font-light text-sm md:text-base pr-4">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Title */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-32 pt-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            >
              <span className="text-[#BAF72B]">Frequently</span> asked<br className="hidden lg:block"/> questions
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-gray-400 text-lg leading-relaxed font-light max-w-md"
            >
              If you have a question, chances are we have the answer here. Explore our FAQ section and stay informed!
            </motion.p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FaqSection;
