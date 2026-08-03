import { latLngToCell, cellToBoundary, gridDisk } from 'h3-js';

export interface H3CellInfo {
  h3Index: string;
  resolution: number;
  boundaryCoords: [number, number][]; // [lat, lng] array
  centerLat: number;
  centerLng: number;
}

// Uber H3 Spatial Resolution (Res 9 ~ 100m hex cell, ideal for urban campus AR games)
export const DEFAULT_H3_RESOLUTION = 9;

/**
 * Converts GPS lat/lng into an Uber H3 Hexagonal Cell Index string in O(1) time
 */
export function getH3IndexFromLatLng(lat: number, lng: number, resolution = DEFAULT_H3_RESOLUTION): string {
  try {
    return latLngToCell(lat, lng, resolution);
  } catch (err) {
    console.error('Error calculating H3 cell:', err);
    return '892a1008007ffff';
  }
}

/**
 * Retrieves the 6 boundary lat/lng vertices of an H3 Hexagon for Leaflet/Polygon rendering
 */
export function getH3CellBoundary(h3Index: string): [number, number][] {
  try {
    const boundary = cellToBoundary(h3Index);
    return boundary as [number, number][];
  } catch (err) {
    console.error('Error fetching H3 boundary:', err);
    return [];
  }
}

/**
 * Gets a k-ring disk of surrounding H3 Hexagonal cells around player location in O(1)
 */
export function getSurroundingH3Cells(lat: number, lng: number, kRing = 2, resolution = DEFAULT_H3_RESOLUTION): H3CellInfo[] {
  const centerCell = getH3IndexFromLatLng(lat, lng, resolution);
  let cellArray: string[] = [centerCell];
  
  try {
    cellArray = gridDisk(centerCell, kRing);
  } catch (err) {
    console.error('Error in H3 gridDisk:', err);
  }

  return cellArray.map((cellId) => {
    const boundary = getH3CellBoundary(cellId);
    // calculate centroid
    const lats = boundary.map((b) => b[0]);
    const lngs = boundary.map((b) => b[1]);
    const centerLat = lats.reduce((a, b) => a + b, 0) / (lats.length || 1);
    const centerLng = lngs.reduce((a, b) => a + b, 0) / (lngs.length || 1);

    return {
      h3Index: cellId,
      resolution,
      boundaryCoords: boundary,
      centerLat: parseFloat(centerLat.toFixed(5)),
      centerLng: parseFloat(centerLng.toFixed(5)),
    };
  });
}
