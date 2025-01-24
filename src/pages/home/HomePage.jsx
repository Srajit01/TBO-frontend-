import React, { useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar";
import CityCard from "../../components/CityCard";
import { featuredCities } from "../../../data/Cities";
import axios, { Axios } from "axios";
import {
  Building2,
  User,
  Menu,
  X,
  MessageSquare,
  ArrowRight,
} from "lucide-react"; // Ensure ArrowRight is imported

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);

  // Background images for the hero section
  const backgroundImages = [
    "https://wallpaperaccess.com/full/332759.jpg",
    "https://vastphotos.com/files/uploads/photos/10252/mountains-in-autumn-landscape-l.jpg",
    "https://wallpaperaccess.com/full/1534566.jpg",
    "https://i.pinimg.com/originals/27/62/8e/27628eb26e7e3509341a71695358d31b.jpg",
    "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&q=80&w=1000",
    "https://images2.alphacoders.com/734/thumb-1920-734981.jpg",
    "https://wallpaperaccess.com/full/1318032.jpg",
  ];

  // Rotate background images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Mock auth functions for sign-in/sign-out
  const handleGoogleSignIn = async () => {
    try {
      const mockUser = { name: "John Doe", email: "johndoe@example.com" }; // Mock user object
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error("Error during sign-in", error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Load user from local storage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2">
              <img
                src="/Tbo.jpg"
                alt="TBO Logo"
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-2xl font-bold text-blue-600">TBO BOOKINGS</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Hotels
              </a>
              <a
                href="/about"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                About
              </a>
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <User size={18} />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-separate">
            <div className="container mx-auto px-4 py-2 space-y-2">
              <a href="#" className="block py-2 text-gray-600">
                Hotels
              </a>
              <a href="/about" className="block py-2 text-gray-600">
                About
              </a>
              <button
                onClick={user ? handleSignOut : handleGoogleSignIn}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
              >
                <User size={18} />
                {user ? "Sign Out" : "Sign In"}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4">
        <div
          className="relative py-8 md:py-12"
          style={{
            backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "background-image 1s ease-in-out",
          }}
        >
          <div className="max-w-4xl mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Find Your Perfect Stay
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Search through thousands of hotels across the Globe.
            </p>
            <SearchBar />
          </div>
        </div>

        {/* Featured Cities */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Building2 className="w-6 h-6 text-gray-700 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Featured Cities
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredCities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        </div>

        {/* AI Trip Planner and Chatbot Assistance */}
        <div
          className="relative py-16"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2070')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          {/* Content Container */}
          <div className="container mx-auto px-4 py-8">
            {/* Section Title */}
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Smart Travel Solutions
            </h2>

            <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-5xl mx-auto">
              {/* AI Trip Planner Box */}
              <a
                href="https://www.tbocom.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-1/2 group relative overflow-hidden bg-gradient-to-r from-blue-600/90 to-blue-400/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-12 -mb-12 blur-xl" />

                <div className="relative flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"></div>
                    <h2 className="text-2xl font-bold text-white ml-4">
                      AI Trip Planner
                    </h2>
                  </div>

                  <p className="text-blue-50 text-base mb-6">
                    Experience smart travel planning with our AI-powered
                    assistant
                  </p>

                  <div className="mt-auto flex items-center text-white group-hover:translate-x-2 transition-transform">
                    <span className="text-sm font-semibold">
                      Plan your trip
                    </span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </a>

              {/* Chatbot Assistance Box */}
              <a
                href="https://www.tbocom.com/chatbot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-1/2 group relative overflow-hidden bg-gradient-to-r from-emerald-600/90 to-emerald-400/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full -ml-12 -mb-12 blur-xl" />

                <div className="relative flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white ml-4">
                      Chatbot Assistance
                    </h2>
                  </div>

                  <p className="text-emerald-50 text-base mb-6">
                    Get instant support 24/7 with our intelligent chatbot
                  </p>

                  <div className="mt-auto flex items-center text-white group-hover:translate-x-2 transition-transform">
                    <span className="text-sm font-semibold">Start chat</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* About Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
                  About TBO Bookings
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Your trusted partner for hotel bookings across the globe.
                </p>
              </div>

              {/* Quick Links Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
                  Quick Links
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="/hotels"
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      Hotels
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about"
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contact"
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
                  Contact Us
                </h3>
                <div className="text-gray-300 leading-relaxed">
                  <p>Email: srajitbhardwaj@gmail.com</p>
                  <p>Phone: +91 7217489840</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default HomePage;
