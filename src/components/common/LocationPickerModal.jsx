import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Loader2, MapPin, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import CustomButton from "@/components/common/Buttons/CustomButton";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_LOCATION = {
  lat: 28.6139,
  lng: 77.209,
};

const ChangeMapView = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position?.lat && position?.lng) {
      map.setView([position.lat, position.lng], 16);
    }
  }, [position, map]);

  return null;
};

const LocationMarker = ({ position, onChange }) => {
  useMapEvents({
    click(e) {
      onChange({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  if (!position) return null;

  return (
    <Marker
      position={[position.lat, position.lng]}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const latLng = marker.getLatLng();

          onChange({
            lat: latLng.lat,
            lng: latLng.lng,
          });
        },
      }}
    />
  );
};

const LocationPickerModal = ({ open, onClose, onSelect }) => {
  const [position, setPosition] = useState(DEFAULT_LOCATION);
  const [search, setSearch] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const fetchAddressFromLatLng = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      const data = await response.json();

      setSelectedAddress(data?.display_name || "");

      return data;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      setSelectedAddress("");
      return null;
    }
  };

  const updatePosition = async (newPosition) => {
    setPosition(newPosition);
    await fetchAddressFromLatLng(newPosition.lat, newPosition.lng);
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) return;

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (location) => {
        const currentPosition = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };

        await updatePosition(currentPosition);
        setIsDetecting(false);
      },
      (error) => {
        console.error("Location permission denied:", error);
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  useEffect(() => {
    if (open) {
      detectCurrentLocation();
    }
  }, [open]);

  const handleSearchLocation = async () => {
    if (!search.trim()) return;

    try {
      setIsSearching(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          search
        )}`
      );

      const data = await response.json();

      if (data?.length > 0) {
        const searchedPosition = {
          lat: Number(data[0].lat),
          lng: Number(data[0].lon),
        };

        setSelectedAddress(data[0].display_name || "");
        setPosition(searchedPosition);
      }
    } catch (error) {
      console.error("Location search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseLocation = () => {
    onSelect({
      lat: position.lat,
      lng: position.lng,
      address: selectedAddress,
    });

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Pick Fitter Location
            </h2>
            <p className="text-sm text-slate-500">
              Search, click on map, or drag marker to select exact location.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b p-4">
          <div className="flex gap-2">
            <Input
              value={search}
              placeholder="Search location, city, landmark..."
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchLocation();
                }
              }}
            />

            <CustomButton
              type="button"
              onClick={handleSearchLocation}
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </CustomButton>

            <CustomButton
              type="button"
              variant="outline"
              onClick={detectCurrentLocation}
              disabled={isDetecting}
            >
              {isDetecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-4 w-4" />
              )}
              Current
            </CustomButton>
          </div>
        </div>

        <div className="h-[320px]">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={13}
            className="h-full w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ChangeMapView position={position} />

            <LocationMarker position={position} onChange={updatePosition} />
          </MapContainer>
        </div>

        <div className="flex flex-col gap-4 border-t px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 text-sm">
            <p className="font-medium text-slate-900">
              Selected Location
            </p>

            <p className="mt-1 line-clamp-2 text-slate-500">
              {selectedAddress || "Address not available"}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Lat: {position.lat.toFixed(6)} | Lng:{" "}
              {position.lng.toFixed(6)}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <CustomButton type="button" variant="outline" onClick={onClose}>
              Cancel
            </CustomButton>

            <CustomButton type="button" onClick={handleUseLocation} disabled={isDetecting||isSearching}>
              Use This Location
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;