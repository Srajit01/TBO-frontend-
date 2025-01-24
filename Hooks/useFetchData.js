import { useState, useEffect } from "react";
import axios from "axios";

const useFetch = (url, initialParams = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data logic
  
  //   const fetchData = async () => {
  //     setLoading(true);
  //     setError(null); // Reset error state before a new request
  //     try {
  //       const response = await axios.get(url, {
  //         params:initialParams,  // Pass params here
  //       });
  //       console.log(response.data, 'use');
  //       setData(response.data);
  //     } catch (err) {
  //       console.error("Error during fetch:", err.message);
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //  useEffect(()=>{
  //    fetchData();
  //   },[fetchData])


  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(url, {params:initialParams}); // Ensure this URL is static unless needed to change.
      const result = await response.json();
      setData(result); // This could be causing the re-render loop
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  fetchData();
}, [url,]); // Ensure `url` doesn't change on every render

    return { data, loading, error };
};

export default useFetch;