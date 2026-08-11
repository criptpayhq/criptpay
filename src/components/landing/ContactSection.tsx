import { motion } from 'framer-motion';

const ContactSection = () => {
  const contactMethods = [
    {
      title: "Help & Support.",
      description: "Get answers fast, resolve issues quickly.",
      linkText: "support@criptpay.com",
      linkUrl: "mailto:support@criptpay.com",
      imageName: "/Support.png"
    },
    {
      title: "Quick Complaint",
      description: "Report a problem or transaction concern instantly",
      linkText: "+234 (0) 703 501 4722",
      linkUrl: "tel:+2347035014722",
      imageName: "/Quick-Complaint.png"
    },
    {
      title: "Media & press.",
      description: "For partnerships, press inquiries, interviews, etc.",
      linkText: "press@criptpay.com",
      linkUrl: "mailto:press@criptpay.com",
      imageName: "/Media&press.png"
    }
  ];

  return (
    <section className="py-20 lg:py-32 relative z-10 bg-white/[0.02]" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            Prefer to reach out <span className="text-[#BAF72B]">directly?</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed"
          >
            Skip the forms and connect with us directly for a personalized experience. We are just a phone call or message away.
          </motion.p>
        </div>

        {/* Contact Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 bg-[#050505] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl divide-y md:divide-y-0 md:divide-x divide-white/5"
        >
          {contactMethods.map((method, index) => (
            <div key={index} className="p-10 md:p-12 lg:p-16 flex flex-col items-center text-center group hover:bg-white/[0.02] transition-colors duration-300">
              <div className="w-24 h-24 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:border-[#BAF72B]/30 transition-all duration-300 relative overflow-hidden">
                <img src={method.imageName} alt={method.title} className="w-full h-full object-cover rounded-full" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4 tracking-tight">{method.title}</h3>
              <p className="text-gray-400 mb-8 font-light leading-relaxed flex-grow text-base lg:text-lg">
                {method.description}
              </p>
              <a 
                href={method.linkUrl}
                className="text-white font-bold text-lg hover:text-[#BAF72B] transition-colors duration-300"
              >
                {method.linkText}
              </a>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default ContactSection;
