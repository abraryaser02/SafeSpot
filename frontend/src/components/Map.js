import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { GeocodingControl } from "@maptiler/geocoding-control/maplibregl";
// import "@maptiler/geocoding-control/dist/style.css";

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
