import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import HotelCard from "../../components/HotelCard";
import axios from "axios";
import { Star, Filter, Coffee, Wifi, Car, Utensils, Wind, Calendar, Mic } from "lucide-react";
import VoiceSearch from "../../components/VoiceSearch";

function HotelListPage() {
    const { city } = useParams();
    const location = useLocation();
    const data = location.state;
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        minBudget: "",
        maxBudget: "",
        starRating: "",
        amenities: [],
        propertyType: [],
        sortBy: "recommended",
        checkIn: null,
        checkOut: null,
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalHotels: 0,
        hotelsPerPage: 30,
    });
    const [wishlist, setWishlist] = useState(() => {
        const savedWishlist = localStorage.getItem("wishlist");
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    });

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
      }, [wishlist]);


    // Define your static image URLs here
    const staticImages = [
        "/one.jpg",
        "/two.jpg",
        "/threes.jpg",
        "/four.jpg",
        "/five.jpg",
        "/six.jpg",
        "/seven.jpg",
        "/eight.jpg",
    ];

    // Load check-in and check-out from local storage
    useEffect(() => {
        const savedCheckIn = localStorage.getItem("checkIn");
        const savedCheckOut = localStorage.getItem("checkOut");
        setFilters((prev) => ({
            ...prev,
            checkIn: savedCheckIn || null,
            checkOut: savedCheckOut || null,
        }));
    }, []);

    const handleDateChange = (type, date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        if (type === 'checkIn') {
            if (selectedDate < today) {
                setError("Check-in date cannot be in the past");
                return;
            }
            setFilters(prev => ({
                ...prev,
                checkIn: date,
                checkOut: prev.checkOut && new Date(prev.checkOut) < selectedDate ? null : prev.checkOut
            }));
        }
        if (type === 'checkOut') {
            if (!filters.checkIn) {
                setError("Please select check-in date first");
                return;
            }
            const checkInDate = new Date(filters.checkIn);
            if (selectedDate <= checkInDate) {
                setError("Check-out date must be after check-in date");
                return;
            }
            setFilters(prev => ({
                ...prev,
                checkOut: date
            }));
        }
    };

    const amenitiesOptions = [
        { icon: <Wifi size={18} />, label: "Free WiFi" },
        { icon: <Car size={18} />, label: "Parking" },
        { icon: <Coffee size={18} />, label: "Breakfast" },
        { icon: <Utensils size={18} />, label: "Restaurant" },
        { icon: <Wind size={18} />, label: "Air Conditioning" },
    ];

    const propertyTypes = ["Hotel", "Resort", "Apartment", "Villa", "Homestay"];

    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage,
        }));
    };

    const fetchHotels = async () => {
        if (!city) {
            setError("No city code provided");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `http://localhost:9090/api/hotels/${data.code}`,
                {
                    page: pagination.currentPage,
                    limit: pagination.hotelsPerPage,
                    ...filters,
                    starRating: filters.starRating ? parseInt(filters.starRating, 10) : undefined,
                    sortBy: filters.starRating ? "stars_desc" : "recommended",
                }
            );

            if (response.data?.data?.Hotels) {
                let { Hotels, total, totalPages } = response.data.data;
                // Map each hotel to include the correct image URL
                const hotelsWithImages = Hotels.map((hotel, index) => ({
                    ...hotel,
                    imageUrl: staticImages[index % staticImages.length],
                }));
                const sortedHotels = sortHotelsByStarAndVoiceSearch([...hotelsWithImages]);
                setHotels(sortedHotels);
                setPagination((prev) => ({
                    ...prev,
                    totalHotels: total,
                    totalPages: totalPages,
                }));
            } else {
                setError("No hotels found");
            }
        } catch (err) {
            console.error("Error fetching hotels:", err);
            setError("Failed to fetch hotels. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const sortHotelsByStarAndVoiceSearch = (hotelsToSort) => {
        return hotelsToSort.sort((a, b) => {
            // First, handle voice search
            if (voiceSearchQuery) {
                const aNameMatch = a.HotelName.toLowerCase().includes(voiceSearchQuery.toLowerCase());
                const bNameMatch = b.HotelName.toLowerCase().includes(voiceSearchQuery.toLowerCase());
                if (aNameMatch && !bNameMatch) return -1;
                if (!aNameMatch && bNameMatch) return 1;
            }
            // Then, handle star rating
            if (filters.starRating) {
                const targetStars = parseInt(filters.starRating, 10);
                const aStars = parseInt(a.StarRating, 10) || 0;
                const bStars = parseInt(b.StarRating, 10) || 0;
                // If one matches the filter exactly, prioritize it
                if (aStars === targetStars && bStars !== targetStars) return -1;
                if (bStars === targetStars && aStars !== targetStars) return 1;
            }
            // Default sort by star rating (highest first)
            return (parseInt(b.StarRating) || 0) - (parseInt(a.StarRating) || 0);
        });
    };

    useEffect(() => {
        fetchHotels();
    }, [city, filters, pagination.currentPage]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const toggleAmenity = (amenity) => {
        setFilters(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const togglePropertyType = (type) => {
        setFilters(prev => ({
            ...prev,
            propertyType: prev.propertyType.includes(type)
                ? prev.propertyType.filter(t => t !== type)
                : [...prev.propertyType, type],
        }));
    };

    const clearFilters = () => {
        setFilters({
            minBudget: "",
            maxBudget: "",
            starRating: "",
            amenities: [],
            propertyType: [],
            sortBy: "recommended",
            checkIn: null,
            checkOut: null,
        });
    };
    const toggleFavorite = (hotel) => {
        setWishlist(prev => {
           const hotelIndex = prev.findIndex(item => item.HotelCode === hotel.HotelCode);
           if(hotelIndex === -1){
               return [...prev, hotel];
           } else {
            return prev.filter(item => item.HotelCode !== hotel.HotelCode);
           }
        });
    };


    const [voiceSearchQuery, setVoiceSearchQuery] = useState("");
    const { isListening, error: voiceError, startListening, stopListening } = VoiceSearch();

    const handleVoiceSearch = () => {
        if (isListening) {
            stopListening();
            return;
        }
        startListening((transcript) => {
            setVoiceSearchQuery(transcript.toLowerCase());
        });
    };

    useEffect(() => {
        if (voiceSearchQuery) {
            fetchHotels();
        }
    }, [voiceSearchQuery]);


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-blue-600 text-white py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold capitalize mb-2">
                        Hotels in {data.cityName}
                    </h1>
                    <p className="text-lg opacity-90">
                        {pagination.totalHotels} properties found
                    </p>
                </div>
            </div>
          <div className="container mx-auto px-4 py-8">
            <WishlistSection wishlist={wishlist} staticImages={staticImages} toggleFavorite={toggleFavorite}  />
            <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
              <div className="lg:w-1/4">
                  <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-semibold flex items-center gap-2">
                              <Filter size={20} />
                              Filters
                          </h2>
                          <button
                              onClick={clearFilters}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                              Clear all
                          </button>
                      </div>
                      {/* Date Range Filter */}
                      <div className="mb-6">
                          <h3 className="font-medium mb-4">Travel Dates</h3>
                          <div className="space-y-4">
                              <div>
                                  <label className="block mb-2 text-sm font-medium">
                                      Check-in Date
                                  </label>
                                  <div className="relative">
                                      <input
                                          type="date"
                                          value={filters.checkIn || ''}
                                          onChange={(e) => handleDateChange('checkIn', e.target.value)}
                                          min={new Date().toISOString().split('T')[0]}
                                          className="w-full border rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-blue-500"
                                      />
                                      <Calendar
                                          size={20}
                                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="block mb-2 text-sm font-medium">
                                      Check-out Date
                                  </label>
                                  <div className="relative">
                                      <input
                                          type="date"
                                          value={filters.checkOut || ''}
                                          onChange={(e) => handleDateChange('checkOut', e.target.value)}
                                          min={filters.checkIn || new Date().toISOString().split('T')[0]}
                                          disabled={!filters.checkIn}
                                          className="w-full border rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-blue-500
                            disabled:bg-gray-100 disabled:cursor-not-allowed"
                                      />
                                      <Calendar
                                          size={20}
                                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                      />
                                  </div>
                              </div>
                          </div>
                          {error && (
                              <p className="text-red-500 text-sm mt-2">{error}</p>
                          )}
                      </div>
                      {/* Price Range Filter */}
                      <div className="mb-6">
                          <h3 className="font-medium mb-4">Price Range</h3>
                          <div className="flex gap-4">
                              <input
                                  type="number"
                                  name="minBudget"
                                  placeholder="Min"
                                  value={filters.minBudget}
                                  onChange={handleFilterChange}
                                  className="w-1/2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                  type="number"
                                  name="maxBudget"
                                  placeholder="Max"
                                  value={filters.maxBudget}
                                  onChange={handleFilterChange}
                                  className="w-1/2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                              />
                          </div>
                      </div>
                      {/* Star Rating Filter */}
                      <div className="mb-6">
                          <h3 className="font-medium mb-4">Star Rating</h3>
                          <div className="space-y-3">
                              {[5, 4, 3, 2, 1].map((stars) => (
                                  <label
                                      key={stars}
                                      className="flex items-center gap-2 cursor-pointer"
                                  >
                                      <input
                                          type="radio"
                                          name="starRating"
                                          value={stars}
                                          checked={filters.starRating === String(stars)}
                                          onChange={handleFilterChange}
                                          className="w-4 h-4 text-blue-600"
                                      />
                                      <div className="flex text-yellow-400">
                                          {[...Array(stars)].map((_, i) => (
                                              <Star key={i} size={16} fill="currentColor" />
                                          ))}
                                      </div>
                                  </label>
                              ))}
                          </div>
                      </div>
                      {/* Amenities Filter */}
                      <div className="mb-6">
                          <h3 className="font-medium mb-4">Amenities</h3>
                          <div className="space-y-3">
                              {amenitiesOptions.map(({ icon, label }) => (
                                  <label
                                      key={label}
                                      className="flex items-center gap-3 cursor-pointer"
                                  >
                                      <input
                                          type="checkbox"
                                          checked={filters.amenities.includes(label)}
                                          onChange={() => toggleAmenity(label)}
                                          className="w-4 h-4 text-blue-600 rounded"
                                      />
                                      {icon}
                                      <span>{label}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                      {/* Property Type Filter */}
                      <div>
                          <h3 className="font-medium mb-4">Property Type</h3>
                          <div className="space-y-3">
                              {propertyTypes.map((type) => (
                                  <label
                                      key={type}
                                      className="flex items-center gap-2 cursor-pointer"
                                  >
                                      <input
                                          type="checkbox"
                                          checked={filters.propertyType.includes(type)}
                                          onChange={() => togglePropertyType(type)}
                                          className="w-4 h-4 text-blue-600 rounded"
                                      />
                                      <span>{type}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
              {/* Main Content */}
              <div className="lg:w-3/4">
                  {/* Sort Options */}
                  <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                      <div className="flex items-center justify-between">
                          <select
                              name="sortBy"
                              value={filters.sortBy}
                              onChange={handleFilterChange}
                              className="border-0 text-lg font-medium focus:ring-0"
                          >
                              <option value="recommended">Recommended</option>
                              <option value="price-low-to-high">Price: Low to High</option>
                              <option value="price-high-to-low">Price: High to Low</option>
                              <option value="rating">Rating</option>
                          </select>
                         <button
                                onClick={handleVoiceSearch}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                isListening
                                    ? "bg-red-500 text-white"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                } transition-colors`}
                            >
                                <Mic size={20} />
                                {isListening ? "Stop Listening" : "Voice Search"}
                            </button>
                      </div>
                      {voiceError && (
                          <p className="text-red-500 text-sm mt-2">{voiceError}</p>
                      )}
                  </div>
                  {/* Hotel Cards */}
                  {loading ? (
                      <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                          <p className="text-gray-600 mt-4">Loading hotels...</p>
                      </div>
                  ) : error ? (
                      <div className="text-center py-12">
                          <p className="text-red-600 text-lg">{error}</p>
                      </div>
                  ) : !hotels || hotels.length === 0 ? (
                      <div className="text-center py-12">
                          <p className="text-gray-600 text-lg">
                              Loading your Hotels.. Have a nice booking
                          </p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 gap-6">
                          {hotels.map((hotel, index) => (
                              <HotelCard
                                  key={`${hotel.Hotelcity}-${index}`}
                                  hotel={hotel}
                                  imageUrl={hotel.imageUrl}
                                    toggleFavorite={toggleFavorite}
                                    isFavorite={wishlist.some(item => item.HotelCode === hotel.HotelCode)}
                                 />
                          ))}
                      </div>
                  )}
                  {/* Pagination */}
                  {!loading && hotels && hotels.length > 0 && (
                      <div className="mt-8 flex justify-center items-center gap-2">
                          {Array.from({ length: pagination.totalPages }, (_, index) => (
                              <button
                                  key={index + 1}
                                  onClick={() => handlePageChange(index + 1)}
                                  className={`px-4 py-2 rounded-lg ${
                                      pagination.currentPage === index + 1
                                          ? "bg-blue-600 text-white"
                                          : "bg-white text-gray-600 hover:bg-gray-100"
                                  } transition-colors`}
                              >
                                  {index + 1}
                              </button>
                          ))}
                      </div>
                  )}
              </div>
            </div>
          </div>
        </div>
    );
}

const WishlistSection = ({ wishlist, staticImages, toggleFavorite}) => {
    if (!wishlist || wishlist.length === 0) {
        return null;
    }
    
    return(
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Wishlist</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {wishlist.map((hotel,index) =>(
                     <HotelCard
                         key={hotel.HotelCode}
                       hotel={hotel}
                        imageUrl={staticImages[index % staticImages.length]}
                        toggleFavorite={toggleFavorite}
                        isFavorite={true}
                     />
                   ))}
              </div>
      </div>
    );
}

export default HotelListPage;