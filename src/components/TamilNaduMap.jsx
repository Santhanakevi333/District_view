import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapControl from "./MapControl";
import { jsx } from "react/jsx-runtime";

const TamilNaduMap = () => {
  const [districts, setDistricts] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    fetch("/tamilnadu_districts.geojson")
      .then((res) => res.json())
      .then(data => {
      console.log("Loaded GeoJSON:", data);
      setDistricts(data);
      });
  }, []);

  // Styles
  const defaultStyle = {
    fillColor: "#3388ff",
    weight: 1,
    opacity: 1,
    color: "white",
    fillOpacity: 0.5,
  };

  const highlightStyle ={
    fillColor: "#ff6b00",
    weight: 2,
    color: "#ff7800",
    fillOpacity: 0.9,
  };

  const blurStyle = {
    fillColor: "#cccccc",
    weight: 0.5,
    color: "#999999",
    fillOpacity: 0.2,
  };

const generateSVGPath = (coordinates)=>{
  const flattenCoords = [];
  if(!coordinates || !coordinates.length) return "";

  if(typeof  coordinates[0][0][0] === "number"){
    flattenCoords.push(...coordinates[0]);
  }else{
    coordinates.forEach(polygon => {
      flattenCoords.push(...polygon[0]);
    });
  }
  if(!flattenCoords.length) return "";

  const scale = 100;

  const lats = flattenCoords.map(c=>c[1]);
  const lngs = flattenCoords.map(c => c[0]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const normalize = ([lng, lat]) => {
    return [
      ((lng - minLng)/(maxLng - minLng)) * scale,
      scale - ((lat - minLat) / (maxLat - minLat)) * scale
    ];
  };
  const path = flattenCoords.map((coord, index)=>{
    const [X, y] = normalize(coord);
    return `${index === 0 ? "M" : "L"}${X},${y}`;
  })
  .join(" ") + " z";
  return path;
}
 


  // Filter functions
  const isSelected = (feature) => {
    const name = feature.properties.Dist_Name || feature.properties.district;
    console.log("Checking feature:", name,"vs selected",selectedDistrict)
    return !selectedDistrict || name === selectedDistrict;
  };

  const isNotSelected = (feature) => {
    if (!selectedDistrict) return false;
    const name = feature.properties.Dist_Name || feature.properties.district;
  
    return name !== selectedDistrict;
  };

  const onEachDistrict = (feature, layer) => {
    const name = feature.properties.Dist_Name || "Unknown District";

    layer.bindPopup(`<b>${name}</b>`);

    layer.on({
      click: () => {
        setSelectedDistrict(name); // select clicked district
        // layer.openPopup();
        const coordinates = feature.geometry.coordinates;
        const svgPath = generateSVGPath(coordinates);

        const popupContent = `<div>
        <b>${name}<b></br>
        <svg width="200" height="200" viewBox="0 0 100 100">
        <path d="${svgPath}" fill="#ff7800" stroke="#333" stroke-width="0.5"/>
        </svg>
        </div>`;
        layer.bindPopup(popupContent).openPopup();
      },
      mouseover: (e) => {
        if (!selectedDistrict || name === selectedDistrict) {
          e.target.setStyle({ weight: 2, fillColor: "#ff6b00" });
        }
      },
      mouseout: (e) => {
        if (!selectedDistrict || name === selectedDistrict) {
          e.target.setStyle({ weight: 1, fillColor: "#3388ff" });
        }
      },
    });
  };

  return (
    <div className="h-screen relative">
    <button onClick={()=>setSelectedDistrict(null)} 
      className="absolute z-[1000] top-4 right-4 font-semibold text-white bg-green-500 border border-gray-400 px-3 py-2 rounded shadow hover:bg-green-600">Back to View</button>
      <MapContainer
        center={[10.85, 78.7]}
        zoom={7}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <MapControl selectedDistrict={selectedDistrict}/>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Show selected district with highlight */}
        {districts && selectedDistrict && (
          <GeoJSON
            data={{
              ...districts,
              features: districts.features.filter(isSelected),
            }}
            style={highlightStyle}
            onEachFeature={onEachDistrict}
          />
        )}

        {/* Show other districts as blurred */}
        {districts && selectedDistrict && (
          <GeoJSON
            data={{
              ...districts,
              features: districts.features.filter(isNotSelected),
            }}
            style={blurStyle}
          />
        )}

        {/* Show all if none selected */}
        {districts && !selectedDistrict && (
          <GeoJSON
            data={districts}
            style={defaultStyle}
            onEachFeature={onEachDistrict}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default TamilNaduMap;
