import React, { useState } from 'react';

function ImageSearch() {
  const [image, setImage] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      // Process the uploaded image (e.g., send to API)
    }
  };

  return (
    <div className="image-search">
      <h2>Search by Image</h2>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      {image && <img src={image} alt="Uploaded Preview" className="preview" />}
    </div>
  );
}

export default ImageSearch;
