'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Car,
  DollarSign,
  Shield,
  BarChart3,
  Calculator,
  Search,
  Star,
  Settings,
  Facebook,
  Instagram,
  Twitter,
  PhoneCall,
  ChevronDown
} from 'lucide-react';
import Link from "next/link";

const DiagonalSlice = ({ imageUrl, index, total }) => {
  const width = 100 / total;
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
      <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 100 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
          transition={{ duration: 0.8, delay: index * 0.2 }}
          className="absolute h-full"
          style={{
            left: `${index * width}%`,
            width: `${width + 0.5}%`, // Slight overlap to prevent gaps
            clipPath: `polygon(0 0, 100% ${index % 2 ? '20%' : '0'}, 100% 100%, 0 ${index % 2 ? '100%' : '80%'})`,
            zIndex: index,
          }}
      >
        <div
            className="w-full h-full bg-cover bg-center transform hover:scale-105 transition-transform duration-700"
            style={{
              backgroundImage: `url(${imageUrl})`,
            }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60" />
      </motion.div>
  );
};

const carImages = [
  "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80",
];

const CountUpAnimation = ({ value }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (inView) {
      let start = 0;
      const end = numericValue;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [inView, numericValue]);

  return (
      <div ref={ref}>
        {value.includes('+') ? `${count}+` : count}
      </div>
  );
};

const FeatureCard = ({ icon, title, description, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.2
      }
    }
  };

  return (
      <motion.div
          ref={ref}
          variants={cardVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          whileHover={{ scale: 1.03 }}
          className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <motion.div
            className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center mb-6"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
        >
          <div className="text-white">{icon}</div>
        </motion.div>
        <h3 className="text-2xl font-bold text-slate-800 mb-4">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </motion.div>
  );
};

const features = [
  {
    icon: <Search className="w-7 h-7" />,
    title: "Smart Search",
    description: "Compare prices across Kenya's top dealers with our intelligent search engine.",
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    title: "Market Analysis",
    description: "Real-time market trends and price analysis to help you make informed decisions.",
  },
  {
    icon: <Calculator className="w-7 h-7" />,
    title: "Import Calculator",
    description: "Calculate import duties, fees, and total landing cost for any vehicle.",
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: "Verified Dealers",
    description: "Access listings from thoroughly vetted and trusted car dealers across Kenya.",
  },
  {
    icon: <Settings className="w-7 h-7" />,
    title: "Maintenance Guide",
    description: "Estimated maintenance costs and service schedules for different models.",
  },
  {
    icon: <Star className="w-7 h-7" />,
    title: "Expert Reviews",
    description: "Detailed reviews and ratings from automotive experts and real owners.",
  },
];

const stats = [
  { icon: <Car className="w-6 h-6" />, value: "50K+", label: "Listed Vehicles" },
  { icon: <Shield className="w-6 h-6" />, value: "200+", label: "Verified Dealers" },
  { icon: <Star className="w-6 h-6" />, value: "4.8", label: "User Rating" },
  { icon: <DollarSign className="w-6 h-6" />, value: "1M+", label: "Price Comparisons" },
];

const LandingPage = () => {
  return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Diagonal Slices Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute z-40 inset-0 bg-black opacity-60"/>
            {carImages.map((url, index) => (
                <DiagonalSlice
                    key={index}
                    imageUrl={url}
                    index={index}
                    total={carImages.length}
                />
            ))}
          </div>

          {/* Content Overlay */}
          <div className="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
            >
              <motion.h1
                  className="text-8xl font-extrabold text-white mb-8 drop-shadow-2xl"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
              >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-red-200">
                WheelsKe
              </span>
              </motion.h1>
              <motion.p
                  className="text-3xl text-white mb-12 max-w-3xl mx-auto drop-shadow-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
              >
                Kenya's Premier Vehicle Comparison Platform
              </motion.p>
              <motion.div
                  className="flex justify-center gap-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Link href="/search">
                  <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium text-lg hover:shadow-lg transition-shadow relative overflow-hidden group"
                  >
                    <motion.span
                        className="absolute inset-0 bg-white opacity-20"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                    />
                    Compare Cars
                  </motion.button>
                </Link>
                <Link href="/calculator">
                  <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 border-2 border-white text-white rounded-xl font-medium text-lg hover:bg-white/10 transition-colors"
                  >
                    Import Calculator
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white cursor-pointer"
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
          >
            <ChevronDown className="w-8 h-8" />
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                  <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                        className="flex justify-center mb-4"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                    >
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        {stat.icon}
                      </div>
                    </motion.div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">
                      <CountUpAnimation value={stat.value} />
                    </div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Your Ultimate Car Shopping Companion
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Make confident decisions with our comprehensive suite of automotive tools and insights.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                  <FeatureCard key={index} {...feature} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative py-24 bg-gradient-to-r from-red-600 to-red-800 overflow-hidden">
          <motion.div
              className="absolute inset-0 opacity-10"
              animate={{
                backgroundPositionX: ["0%", "100%"],
                backgroundPositionY: ["0%", "100%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Find Your Perfect Car?
              </h2>
              <p className="text-xl text-red-100 mb-12 max-w-2xl mx-auto">
                Join thousands of satisfied customers who found their dream cars through WheelsKe.
              </p>
              <Link href="/search">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-red-600 rounded-xl font-medium text-lg hover:bg-red-50 transition-colors relative overflow-hidden group"
                >
                  <motion.span
                      className="absolute inset-0 bg-red-50"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                  />
                  <span className="relative z-10">Start Comparing</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold text-white mb-4">WheelsKe</h3>
                <p className="text-slate-400">Your trusted automotive comparison platform in Kenya.</p>
              </motion.div>
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <motion.a
                        href="#"
                        className="hover:text-white transition-colors block"
                        whileHover={{ x: 10 }}
                    >
                      Car Search
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                        href="#"
                        className="hover:text-white transition-colors block"
                        whileHover={{ x: 10 }}
                    >
                      Import Calculator
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                        href="#"
                        className="hover:text-white transition-colors block"
                        whileHover={{ x: 10 }}
                    >
                      Market Analysis
                    </motion.a>
                  </li>
                </ul>
              </motion.div>
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <motion.a
                        href="#"
                        className="hover:text-white transition-colors block"
                        whileHover={{ x: 10 }}
                    >
                      About Us
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                        href="#"
                        className="hover:text-white transition-colors block"
                        whileHover={{ x: 10 }}
                    >
                      Blog
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                        href="#"
                        className="hover:text-white transition-colors block"
                        whileHover={{ x: 10 }}
                    >
                      Dealer Network
                    </motion.a>
                  </li>
                </ul>
              </motion.div>
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
                <div className="flex space-x-4 mb-4">
                  <motion.a
                      href="#"
                      className="hover:text-white transition-colors"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                  >
                    <Facebook className="w-6 h-6" />
                  </motion.a>
                  <motion.a
                      href="#"
                      className="hover:text-white transition-colors"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                  >
                    <Instagram className="w-6 h-6" />
                  </motion.a>
                  <motion.a
                      href="#"
                      className="hover:text-white transition-colors"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                  >
                    <Twitter className="w-6 h-6" />
                  </motion.a>
                </div>
                <motion.div
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>+254 700 000000</span>
                </motion.div>
              </motion.div>
            </div>
            <div className="border-t border-slate-800 mt-12 pt-8 text-center">
              <p>&copy; 2024 WheelsKe. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
  );
}

export default LandingPage;