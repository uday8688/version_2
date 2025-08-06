import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FinalCTA = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary via-blue-600 to-purple-600 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Simplify Your Apartment Living Today
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-12 leading-relaxed">
            Join thousands of satisfied users across India who have transformed their apartment management with AptCircle.
          </p>
          
          <div className="inline-block">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;