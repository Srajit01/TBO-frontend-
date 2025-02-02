import { useState, useEffect, useRef } from "react";

function VoiceSearch() {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const [transcript, setTranscript] = useState('');

    useEffect(() => {
        if ("webkitSpeechRecognition" in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.lang = "en-US";
            recognitionRef.current.interimResults = false;
            recognitionRef.current.onstart = () => {
              setIsListening(true);
              setError(null);
            };

            recognitionRef.current.onresult = (event) => {
                let query = event.results[0][0].transcript.trim(); // Remove leading/trailing spaces
                query = query.replace(/\.$/, "");
                setTranscript(query);
                setIsListening(false);
                
            };

            recognitionRef.current.onerror = (event) => {
                setError("Voice search error. Please try again.");
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                if(isListening){
                    setIsListening(false);
                }
            }
      } else {
            setError("Voice search not supported on this browser.");
        }
    }, []);

    const startListening = (callback) => {
        if (recognitionRef.current) {
            setTranscript("");
          recognitionRef.current.start();
          recognitionRef.current.onresult = (event) => {
              let query = event.results[0][0].transcript.trim(); // Remove leading/trailing spaces
              query = query.replace(/\.$/, "");
              setTranscript(query);
              setIsListening(false);
              callback(query)
          };
        }
    };
    
    const stopListening = () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        setIsListening(false);
        }
    };
    return {
        isListening,
        error,
        startListening,
        stopListening,
        transcript,
    };
}
export default VoiceSearch;