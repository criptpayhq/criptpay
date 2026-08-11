import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#050505] pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-12 md:gap-0">
          
          {/* Logo and Socials */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center">
              <span className="text-3xl font-bold text-white tracking-tight">Cript<span className="text-[#BAF72B]">pay</span></span>
            </Link>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 transition-transform">
                <Facebook size={20} className="fill-current" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 transition-transform">
                <Twitter size={20} className="fill-current" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 transition-transform">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-16 lg:gap-24">
            <div className="flex flex-col gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Home</a>
              <a href="#faqs" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">FAQs</a>
            </div>
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Features</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Privacy Policy</a>
            </div>
            <div className="flex flex-col gap-4">
              <a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Contact Us</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Terms & Conditions</a>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            All right reserved © 2026 | <span className="text-gray-300">Criptpay Nig. Ltd.</span>
          </p>
          <a href="https://oniontabs.com" className="text-gray-500 text-sm">
            Designed & Developed by <span className="text-[#BAF72B]">Oniontabs</span>
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
