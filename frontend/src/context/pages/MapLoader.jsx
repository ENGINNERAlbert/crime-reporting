// src/components/MapLoader.jsx
import React from 'react';
import { LoadScript } from "@react-google-maps/api";

const MapLoader = ({ children }) => {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY"}>
      {children}
    </LoadScript>
  );
};

export default MapLoader;
