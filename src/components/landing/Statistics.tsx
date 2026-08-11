import { motion } from 'framer-motion';

const Statistics = () => {
  const stats = [
    {
      value: "155k",
      suffix: "+",
      label: "Transactions Completed"
    },
    {
      value: "$850k",
      suffix: "+",
      label: "Crypto Converted to Naira"
    },
    {
      value: "46k",
      suffix: "+",
      label: "Active Users"
    },
    {
      value: "<2Ms",
      suffix: "",
      label: "Average Payout Time"
    }
  ];

  return (
    <section className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold text-white"
          >
            The <span className="text-[#BAF72B]">numbers</span> speak for themselves.
          </motion.h2>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden relative"
        >
          {/* Add a subtle glow behind the container */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#BAF72B]/5 via-transparent to-[#BAF72B]/5 opacity-50" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5 relative z-10">
            {stats.map((stat, index) => (
              <div key={index} className="px-6 py-10 flex flex-col justify-center items-center text-center group hover:bg-white/[0.02] transition-colors duration-300">
                <h3 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
                  {stat.value}<span className="text-[#BAF72B]">{stat.suffix}</span>
                </h3>
                <p className="text-gray-400 text-sm sm:text-base font-light">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Statistics;
