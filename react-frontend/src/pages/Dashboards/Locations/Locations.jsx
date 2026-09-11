import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Bell,
  User,
  ChevronDown,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  RadioTower,
  Layers,
  Maximize,
  Eye,
  BarChart3,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import { fetchFeatures, runPrediction } from "../../../services/api";
import "./Locations.css";


/* =========================================================
   MARKER COLORS
========================================================= */

const markerColors = {
  LOW: "#16a34a",
  MODERATE: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#dc2626",
};


/* =========================================================
   CUSTOM MARKER
========================================================= */

const createMarkerIcon = (riskLevel) => {
  const color = markerColors[riskLevel] || "#1768d8";

  return L.divIcon({
    className: "location-marker-wrapper",

    html: `
      <div
        class="location-marker"
        style="--marker-color:${color};"
      >
        <div class="location-marker-inner"></div>
      </div>
    `,

    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -36],
  });
};


/* =========================================================
   LOCATION DATA

   Backend later can replace this array with API data.
========================================================= */

const locationData = [
  {
    id: 1,
    name: "Selected Location",
    state: "Selected Region",
    lat: 22.5726,
    lng: 88.3639,
    elevation: 1520,
    risk: "HIGH",
    probability: 82,
    updated: "30 Aug 2026, 10:30 AM",
  },

  {
    id: 2,
    name: "Rudraprayag",
    state: "Selected Region",
    lat: 30.2830,
    lng: 79.0670,
    elevation: 895,
    risk: "HIGH",
    probability: 78,
    updated: "30 Aug 2026, 10:28 AM",
  },

  {
    id: 3,
    name: "Chamoli",
    state: "Selected Region",
    lat: 30.4150,
    lng: 79.6030,
    elevation: 1780,
    risk: "HIGH",
    probability: 75,
    updated: "30 Aug 2026, 10:25 AM",
  },

  {
    id: 4,
    name: "Uttarkashi",
    state: "Selected Region",
    lat: 30.7260,
    lng: 78.4360,
    elevation: 1158,
    risk: "MODERATE",
    probability: 58,
    updated: "30 Aug 2026, 10:20 AM",
  },

  {
    id: 5,
    name: "Pauri",
    state: "Selected Region",
    lat: 30.1390,
    lng: 78.8020,
    elevation: 1050,
    risk: "MODERATE",
    probability: 52,
    updated: "30 Aug 2026, 10:15 AM",
  },

  {
    id: 6,
    name: "Pithoragarh",
    state: "Selected Region",
    lat: 29.5850,
    lng: 80.2190,
    elevation: 1640,
    risk: "LOW",
    probability: 28,
    updated: "30 Aug 2026, 10:10 AM",
  },

  {
    id: 7,
    name: "Haridwar",
    state: "Selected Region",
    lat: 29.9450,
    lng: 77.9500,
    elevation: 314,
    risk: "LOW",
    probability: 18,
    updated: "30 Aug 2026, 10:05 AM",
  },

  {
    id: 8,
    name: "Nainital",
    state: "Selected Region",
    lat: 29.3800,
    lng: 79.4630,
    elevation: 2084,
    risk: "LOW",
    probability: 22,
    updated: "30 Aug 2026, 10:02 AM",
  },
];


/* =========================================================
   INDIAN STATES + UNION TERRITORIES
========================================================= */

const states = [
  "All States",

  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Selected Region",
  "West Bengal",

  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];


/* =========================================================
   MAP CONTROLLER
========================================================= */

function MapController({ selectedLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedLocation) return;

    map.flyTo(
      [selectedLocation.lat, selectedLocation.lng],
      9,
      {
        duration: 1,
      }
    );
  }, [selectedLocation, map]);

  return null;
}


/* =========================================================
   LOCATIONS PAGE
========================================================= */

function Locations({ onNavigate }) {
  const [locations, setLocations] = useState(locationData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadRealData() {
      setLoading(true);
      try {
        const updated = await Promise.all(
          locationData.map(async (loc) => {
            try {
              const features = await fetchFeatures(loc.lat, loc.lng);
              if (features.error) return loc;

              const payload = {
                latitude: loc.lat,
                longitude: loc.lng,
                rainfall_mm_hr: features.rainfall_mm_hr ?? 0,
                elevation_m: features.elevation_m ?? 0,
                slope_degree: features.slope_degree ?? 0,
                rain_1h: features.rain_1h ?? 0,
                rain_3h: features.rain_3h ?? 0,
                rain_6h: features.rain_6h ?? 0,
                rain_12h: features.rain_24h ?? 0,
                rain_24h: features.rain_24h ?? 0,
                rainfall_change: features.rainfall_change ?? 0,
              };

              const prediction = await runPrediction(payload);
              return {
                ...loc,
                probability: Math.round(prediction.flood_probability * 100),
                risk: prediction.risk_level === "MEDIUM" ? "MODERATE" : prediction.risk_level,
                elevation: Math.round(features.elevation_m ?? 0),
                updated: "Live ML Model",
              };
            } catch {
              return loc;
            }
          })
        );
        setLocations(updated);
        setSelectedLocation(updated[0]);
      } catch (err) {
        console.error("Failed to load location ML data", err);
      } finally {
        setLoading(false);
      }
    }
    loadRealData();
  }, []);

  const [state, setState] = useState("All States");
  const [riskLevel, setRiskLevel] = useState("All Levels");

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [selectedLocation, setSelectedLocation] = useState(locations[0]);

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;


  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };


  /* =======================================================
     SEARCH SUGGESTIONS
  ======================================================= */

  const stateSuggestions = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return states
      .filter((item) => item !== "All States")
      .filter((item) =>
        item.toLowerCase().startsWith(value)
      )
      .slice(0, 6);
  }, [search]);


  /* =======================================================
     FILTER DATA
  ======================================================= */

  const filteredLocations = useMemo(() => {
    return locations.filter((item) => {

      const stateMatch =
        state === "All States" ||
        item.state === state;

      const riskMatch =
        riskLevel === "All Levels" ||
        item.risk === riskLevel;

      /*
        Search ONLY by STATE
      */

      const searchMatch =
        appliedSearch === "" ||
        item.state
          .toLowerCase()
          .startsWith(
            appliedSearch.toLowerCase()
          );

      return (
        stateMatch &&
        riskMatch &&
        searchMatch
      );
    });
  }, [
    locations,
    state,
    riskLevel,
    appliedSearch,
  ]);


  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredLocations.length / rowsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * rowsPerPage;

  const paginatedLocations =
    filteredLocations.slice(
      startIndex,
      startIndex + rowsPerPage
    );


  /* =======================================================
     APPLY FILTERS
  ======================================================= */

  const handleApplyFilters = () => {
    setAppliedSearch(search.trim());
    setCurrentPage(1);
  };


  /* =======================================================
     SELECT SUGGESTION
  ======================================================= */

  const handleSelectState = (selectedState) => {
    setSearch(selectedState);
    setAppliedSearch(selectedState);
    setCurrentPage(1);

    /*
      Automatically set the dropdown also.
    */

    setState(selectedState);

    /*
      Find first location from selected state
      and move the map there when available.
    */

    const firstLocation = locations.find(
      (item) => item.state === selectedState
    );

    if (firstLocation) {
      setSelectedLocation(firstLocation);
    }
  };


  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const handleClearFilters = () => {
    setState("All States");
    setRiskLevel("All Levels");
    setSearch("");
    setAppliedSearch("");
    setCurrentPage(1);

    setSelectedLocation(
      locationData[0]
    );
  };


  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalLocations = 1248;
  const activeLocations = 1186;
  const highRiskLocations = 156;
  const sensorsOnline = 98;


  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="locations-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        activePage="locations"
        onNavigate={handleNavigation}
      />


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="locations-main">


        {/* ===================================================
            HEADER
        =================================================== */}

        <Navbar 
          title="Locations" 
          subtitle="View and manage monitoring locations across Selected Region"
          searchPlaceholder="Search state..."
          searchValue={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleApplyFilters}
        />


        {/* ===================================================
            CONTENT
        =================================================== */}

        <main className="locations-content">


          {/* =================================================
              STAT CARDS
          ================================================= */}

          <section className="location-stat-grid">


            {/* TOTAL */}

            <div className="location-stat-card">

              <div className="stat-icon blue">
                <MapPin size={29} />
              </div>

              <div className="stat-content">

                <span>
                  Total Locations
                </span>

                <strong>
                  {totalLocations.toLocaleString()}
                </strong>

                <small>
                  Across India
                </small>

              </div>

            </div>


            {/* ACTIVE */}

            <div className="location-stat-card">

              <div className="stat-icon green">
                <ShieldCheck size={29} />
              </div>

              <div className="stat-content">

                <span>
                  Active Locations
                </span>

                <strong>
                  {activeLocations.toLocaleString()}
                </strong>

                <small>
                  Monitoring now
                </small>

              </div>

            </div>


            {/* HIGH RISK */}

            <div className="location-stat-card">

              <div className="stat-icon orange">
                <AlertTriangle size={29} />
              </div>

              <div className="stat-content">

                <span>
                  High Risk Locations
                </span>

                <strong>
                  {highRiskLocations}
                </strong>

                <small>
                  Requires attention
                </small>

              </div>

            </div>


            {/* SENSORS */}

            <div className="location-stat-card">

              <div className="stat-icon purple">
                <RadioTower size={29} />
              </div>

              <div className="stat-content">

                <span>
                  Sensors Online
                </span>

                <strong>
                  {sensorsOnline}%
                </strong>

                <small>
                  Network Status
                </small>

              </div>

            </div>

          </section>


          {/* =================================================
              MAP + FILTERS
          ================================================= */}

          <section className="locations-workspace">


            {/* =================================================
                MAP
            ================================================= */}

            <div className="locations-map-card">

              <div className="locations-card-header">

                <h2>
                  Locations Map
                </h2>

              </div>


              <div className="locations-map">

                <MapContainer
                  center={[30.45, 78.8]}
                  zoom={8}
                  scrollWheelZoom={true}
                  className="locations-leaflet-map"
                >

                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />


                  <MapController
                    selectedLocation={
                      selectedLocation
                    }
                  />


                  {locations.map((item) => (

                    <Marker
                      key={item.id}
                      position={[
                        item.lat,
                        item.lng,
                      ]}
                      icon={createMarkerIcon(
                        item.risk
                      )}
                      eventHandlers={{
                        click: () => {
                          setSelectedLocation(item);
                        },
                      }}
                    >

                      <Popup>

                        <div className="map-popup">

                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.state}
                          </span>

                          <div>
                            Risk:{" "}
                            <b>
                              {item.risk}
                            </b>
                          </div>

                          <div>
                            Probability:{" "}
                            <b>
                              {item.probability}%
                            </b>
                          </div>

                        </div>

                      </Popup>

                    </Marker>

                  ))}

                </MapContainer>


                {/* MAP EXTRA CONTROLS */}

                <div className="leaflet-extra-controls">

                  <button
                    type="button"
                    title="Map layers"
                  >
                    <Layers size={17} />
                  </button>

                  <button
                    type="button"
                    title="Fullscreen"
                    onClick={() => {

                      const mapElement =
                        document.querySelector(
                          ".locations-map"
                        );

                      if (
                        mapElement?.requestFullscreen
                      ) {
                        mapElement.requestFullscreen();
                      }

                    }}
                  >
                    <Maximize size={17} />
                  </button>

                </div>


                {/* MAP LEGEND */}

                <div className="location-map-legend">

                  <div>
                    <i className="legend-dot low"></i>
                    Low
                  </div>

                  <div>
                    <i className="legend-dot moderate"></i>
                    Moderate
                  </div>

                  <div>
                    <i className="legend-dot high"></i>
                    High
                  </div>

                  <div>
                    <i className="legend-dot critical"></i>
                    Critical
                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                FILTER CARD
            ================================================= */}

            <div className="location-filter-card">


              <div className="filter-header">

                <h2>
                  Filters
                </h2>

                <button
                  type="button"
                  onClick={handleClearFilters}
                >
                  Clear All
                </button>

              </div>


              {/* STATE */}

              <div className="filter-field">

                <label>
                  State
                </label>

                <select
                  value={state}
                  onChange={(e) => {

                    const selectedState =
                      e.target.value;

                    setState(selectedState);
                    setSearch(
                      selectedState === "All States"
                        ? ""
                        : selectedState
                    );

                    setAppliedSearch(
                      selectedState === "All States"
                        ? ""
                        : selectedState
                    );

                    setCurrentPage(1);

                    const firstLocation =
                      locations.find(
                        (item) =>
                          item.state ===
                          selectedState
                      );

                    if (firstLocation) {
                      setSelectedLocation(
                        firstLocation
                      );
                    }

                  }}
                >

                  {states.map((item) => (

                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>

                  ))}

                </select>

              </div>


              {/* RISK LEVEL */}

              <div className="filter-field">

                <label>
                  Risk Level
                </label>

                <select
                  value={riskLevel}
                  onChange={(e) => {
                    setRiskLevel(
                      e.target.value
                    );

                    setCurrentPage(1);
                  }}
                >

                  <option value="All Levels">
                    All Levels
                  </option>

                  <option value="LOW">
                    Low
                  </option>

                  <option value="MODERATE">
                    Moderate
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="CRITICAL">
                    Critical
                  </option>

                </select>

              </div>


              {/* SEARCH STATE */}

              <div className="filter-field state-search-field">

                <label>
                  Search State
                </label>


                <div className="filter-search">

                  <input
                    type="text"
                    placeholder="Search state name..."
                    value={search}
                    onChange={(e) => {

                      setSearch(
                        e.target.value
                      );

                    }}
                    onKeyDown={(e) => {

                      if (e.key === "Enter") {
                        handleApplyFilters();
                      }

                    }}
                  />

                  <Search size={16} />

                </div>


                {/* STATE SUGGESTIONS */}

                {search.trim() !== "" &&
                  stateSuggestions.length > 0 && (

                    <div className="state-suggestions">

                      {stateSuggestions.map(
                        (item) => (

                          <button
                            key={item}
                            type="button"
                            className="state-suggestion-item"
                            onClick={() =>
                              handleSelectState(item)
                            }
                          >

                            <MapPin size={13} />

                            <span>
                              {item}
                            </span>

                          </button>

                        )
                      )}

                    </div>

                  )}

              </div>


              {/* APPLY FILTER */}

              <button
                className="apply-filter-button"
                type="button"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </button>

            </div>

          </section>


          {/* =================================================
              TABLE
          ================================================= */}

          <section className="locations-table-card">


            <div className="locations-table-header">

              <h2>
                All Locations
              </h2>

            </div>


            <div className="locations-table-wrapper">

              <table className="locations-table">

                <thead>

                  <tr>

                    <th>
                      Location Name
                    </th>

                    <th>
                      State
                    </th>

                    <th>
                      Coordinates
                    </th>

                    <th>
                      Elevation (m)
                    </th>

                    <th>
                      Current Risk
                    </th>

                    <th>
                      Probability
                    </th>

                    <th>
                      Last Updated
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {paginatedLocations.length > 0 ? (

                    paginatedLocations.map(
                      (item) => (

                        <tr
                          key={item.id}
                        >

                          {/* LOCATION */}

                          <td>

                            <div className="table-location">

                              <span
                                className="table-location-dot"
                                style={{
                                  background:
                                    markerColors[
                                      item.risk
                                    ],
                                }}
                              >
                                <MapPin size={12} />
                              </span>

                              <strong>
                                {item.name}
                              </strong>

                            </div>

                          </td>


                          {/* STATE */}

                          <td>
                            {item.state}
                          </td>


                          {/* COORDINATES */}

                          <td className="coordinates-cell">

                            {item.lat.toFixed(4)}
                            ° N,{" "}

                            {item.lng.toFixed(4)}
                            ° E

                          </td>


                          {/* ELEVATION */}

                          <td>

                            {item.elevation.toLocaleString()}

                          </td>


                          {/* RISK */}

                          <td>

                            <span
                              className={`table-risk ${item.risk.toLowerCase()}`}
                            >
                              {item.risk}
                            </span>

                          </td>


                          {/* PROBABILITY */}

                          <td>

                            <strong
                              className={`table-probability ${item.risk.toLowerCase()}`}
                            >
                              {item.probability}%
                            </strong>

                          </td>


                          {/* UPDATED */}

                          <td>
                            {item.updated}
                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div className="table-actions">

                              <button
                                type="button"
                                title="View location"
                                onClick={() => {

                                  setSelectedLocation(
                                    item
                                  );

                                  window.scrollTo({
                                    top: 0,
                                    behavior:
                                      "smooth",
                                  });

                                }}
                              >
                                <Eye size={15} />
                              </button>


                              <button
                                type="button"
                                title="View analytics"
                              >
                                <BarChart3 size={15} />
                              </button>


                              <button
                                type="button"
                                title="More options"
                              >
                                <MoreVertical
                                  size={15}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="8"
                        className="no-location-row"
                      >

                        <X size={22} />

                        No locations found

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="locations-table-footer">


              <span>

                Showing{" "}

                <strong>
                  {filteredLocations.length === 0
                    ? 0
                    : startIndex + 1}
                </strong>

                {" "}to{" "}

                <strong>
                  {Math.min(
                    startIndex + rowsPerPage,
                    filteredLocations.length
                  )}
                </strong>

                {" "}of{" "}

                <strong>
                  {filteredLocations.length}
                </strong>

                {" "}locations

              </span>


              {/* PAGINATION */}

              <div className="pagination">

                <button
                  type="button"
                  disabled={
                    safeCurrentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                >
                  <ChevronLeft size={15} />
                </button>


                {Array.from(
                  {
                    length: Math.min(
                      totalPages,
                      5
                    ),
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (

                  <button
                    key={page}
                    type="button"
                    className={
                      safeCurrentPage === page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(page)
                    }
                  >
                    {page}
                  </button>

                ))}


                {totalPages > 5 && (
                  <>
                    <span className="pagination-dots">
                      ...
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          totalPages
                        )
                      }
                    >
                      {totalPages}
                    </button>
                  </>
                )}


                <button
                  type="button"
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                >
                  <ChevronRight size={15} />
                </button>

              </div>


              {/* ROWS */}

              <div className="rows-per-page">

                <span>
                  Rows per page:
                </span>

                <select
                  defaultValue="10"
                  disabled
                >
                  <option value="10">
                    10
                  </option>
                </select>

              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Locations;