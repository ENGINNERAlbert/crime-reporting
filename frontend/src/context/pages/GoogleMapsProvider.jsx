// src/components/GoogleMapsProvider.jsx
import React from 'react';
import { LoadScript } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCLgQCeAdeTDZAAaGu809QwkO3iLmJVl3U'; // Replace with your real key

const libraries = ['places', 'geometry']; // Add any necessary libraries

const GoogleMapsProvider = ({ children }) => {
  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
      {children}
    </LoadScript>
  );
};

export default GoogleMapsProvider;
