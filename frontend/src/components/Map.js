import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { GeocodingControl } from "@maptiler/geocoding-control/maplibregl";
import "@maptiler/geocoding-control/style.css";
import "../styles/searchBar.css";
import "../styles/sidebar.css";
import "../styles/map.css";
import axios from "axios";
import SideBar from "./SideBar";

import postData from "../data/posts.geojson";
import musicNote from "../assets/musicnote.png";

const maptilerApiKey = "UHRJl9L3oK7bh3QT6De6";
const maptilerMapReference = "99cf5fa2-3c1e-4adf-a1c1-fd879b417597";
const googleMapsApiKey = "AIzaSyB5C1aYQpk0q6svZOREnk4tM9mQDP7236A";

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const initialState = {
    lng: -117.71319812050054,
    lat: 34.099885457669316,
    zoom: 16.5,
  };

  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarPostalCode, setSidebarPostalCode] = useState("");
  const [drugType, setDrugType] = useState("");
  const [notes, setNotes] = useState("");

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

      const image = new Image();
      image.src = musicNote;
      image.onload = () => {
        mapInstance.addImage("musicNote", image);

        mapInstance.addSource("musicNotes", {
          type: "geojson",
          data: postData,
        });

        mapInstance.addLayer({
          id: "musicNotePins",
          type: "symbol",
          source: "musicNotes",
          layout: {
            "icon-image": "musicNote",
            "icon-allow-overlap": true,
            "icon-size": 1,
          },
        });
      };

      mapInstance.on("click", (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ["musicNotes"],
        });

        if (features.length > 0) {
          const feature = features[0];
          const properties = feature.properties;

          const popupContent = `
                        <h3>${properties["Program Name"]}</h3>
                        <p>Address: ${properties["Street Address 1"]}, ${properties["City"]}, ${properties["State"]} ${properties["Zip"]}</p>
                        <p>Phone: ${properties["Phone"]}</p>
                    `;

          new maplibregl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .setHTML(popupContent)
            .addTo(mapInstance);
        } else {
          const { lng, lat } = e.lngLat;
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`;

          axios
            .get(url)
            .then((response) => {
              const results = response.data.results;
              if (results && results.length > 0) {
                const postalCodeComponent = results[0].address_components.find(
                  (component) => component.types.includes("postal_code")
                );
                const postalCode = postalCodeComponent
                  ? postalCodeComponent.short_name
                  : "No zipcode found";
                const backendUrl = `http://localhost:8800/api/reports/${postalCode}`;

                axios
                  .get(backendUrl)
                  .then((backendResponse) => {
                    const positiveCaseNum = backendResponse.data.length;
                    const description = `
                    <div class="custom-popup">
                    <h1>${positiveCaseNum} cases found in zipcode ${postalCode}</h1>
                    <button class="report-positive-btn" onclick="openSidebar('${postalCode}')">Log a Positive Case</button>
                </div>
            `;

                    new maplibregl.Popup()
                      .setLngLat([lng, lat])
                      .setHTML(description)
                      .addTo(mapInstance);
                  })
                  .catch((backendError) => {
                    console.error(
                      "Error fetching data from backend:",
                      backendError
                    );
                    const description = `
                                            <div class="custom-popup">
                                                <h1>0 cases found in zipcode ${postalCode}</h1>
                                                <button class="report-positive-btn" onclick="openSidebar('${postalCode}')">Log a Positive Case</button>
                                            </div>`;

                    new maplibregl.Popup()
                      .setLngLat([lng, lat])
                      .setHTML(description)
                      .addTo(mapInstance);
                  });
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

    mapInstance.on("error", (error) => {
      console.error("An error occurred while loading the map:", error);
    });

    map.current = mapInstance;

    // Function to open the sidebar
    window.openSidebar = (postalCode) => {
      setSidebarPostalCode(postalCode);
      setShowSidebar(true);
    };

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create JSON object with the selected drug type, notes, zip code, and reportedAt timestamp
    const reportData = {
      drugType: drugType,
      notes: notes,
      zipCode: sidebarPostalCode,
      reportedAt: new Date().toISOString(),
    };

    // Submit the report data to your backend API
    axios
      .post("http://localhost:8800/api/reports", reportData)
      .then((response) => {
        console.log("Report submitted successfully:", response.data);
        // Optionally, you can reset the form fields or close the sidebar after successful submission
        setDrugType("");
        setNotes("");
        setShowSidebar(false);
      })
      .catch((error) => {
        console.error("Error submitting report:", error);
        // Handle error, display error message, etc.
      });
  };

  return (
    <>
      <div
        id="map"
        ref={mapContainer}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
      {showSidebar && <SideBar closeSidebar={() => setShowSidebar(false)} />}
    </>
  );
};

export default Map;
