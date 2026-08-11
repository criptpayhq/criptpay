import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="bg-[#BAF72B] relative overflow-hidden" id="cta">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:gap-24 pt-20 lg:pt-0">
          
          {/* Left Column - Image Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 w-full lg:w-1/2 flex justify-center lg:justify-start lg:mt-21"
          >
            <img 
              src="/Download_the_App.svg"
              alt="Criptpay App Mockup" 
              className="w-full max-w-lg object-contain"
            />
          </motion.div>

          {/* Right Column - Text & Buttons */}
          <div className="order-1 lg:order-2 w-full lg:w-1/2 pb-20 lg:py-32">
            <motion.h2 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight tracking-tight mb-4 lg:mb-6"
            >
              Stop Waiting.<br className="hidden lg:block"/> Your Cash Dey Wait for You.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-black/80 text-lg sm:text-xl font-medium mb-10 max-w-xl leading-relaxed"
            >
              Convert your crypto to Naira in 3 steps. No wahala. No KYC drama. No middleman. Just instant cash, every time.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link 
                to="/login"
                className="bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-lg text-center transition-all duration-300 transform hover:scale-105"
              >
                Convert Now
              </Link>
              <a 
                href="https://t.me/Criptpay"
                target="_blank"
                className="border border-black/20 hover:border-black text-black px-8 py-4 rounded-full font-bold text-lg text-center transition-all duration-300 transform hover:scale-105"
              >
                Join Community
              </a>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CallToAction;
