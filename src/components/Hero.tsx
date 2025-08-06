import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 gradient-hero"></div>
      <div className="absolute inset-0 bg-pattern opacity-30"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight">
            Community-Centric Apartment
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Management
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary mb-6 font-semibold">
            India's Most Loved Community Platform for Apartments
          </p>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            Streamline rent collection, maintenance requests, and community engagement for small to mid-sized apartment buildings across India.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to={"/signup"}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                Book Demo
              </Button>
            </Link>
            <Link to={"/login"}>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300">
                Login
              </Button>
            </Link>
            <Link to={"/signup"}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;