import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./pages/home/HomePage";
import HotelListPage from "./pages/home/HotelListpage.jsx";
import HotelDetailPage from "./pages/home/HotelDetailPage";
import BookingPage from "./pages/home/BookingPage";
import BookingConfirm from "./pages/home/BookingConfirm";
import BookingsPage from "./pages/home/BookingsPage";

// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hotels/:city" element={<HotelListPage />} />
          <Route path="/hotel/:hotelCode" element={<HotelDetailPage />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/booking-confirm" element={<BookingConfirm />} />
          <Route path="/bookings" element={<BookingsPage />} />
        </Routes>
    </QueryClientProvider>
  );
}

export default App;
