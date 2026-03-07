import HeroSection from '@/components/HeroSection';
import ServiceCards from '@/components/ServiceCards';
import AboutRegion from '@/components/AboutRegion';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10">
        <HeroSection />
        <ServiceCards />
        <AboutRegion />
      </div>
    </div>
  );
};


export default Index;
