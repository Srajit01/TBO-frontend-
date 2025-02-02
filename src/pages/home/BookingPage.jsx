import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, User, Loader2 } from "lucide-react";
import axios from "axios";
import RoomCard from "../../components/RoomCard";

function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    childrenAges: [1],
    nationality: "IN",
  });

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

  const today = new Date().toISOString().split("T")[0];
  const [cin, setcin] = useState("");
  useEffect(() => {
    const savedCheckIn = localStorage.getItem("checkIn");
    const savedCheckOut = localStorage.getItem("checkOut");
    setcin(savedCheckIn);
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

    if (type === "checkIn") {
      if (selectedDate < today) {
        setError("Check-in date cannot be in the past");
        return;
      }
      setFilters((prev) => ({
        ...prev,
        checkIn: date,
        checkOut:
          prev.checkOut && new Date(prev.checkOut) < selectedDate
            ? null
            : prev.checkOut,
      }));
    }

    if (type === "checkOut") {
      if (!filters.checkIn) {
        setError("Please select check-in date first");
        return;
      }

      const checkInDate = new Date(filters.checkIn);
      if (selectedDate <= checkInDate) {
        setError("Check-out date must be after check-in date");
        return;
      }

      setFilters((prev) => ({
        ...prev,
        checkOut: date,
      }));
    }
  };

  // Updating the children ages list when number of children changes
  useEffect(() => {
    const newChildrenAges = Array(formData.children).fill(1);
    setFormData((prev) => ({
      ...prev,
      childrenAges: newChildrenAges,
    }));
  }, [formData.children]);

  const validateDates = () => {
    if (!formData.checkIn || !formData.checkOut) {
      setError("Please select check-in and check-out dates");
      return false;
    }

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const todayDate = new Date(today);

    if (checkInDate < todayDate) {
      setError("Check-in date cannot be in the past");
      return false;
    }

    if (checkOutDate <= checkInDate) {
      setError("Check-out date must be after check-in date");
      return false;
    }

    setError(null);
    return true;
  };

  const searchRooms = async () => {
    if (!validateDates()) return;

    setIsLoading(true);
    setRooms([]);
    setError(null);

    try {
      const payload = {
        CheckIn: formData.checkIn,
        CheckOut: formData.checkOut,
        HotelCodes: id || "",
        GuestNationality: formData.nationality,
        PaxRooms: [
          {
            Adults: formData.adults,
            Children: formData.children,
            ChildrenAges: formData.childrenAges.slice(0, formData.children),
          },
        ],
        ResponseTime: 23.0,
        IsDetailedResponse: false,
        Filters: {
          Refundable: false,
          NoOfRooms: 1,
        },
      };

      const response = await axios.post(
        "http://localhost:9090/api/hotelsearch",
        payload
      );
      const availableRooms = response.data || [];
      console.log(availableRooms,'ab')
      const rooms = availableRooms.HotelResult[0].Rooms;

      setRooms(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError("No available rooms for selected Date. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomSelect = (room) => {
    navigate("/booking-confirm", {
      state: {
        room,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.adults + formData.children,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Hotel Room Booking</h1>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Check-In Date */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
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
                    value={formData.checkIn}
                    onChange={(e) =>
                      setFormData({ ...formData, checkIn: e.target.value })
                    }
                    min={today}
                  />
                </div>
              </div>

              {/* Check-Out Date */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
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
                    value={formData.checkOut}
                    onChange={(e) =>
                      setFormData({ ...formData, checkOut: e.target.value })
                    }
                    min={formData.checkIn || today}
                  />
                </div>
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality
                </label>
                <select
                  value={formData.nationality}
                  onChange={(e) =>
                    setFormData({ ...formData, nationality: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>

            {/* Guests Section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <select
                    value={formData.adults}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adults: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Adult" : "Adults"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <select
                    value={formData.children}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        children: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[0, 1, 2].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Child" : "Children"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Children Ages */}
            {formData.children > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Children Ages
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: formData.children }).map((_, index) => (
                    <select
                      key={index}
                      value={formData.childrenAges[index]}
                      onChange={(e) => {
                        const newAges = [...formData.childrenAges];
                        newAges[index] = Number(e.target.value);
                        setFormData({ ...formData, childrenAges: newAges });
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Array.from({ length: 17 }, (_, i) => i + 1).map(
                        (age) => (
                          <option key={age} value={age}>
                            {age} years
                          </option>
                        )
                      )}
                    </select>
                  ))}
                </div>
              </div>
            )}

            {/* Search Button */}
            <div className="mt-6">
              <button
                onClick={searchRooms}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <User className="w-5 h-5 mr-2" />
                )}
                {isLoading ? "Searching..." : "Search Rooms"}
              </button>
            </div>
          </div>

          {/* Room Search Results */}
          {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room, index) => (
                  <RoomCard key={index} room={room} onSelect={handleRoomSelect} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-center text-gray-500">Fill the details to fetch your rooms..</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
