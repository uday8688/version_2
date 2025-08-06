import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MapPin, 
  Phone,
  Wrench,
  Zap,
  Droplets,
  PaintBucket,
  Car,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

const ServiceProviders = () => {
  const providers = [
    {
      name: 'QuickFix Plumbing',
      category: 'Plumbing',
      rating: 4.8,
      reviews: 127,
      location: 'Downtown Area',
      phone: '(555) 123-4567',
      icon: Droplets,
      specialties: ['Emergency Repairs', '24/7 Service', 'Licensed & Insured']
    },
    {
      name: 'BrightSpark Electric',
      category: 'Electrical',
      rating: 4.9,
      reviews: 89,
      location: 'City Center',
      phone: '(555) 234-5678',
      icon: Zap,
      specialties: ['Safety Inspections', 'Smart Home Setup', 'Emergency Service']
    },
    {
      name: 'HandyPro Services',
      category: 'General Maintenance',
      rating: 4.7,
      reviews: 203,
      location: 'Multiple Locations',
      phone: '(555) 345-6789',
      icon: Wrench,
      specialties: ['Appliance Repair', 'Furniture Assembly', 'General Repairs']
    },
    {
      name: 'PaintMasters Pro',
      category: 'Painting',
      rating: 4.6,
      reviews: 156,
      location: 'Metro Area',
      phone: '(555) 456-7890',
      icon: PaintBucket,
      specialties: ['Interior Design', 'Eco-Friendly Paint', 'Quick Turnaround']
    },
    {
      name: 'AutoCare Mobile',
      category: 'Automotive',
      rating: 4.8,
      reviews: 94,
      location: 'On-Site Service',
      phone: '(555) 567-8901',
      icon: Car,
      specialties: ['Mobile Service', 'Oil Changes', 'Tire Rotation']
    },
    {
      name: 'EcoClean Solutions',
      category: 'Cleaning',
      rating: 4.9,
      reviews: 178,
      location: 'Citywide',
      phone: '(555) 678-9012',
      icon: Trash2,
      specialties: ['Deep Cleaning', 'Eco-Friendly', 'Move-in/Move-out']
    }
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted Service Providers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with verified, reliable service providers in your area. 
            All our partners are background-checked and highly rated by the community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {providers.map((provider, index) => (
            <Card key={index} className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <provider.icon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{provider.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{provider.rating}</span>
                    <span className="text-xs text-muted-foreground">({provider.reviews})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {provider.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {provider.phone}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {provider.specialties.map((specialty, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    Contact Provider
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Link to={ROUTES.SERVICE_PROVIDER_MANAGEMENT}>
            <Button size="lg" className="gradient-primary">
              View All Service Providers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServiceProviders;