import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { GeocodingControl } from "@maptiler/geocoding-control/maplibregl";
import "@maptiler/geocoding-control/style.css";
import "../styles/searchBar.css";

// Import your GeoJSON file
import GeoJSONData from "../data/output.geojson";

// Import the marker image
import markerImage from "../data/marker.png";

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const initialState = {
    lng: -117.71319812050054,
    lat: 34.099885457669316,
    zoom: 16.5,
  };

  const maptilerApiKey = "SbGQ4qpToiGBv5VDdgfc";
  const maptilerMapReference = "62541eae-c092-4439-bb8f-ff1d146db515";

  useEffect(() => {
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/${maptilerMapReference}/style.json?key=${maptilerApiKey}`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      minZoom: 2,
      maxZoom: 18,
    });

    map.current.on("load", () => {
      console.log("Map loaded successfully");

      // Add your map controls
      map.current.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "bottom-right"
      );

      const gc = new GeocodingControl({
        apiKey: maptilerApiKey,
        map: map.current,
      });
      map.current.addControl(gc);

      map.current.keyboard.enable();

      // Add the marker image to the map
      const image = new Image();
      image.src = markerImage;

      image.onload = () => {
        map.current.addImage("marker", image);
      };

      // Add markers from GeoJSON data
      map.current.addSource("markers", {
        type: "geojson",
        data: GeoJSONData,
      });

      map.current.addLayer({
        id: "markers",
        type: "symbol",
        source: "markers",
        layout: {
          "icon-image": "marker", // Use the marker image for the icons
          "icon-allow-overlap": true,
          "icon-size": 0.07,
        },
      });
    });

    // Handle errors
    map.current.on("error", (error) => {
      console.error("An error occurred while loading the map:", error);
    });

    map.current.on("click", (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ["markers"], // Specify the layer where your markers are located
      });
    
      if (features.length > 0) {
        const feature = features[0];
        const properties = feature.properties;
    
        // Construct the HTML content for the popup
        const popupContent = `
          <h3>${properties["Program Name"]}</h3>
          <p>Address: ${properties["Street Address 1"]}, ${properties["City"]}, ${properties["State"]} ${properties["Zip"]}</p>
          <p>Phone: ${properties["Phone"]}</p>
        `;
    
        // Display the information in a popup
        new maplibregl.Popup()
          .setLngLat(feature.geometry.coordinates)
          .setHTML(popupContent)
          .addTo(map.current);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div
      id="map"
      ref={mapContainer}
      style={{ position: "absolute", width: "100%", height: "100%" }}
    />
  );
};

export default Map;
