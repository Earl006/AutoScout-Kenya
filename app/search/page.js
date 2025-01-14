'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    SlidersHorizontal,
    Car,
    Gauge,
    Calendar,
    MapPin,
    DollarSign,
    BarChart2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronDown,
    Filter,
    TrendingUp,
    TrendingDown, Loader2
} from 'lucide-react';

// Search Form Component
const SearchForm = ({ onSearch, loading }) => {
    const [filters, setFilters] = useState({
        make: '',
        model: '',
        minYear: '',
        maxYear: '',
        minPrice: '',
        maxPrice: '',
        location: ''
    });
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(filters);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                        <select
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                            value={filters.make}
                            onChange={(e) => setFilters({...filters, make: e.target.value})}
                        >
                            <option value="">Select Make</option>
                            <option value="Toyota">Toyota</option>
                            <option value="Honda">Honda</option>
                            <option value="Mazda">Mazda</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <select
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                            value={filters.model}
                            onChange={(e) => setFilters({...filters, model: e.target.value})}
                        >
                            <option value="">Select Model</option>
                            <option value="Allion">Allion</option>
                            <option value="Premio">Premio</option>
                            <option value="Mark X">Mark X</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <select
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                            value={filters.location}
                            onChange={(e) => setFilters({...filters, location: e.target.value})}
                        >
                            <option value="">All Locations</option>
                            <option value="Nairobi">Nairobi</option>
                            <option value="Mombasa">Mombasa</option>
                            <option value="Kisumu">Kisumu</option>
                        </select>
                    </div>
                </div>

                <motion.div
                    animate={{ height: showAdvanced ? 'auto' : 0, opacity: showAdvanced ? 1 : 0 }}
                    className="overflow-hidden mb-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Year</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-lg"
                                value={filters.minYear}
                                onChange={(e) => setFilters({...filters, minYear: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Year</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-lg"
                                value={filters.maxYear}
                                onChange={(e) => setFilters({...filters, maxYear: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (KES)</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-lg"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (KES)</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-lg"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                            />
                        </div>
                    </div>
                </motion.div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        {showAdvanced ? 'Less Filters' : 'More Filters'}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    >
                        {loading ? (
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 mr-2"
                            >
                                <Filter className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <Search className="w-5 h-5 mr-2" />
                        )}
                        Compare Cars
                    </button>
                </div>
            </form>
        </div>
    );
};

// Market Analysis Component
const MarketAnalysis = ({ cars }) => {
    const avgPrice = cars.reduce((acc, car) => acc + car.price, 0) / cars.length;
    const priceRange = {
        min: Math.min(...cars.map(car => car.price)),
        max: Math.max(...cars.map(car => car.price))
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <BarChart2 className="w-6 h-6 mr-2 text-red-600" />
                Market Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Average Price</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                            maximumFractionDigits: 0
                        }).format(avgPrice)}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Price Range</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                            maximumFractionDigits: 0
                        }).format(priceRange.min)} -
                        {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                            maximumFractionDigits: 0
                        }).format(priceRange.max)}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Total Listings</h3>
                    <p className="text-2xl font-bold text-gray-900">{cars.length} cars</p>
                </div>
            </div>
        </div>
    );
};

// Comparison Table Component
const ComparisonTable = ({ cars }) => {
    const [selectedCars, setSelectedCars] = useState([]);

    const getPriceAnalysis = (price) => {
        const avgPrice = cars.reduce((acc, car) => acc + car.price, 0) / cars.length;
        if (price < avgPrice * 0.9) return { icon: TrendingDown, color: 'text-green-600', text: 'Below Market' };
        if (price > avgPrice * 1.1) return { icon: TrendingUp, color: 'text-red-600', text: 'Above Market' };
        return { icon: CheckCircle2, color: 'text-blue-600', text: 'Fair Price' };
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full">
                <thead>
                <tr className="bg-gray-50">
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Vehicle</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Price</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Year</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Mileage</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Location</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Analysis</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">

                {cars.map((car) => {
                    const priceAnalysis = getPriceAnalysis(car.price);
                    const PriceIcon = priceAnalysis.icon;

                    return (
                        <tr
                            key={car.externalId}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                                if (selectedCars.includes(car.externalId)) {
                                    setSelectedCars(selectedCars.filter(id => id !== car.externalId));
                                } else if (selectedCars.length < 3) {
                                    setSelectedCars([...selectedCars, car.externalId]);
                                }
                            }}
                        >
                            <td className="py-4 px-6">
                                <div className="flex items-center">
                                    <div className="h-44 w-44 flex-shrink-0">
                                        {car.images?.[0] ? (
                                            <img className="h-44 w-44 rounded-lg object-cover" src={car.images[0]} alt="" />
                                        ) : (
                                            <Car className="h-44 w-44 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <div className="font-medium text-gray-900">{car.title ?? 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{car.specs.engineSize}cc</div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <div className="font-medium text-gray-900">
                                    {new Intl.NumberFormat('en-KE', {
                                        style: 'currency',
                                        currency: 'KES',
                                        maximumFractionDigits: 0
                                    }).format(car.price)}
                                </div>
                            </td>
                            <td className="py-4 px-6 text-gray-900">{car.year}</td>
                            <td className="py-4 px-6 text-gray-900">{car.specs.mileage}k km</td>
                            <td className="py-4 px-6 text-gray-900">{car.location}</td>
                            <td className="py-4 px-6">
                                <div className={`flex items-center ${priceAnalysis.color}`}>
                                    <PriceIcon className="w-5 h-5 mr-2" />
                                    <span>{priceAnalysis.text}</span>
                                </div>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

// Main Component
const CarComparison = () => {
    const [loading, setLoading] = useState(false);
    const [cars, setCars] = useState([]);
    const [error, setError] = useState(null);
    const [selectedCars, setSelectedCars] = useState([]);
    const [comparisonMode, setComparisonMode] = useState('list'); // 'list' or 'versus'

    const handleSearch = async (filters) => {
        setLoading(true);
        try {
            const response = await fetch('/api/crawler/cheki/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });

            const data = await response.json();

            if (!data.success) throw new Error(data.error || 'Failed to fetch cars');

            setCars(data.data.normalized);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Compare Cars in Kenya
                    </h1>
                    <p className="text-xl text-gray-600">
                        Find the best deals across multiple dealers
                    </p>
                </div>

                {/* Search Form */}
                <SearchForm onSearch={handleSearch} loading={loading} />

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-12 h-12"
                        >
                            <Loader2 className="w-12 h-12 text-red-600" />
                        </motion.div>
                    </div>
                )}

                {!loading && cars.length > 0 && (
                    <>
                        {/* Market Analysis */}
                        <MarketAnalysis cars={cars} />

                        {/* View Toggle */}
                        <div className="flex justify-end mb-6">
                            <div className="bg-white rounded-lg shadow inline-flex">
                                <button
                                    onClick={() => setComparisonMode('list')}
                                    className={`px-4 py-2 rounded-l-lg ${
                                        comparisonMode === 'list'
                                            ? 'bg-red-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    List View
                                </button>
                                <button
                                    onClick={() => setComparisonMode('versus')}
                                    className={`px-4 py-2 rounded-r-lg ${
                                        comparisonMode === 'versus'
                                            ? 'bg-red-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    VS Mode
                                </button>
                            </div>
                        </div>

                        {/* Selected Cars Comparison */}
                        {selectedCars.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Selected for Comparison ({selectedCars.length}/3)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {selectedCars.map(carId => {
                                        const car = cars.find(c => c.externalId === carId);
                                        return (
                                            <div key={carId} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-medium text-gray-900">{car.title}</h3>
                                                    <button
                                                        onClick={() => setSelectedCars(prev =>
                                                            prev.filter(id => id !== carId)
                                                        )}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <p className="text-gray-600">{car.location}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Comparison View */}
                        {comparisonMode === 'list' ? (
                            <ComparisonTable
                                cars={cars}
                                selectedCars={selectedCars}
                                onSelectCar={(carId) => {
                                    if (selectedCars.includes(carId)) {
                                        setSelectedCars(prev => prev.filter(id => id !== carId));
                                    } else if (selectedCars.length < 3) {
                                        setSelectedCars(prev => [...prev, carId]);
                                    }
                                }}
                            />
                        ) : (
                            <VersusMode
                                cars={cars.filter(car => selectedCars.includes(car.externalId))}
                            />
                        )}
                    </>
                )}

                {!loading && cars.length === 0 && !error && (
                    <div className="text-center py-12">
                        <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No cars found
                        </h3>
                        <p className="text-gray-600">
                            Try adjusting your search filters to find more results
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Versus Mode Component for detailed side-by-side comparison
const VersusMode = ({ cars }) => {
    if (cars.length < 2) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select at least 2 cars to compare
                </h3>
                <p className="text-gray-600">
                    Click on cars in the list view to select them for comparison
                </p>
            </div>
        );
    }

    const compareSpecs = (spec1, spec2) => {
        if (spec1 === spec2) return 'equal';
        return spec1 > spec2 ? 'better' : 'worse';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-6">
                {cars.map((car, index) => (
                    <div key={car.externalId} className="space-y-6">
                        {/* Car Image */}
                        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">
                            {car.images?.[0] ? (
                                <img src={car.images[0]} alt={car.title} className="object-cover" />
                            ) : (
                                <Car className="w-full h-full text-gray-400 p-8" />
                            )}
                        </div>

                        {/* Car Details */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{car.title}</h3>
                            <div className="mt-2 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Price:</span>
                                    <span className={`font-medium ${
                                        compareSpecs(cars[0].price, car.price) === 'better'
                                            ? 'text-green-600'
                                            : compareSpecs(cars[0].price, car.price) === 'worse'
                                                ? 'text-red-600'
                                                : 'text-gray-900'
                                    }`}>
                                        {new Intl.NumberFormat('en-KE', {
                                            style: 'currency',
                                            currency: 'KES',
                                            maximumFractionDigits: 0
                                        }).format(car.price)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Year:</span>
                                    <span className="font-medium text-gray-900">{car.year}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mileage:</span>
                                    <span className="font-medium text-gray-900">{car.specs.mileage}k km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Engine:</span>
                                    <span className="font-medium text-gray-900">{car.specs.engineSize}cc</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Location:</span>
                                    <span className="font-medium text-gray-900">{car.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarComparison;