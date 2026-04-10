"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { envConfig } from "@/configs/env.config";

const MAPBOX_TOKEN = envConfig.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v12";
const DEFAULT_CENTER: [number, number] = [105.8542, 21.0285]; // [lng, lat] Hà Nội
const DEFAULT_ZOOM = 13;
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export interface PickedLocation {
  lat: number;
  lng: number;
  name: string;
}

interface LocationPickerProps {
  value?: PickedLocation | null;
  onChange?: (val: PickedLocation | null) => void;
  defaultCenter?: { lat: number; lng: number };
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type: string;
  class: string;
}

export function LocationPicker({
  value,
  onChange,
  defaultCenter,
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
    value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : null
  );
  const [placeName, setPlaceName] = useState(value?.name ?? "");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes
  useEffect(() => {
    if (value?.lat && value?.lng) {
      setMarkerPos({ lat: value.lat, lng: value.lng });
      setPlaceName(value.name ?? "");
    }
  }, [value]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const center: [number, number] = defaultCenter
      ? [defaultCenter.lng, defaultCenter.lat]
      : DEFAULT_CENTER;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      language: "vi",
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "bottom-right"
    );

    map.on("load", () => setMapReady(true));

    // Restore marker from initial value
    if (value?.lat && value?.lng) {
      const el = document.createElement("div");
      el.style.cssText =
        "width:16px;height:16px;background:#0d9488;border-radius:50%;border:2px solid white;cursor:pointer;";
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([value.lng, value.lat])
        .addTo(map);
      markerRef.current = marker;
    }

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker when position changes
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    markerRef.current?.remove();

    if (!markerPos) return;

    const el = document.createElement("div");
    el.style.cssText =
      "width:16px;height:16px;background:#0d9488;border-radius:50%;border:2px solid white;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.3);";

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([markerPos.lng, markerPos.lat])
      .addTo(mapRef.current);

    markerRef.current = marker;
  }, [mapReady, markerPos]);

  // Search using Nominatim (OpenStreetMap) — covers Vietnamese universities & POIs well
  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        format: "json",
        limit: "8",
        countrycodes: "vn",
        addressdetails: "1",
        "accept-language": "vi",
      });
      const res = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: {
          "Accept-Language": "vi",
          "User-Agent": "StudentActivityPortal/1.0",
        },
      });
      if (!res.ok) throw new Error("Search failed");
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchPlaces(val);
    }, 400);
  };

  const selectSuggestion = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const name = result.display_name;

    mapRef.current?.flyTo({ center: [lng, lat], zoom: 16 });

    setMarkerPos({ lat, lng });
    setPlaceName(name);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    onChange?.({ lat, lng, name });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      selectSuggestion(suggestions[0]);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Reverse geocode using Nominatim (better POI coverage than Mapbox for Vietnam)
  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lng),
        format: "json",
        addressdetails: "1",
        "accept-language": "vi",
      });
      const res = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: {
          "Accept-Language": "vi",
          "User-Agent": "StudentActivityPortal/1.0",
        },
      });
      const data = await res.json();
      return data[0]?.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }, []);

  const handleMapClick = useCallback(
    async (e: mapboxgl.MapMouseEvent) => {
      const lngLat = e.lngLat;
      const pos = { lat: lngLat.lat, lng: lngLat.lng };
      setMarkerPos(pos);

      const name = await reverseGeocode(lngLat.lng, lngLat.lat);
      setPlaceName(name);
      setSearchQuery("");
      setShowSuggestions(false);
      onChange?.({ lat: pos.lat, lng: pos.lng, name });
    },
    [reverseGeocode, onChange]
  );

  // Attach click listener after map is ready
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    mapRef.current.on("click", handleMapClick as (e: mapboxgl.MapLayerMouseEvent) => void);
    return () => {
      mapRef.current?.off("click", handleMapClick as (e: mapboxgl.MapLayerMouseEvent) => void);
    };
  }, [mapReady, handleMapClick]);

  const handleClear = () => {
    setMarkerPos(null);
    setPlaceName("");
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    onChange?.(null);
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="border rounded p-4 bg-yellow-50 text-sm text-yellow-700">
        <p className="font-medium mb-1">Chưa có Mapbox Access Token</p>
        <p className="text-xs">
          Thêm{" "}
          <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> vào file{" "}
          <code className="bg-yellow-100 px-1 rounded">.env.local</code> để bật bản đồ.
          <br />
          Lấy token tại:{" "}
          <a
            href="https://account.mapbox.com/access-tokens/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Mapbox Account
          </a>{" "}
          — Free 50K loads/tháng, không cần thẻ.
        </p>
      </div>
    );
  }

  // Icon cho từng loại kết quả
  const getIcon = (result: NominatimResult) => {
    const iconClass = "w-3.5 h-3.5 mt-0.5 shrink-0";
    if (result.class === "amenity" || result.type === "university" || result.type === "college") {
      return (
        <svg className={`${iconClass} text-teal-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    }
    if (result.class === "building" || result.type === "hotel" || result.type === "hospital") {
      return (
        <svg className={`${iconClass} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    }
    return (
      <svg className={`${iconClass} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  };

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          placeholder="Tìm địa điểm (VD: Học viện Ngân hàng, ĐH Bách Khoa)..."
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 pr-8"
          autoComplete="off"
        />
        {searchLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => selectSuggestion(result)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 border-b border-gray-100 last:border-b-0 flex items-start gap-2"
              >
                {getIcon(result)}
                <span className="text-gray-700 leading-tight line-clamp-2">
                  {result.display_name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {showSuggestions && suggestions.length === 0 && !searchLoading && searchQuery.trim() && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg px-3 py-2 text-sm text-gray-400 text-center">
            Không tìm thấy kết quả
          </div>
        )}
      </div>

      {/* Map container */}
      <div
        ref={mapContainer}
        className="w-full rounded overflow-hidden"
        style={{ height: 260 }}
      />

      {/* Selected info */}
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 flex-1">
          {markerPos ? (
            <>
              <span className="font-medium text-teal-700">Đã chọn: </span>
              {placeName || `${markerPos.lat.toFixed(5)}, ${markerPos.lng.toFixed(5)}`}
            </>
          ) : (
            <span className="text-gray-400">
              Nhấn vào bản đồ hoặc gõ địa chỉ để chọn địa điểm
            </span>
          )}
        </div>
        {markerPos && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-500 hover:underline shrink-0"
          >
            Xóa
          </button>
        )}
      </div>
    </div>
  );
}
