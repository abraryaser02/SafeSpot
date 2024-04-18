import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { GeocodingControl } from "@maptiler/geocoding-control/maplibregl";
import "@maptiler/geocoding-control/style.css";
import "../styles/searchBar.css";
import "../styles/sidebar.css";
import "../styles/map.css";
import axios from "axios";
import AddSongSideBar from "./AddSongSideBar";

import postData from "../data/posts.geojson";
import musicNote from "../assets/musicnote.png";
import SongPostSideBar from "./SongPostSideBar";

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

  const [showAddSongSidebar, setShowAddSongSidebar] = useState(false);
  const [showSongPostSidebar, setShowSongPostSidebar] = useState(false);
  const [sidebarPostalCode, setSidebarPostalCode] = useState("");
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

      // if user clicks on the map
      mapInstance.on("click", (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ["musicNotePins"],
        });

        const tempSourceId = "tempMusicNote";
        const tempLayerId = "tempMusicNoteLayer";

        // if user clicks on the music note
        if (features.length > 0) {
          if (mapInstance.getLayer(tempLayerId)) {
            mapInstance.removeLayer(tempLayerId);
            mapInstance.removeSource(tempSourceId);
          }
          setShowSongPostSidebar(true);
          setShowAddSongSidebar(false);
          console.log("Music note clicked");
        } else {
          // if user clicks on an empty space
          const { lng, lat } = e.lngLat;

          if (mapInstance.getLayer(tempLayerId)) {
            mapInstance.removeLayer(tempLayerId);
            mapInstance.removeSource(tempSourceId);
          }

          mapInstance.addSource(tempSourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [lng, lat],
              },
            },
          });

          mapInstance.addLayer({
            id: tempLayerId,
            type: "symbol",
            source: tempSourceId,
            layout: {
              "icon-image": "musicNote",
              "icon-allow-overlap": true,
              "icon-size": 1,
            },
          });

          // Pulls up add song sidebar
          setShowAddSongSidebar(true);
          setShowSongPostSidebar(false);
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
      setShowAddSongSidebar(true);
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
        setNotes("");
        setShowAddSongSidebar(false);
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
      {showAddSongSidebar && (
        <AddSongSideBar
          closeAddSongSidebar={() => setShowAddSongSidebar(false)}
        />
      )}
      {showSongPostSidebar && (
        <SongPostSideBar
          closeSongPostSidebar={() => setShowSongPostSidebar(false)}
        />
      )}
    </>
  );
};

export default Map;
