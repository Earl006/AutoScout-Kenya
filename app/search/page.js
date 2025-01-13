'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car,
    DollarSign,
    MapPin,
    Gauge,
    Calendar,
    Info,
    Loader2,
} from 'lucide-react';

const carFacts = [
    "Did you know? The Toyota Corolla is the best-selling car of all time.",
    "The average car has around 30,000 parts.",
    "The first recorded car accident happened in 1891.",
    "More than 1 billion cars are on the road worldwide.",
    "Kenya's first car was imported in 1902.",
    "The average modern car can last for up to 200,000 kilometers.",
];

const LoadingState = () => {
    const [fact, setFact] = useState(carFacts[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setFact(carFacts[Math.floor(Math.random() * carFacts.length)]);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-2xl mx-auto p-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto mb-8"
                >
                    <Loader2 className="w-16 h-16 text-red-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Searching for the best deals...
                </h2>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-6 rounded-lg shadow-lg"
                >
                    <Info className="w-6 h-6 text-red-600 mx-auto mb-3" />
                    <p className="text-gray-600 italic">{fact}</p>
                </motion.div>
            </div>
        </div>
    );
};

const CarCard = ({ car, index }) => {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl ${
                isEven ? 'hover:-rotate-2' : 'hover:rotate-2'
            }`}
        >
            <div className="relative h-48 bg-gray-200">
                {car.images?.[0] ? (
                    <img
                        src={car.images[0]}
                        alt={car.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-16 h-16 text-gray-400" />
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                    {car.specs.locality}
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{car.title}</h3>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{car.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-red-600" />
                        <span className="text-sm">{car.specs.mileage}k km</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <span className="text-sm">{new Date(car.year).getFullYear()}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <DollarSign className="w-5 h-5 text-red-600" />
                        <span className="text-xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES',
                  maximumFractionDigits: 0,
              }).format(car.price)}
            </span>
                    </div>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        View Details
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const SearchResults = () => {
    const [loading, setLoading] = useState(true);
    const [cars, setCars] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await fetch('/api/crawler', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        make: 'Toyota',
                        model: 'Allion',
                        maxPages: 1,
                    }),
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to fetch cars');
                }

                setCars(data.data.normalized);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCars();
    }, []);

    if (loading) return <LoadingState />;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Search Results
                    </h1>
                    <p className="text-gray-600">
                        Found {cars.length} cars matching your criteria
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cars.map((car, index) => (
                        <CarCard key={car.externalId} car={car} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;