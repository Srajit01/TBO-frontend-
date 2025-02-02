import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search } from 'lucide-react';

const Autocomplete = ({ data, handleChange, city, setCity }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [debouncedCity, setDebouncedCity] = useState("");
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

    const filteredData = useMemo(() => {
        if (!debouncedCity.trim()) {
            return [];
        }
      return data?.filter((item) =>
            item.city.toLowerCase().startsWith(debouncedCity.toLowerCase())
        ) || [];
    }, [debouncedCity, data]);

  useEffect(() => {
    setIsDropdownVisible(filteredData.length > 0);
  }, [filteredData]);

    const handleInputChange = (e) => {
      const newCityValue = e.target.value;
        setCity(prev => ({...prev, city:newCityValue}));
        if(debounceTimeoutRef.current){
           clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          setDebouncedCity(newCityValue);
        },300);
    };


  const handleKeyDown = (e) => {
    if (!filteredData.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filteredData.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelection(filteredData[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsDropdownVisible(false);
    }
  };

  const handleSelection = (item) => {
    if (!item) return;

    const cityName = item.city.split(',')[0].trim();
    const cityCode = item.code || item.cityCode || item.hotelCode || cityName;

    setCity({
      city: cityName,
      code: item.citycode
    });

    setIsDropdownVisible(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsDropdownVisible(false);
      }
    };
      
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
     document.removeEventListener('mousedown', handleClickOutside);
     if(debounceTimeoutRef.current){
         clearTimeout(debounceTimeoutRef.current);
     }
    }
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          value={city.city}
           onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => filteredData.length > 0 && setIsDropdownVisible(true)}
          className="w-full h-12 pl-10 pr-4 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
          placeholder="Search for a city..."
        />
      </div>

      {isDropdownVisible && filteredData.length > 0 && (
        <ul
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredData.map((item, index) => {
            const cityName = item.city.split(',')[0];
            const stateInfo = item.city.slice(cityName.length);

            return (
              <li
                key={index}
                onClick={() => handleSelection(item)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-4 py-3 cursor-pointer transition-colors duration-150
                  ${activeIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  ${index === filteredData.length - 1 ? '' : 'border-b border-gray-100'}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{cityName}</span>
                  {stateInfo && <span className="text-sm text-gray-500">{stateInfo}</span>}
                  <span className="text-xs text-gray-400">Code: {item.code || item.cityCode || item.hotelCode}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;