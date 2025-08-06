import { useSEO } from '@/hooks/useSEO';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import StatsSection from '@/components/StatsSection';
import RoleSelection from '@/components/RoleSelection';
import ComprehensiveFeatures from '@/components/ComprehensiveFeatures';
import Testimonials from '@/components/Testimonials';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import { RoleRedirect } from '@/components/auth/RoleRedirect';

const Index = () => {
  useSEO('home');

  return (
    <div className="min-h-screen bg-background">
      <RoleRedirect />
      <Navigation />
      <Hero />
      <StatsSection />
      <RoleSelection />
      <ComprehensiveFeatures />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
