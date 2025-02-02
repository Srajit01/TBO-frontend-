import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HashRouter } from "react-router";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
    <GoogleOAuthProvider clientId="<import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID>">
    <App />
    </GoogleOAuthProvider>;
    </HashRouter> 
  </StrictMode>
);
