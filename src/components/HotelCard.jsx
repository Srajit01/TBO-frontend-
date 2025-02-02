import React, { useEffect, useState } from 'react';
import { Star, Wifi, Car, Coffee, Utensils, Building, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
//import { getHotelImage } from './images'; // Removed this line

// Map the string ratings to numeric values
const ratingMap = {
    'OneStar': 1,
    'TwoStar': 2,
    'ThreeStar': 3,
    'FourStar': 4,
    'FiveStar': 5
};

const HotelCard = ({ hotel, imageUrl, isFavorite, toggleFavorite }) => {
    const [rating, setRating] = useState(0);
    const [facilities, setFacilities] = useState([]);
  
  
    useEffect(() => {
        if (hotel) {
            // Use the mapped rating based on the string value
            const mappedRating = ratingMap[hotel?.HotelRating] || 0; // Default to 0 if not found
            setRating(mappedRating);
            setFacilities(hotel.HotelFacilities?.slice(0, 5) || []);
        }
    }, [hotel]);

    const facilityIcons = {
        'WiFi': <Wifi className="w-4 h-4 text-blue-500" />,
        'Parking': <Car className="w-4 h-4 text-green-500" />,
        'Restaurant': <Utensils className="w-4 h-4 text-red-500" />,
        'Breakfast': <Coffee className="w-4 h-4 text-orange-500" />,
        'Building': <Building className="w-4 h-4 text-purple-500" />
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                className={`transition-colors duration-300 ${
                    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 stroke-current'
                }`}
            />
        ));
    };


    return (
        <motion.div
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            whileHover={{ scale: 1.025 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative">
                <img
                    src={imageUrl}
                    alt={hotel.HotelName}
                    className="w-full h-56 object-cover"
                />

                <button
                    onClick={()=> toggleFavorite(hotel)}
                    className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white shadow-md"
                >
                    <Heart
                        className={`w-6 h-6 transition-colors ${
                            isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'
                        }`}
                    />
                </button>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-grow">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{hotel.HotelName}</h2>
                        <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-2 text-green-500" />
                            <span className="text-sm">
                {hotel.CityName}, {hotel.CountryName}
              </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <div className="flex items-center">{renderStars(rating)}</div>
                        <span className="ml-2 text-sm font-semibold text-blue-600">{rating.toFixed(1)}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {facilities.map((facility, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs text-gray-700 font-bold">
                                {facilityIcons[facility] || null}
                                <span>{facility}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-gray-800">
                        From <span className="text-blue-600">??{hotel.LowestPrice}</span>/night
                    </div>
                    <Link
                        to={`/hotel/${hotel.HotelCode}`}
                        className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default HotelCard;