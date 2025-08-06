import { Card, CardContent } from '@/components/ui/card';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "AptCircle has transformed how I manage my apartment life. Paying rent and reporting issues is now effortless!",
      author: "Priya Sharma",
      role: "Tenant",
      location: "Bangalore",
      avatar: "PS",
      rating: 5
    },
    {
      quote: "As a property owner, AptCircle has streamlined my operations and improved tenant satisfaction significantly.",
      author: "Rajesh Kumar",
      role: "Property Owner",
      location: "Mumbai",
      avatar: "RK",
      rating: 5
    },
    {
      quote: "The maintenance request system is incredibly efficient. Our response times have improved by 50%.",
      author: "Anita Desai",
      role: "Property Manager",
      location: "Delhi",
      avatar: "AD",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real feedback from our community members across India
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-card border-0 relative overflow-hidden">
            <CardContent className="p-8 md:p-12">
              {/* Star Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-lg md:text-xl text-center italic text-foreground mb-8 leading-relaxed">
                "{testimonials[0].quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {testimonials[0].avatar}
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">{testimonials[0].author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[0].role} • {testimonials[0].location}
                  </p>
                </div>
              </div>

              {/* Navigation dots */}
              <div className="flex justify-center space-x-2 mt-8">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="w-2 h-2 rounded-full bg-muted"></div>
                <div className="w-2 h-2 rounded-full bg-muted"></div>
                <div className="w-2 h-2 rounded-full bg-muted"></div>
              </div>
            </CardContent>

            {/* Navigation arrows */}
            <Button 
              variant="ghost" 
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full w-10 h-10 p-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full w-10 h-10 p-0"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;