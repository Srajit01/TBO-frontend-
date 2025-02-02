const hotelImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945',  // Luxury hotel 1
    'https://images.unsplash.com/photo-1582719508461-905c673771fd',  // Luxury hotel 2
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',  // Luxury hotel 3
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',  // Luxury hotel 4
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9',  // Luxury hotel 5
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a',  // Luxury hotel 6
    'https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e',  // Luxury hotel 7
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791'   // Luxury hotel 8
  ];
  
  export const getHotelImage = (index) => {
    // For hotels after index 7, we start repeating from the beginning
    const imageIndex = index % hotelImages.length;
    return hotelImages[imageIndex];
  };
  