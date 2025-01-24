import React, { useState } from "react";

function VoiceSearch() {
  const [status, setStatus] = useState("Click to start voice search");

  const handleVoiceSearch = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false; // Ensure only final results are processed

      recognition.onstart = () => {
        setStatus("Listening...");
      };

      recognition.onresult = (event) => {
        let query = event.results[0][0].transcript.trim(); // Remove leading/trailing spaces
        query = query.replace(/\.$/, ""); // Remove trailing full stop if present
        setStatus("Voice Search Completed: " + query);
        // Process query (e.g., send to API)
      };

      recognition.onerror = () => {
        setStatus("Voice search error. Please try again.");
      };

      recognition.start();
    } else {
      setStatus("Voice search not supported on this browser.");
    }
  };

  return (
    <div className="voice-search">
      <h2>Search with Your Voice</h2>
      <button onClick={handleVoiceSearch}>Start Voice Search</button>
      <p>{status}</p>
    </div>
  );
}

export default VoiceSearch;
npm 