import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { GeocodingControl } from "@maptiler/geocoding-control/maplibregl";
import "@maptiler/geocoding-control/style.css";
import "../styles/searchBar.css";
import NavBar from "./NavBar"; // Import NavBar component
import axios from "axios"; // Import axios for API requests
import "../styles/sidebar.css"; // Import CSS for sidebar styles

// Import your GeoJSON file
import GeoJSONData from "../data/output.geojson";

// Import the marker image
import markerImage from "../data/marker.png";

const positiveCaseNum = 0;

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
  const googleMapsApiKey = "AIzaSyB5C1aYQpk0q6svZOREnk4tM9mQDP7236A";

  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/${maptilerMapReference}/style.json?key=${maptilerApiKey}`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      minZoom: 2,
      maxZoom: 18,
    });

    mapInstance.on("load", () => {
      console.log("Map loaded successfully");

      // Add your map controls
      mapInstance.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "bottom-right"
      );

      const gc = new GeocodingControl({
        apiKey: maptilerApiKey,
        map: mapInstance,
      });
      mapInstance.addControl(gc);
      mapInstance.keyboard.enable();

      // Add the marker image to the map
      const image = new Image();
      image.src = markerImage;

      image.onload = () => {
        mapInstance.addImage("marker", image);
      };

      // Add markers from GeoJSON data
      mapInstance.addSource("markers", {
        type: "geojson",
        data: GeoJSONData,
      });

      mapInstance.addLayer({
        id: "markers",
        type: "symbol",
        source: "markers",
        layout: {
          "icon-image": "marker", // Use the marker image for the icons
          "icon-allow-overlap": true,
          "icon-size": 0.07,
        },
      });

      mapInstance.on("click", (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, {
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
            <button id="sidebar-button">Click Me</button>
          `;

          // Display the information in a popup
          const popup = new maplibregl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .setHTML(popupContent)
            .addTo(mapInstance);

          // Add click event listener to the button within the popup
          popup.getElement().addEventListener("click", () => {
            setShowSidebar(true);
          });
        } else {
          const { lng, lat } = e.lngLat;
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`;

          axios
            .get(url)
            .then((response) => {
              const results = response.data.results;
              if (results && results.length > 0) {
                // Find the address component containing the postal code
                const postalCodeComponent = results[0].address_components.find(
                  (component) => component.types.includes("postal_code")
                );

                const postalCode = postalCodeComponent
                  ? postalCodeComponent.short_name
                  : "No zipcode found";

                const description = `
                  <div class="custom-popup">
                    <h1>${positiveCaseNum} cases found in zipcode ${postalCode}</h1>
                    <p>Log a Positive Case</p>
                  </div>`;

                new maplibregl.Popup()
                  .setLngLat([lng, lat])
                  .setHTML(description)
                  .addTo(mapInstance);
              } else {
                console.error("No results found for the provided coordinates");
              }
            })
            .catch((error) =>
              console.error("Error fetching the address:", error)
            );
        }
      });
    });

    // Handle errors
    mapInstance.on("error", (error) => {
      console.error("An error occurred while loading the map:", error);
    });

    map.current = mapInstance;

    return () => map.current && map.current.remove();
  }, []);

  return (
    <>
      <NavBar /> {/* Include NavBar component here */}
      <div
        id="map"
        ref={mapContainer}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
      {showSidebar && (
        <div className="sidebar">
          {/* Content of your sidebar */}
          <h2>Sidebar Content</h2>
          <p>This is the sidebar that pops up when you click the button.</p>
        </div>
      )}
    </>
  );
};

export default Map;
