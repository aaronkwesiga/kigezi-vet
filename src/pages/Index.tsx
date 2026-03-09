import HeroSection from '@/components/HeroSection';
import ServiceCards from '@/components/ServiceCards';
import AboutRegion from '@/components/AboutRegion';
import Testimonials from '@/components/Testimonials';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10">
        <HeroSection />
        <ServiceCards />
        <Testimonials />
        <AboutRegion />
      </div>
    </div>
  );
};


export default Index;
