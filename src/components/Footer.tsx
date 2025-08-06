import { Link } from 'react-router-dom';
import { Building, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const features = [
    'Background Verification',
    'Utility Payments',
    'Service Management'
  ];

  const support = [
    'Help Center',
    'Contact Support',
    'User Guides',
    'API Documentation'
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to={ROUTES.HOME} className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <span className="text-xl font-bold">AptCircle</span>
                <p className="text-xs text-gray-400">Smart Living Platform</p>
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Simplifying apartment management for modern communities across India. 
              Trusted by thousands of residents, owners, and service providers.
            </p>
            <div className="flex space-x-2">
              <Badge className="bg-blue-600 text-white border-0">Trusted</Badge>
              <Badge className="bg-green-600 text-white border-0">Secure</Badge>
              <Badge className="bg-purple-600 text-white border-0">Reliable</Badge>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-white/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-white/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-white/10">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-white/10">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Features</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <Link 
                  key={index}
                  to="#" 
                  className="block text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  {feature}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Support</h3>
            <div className="space-y-3">
              {support.map((item, index) => (
                <Link 
                  key={index}
                  to="#" 
                  className="block text-sm text-gray-300 hover:text-primary transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stay Updated</h3>
            <p className="text-sm text-gray-300">
              Join 10,000+ others who get community tips & updates
            </p>
            <div className="flex space-x-2">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
              />
              <Button className="bg-primary hover:bg-primary/90 px-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} AptCircle. All rights reserved. Made with ❤️ for Indian communities.
            </p>
            <div className="flex items-center space-x-6">
              <Link to="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;