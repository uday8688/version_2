import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  Wrench, 
  MessageSquare,
  Building,
  Calendar,
  Shield
} from 'lucide-react';

const ComprehensiveFeatures = () => {
  const residentFeatures = [
    {
      icon: DollarSign,
      title: 'Smart Rent Management',
      description: 'Automated reminders, digital payments, instant receipts',
      stat: '98% payment success rate',
      statColor: 'text-green-600'
    },
    {
      icon: Wrench,
      title: 'Maintenance Ticketing',
      description: 'Submit, track, and manage maintenance requests with photos',
      stat: '24hr average response time',
      statColor: 'text-blue-600'
    },
    {
      icon: MessageSquare,
      title: 'Community Hub',
      description: 'Announcements, discussions, neighbor networking',
      stat: '85% user engagement',
      statColor: 'text-purple-600'
    }
  ];

  const ownerFeatures = [
    {
      icon: Building,
      title: 'Property Oversight',
      description: 'Monitor occupancy, track performance, analyze revenue',
      stat: '15% higher occupancy rates',
      statColor: 'text-blue-600'
    },
    {
      icon: Calendar,
      title: 'Utility Management',
      description: 'Track usage, split bills, coordinate payments',
      stat: '30% cost savings on average',
      statColor: 'text-blue-600'
    },
    {
      icon: Shield,
      title: 'Background Verification',
      description: 'Secure document verification for tenants and vendors',
      stat: 'Bank-level security',
      statColor: 'text-blue-600'
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your apartment community efficiently
          </p>
        </div>

        {/* For Residents Section */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-8">
            <User className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-2xl font-bold">For Residents</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {residentFeatures.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-glow transition-all duration-300 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-lg">{feature.title}</h4>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {feature.description}
                  </p>
                  <p className={`text-sm font-semibold ${feature.statColor}`}>
                    {feature.stat}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* For Owners & Admins Section */}
        <div>
          <div className="flex items-center justify-center mb-8">
            <Building className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-2xl font-bold">For Owners & Admins</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ownerFeatures.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-glow transition-all duration-300 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-lg">{feature.title}</h4>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {feature.description}
                  </p>
                  <p className={`text-sm font-semibold ${feature.statColor}`}>
                    {feature.stat}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Import User icon that was missing
import { User } from 'lucide-react';

export default ComprehensiveFeatures;