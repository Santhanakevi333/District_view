import { useEffect } from "react";
import { useMap } from "react-leaflet";


const MapControl = ({selectedDistrict}) => {
    const map = useMap();

    useEffect(()=>{
        if (!selectedDistrict){
            map.flyTo([10.85, 78.7], 7);
        }
    },[selectedDistrict, map]);

    return null;
}

export default MapControl;