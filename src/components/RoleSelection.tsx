import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Building,
  Settings,
  Wrench,
  Check
} from 'lucide-react';

const RoleSelection = () => {
  const roles = [
    {
      icon: User,
      title: 'Tenant',
      subtitle: 'Simplify your apartment living experience',
      description: 'Pay rent, report issues, and connect with neighbors effortlessly',
      features: [
        'Pay rent online',
        'Report issues',
        'Community chat',
        'Announcements'
      ],
      iconBg: 'feature-blue',
      color: 'text-blue-600'
    },
    {
      icon: Building,
      title: 'Owner/Landlord',
      subtitle: 'Maximize your property investment returns',
      description: 'Monitor properties, track income, and manage tenants efficiently',
      features: [
        'Revenue tracking',
        'Tenant screening',
        'Maintenance oversight',
        'Financial reports'
      ],
      iconBg: 'feature-green',
      color: 'text-green-600'
    },
    {
      icon: Settings,
      title: 'Admin/Manager',
      subtitle: 'Complete control over your apartment community',
      description: 'Full platform control, vendor coordination, and comprehensive analytics',
      features: [
        'User management',
        'System analytics',
        'Vendor coordination',
        'Platform control'
      ],
      iconBg: 'feature-purple',
      color: 'text-purple-600'
    },
    {
      icon: Wrench,
      title: 'Service Provider',
      subtitle: 'Grow your service business efficiently',
      description: 'Receive job assignments and manage service requests efficiently',
      features: [
        'Job notifications',
        'Schedule calendar',
        'Invoice generation',
        'Performance metrics'
      ],
      iconBg: 'feature-orange',
      color: 'text-orange-600'
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Role
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your role to explore personalized features and get started with AptCircle
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <Card key={index} className="shadow-card hover:shadow-glow transition-all duration-300 border-0 h-full">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${role.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <role.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">{role.title}</CardTitle>
                <p className={`text-sm font-semibold ${role.color}`}>
                  {role.subtitle}
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground text-sm mb-6 text-center">
                  {role.description}
                </p>
                
                <div className="space-y-3 mb-6 flex-1">
                  <h4 className="font-semibold text-sm">Key Features:</h4>
                  {role.features.map((feature, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">Ready to get started? Choose your entry point:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="px-8">
              Login to Your Account
            </Button>
            <Button size="lg" className="px-8 bg-foreground text-background hover:bg-foreground/90">
              Create New Account
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleSelection;