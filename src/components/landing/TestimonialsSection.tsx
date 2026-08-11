import { motion } from 'framer-motion';

const TestimonialsSection = () => {
  const testimonials = [
    {
      text: "I love the way they converse and resolve issues intelligently & swiftly to get the customer's problem resolved within shortest possible time.",
      author: "Emeka Ani"
    },
    {
      text: "I sent USDT and my money was in my account in under a minute. I genuinely couldn't believe it. This is the future.",
      author: "Paul Edet"
    },
    {
      text: "P2P almost cost me serious money last month. Switched to Criptpay and honestly, I'm never going back. It's just too easy.",
      author: "Atinuke Johnson"
    },
    {
      text: "I've been using Criptpay for close to a year now, and so far I haven't encountered any problems. It's fast and easy to understand.",
      author: "Oluwale Emmanuel"
    },
    {
      text: "3am, needed cash urgently - Criptpay delivered. No wait, no stress. I tell everyone I know about this platform.",
      author: "Itoro Inyang"
    },
    {
      text: "Three steps and my Naira was in my account. Didn't even need to create an account. This is how it should have always worked.",
      author: "Aliyu Danbaba"
    }
  ];

  return (
    <section className="bg-[#BAF72B] py-20 lg:py-32" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-black text-center mb-16 tracking-tight leading-tight max-w-4xl mx-auto"
        >
          People Are Talking. Here's<br className="hidden md:block" /> What They're Saying.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border border-black/20 rounded-3xl p-8 hover:bg-black/5 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
            >
              <p className="text-black/80 font-medium text-lg leading-relaxed mb-8">
                "{testimonial.text}"
              </p>
              <p className="text-black font-bold text-lg">
                {testimonial.author}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
