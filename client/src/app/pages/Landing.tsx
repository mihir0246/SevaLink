import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Database, BarChart3, Users, MapPin, TrendingUp, Heart, Globe } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-2xl tracking-tight text-[#1E3A8A]">SevaLink</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm text-[#1E3A8A] hover:bg-gray-50 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 text-sm bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90 rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl text-gray-900 mb-6 leading-tight">
                Connecting Community Needs with the Right Help
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Empowering NGOs and volunteers to create meaningful impact through smart data collection and coordination
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#1E3A8A]/90 transition-all flex items-center justify-center gap-2 text-lg group"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/signup?role=volunteer')}
                  className="px-8 py-4 bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-xl hover:bg-gray-50 transition-all text-lg"
                >
                  Join as Volunteer
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80"
                  alt="Community volunteers helping"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#14B8A6] flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl text-gray-900">2,847</p>
                    <p className="text-sm text-gray-600">Active Volunteers</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl text-gray-900 mb-4">Powerful Features for Social Impact</h2>
            <p className="text-xl text-gray-600">Everything you need to manage and coordinate community initiatives</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Database,
                title: 'Smart Data Collection',
                description: 'OCR-powered survey extraction from paper forms and digital uploads',
                color: 'bg-[#1E3A8A]'
              },
              {
                icon: BarChart3,
                title: 'Real-time Insights',
                description: 'Visualize community needs with interactive charts and analytics',
                color: 'bg-[#14B8A6]'
              },
              {
                icon: Users,
                title: 'Volunteer Coordination',
                description: 'Match skilled volunteers with tasks they can make the biggest impact on',
                color: 'bg-[#F97316]'
              },
              {
                icon: MapPin,
                title: 'Geographic Mapping',
                description: 'Track needs and resources across your community in real-time',
                color: 'bg-[#8B5CF6]'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to make a difference</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Collect Data',
                description: 'Upload survey forms or use our OCR system to extract community needs from paper forms',
                image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80'
              },
              {
                step: '02',
                title: 'Analyze Needs',
                description: 'Our platform automatically categorizes and prioritizes needs based on urgency and location',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80'
              },
              {
                step: '03',
                title: 'Volunteers Take Action',
                description: 'Skilled volunteers accept tasks and create real impact in their communities',
                image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&q=80'
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] rounded-full flex items-center justify-center text-white text-xl z-10">
                  {item.step}
                </div>
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 px-6 bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl text-white mb-4">Our Impact</h2>
            <p className="text-xl text-white/90">Making a difference, one community at a time</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: '12,847', label: 'People Helped' },
              { icon: TrendingUp, value: '3,249', label: 'Tasks Completed' },
              { icon: Heart, value: '847', label: 'Active Volunteers' },
              { icon: Globe, value: '23', label: 'Communities Served' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <p className="text-4xl mb-2">{stat.value}</p>
                <p className="text-white/90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl mb-4">SevaLink</h3>
              <p className="text-gray-400 text-sm">Connecting communities with meaningful help</p>
            </div>
            <div>
              <h4 className="text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#impact" className="hover:text-white transition-colors">Our Impact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-white transition-colors text-left">
                    Sign In
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/signup')} className="hover:text-white transition-colors text-left">
                    Register as NGO
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/signup?role=volunteer')} className="hover:text-white transition-colors text-left">
                    Join as Volunteer
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="mailto:hello@sevalink.org" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="mailto:volunteer@sevalink.org" className="hover:text-white transition-colors">
                    Volunteer Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2026 SevaLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
