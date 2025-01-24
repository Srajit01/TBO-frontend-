import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  Mic,
  Image as ImageIcon,
  Minus,
  Plus,
  Upload,
  X,
} from "lucide-react";
import useFetch from "../../Hooks/UseFetchData";
import Autocomplete from "./Autocomplete";
import { toast } from 'react-toastify';
import axios from "axios";
const EnhancedSearchBar = () => {
  const [city, setCity] = useState({ city: "", code: "" });
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [data, setData] = useState([])
  const [guestDetails, setGuestDetails] = useState({
    adults: 1,
    children: [],
  });
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const guestMenuRef = useRef(null);
  // const { data } = useFetch("http://localhost:9090/city", { city: city.city});
  useEffect(() => {
    const fetchData = async () => {
      if (city.city) { // Only fetch if city is not empty
        try {
          const response = await axios.get("http://localhost:9090/city", {
            params: { city: city.city }
          });
          const result = response.data;
          console.log(result, 'fa')
          setData(result);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
  
    fetchData();
  }, [city.city]); // Adding city.city as dependency
  
  const navigate = useNavigate();
  const MIN_ADULTS = 1;
  const MAX_TOTAL_GUESTS = 9;
  const MIN_CHILD_AGE = 0;
  const MAX_CHILD_AGE = 17;
  const totalGuests = guestDetails.adults + guestDetails.children.length;
  const handleChange = useCallback((e) => {
    setCity((prevState) => ({
      ...prevState,
      city: e.target.value,
    }));
  }, []);
  const startListening = () => {
    if ("webkitSpeechRecognition" in window) {
      setIsListening(true);
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCity((prevState) => ({
          ...prevState,
          city: transcript,
        }));
        setIsListening(false);
      };
      recognition.start();
    }
  };
  const updateAdults = (change) => {
    setGuestDetails((prev) => ({
      ...prev,
      adults: Math.max(MIN_ADULTS, prev.adults + change),
    }));
  };
  const addChild = () => {
    if (totalGuests < MAX_TOTAL_GUESTS) {
      setGuestDetails((prev) => ({
        ...prev,
        children: [...prev.children, { id: Date.now(), age: "" }],
      }));
    }
  };
  const updateChildAge = (id, age) => {
    setGuestDetails((prev) => ({
      ...prev,
      children: prev.children.map((child) =>
        child.id === id ? { ...child, age } : child
      ),
    }));
  };
  const removeChild = (id) => {
    setGuestDetails((prev) => ({
      ...prev,
      children: prev.children.filter((child) => child.id !== id),
    }));
  };
 const handleSubmit = async (e) => {
    e.preventDefault();

    if (!city.city) {
      toast({
        title: "Error",
        description: "Please select a city",
        variant: "destructive",
      });
      return;
    }
    try {
      if (city.code) {
        navigate(`/hotels/${city}`, { 
          state: { 
            cityName: city.city,
            checkIn,
            checkOut,
            guests: guestDetails,
            code: city.code
          } 
        });
      } else if ( data && data?.length >0) {
        const cityData = data.find(c => 
          c.city.toLowerCase().includes(city.city.toLowerCase())
        );
        
        if (cityData) {
          const cityCode = cityData.code || cityData.cityCode || cityData.hotelCode;
          if (cityCode) {
            setCity(prev => ({ ...prev, code: cityCode }));
            navigate(`/hotels/${cityCode}`, {
              state: {
                cityName: cityData.city,
                checkIn,
                checkOut,
                guests: guestDetails
              }
            });
          } else {
            toast({
              title: "Error",
              description: "No city code found for selected city",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Error",
            description: "City not found in our database",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "No data available for city search",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during navigation:", error);
      toast({
        title: "Error",
        description: "An error occurred while searching for hotels",
        variant: "destructive",
      });
    }
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setShowImageSearch(true);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleImageSearch = async () => {
    if (image) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", image);
      try {
        const response = await fetch("http://localhost:9090/image-search", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (result.city) {
          setCity((prevState) => ({
            ...prevState,
            city: result.city,
          }));
          setShowImageSearch(false);
          setImagePreview(null);
          setImage(null);
        }
      } catch (error) {
        console.error("Error during image search:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };
  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setShowImageSearch(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestMenuRef.current && !guestMenuRef.current.contains(event.target)) {
        setGuestMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location Input */}
          <div className="relative">
            <label className="block text-sm font-semibold text-white mb-2">
              Location
            </label>
            <div className="relative group">
              <MapPin
                className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                size={20}
              />
              <Autocomplete
                data={data}
                handleChange={handleChange}
                city={city}
                setCity={setCity}
              />
              <button
                type="button"
                onClick={startListening}
                className={`absolute right-3 top-3 p-1 rounded-full hover:bg-blue-100 ${
                  isListening
                    ? "bg-blue-100 text-blue-600 animate-pulse"
                    : "text-blue-500"
                } transition-all duration-200`}
              >
                <Mic size={20} />
              </button>
            </div>
          </div>
          {/* Check-In Date Input */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Check In
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="date"
                className="pl-10 w-full p-3 bg-white/90 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
          </div>
          {/* Check-Out Date Input */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Check Out
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="date"
                className="pl-10 w-full p-3 bg-white/90 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>
          {/* Guests Selection */}
          <div className="relative" ref={guestMenuRef}>
            <label className="block text-sm font-semibold text-white mb-2">
              Guests
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setGuestMenuOpen(!guestMenuOpen)}
                className="w-full p-3 pl-10 bg-white/90 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left transition-all"
              >
                <Users
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                {guestDetails.adults} Adult
                {guestDetails.adults !== 1 ? "s" : ""},{" "}
                {guestDetails.children.length} Child
                {guestDetails.children.length !== 1 ? "ren" : ""}
              </button>
              {guestMenuOpen && (
                <div className="absolute top-full right-0 w-72 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                  {/* Adults */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">Adults</p>
                      <p className="text-sm text-gray-500">Ages 18 or above</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateAdults(-1)}
                        disabled={guestDetails.adults <= MIN_ADULTS}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-6 text-center font-semibold">
                        {guestDetails.adults}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateAdults(1)}
                        disabled={totalGuests >= MAX_TOTAL_GUESTS}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                  {/* Children */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Children</p>
                        <p className="text-sm text-gray-500">Ages 0-17</p>
                      </div>
                      <button
                        type="button"
                        onClick={addChild}
                        disabled={totalGuests >= MAX_TOTAL_GUESTS}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Child
                      </button>
                    </div>
                    {/* Child Age Inputs */}
                    {guestDetails.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center gap-2 mt-2"
                      >
                        <select
                          value={child.age}
                          onChange={(e) =>
                            updateChildAge(child.id, e.target.value)
                          }
                          className="flex-1 p-2 border rounded-lg"
                        >
                          <option value="">Select age</option>
                          {[...Array(MAX_CHILD_AGE + 1)].map((_, i) => (
                            <option key={i} value={i}>
                              {i} year{i !== 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeChild(child.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Search Button */}
        <button
          type="submit"
          className="mt-6 w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          disabled={!checkIn || !checkOut}
        >
          <Search size={24} />
          Search Hotels
        </button>
        {/* Image Upload Button */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setShowImageSearch(true)}
            className="w-36 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-all"
          >
            <ImageIcon size={24} />
            Upload Image
          </button>
        </div>
        {/* Image Upload Dialog */}
        {showImageSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 w-96 relative">
              <h3 className="text-xl font-semibold mb-4">Upload Image for Search</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm border p-3 rounded-lg mb-4"
              />
              {imagePreview && (
                <div className="relative mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              )}
              <div className="flex justify-between">
                <button
                  onClick={() => setShowImageSearch(false)}
                  className="px-4 py-2 bg-gray-300 text-black rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImageSearch}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                  ) : (
                    <span>Search Using Image</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
export default EnhancedSearchBar;