import { Card } from '@/components/ui/card';
import { Users, Building, DollarSign, Clock } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      number: '15,000+',
      label: 'Happy Users',
      color: 'feature-blue'
    },
    {
      icon: Building,
      number: '750+',
      label: 'Properties',
      color: 'feature-blue'
    },
    {
      icon: DollarSign,
      number: '98%',
      label: 'Payment Success',
      color: 'feature-blue'
    },
    {
      icon: Clock,
      number: '24hrs',
      label: 'Avg Response',
      color: 'feature-blue'
    }
  ];

  const trustBadges = [
    'Bank-Level Security',
    'ISO Certified',
    'Customer Loved',
    'India-Wide'
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm font-medium">{badge}</span>
            </div>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="p-8 text-center shadow-stats hover:shadow-glow transition-all duration-300 border-0 bg-white">
              <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-foreground mb-2">{stat.number}</h3>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Book Demo CTA */}
        <div className="text-center">
          <button className="inline-flex items-center space-x-2 bg-white border border-border rounded-lg px-6 py-3 text-foreground hover:bg-muted/50 transition-colors duration-300">
            <span>Book a Demo</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;