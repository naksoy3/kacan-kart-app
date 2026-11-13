import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import * as Location from "expo-location";

type Coordinate = { latitude: number; longitude: number };
type SearchResult = { place_id: number; display_name: string; lat: string; lon: string };

type LocationPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [coordinate, setCoordinate] = useState<Coordinate | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const reverseGeocode = async (point: Coordinate) => {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(point.latitude),
      lon: String(point.longitude),
      "accept-language": "tr",
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
    if (!response.ok) throw new Error("Konum adı alınamadı.");
    const result = (await response.json()) as { display_name?: string };
    return result.display_name || `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
  };

  const selectCoordinate = async (point: Coordinate) => {
    setCoordinate(point);
    setBusy(true);
    setMessage("");
    try {
      const place = await reverseGeocode(point);
      onChange(place);
      setQuery(place);
      setMessage("Konum seçildi.");
    } catch {
      const coordinates = `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
      onChange(coordinates);
      setQuery(coordinates);
      setMessage("Konum koordinat olarak seçildi.");
    } finally {
      setBusy(false);
    }
  };

  const searchPlaces = async () => {
    if (!query.trim()) return;
    setBusy(true);
    setMessage("");
    setResults([]);
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        format: "jsonv2",
        limit: "6",
        addressdetails: "1",
        "accept-language": "tr",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      if (!response.ok) throw new Error("Arama başarısız.");
      const places = (await response.json()) as SearchResult[];
      setResults(places);
      setMessage(places.length ? `${places.length} konum bulundu.` : "Konum bulunamadı.");
    } catch {
      setMessage("Konum aranamadı. Haritadan bir nokta seçebilirsin.");
    } finally {
      setBusy(false);
    }
  };

  const useCurrentLocation = async () => {
    setBusy(true);
    setMessage("");
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setMessage("Konum izni verilmedi.");
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await selectCoordinate({ latitude: current.coords.latitude, longitude: current.coords.longitude });
      setMessage("Mevcut konumun seçildi.");
    } catch {
      setMessage("Mevcut konum alınamadı.");
    } finally {
      setBusy(false);
    }
  };

  const chooseResult = (result: SearchResult) => {
    const point = { latitude: Number(result.lat), longitude: Number(result.lon) };
    setCoordinate(point);
    onChange(result.display_name);
    setQuery(result.display_name);
    setResults([]);
    setMessage("Konum seçildi.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => void searchPlaces()}
          placeholder="Şehir, adres veya mekan ara"
          placeholderTextColor="#96989D"
          returnKeyType="search"
          style={styles.searchInput}
        />
        <Pressable onPress={() => void searchPlaces()} disabled={busy} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Ara</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => void useCurrentLocation()} disabled={busy} style={styles.locationButton}>
        {busy ? <ActivityIndicator color="#9BE0BE" size="small" /> : <Text style={styles.locationButtonText}>Konumumu bul</Text>}
      </Pressable>
      {results.length ? (
        <ScrollView style={styles.results} keyboardShouldPersistTaps="handled">
          {results.map((result) => (
            <Pressable key={result.place_id} onPress={() => chooseResult(result)} style={styles.result}>
              <Text style={styles.resultText}>{result.display_name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <MapView
        style={styles.map}
        initialRegion={{ latitude: 39, longitude: 35, latitudeDelta: 12, longitudeDelta: 12 }}
        region={coordinate ? { ...coordinate, latitudeDelta: 0.08, longitudeDelta: 0.08 } : undefined}
        onPress={(event) => void selectCoordinate(event.nativeEvent.coordinate)}
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
        {coordinate ? <Marker coordinate={coordinate} title={value || "Seçilen konum"} /> : null}
      </MapView>
      <View style={styles.mapFooter}>
        <Text numberOfLines={2} style={styles.locationText}>{busy ? "Konum aranıyor..." : value || message || "Haritaya dokun veya konum ara"}</Text>
        {value ? <Pressable onPress={() => { setCoordinate(null); setQuery(""); setResults([]); onChange(""); setMessage(""); }}><Text style={styles.clearText}>Temizle</Text></Pressable> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 9 },
  searchRow: { flexDirection: "row", gap: 8 },
  searchInput: { flex: 1, minHeight: 48, paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: "#3B3D41", backgroundColor: "#2A2C30", color: "#F5F1E9", fontSize: 14 },
  searchButton: { justifyContent: "center", paddingHorizontal: 15, borderRadius: 12, backgroundColor: "#9BE0BE" },
  searchButtonText: { color: "#17181B", fontSize: 13, fontWeight: "800" },
  locationButton: { minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: 11, borderWidth: 1, borderColor: "#3B3D41" },
  locationButtonText: { color: "#9BE0BE", fontSize: 12, fontWeight: "700" },
  results: { maxHeight: 150, borderRadius: 11, borderWidth: 1, borderColor: "#3B3D41", backgroundColor: "#222428" },
  result: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#3B3D41" },
  resultText: { color: "#F5F1E9", fontSize: 12, lineHeight: 18 },
  map: { height: 220, overflow: "hidden", borderRadius: 14 },
  mapFooter: { minHeight: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  locationText: { flex: 1, color: "#96989D", fontSize: 11 },
  clearText: { color: "#9BE0BE", fontSize: 11, fontWeight: "700" },
});