import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CreditCard, 
  Wrench, 
  Users, 
  FileText, 
  Clock, 
  Shield,
  MessageSquare,
  BarChart3
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: CreditCard,
      title: 'Payment Management',
      description: 'Secure online payments for rent, utilities, and maintenance fees with automated tracking and receipts.'
    },
    {
      icon: Wrench,
      title: 'Maintenance Requests',
      description: 'Submit, track, and manage maintenance requests with real-time status updates and photo attachments.'
    },
    {
      icon: Users,
      title: 'Community Board',
      description: 'Connect with neighbors, share announcements, and build a stronger apartment community.'
    },
    {
      icon: FileText,
      title: 'Background Verification',
      description: 'Streamlined tenant screening with secure document uploads and verification processes.'
    },
    {
      icon: Shield,
      title: 'Service Provider Hub',
      description: 'Verified local service providers for plumbing, electrical, cleaning, and more maintenance needs.'
    },
    {
      icon: MessageSquare,
      title: 'Communication Center',
      description: 'Direct messaging between tenants, property managers, and service providers for quick resolutions.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into property performance, tenant satisfaction, and maintenance trends.'
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for Modern Apartment Living
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From payments to maintenance, communication to community building - 
            AptCircle handles it all in one intuitive platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader className="text-center">
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm text-center">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;