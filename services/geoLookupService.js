/**
 * Geospatial Lookup Service
 * 
 * Loads the soil mapping unit GeoJSON at server startup and provides
 * a fast point-in-polygon lookup to determine which soil unit contains
 * a given coordinate.
 */

const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

class GeoLookupService {
  constructor() {
    this.geojson = null;
    this.isLoaded = false;
  }

  /**
   * Load the GeoJSON file into memory
   * Call this once when the server starts
   */
  loadGeoJSON() {
    const geojsonPath = path.join(__dirname, '../data/landiq_soil_data.geojson');

    if (!fs.existsSync(geojsonPath)) {
      throw new Error(`GeoJSON file not found at ${geojsonPath}`);
    }

    const geojsonContent = fs.readFileSync(geojsonPath, 'utf-8');
    this.geojson = JSON.parse(geojsonContent);
    this.isLoaded = true;

    console.log(`✅ Loaded ${this.geojson.features.length} soil mapping units into memory`);
  }

  /**
   * Find which mapping unit contains the given coordinates
   * 
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {string|null} - mapping_unit string (e.g. "2a") or null if not found
   */
  findMappingUnit(latitude, longitude) {
    if (!this.isLoaded) {
      throw new Error('GeoJSON not loaded. Call loadGeoJSON() first.');
    }

    // Create a point from the coordinates
    const point = turf.point([longitude, latitude]); // Turf uses [lng, lat] order

    // Loop through all features and check if point is inside
    for (const feature of this.geojson.features) {
      
      let isInside = false;

      if (feature.geometry.type === 'Polygon') {
        isInside = turf.booleanPointInPolygon(point, feature);
      } else if (feature.geometry.type === 'MultiPolygon') {
        // For MultiPolygon, check each polygon
        for (const polygon of feature.geometry.coordinates) {
          const tempPolygon = turf.polygon(polygon);
          if (turf.booleanPointInPolygon(point, tempPolygon)) {
            isInside = true;
            break;
          }
        }
      }

      if (isInside) {
        return feature.properties.mapping_unit;
      }
    }

    // No match found
    return null;
  }

  /**
   * Check if coordinates fall within the dataset's geographic bounds
   * Fast pre-check before running the expensive point-in-polygon lookup
   * 
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {boolean}
   */
  isWithinBounds(latitude, longitude) {
    // Bounds from data_summary.json
    const bounds = {
      min_lon: 2.451429629088108,
      min_lat: 4.3919549113228715,
      max_lon: 14.777616251051061,
      max_lat: 13.927350558912927,
    };

    return (
      longitude >= bounds.min_lon &&
      longitude <= bounds.max_lon &&
      latitude >= bounds.min_lat &&
      latitude <= bounds.max_lat
    );
  }
}

const geoLookupService = new GeoLookupService();

module.exports = geoLookupService;