import { useEffect } from 'react';

export type SEOPage = 'home' | 'login' | 'signup' | 'contact' | 'dashboard' | 'payment' | 'maintenance' | 'announcements' | 'settings' | 'community' | 'visitors';

const SEO_DATA = {
  home: {
    title: 'AptCircle - Community Hub for Apartment Living',
    description: 'Modern apartment management platform for tenants, owners, and service providers. Manage payments, maintenance, and community interactions seamlessly.',
  },
  login: {
    title: 'Login - AptCircle',
    description: 'Sign in to your AptCircle account to access your apartment community dashboard.',
  },
  signup: {
    title: 'Sign Up - AptCircle',
    description: 'Join AptCircle to connect with your apartment community and manage your living experience.',
  },
  contact: {
    title: 'Contact Us - AptCircle',
    description: 'Get in touch with the AptCircle team for support and inquiries.',
  },
  dashboard: {
    title: 'Dashboard - AptCircle',
    description: 'Your personal AptCircle dashboard for managing apartment living.',
  },
  payment: {
    title: 'Payments - AptCircle',
    description: 'Manage your rent and utility payments securely through AptCircle.',
  },
  maintenance: {
    title: 'Maintenance - AptCircle',
    description: 'Submit and track maintenance requests for your apartment.',
  },
  announcements: {
    title: 'Announcements - AptCircle',
    description: 'Stay informed with community announcements and important updates.',
  },
  settings: {
    title: 'Settings - AptCircle',
    description: 'Manage your account preferences and notification settings.',
  },
  community: {
    title: 'Community - AptCircle',
    description: 'Connect with your apartment community and participate in events.',
  },
  visitors: {
    title: 'Visitor Management - AptCircle',
    description: 'Manage visitor requests and approvals for your apartment.',
  },
};

export const useSEO = (page: SEOPage) => {
  useEffect(() => {
    const { title, description } = SEO_DATA[page];
    
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [page]);
};