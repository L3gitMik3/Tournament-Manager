import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { Trophy, Users, Calendar, Shield } from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: Trophy, title: 'Multiple Tournaments', desc: 'Host multiple tournaments with complete data isolation' },
    { icon: Users, title: 'Age Categories', desc: 'Support for multiple age groups per tournament' },
    { icon: Calendar, title: 'Match Management', desc: 'Easy match scheduling and score tracking' },
    { icon: Shield, title: 'Admin Control', desc: 'Full control over your tournament data' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero */}
      <div className="container-custom py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Tournament Management
          <span className="text-blue-600"> Platform</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Create and manage your own tournaments with ease. Perfect for sports coaches, event organizers, and tournament directors.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          {isAuthenticated ? (
            <Link to="/my-tournaments">
              <Button size="lg">My Tournaments</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button size="lg">Admin Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="container-custom pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;