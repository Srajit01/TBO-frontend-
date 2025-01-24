import React, { useState } from 'react';

function HotelSearch() {
  const [destination, setDestination] = useState('Raipur, India');
  const [checkIn, setCheckIn] = useState('2025-01-18');
  const [checkOut, setCheckOut] = useState('2025-01-19');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const handleSearch = () => {
    if (new Date(checkOut) <= new Date(checkIn)) {
      alert('Check-out date must be after check-in date.');
      return;
    }
  };

  return (
    <div className="hotel-search">
      <div>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destination"
        />
      </div>
      <div>
        <label>Check-In Date:</label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
        />
      </div>
      <div>
        <label>Check-Out Date:</label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
        />
      </div>
      <div>
        <label>Adults:</label>
        <input
          type="number"
          value={adults}
          onChange={(e) => setAdults(e.target.value)}
          min="1"
        />
      </div>
      <div>
        <label>Children:</label>
        <input
          type="number"
          value={children}
          onChange={(e) => setChildren(e.target.value)}
          min="0"
        />
      </div>
      <div>
        <label>Rooms:</label>
        <input
          type="number"
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
          min="1"
        />
      </div>
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default HotelSearch;
