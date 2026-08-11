import Header from '../components/landing/Header';
import HeroSection from '../components/landing/HeroSection';
import Statistics from '../components/landing/Statistics';
import HowItWorks from '../components/landing/HowItWorks';
import FeaturesSection from '../components/landing/FeaturesSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FaqSection from '../components/landing/FaqSection';
import ContactSection from '../components/landing/ContactSection';
import CallToAction from '../components/landing/CallToAction';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] selection:bg-[#BAF72B] selection:text-black">
      <Header />
      <main>
        <HeroSection />
        <Statistics />
        <HowItWorks />
        <FeaturesSection />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
