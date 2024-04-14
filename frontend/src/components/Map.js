import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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
      map.current.keyboard.enable();

      //   map.current.addSource("moments", {
      //     type: "geojson",
      //     data: moments,
      //   });

      //   map.current.loadImage(
      //     "src/lib/assets/Musicnotes.png",
      //     async function (error, image) {
      //       if (error) throw error;
      //       map.current.addImage("Musicnotes", image);
      //       console.log("image loaded");
      //     }
      //   );

      //   map.current.addLayer({
      //     id: "moments-layer",
      //     type: "symbol",
      //     source: "moments",
      //     layout: {
      //       "icon-image": "Musicnotes",
      //       "icon-size": ["*", ["get", "scalerank"], 0.001],
      //       "icon-allow-overlap": true,
      //     },
      //     paint: {},
      //   });

      //   map.current.on("click", "moments-layer", async function (e) {
      //     if (e.features && e.features.length > 0) {
      //       const feature = e.features[0];
      //       if (feature.geometry.type === "Point") {
      //         const coordinates = feature.geometry.coordinates;
      //         const id = feature.properties.id;
      //         const momentInfo = await getMomentText(id);
      //         if (coordinates.length === 2) {
      //           const popupContent = `<strong>Song:</strong> ${momentInfo.song}<br><strong>Note:</strong> ${momentInfo.description}`;
      //           new maplibregl.Popup()
      //             .setLngLat(coordinates)
      //             .setHTML(popupContent)
      //             .addTo(map.current);
      //         } else {
      //           console.error("Invalid coordinates format");
      //         }
      //       }
      //     }
      //   });

      //   map.current.on("mouseenter", "moments-layer", function () {
      //     map.current.getCanvas().style.cursor = "pointer";
      //   });

      //   map.current.on("mouseleave", "moments-layer", function () {
      //     map.current.getCanvas().style.cursor = "";
      //   });
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
