import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import HotelCard from "../../components/HotelCard";
import axios from "axios";
import { Star, Filter, Coffee, Wifi, Car, Utensils, Wind, Calendar } from "lucide-react";

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
        }
      );
      
      if (response.data?.data?.Hotels) {
        const { Hotels, total, totalPages } = response.data.data;
        setHotels(Hotels);
        setPagination(prev => ({
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

  useEffect(() => {
    fetchHotels();
  }, [city, filters, pagination.currentPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "starRating") {
      const starMap = {
        1: "OneStar",
        2: "TwoStar",
        3: "ThreeStar",
        4: "FourStar",
        5: "FiveStar",
      };
      setFilters(prev => ({ ...prev, [name]: starMap[value] }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
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
                        checked={filters.starRating === `${
                          stars === 1
                            ? "One"
                            : stars === 2
                            ? "Two"
                            : stars === 3
                            ? "Three"
                            : stars === 4
                            ? "Four"
                            : "Five"
                        }Star`}
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
              </div>
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

export default HotelListPage;
