import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  MapPin,
  Clock,
  Wifi,
  Utensils,
  Bed,
  Car,
  Image as ImageIcon,
  X,
  ZoomIn,
  ZoomOut,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
const fadeVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
const ICON_MAP = {
  WiFi: <Wifi className="mr-2 text-blue-500" />,
  Restaurant: <Utensils className="mr-2 text-green-500" />,
  Parking: <Car className="mr-2 text-gray-600" />,
  "Room Service": <Bed className="mr-2 text-purple-500" />,
};
const ImageModal = ({
  image,
  isOpen,
  onClose,
  images,
  activeImageIndex,
  setActiveImageIndex,
}) => {
  const [zoom, setZoom] = useState(1);
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 1));
  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      setActiveImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    } else if (event.key === "ArrowRight") {
      setActiveImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };
  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            className="bg-white/10 p-2 rounded-full hover:bg-white/20"
          >
            <ZoomIn size={24} className="text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            className="bg-white/10 p-2 rounded-full hover:bg-white/20"
          >
            <ZoomOut size={24} className="text-white" />
          </button>
        </div>
        <img
          src={image}
          alt="Zoomed view"
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </motion.div>
  );
};
const HotelDetailPage = () => {
  const { hotelCode } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullFacilities, setShowFullFacilities] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://tbo-server-v1-0.onrender.com/api/hotel/${hotelCode}`
        );
        setHotel(response.data.HotelDetails[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    hotelCode && fetchHotelDetails();
  }, [hotelCode]);
  const NavigationButtons = () => (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm shadow-lg border-t border-gray-200 p-4 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors duration-200"
        >
          <CalendarCheck className="w-5 h-5" />
          <span>Home Page</span>
        </button>
        <button
          onClick={() => navigate(`/booking/${hotelCode}`)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
        >
          <span>Select Rooms</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-red-600 text-xl">Error: {error}</p>
      </div>
    );
  if (!hotel)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No hotel details found.</p>
      </div>
    );
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <AnimatePresence>
        {showImageModal && (
          <ImageModal
            image={hotel.Images[activeImageIndex]}
            isOpen={showImageModal}
            onClose={() => setShowImageModal(false)}
            images={hotel.Images}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeVariants}
      >
        <h1 className="text-2xl font-bold mb-4  text-center text-gray-800">
          {hotel.HotelName}
        </h1>
        {/* Enhanced Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div
            className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl cursor-zoom-in"
            onClick={() => setShowImageModal(true)}
          >
            <img
              src={hotel.Images[activeImageIndex] || "/placeholder.svg"}
              alt={`Hotel Image ${activeImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {hotel.Images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(index);
                  }}
                  className={`h-2 w-2 rounded-full ${
                    index === activeImageIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {hotel.Images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className={`rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition ${
                  index === activeImageIndex ? "border-2 border-blue-500" : ""
                }`}
                onClick={() => {
                  setActiveImageIndex(index);
                  setShowImageModal(true);
                }}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-36 object-cover"
                />
              </div>
            ))}
            {hotel.Images.length > 4 && (
              <div
                className="bg-gray-100 flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  setActiveImageIndex(4);
                  setShowImageModal(true);
                }}
              >
                <div className="text-center">
                  <ImageIcon className="mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600">
                    +{hotel.Images.length - 4} More
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About Hotel Section */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6"
              variants={fadeVariants}
            >
              <h2 className="text-2xl font-semibold mb-4 border-b pb-3">
                About the Hotel
              </h2>
              <p className="text-gray-600">
                {hotel.Description.replace(/<[^>]*>/g, "")}
              </p>
            </motion.div>
            {/* Facilities Section */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6"
              variants={fadeVariants}
            >
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h2 className="text-2xl font-semibold">Facilities</h2>
                {hotel.HotelFacilities.length > 6 && (
                  <button
                    onClick={() => setShowFullFacilities(!showFullFacilities)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {showFullFacilities ? "Show Less" : "Show All"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(showFullFacilities
                  ? hotel.HotelFacilities
                  : hotel.HotelFacilities.slice(0, 6)
                ).map((facility, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center bg-gray-100 p-3 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    variants={fadeVariants}
                  >
                    {ICON_MAP[facility] || (
                      <MapPin className="mr-2 text-gray-500" />
                    )}
                    <p className="text-gray-600">{facility}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          <div>
            {/* Check-in/Check-out Section */}
            <div>
              <div className="flex items-center mb-4">
                <Clock className="mr-3 text-blue-600" />
                <h3 className="text-xl font-semibold">Check Times</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Check-in</p>
                  <p className="font-medium">{hotel.CheckInTime}</p>
                </div>
                <div>
                  <p className="text-gray-500">Check-out</p>
                  <p className="font-medium">{hotel.CheckOutTime}</p>
                </div>
              </div>
            </div>
            {/* Location Section */}
            <div>
              <div className="flex items-center mb-4 ">
                <MapPin className="mr-3 text-green-600 " />
                <h3 className="text-xl font-semibold">Location</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {hotel.CityName}, {hotel.CountryName}
              </p>
              {hotel.Map && (
                <div className="aspect-w-12 aspect-h-9 aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    title="Hotel Location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://maps.google.com/maps?q=${hotel.Map}&z=15&output=embed`}
                    allowFullScreen
                  />
                </div>
              )}
            </div>
            {/* Location Section */}
            {/* Contact Info Section */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6"
              variants={fadeVariants}
            >
              <h2 className="text-2xl font-semibold mb-4 border-b pb-3">
                Contact Information
              </h2>
              <p className="text-gray-600">{hotel.ContactNumber}</p>
              <p className="text-gray-600">{hotel.Email}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
      <NavigationButtons />
    </div>
  );
};
export default HotelDetailPage;
