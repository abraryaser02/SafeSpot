import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { GeocodingControl } from "@maptiler/geocoding-control/maplibregl";
import "@maptiler/geocoding-control/style.css";
import "../styles/searchBar.css";
import "../styles/sidebar.css";
import axios from "axios"; // Import axios for API requests

import GeoJSONData from "../data/output.geojson";
import markerImage from "../data/marker.png";
import heatmapData from "../data/heatmap.geojson"; 


const maptilerApiKey = "SbGQ4qpToiGBv5VDdgfc";
const maptilerMapReference = "62541eae-c092-4439-bb8f-ff1d146db515";
const googleMapsApiKey = "AIzaSyB5C1aYQpk0q6svZOREnk4tM9mQDP7236A";


const Map = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const initialState = {
        lng: -118.242432,
        lat: 34.043926,
        zoom: 13,
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
            image.src = markerImage;
            image.onload = () => {
                mapInstance.addImage("marker", image);
            };

            mapInstance.addSource("markers", {
                type: "geojson",
                data: GeoJSONData,
            });

            mapInstance.addLayer({
                id: "markers",
                type: "symbol",
                source: "markers",
                layout: {
                    "icon-image": "marker",
                    "icon-allow-overlap": true,
                    "icon-size": 0.07,
                },
            });

            // Add heatmap layer
            mapInstance.addSource("heatmap", {
              type: "geojson",
              data: heatmapData,
          });

          mapInstance.addLayer({
            id: "heatmapLayer",
            type: "heatmap",
            source: "heatmap",
            paint: {
                "heatmap-weight": [
                    "interpolate",
                    ["linear"],
                    ["get", "intensity"],
                    1, 0,
                    30, 1
                ],
                "heatmap-intensity": 2, // Increased sensitivity
                "heatmap-color": [
                    "interpolate",
                    ["linear"],
                    ["heatmap-density"],
                    0,
                    "rgba(33,102,172,0)",
                    0.2,
                    "rgb(103,169,207)",
                    0.4,
                    "rgb(209,229,240)",
                    0.6,
                    "rgb(253,219,199)",
                    0.8,
                    "rgb(239,138,98)",
                    1,
                    "rgb(178,24,43)"
                ],
                "heatmap-radius": 40, // Increased radius
                "heatmap-opacity": 0.9,
            },
          });


            mapInstance.on("click", (e) => {
                const features = mapInstance.queryRenderedFeatures(e.point, {
                    layers: ["markers"],
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

                    axios.get(url)
                        .then((response) => {
                            const results = response.data.results;
                            if (results && results.length > 0) {
                                const postalCodeComponent = results[0].address_components.find(component => component.types.includes("postal_code"));
                                const postalCode = postalCodeComponent ? postalCodeComponent.short_name : "No zipcode found";
                                const backendUrl = `http://localhost:8800/api/reports/${postalCode}`;

                                axios.get(backendUrl)
                                    .then((backendResponse) => {
                                        const positiveCaseNum = backendResponse.data.length;
                                        const description = `
                                            <div class="custom-popup">
                                                <h1>${positiveCaseNum} cases found in zipcode ${postalCode}</h1>
                                                <button class="report-positive-btn" onclick="openSidebar('${postalCode}')">Log a Positive Case</button>
                                            </div>`;

                                        new maplibregl.Popup()
                                            .setLngLat([lng, lat])
                                            .setHTML(description)
                                            .addTo(mapInstance);
                                    })
                                    .catch((backendError) => {
                                        console.error("Error fetching data from backend:", backendError);
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
                        .catch((error) => console.error("Error fetching the address:", error));
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
          reportedAt: new Date().toISOString()
      };

      // Submit the report data to your backend API
      axios.post('http://localhost:8800/api/reports', reportData)
          .then((response) => {
              console.log('Report submitted successfully:', response.data);
              // Optionally, you can reset the form fields or close the sidebar after successful submission
              setDrugType('');
              setNotes('');
              setShowSidebar(false);
          })
          .catch((error) => {
              console.error('Error submitting report:', error);
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
        {showSidebar && (
            <div className="sidebar">
                {/* Close button */}
                <button className="close-button" onClick={() => setShowSidebar(false)}>
                    &#10005;
                </button>
                {/* Form for reporting a positive case */}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="drugType">Drug Type:</label>
                    <select id="drugType" value={drugType} onChange={(e) => setDrugType(e.target.value)}>
                        <option value="">Select Drug Type</option>
                        <option value="meth">Meth</option>f
                        <option value="cocaine">Cocaine</option>
                        <option value="heroin">Heroin</option>
                        <option value="undefined">Undefined</option>
                    </select>
                    <label htmlFor="notes">Notes:</label>
                    <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
                    <button type="submit">Submit Report</button>
                </form>
            </div>
        )}
    </>
  );
};


export default Map;
