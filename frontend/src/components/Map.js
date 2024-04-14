import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import axios from "axios"; // Import axios for API requests

import "maplibre-gl/dist/maplibre-gl.css";
import { GeocodingControl } from "@maptiler/geocoding-control/maplibregl";
import "@maptiler/geocoding-control/style.css";
import "../styles/searchBar.css";

const postiveCaseNum = 0;

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
    if (!mapContainer.current) return; // Exit if mapContainer is not initialized

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/${maptilerMapReference}/style.json?key=${maptilerApiKey}`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      minZoom: 2,
      maxZoom: 18,
    });

    mapInstance.on("load", () => {
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
    });

    mapInstance.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${maptilerApiKey}`;

      axios
        .get(url)
        .then((response) => {
          const properties = response.data.features[0].properties;
          const postcode = properties.postcode || "No zipcode found";
          const description = `
    <div class="custom-popup">
        <h1>${postiveCaseNum} cases found in zipcode ${postcode}</h1>
        <p>Log a Positive Case</p>
        <button onclick="console.log('Button clicked!')">Click Me</button>
    </div>`;

          new maplibregl.Popup()
            .setLngLat([lng, lat])
            .setHTML(description)
            .addTo(mapInstance);
        })
        .catch((error) => console.error("Error fetching the zipcode:", error));
    });

    map.current = mapInstance;

    return () => map.current && map.current.remove();
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
