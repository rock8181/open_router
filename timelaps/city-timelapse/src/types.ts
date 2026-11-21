export interface Building {
  id: number;
  lat: number;
  lon: number;
  height: number | null;
  width: number | null;
  depth: number | null;
  levels: number | null;
  builtYear: number | null;
  name: string | null;
}

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  centerLat: number;
  centerLon: number;
}