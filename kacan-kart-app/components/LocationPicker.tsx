"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import L from "leaflet";

type LocationPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  type?: string;
};

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const marker = useRef<L.CircleMarker | null>(null);
  const onChangeRef = useRef(onChange);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!mapElement.current || mapInstance.current) return;

    const map = L.map(mapElement.current, { scrollWheelZoom: false }).setView([39.0, 35.0], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    marker.current = L.circleMarker([39.0, 35.0], {
      radius: 9,
      color: "#c7d2fe",
      weight: 3,
      fillColor: "#6366f1",
      fillOpacity: 1,
    }).addTo(map);
    mapInstance.current = map;

    map.on("click", async ({ latlng }) => {
      marker.current?.setLatLng(latlng);
      setBusy(true);
      setMessage("Konum adı bulunuyor...");
      try {
        const params = new URLSearchParams({ format: "jsonv2", lat: String(latlng.lat), lon: String(latlng.lng), "accept-language": "tr" });
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
        if (!response.ok) throw new Error("reverse lookup failed");
        const result = await response.json();
        const place = result.display_name || `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
        onChangeRef.current(place);
        setSearch(place);
        setMessage("Konum seçildi.");
      } catch {
        const place = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
        onChangeRef.current(place);
        setSearch(place);
        setMessage("Koordinat seçildi; konum adı bulunamadı.");
      } finally {
        setBusy(false);
      }
    });

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(mapElement.current);
    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!search.trim()) return;

    setBusy(true);
    setResults([]);
    setMessage("Konum aranıyor...");
    try {
      const params = new URLSearchParams({
        q: search.trim(),
        format: "jsonv2",
        limit: "6",
        addressdetails: "1",
        "accept-language": "tr",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      if (!response.ok) throw new Error("search failed");
      const results = (await response.json()) as NominatimResult[];
      if (results.length === 0) {
        setMessage("Konum bulunamadı. Başka bir arama dene.");
        return;
      }
      setResults(results);
      setMessage(`${results.length} en alakalı konum bulundu. Birini seç.`);
    } catch {
      setMessage("Konum aranamadı. Haritaya tıklayarak seçebilirsin.");
    } finally {
      setBusy(false);
    }
  };

  const selectResult = (result: NominatimResult) => {
    const position: L.LatLngExpression = [Number(result.lat), Number(result.lon)];
    mapInstance.current?.setView(position, 15);
    marker.current?.setLatLng(position);
    onChange(result.display_name);
    setSearch(result.display_name);
    setMessage("Konum seçildi.");
    setResults([]);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Bu tarayıcı konum özelliğini desteklemiyor.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const point: L.LatLngExpression = [coords.latitude, coords.longitude];
      mapInstance.current?.setView(point, 15);
      marker.current?.setLatLng(point);
      setBusy(false);
      const params = new URLSearchParams({ format: "jsonv2", lat: String(coords.latitude), lon: String(coords.longitude), "accept-language": "tr" });
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
        const result = await response.json();
        const place = result.display_name || `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
        onChange(place);
        setSearch(place);
        setMessage("Mevcut konumun seçildi.");
      } catch {
        const place = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
        onChange(place);
        setSearch(place);
        setMessage("Mevcut konum koordinat olarak seçildi.");
      }
    }, () => {
      setBusy(false);
      setMessage("Konum izni alınamadı. Haritadan bir nokta seçebilirsin.");
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  return (
    <section className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <form onSubmit={handleSearch} className="flex min-w-0 flex-1 gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Şehir, adres veya mekan ara"
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
          />
          <button type="submit" disabled={busy} className="rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
            Ara
          </button>
        </form>
        <button type="button" onClick={useMyLocation} disabled={busy} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50">
          Konumumu bul
        </button>
      </div>
      {results.length > 0 && (
        <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/95 p-1 shadow-lg" aria-label="Konum arama sonuçları">
          {results.map((result, index) => {
            const [placeName, ...addressParts] = result.display_name.split(",");
            return (
              <button
                key={result.place_id}
                type="button"
                onClick={() => selectResult(result)}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-indigo-500/15"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-bold text-indigo-200">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-slate-100">{placeName.trim()}</span>
                  <span className="mt-0.5 block line-clamp-2 text-[11px] leading-relaxed text-slate-400">{addressParts.join(",").trim()}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
      <div ref={mapElement} className="h-64 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800" />
      <div className="flex min-h-4 items-center justify-between gap-3 text-[11px] text-slate-400">
        <span>{busy ? "İşleniyor..." : message || (value ? `Seçilen: ${value}` : "Haritaya tıkla veya konum ara")}</span>
        {value && <button type="button" onClick={() => { onChange(""); setSearch(""); setMessage(""); }} className="shrink-0 text-indigo-300 hover:text-indigo-200">Temizle</button>}
      </div>
    </section>
  );
}
