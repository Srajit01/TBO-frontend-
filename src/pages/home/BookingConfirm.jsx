import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

function BookingConfirm() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Booking Confirmed!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for your booking. We've sent a confirmation email with all
          the details.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
          <button
            onClick={() => navigate("/bookings")}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirm;
