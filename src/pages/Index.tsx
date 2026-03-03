import HeroSection from '@/components/HeroSection';
import ServiceCards from '@/components/ServiceCards';
import AIFeatures from '@/components/AIFeatures';
import AboutRegion from '@/components/AboutRegion';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10">
        <HeroSection />
        <ServiceCards />
        <AIFeatures />
        <AboutRegion />
      </div>
    </div>
  );
};


export default Index;
