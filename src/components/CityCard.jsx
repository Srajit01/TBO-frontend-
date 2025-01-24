import React from 'react';
import { useNavigate } from 'react-router-dom';

// Prop type definition for CityCard component
function CityCard({ city }) {
  const navigate = useNavigate();
  const handleclick=()=>{

    navigate(`/hotels/${city}`, { 
      state: { 
        cityName: city.name,
        checkIn: '',
        checkOut: '',
        guests: [],
        code: city.id
      } 
    });
  }
  return (
    <div
      onClick={handleclick}
      className="relative overflow-hidden rounded-lg cursor-pointer group"
    >
      <img
        src={city.imageUrl}
        alt={city.name}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
        <div className="absolute bottom-0 p-4 text-white">
          <h3 className="text-xl font-bold">{city.name}</h3>
          <p className="text-sm opacity-90">{city.description}</p>
        </div>
      </div>
    </div>
  );
}

export default CityCard;
