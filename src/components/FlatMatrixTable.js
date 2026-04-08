  // //! WORKING WITH LIVING:-
  // import React, { useEffect, useRef, useState, useMemo } from "react";
  // import { getBuildingsById, getLevelsWithFlatsByBuilding } from "../api";
  // import { useParams, useLocation, useNavigate } from "react-router-dom";
  // import axios from "axios";
  // import SiteBarHome from "./SiteBarHome";
  // import { useTheme } from "../ThemeContext";
  // import html2pdf from "html2pdf.js";
  // import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";
  // import ChecklistTransferModal from "./ChecklistTransferModal";


  // function FlatMatrixTable() {
  //   const [levels, setLevels] = useState([]);

  //   const [loading, setLoading] = useState(true);
  //   const [apiError, setApiError] = useState(null);
  //   const [selectedType, setSelectedType] = useState("all");
  //   const [selectedFlat, setSelectedFlat] = useState(null);
  //   const [showStats, setShowStats] = useState(false);
  //   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  //   // const { towerId } = useParams(); // or whatever your param is!

  //   // Enhanced states for advanced features
  //   const [expandedFloor, setExpandedFloor] = useState(null);
  //   const [showAllFlats, setShowAllFlats] = useState({});
  //   const [hoveredFlat, setHoveredFlat] = useState(null);
  //   const [searchQuery, setSearchQuery] = useState("");
  //   const [viewMode, setViewMode] = useState("grid");
  //   const [showFilters, setShowFilters] = useState(false);
  //   const [selectedStatuses, setSelectedStatuses] = useState(["all"]);
  //   const [selectedFloors, setSelectedFloors] = useState(["all"]);
  //   const [sortBy, setSortBy] = useState("floor");
  //   const [quickActions, setQuickActions] = useState(false);
  //   const [notifications, setNotifications] = useState([]);
  //   const [showShortcuts, setShowShortcuts] = useState(false);
  //   const SIDEBAR_WIDTH = 0;
  //   // Pagination states
  //   const [currentPage, setCurrentPage] = useState(1);
  //   const [floorsPerPage] = useState(10);

  //   // Multi-select states
  //   const [selectedFlats, setSelectedFlats] = useState(new Set());
  //   const [bulkMode, setBulkMode] = useState(false);
  // const [sidebarOpen, setSidebarOpen] = React.useState(true); // default true for desktop

  //   const {projectId, towerId } = useParams();

  //   const { theme } = useTheme();

  //   const location = useLocation();
  //   const navigate = useNavigate();
  //   // const projectIdFromState = location.state?.projectId;
  //   const projectIdFromState = location.state?.projectId || projectId;
  //   const projectName =
  //     location.state?.projectName || localStorage.getItem("PROJECT_NAME") || "";
  // const resolvedProjectId = useMemo(
  //   () => resolveProjectId(projectIdFromState),
  //   [projectIdFromState]
  // );
  //   const pdfRef = useRef(null);
  //   const searchRef = useRef(null);

  //   // ADD after other useState declarations:
  //   const [filterOverlay, setFilterOverlay] = useState(false);
  //   const [activeFilterSection, setActiveFilterSection] = useState(null);
  // // const [flatChecklistMap, setFlatChecklistMap] = useState({}); // { [flatId]: true }
  // const [flatChecklistMap, setFlatChecklistMap] = useState({});
  //   // per-floor checklist meta from transfer-getchchklist (level_id)
  //   const [levelChecklistMeta, setLevelChecklistMeta] = useState({});
  //   const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  //   const [activeLevelForModal, setActiveLevelForModal] = useState(null);
  //   const [floorInitContextMap, setFloorInitContextMap] = useState({});

  //   // Enhanced Theme Configuration
  //   const ORANGE = "#ffbe63";
  //   const BG_OFFWHITE = "#fcfaf7";
  //   const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  //   const cardColor = theme === "dark" ? "#23232c" : "#fff";
  //   const borderColor = ORANGE;
  //   const textColor = theme === "dark" ? "#fff" : "#222";
  //   const iconColor = ORANGE;
  //   const [towerName, setTowerName] = useState("");

  // function resolvePhaseId(phaseIdFromState) {
  //   if (phaseIdFromState) return Number(phaseIdFromState);

  //   try {
  //     const qs = new URLSearchParams(window.location.search);
  //     const q = qs.get("phase_id");
  //     if (q) return Number(q);
  //   } catch {}

  //   const fromLs =
  //     localStorage.getItem("SELECTED_PHASE_ID") ||
  //     localStorage.getItem("ACTIVE_PHASE_ID") ||
  //     localStorage.getItem("PHASE_ID");

  //   if (fromLs) return Number(fromLs);

  //   return null;
  // }

  // const resolvedPhaseId = useMemo(
  //   () => resolvePhaseId(location.state?.phaseId),
  //   [location.state?.phaseId]
  // );


  // function resolvePurposeId(purposeIdFromState) {
  //   if (purposeIdFromState) return Number(purposeIdFromState);

  //   try {
  //     const qs = new URLSearchParams(window.location.search);
  //     const q = qs.get("purpose_id");
  //     if (q) return Number(q);
  //   } catch {}

  //   const fromLs =
  //     localStorage.getItem("SELECTED_PURPOSE_ID") ||
  //     localStorage.getItem("ACTIVE_PURPOSE_ID") ||
  //     localStorage.getItem("PURPOSE_ID");

  //   if (fromLs) return Number(fromLs);

  //   return null;
  // }

  // const resolvedPurposeId = useMemo(
  //   () => resolvePurposeId(location.state?.purposeId),
  //   [location.state?.purposeId]
  // );


  // useEffect(() => {
  //   // Example: Assume you have towerId in props, URL, or location.state
  //   if (!towerId) return;

  //   async function fetchTowerName() {
  //     try {
  //       const token = localStorage.getItem("ACCESS_TOKEN");
  //       const response = await projectInstance.get(
  //         `/buildings/${towerId}/`,  // <-- or whatever your endpoint is!
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //       if (response.status === 200 && response.data?.name) {
  //         setTowerName(response.data.name);
  //       } else {
  //         setTowerName(`Tower ${towerId}`);
  //       }
  //     } catch {
  //       setTowerName(`Tower ${towerId}`);
  //     }
  //   }

  //   fetchTowerName();
  // }, [towerId]);

  // useEffect(() => {
  //   // const role = getWorkflowRole();
  //   const role = String(getWorkflowRole() || "").toUpperCase();
  //   if (role !== "INTIALIZER" && role !== "Intializer") return;

  //     console.log("INIT FLOOR CHECK", {
  //     role,
  //     resolvedProjectId,
  //     resolvedPhaseId,
  //     towerId,
  //     levelsLength: levels?.length,
  //   });
  //   // if (!resolvedProjectId || !resolvedPhaseId || !towerId || !levels?.length) return;
  //   if (!resolvedProjectId || !resolvedPurposeId || !resolvedPhaseId || !towerId || !levels?.length) return;

  //   let cancelled = false;
  // // }, [resolvedProjectId, resolvedPhaseId, towerId, levels]);
  // }, [resolvedProjectId, resolvedPurposeId, resolvedPhaseId, towerId, levels]);

  // const ensureFloorChecklistForInitializer = async (levelId) => {
  //   const role = String(getWorkflowRole() || "").toUpperCase();
  //   if (role !== "INTIALIZER" && role !== "INITIALIZER") return null;
  //   if (!resolvedProjectId || !resolvedPurposeId || !resolvedPhaseId || !towerId || !levelId) return null;

  //   const initRes = await NEWchecklistInstance.get("/init-context/", {
  //     params: {
  //       project_id: resolvedProjectId,
  //       purpose_id: resolvedPurposeId,
  //       phase_id: resolvedPhaseId,
  //       building_id: Number(towerId),
  //       tower_id: Number(towerId),
  //       level_id: levelId,
  //     },
  //   });

  //   const ctx = initRes?.data || {};

  //   await NEWchecklistInstance.post("/create-live-checklist-from-template/", {
  //     ...ctx,
  //     project_id: ctx.project_id || resolvedProjectId,
  //     purpose_id: ctx.purpose_id || resolvedPurposeId,
  //     phase_id: ctx.phase_id || resolvedPhaseId,
  //     building_id: ctx.building_id || Number(towerId),
  //     tower_id: ctx.tower_id || Number(towerId),
  //     level_id: ctx.level_id || levelId,
  //   });

  //   return ctx;
  // };
  // // ---- Fetch flats that have checklist started for current role ----
  // // ---- Fetch flats that have checklist started for current role ----
  // useEffect(() => {
  //   async function loadChecklistFlats() {
  //     if (!resolvedProjectId) {
  //       console.warn("No project id found for checklist API");
  //       return;
  //     }

  //     const role = getWorkflowRole();
  //     if (!role) {
  //       console.warn("No role found (FLOW_ROLE / ROLE) for checklist API");
  //       return;
  //     }

  //     try {
  //       const res = await NEWchecklistInstance.get("/started-per-flat/", {
  //         params: {
  //           project_id: resolvedProjectId,
  //           phase_id: resolvedPhaseId,
  //           role,
  //           building_id: towerId, // <-- 147 in tumhare URL jaisa
  //         },
  //       });

  //       // ⚠️ Important: API = { project_id, role, ..., results: [...] }
  //       const payload = res.data || {};
  //       const results = Array.isArray(payload.results) ? payload.results : [];

  //       const map = {};

  //       results.forEach((row) => {
  //         if (!row.started_for_role) return;

  //         const flatId = row.flat_id || row.unit_id || row.flat;
  //         if (!flatId) return;

  //         const state = deriveChecklistState(row); // "started" | "in_progress" | "completed" | null
  //         if (!state) return;

  //         map[flatId] = {
  //           state,
  //           stageId: row.stage_id,
  //           raw: row,
  //         };
  //       });

  //       console.log("Checklist map 👉", map);
  //       setFlatChecklistMap(map);
  //     } catch (err) {
  //       console.error("Failed to load checklist flats", err);
  //     }
  //   }

  //   loadChecklistFlats();
  // }, [resolvedProjectId, resolvedPhaseId, towerId]);

  //   // ---- Fetch transfer-getchchklist per floor (level_id) - same pattern as project towers ----
  //   useEffect(() => {
  //     // if (!resolvedProjectId || !id || !levels?.length) return;
  //     if (!resolvedProjectId || !resolvedPhaseId || !towerId || !levels?.length) return;

  //     let cancelled = false;
  //     const buildingId = Number(towerId);

  //     const init = {};
  //     levels.forEach((lvl) => {
  //       const lid = lvl?.id ?? lvl?.level_id;
  //       if (lid != null) init[lid] = { loading: true, count: 0, hasChecklist: false, error: false };
  //     });
  //     setLevelChecklistMeta(init);

  //     const fetchMeta = async (levelId) => {
  //       try {
  //         const res = await NEWchecklistInstance.get("/transfer-getchchklist/", {
  //           params: {
  //             project_id: resolvedProjectId,
  //             phase_id: resolvedPhaseId,
  //             tower_id: buildingId,
  //             building_id: buildingId,
  //             level_id: levelId,
  //             limit: 50,
  //             offset: 0,
  //           },
  //         });
  //         const d = res?.data || {};
  //         const rawCount = Number(d?.count);
  //         const count = Number.isFinite(rawCount)
  //           ? rawCount
  //           : (Array.isArray(d?.results) ? d.results.length : 0);
  //         return { loading: false, count, hasChecklist: count > 0, error: false };
  //       } catch {
  //         return { loading: false, count: 0, hasChecklist: false, error: true };
  //       }
  //     };

  //     const runWithConcurrency = async (items, limit) => {
  //       let idx = 0;
  //       const runners = new Array(Math.min(limit, items.length))
  //         .fill(0)
  //         .map(async () => {
  //           while (idx < items.length && !cancelled) {
  //             const currentIndex = idx++;
  //             const lvl = items[currentIndex];
  //             const levelId = lvl?.id ?? lvl?.level_id;
  //             if (levelId == null) continue;
  //             const meta = await fetchMeta(levelId);
  //             if (cancelled) return;
  //             setLevelChecklistMeta((prev) => ({ ...prev, [levelId]: meta }));
  //           }
  //         });
  //       await Promise.all(runners);
  //     };

  //     runWithConcurrency(levels, 6);

  //     return () => {
  //       cancelled = true;
  //     };
  //   }, [resolvedProjectId, resolvedPhaseId, towerId, levels]);
  //   // }, [resolvedProjectId, resolvedPurposeId, resolvedPhaseId, towerId, levels]);


  // console.log("FlatMatrixTable: towerId is", towerId);



  //   const themeConfig = {
  //     pageBg: bgColor,
  //     cardBg: cardColor,
  //     textPrimary: textColor,
  //     textSecondary: theme === "dark" ? "#a0a0a0" : "#666",
  //     accent: ORANGE,
  //     border: borderColor,
  //     icon: iconColor,
  //     headerBg: theme === "dark" ? "#2a2a35" : "#f8f6f3",
  //     success: "#10b981",
  //     warning: "#f59e0b",
  //     error: "#ef4444",
  //     info: "#3b82f6",
  //   };
  //   // --- FLOOR SORTING HELPERS ---
  // // Floor sorting helpers
  // const SPECIAL_FLOOR_ORDER = [
  //   "Ground", "Basement", "Podium", "Parking", "Terrace"
  // ];

  // // Given a level name, returns: {type: "floor"/"special"/"other", number?, specialIndex?}
  // function classifyLevel(name) {
  //   const match = name.match(/floor\s*(\d+)/i);
  //   if (match) return { type: "floor", number: parseInt(match[1]) };
  //   const specialIndex = SPECIAL_FLOOR_ORDER.findIndex(
  //     (sp) => sp.toLowerCase() === name.toLowerCase()
  //   );
  //   if (specialIndex !== -1) return { type: "special", specialIndex };
  //   return { type: "other" };
  // }
  // function resolveProjectId(projectIdFromState) {
  //   // 1) from route state (preferred)
  //   if (projectIdFromState) return Number(projectIdFromState);

  //   // 2) from URL ?project_id=
  //   try {
  //     const qs = new URLSearchParams(window.location.search);
  //     const q = qs.get("project_id");
  //     if (q) return Number(q);
  //   } catch {}

  //   // 3) from localStorage ACTIVE_PROJECT_ID / PROJECT_ID
  //   const fromLs =
  //     localStorage.getItem("ACTIVE_PROJECT_ID") ||
  //     localStorage.getItem("PROJECT_ID");
  //   if (fromLs) return Number(fromLs);

  //   // 4) fallback: first ACCESSES project
  //   try {
  //     const accessStr = localStorage.getItem("ACCESSES");
  //     if (accessStr && accessStr !== "undefined") {
  //       const accesses = JSON.parse(accessStr);
  //       if (Array.isArray(accesses) && accesses[0]?.project_id) {
  //         return Number(accesses[0].project_id);
  //       }
  //     }
  //   } catch {}

  //   return null;
  // }

  // function getWorkflowRole() {
  //   // FLOW_ROLE = Maker / Checker / Supervisor / Initializer
  //   const flow = localStorage.getItem("FLOW_ROLE");
  //   if (flow) return flow.toUpperCase();

  //   const display = localStorage.getItem("ROLE");
  //   return display ? String(display).toUpperCase() : "";
  // }
  // function deriveChecklistState(row) {
  //   const total = row.total_items || 0;
  //   const started = row.started_items || 0;
  //   const hasChecklist =
  //     Array.isArray(row.checklists) && row.checklists.length > 0;
  //   const anyCompleted =
  //     hasChecklist &&
  //     row.checklists.some((c) => String(c.status).toLowerCase() === "completed");

  //   if (!hasChecklist) return null;

  //   // 1) ✅ Completed: koi bhi checklist completed hai
  //   if (anyCompleted) return "completed";

  //   // 2) ✅ In progress: kuch items start ho chuke hain
  //   if (started > 0 && started < total) return "in_progress";

  //   // 3) ✅ Started: checklist assign hai, par items abhi tak start nahi,
  //   // ya total = started (but not completed as per above)
  //   if (started > 0 || total > 0) return "started";

  //   return null;
  // }


  // function getPrettyUnitNumber(unitName) {
  //   if (!unitName) return "";
  //   // Basement (B001 → B1)
  //   const basement = unitName.match(/^B0*([1-9]\d*)$/i);
  //   if (basement) return `B${basement[1]}`;
  //   // Podium (P001 → Po1)
  //   const podium = unitName.match(/^P0*([1-9]\d*)$/i);
  //   if (podium) return `Po${podium[1]}`;
  //   // Parking (PK001 or PRK001 → Pk1)
  //   const parking = unitName.match(/^PK0*([1-9]\d*)$/i) || unitName.match(/^PRK0*([1-9]\d*)$/i);
  //   if (parking) return `Pk${parking[1]}`;
  //   // Ground (G001 → G1)
  //   const ground = unitName.match(/^G0*([1-9]\d*)$/i);
  //   if (ground) return `G${ground[1]}`;
  //   // Terrace (T001 → T1)
  //   const terrace = unitName.match(/^T0*([1-9]\d*)$/i);
  //   if (terrace) return `T${terrace[1]}`;
  //   // Otherwise, unchanged
  //   return unitName;
  // }

  // const sortedLevels = useMemo(() => {
  //   // First: floors numerically (lowest to highest), then specials (as ordered), then others
  //   return [...levels].sort((a, b) => {
  //     const ca = classifyLevel(a.name || "");
  //     const cb = classifyLevel(b.name || "");

  //     if (ca.type === "floor" && cb.type === "floor") {
  //       return ca.number - cb.number; // Floor 1, Floor 2, ...
  //     }
  //     if (ca.type === "floor") return -1;
  //     if (cb.type === "floor") return 1;

  //     if (ca.type === "special" && cb.type === "special") {
  //       return ca.specialIndex - cb.specialIndex;
  //     }
  //     if (ca.type === "special") return 1; // Specials after floors
  //     if (cb.type === "special") return -1;

  //     // If neither floor nor special, sort alphabetically
  //     return (a.name || "").localeCompare(b.name || "");
  //   });
  // }, [levels]);


  //   // Add notification system
  //   const addNotification = (message, type = "info") => {
  //     const id = Date.now();
  //     const notification = { id, message, type };
  //     setNotifications((prev) => [...prev.slice(-2), notification]);
  //     setTimeout(() => {
  //       setNotifications((prev) => prev.filter((n) => n.id !== id));
  //     }, 4000);
  //   };

  //   // Keyboard shortcuts
  // // Keyboard shortcuts - FIXED VERSION
  // useEffect(() => {
  //   const handleKeyboard = (e) => {
  //     // Check if user is typing in an input field
  //     const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
      
  //     if (e.ctrlKey || e.metaKey) {
  //       switch (e.key.toLowerCase()) {
  //         case 'f':
  //           e.preventDefault();
  //           searchRef.current?.focus();
  //           addNotification("Search focused", "info");
  //           break;
  //         case 'k':
  //           e.preventDefault();
  //           setShowFilters(prev => !prev);
  //           addNotification("Filters toggled", "info");
  //           break;
  //         case '/':
  //         case '?':
  //           e.preventDefault();
  //           setShowShortcuts(prev => !prev);
  //           addNotification("Shortcuts panel toggled", "info");
  //           break;
  //       }
  //     }
      
  //     // Handle escape key
  //     if (e.key === 'Escape') {
  //       if (selectedFlat) {
  //         setSelectedFlat(null);
  //       } else if (showShortcuts) {
  //         setShowShortcuts(false);
  //       } else if (showFilters || filterOverlay) {
  //         setShowFilters(false);
  //         setFilterOverlay(false);
  //       } else if (quickActions) {
  //         setQuickActions(false);
  //       }
  //       addNotification("Closed active panels", "info");
  //     }
      
  //     // Handle other shortcuts without modifier keys (only if not in input)
  //     if (!isInputFocused && !e.ctrlKey && !e.metaKey && !e.altKey) {
  //       switch (e.key.toLowerCase()) {
  //         case 's':
  //           e.preventDefault();
  //           setShowStats(prev => !prev);
  //           addNotification("Stats toggled", "info");
  //           break;
  //         case 'b':
  //           e.preventDefault();
  //           setBulkMode(prev => !prev);
  //           addNotification("Bulk mode toggled", "info");
  //           break;
  //         case 'c':
  //           if (selectedFlats.size > 0) {
  //             e.preventDefault();
  //             setSelectedFlats(new Set());
  //             setBulkMode(false);
  //             addNotification("Selection cleared", "info");
  //           }
  //           break;
  //       }
  //     }
  //   };

  //   // Add event listener
  //   document.addEventListener("keydown", handleKeyboard);
    
  //   // Cleanup
  //   return () => {
  //     document.removeEventListener("keydown", handleKeyboard);
  //   };
  // }, [selectedFlat, showShortcuts, showFilters, filterOverlay, quickActions, selectedFlats.size]);

  //   useEffect(() => {
  //   setLoading(true);
  //   setApiError(null);
  //   (async () => {
  //     try {
  //       const res = await getLevelsWithFlatsByBuilding(towerId);


  //       setLevels(res.data || []);
  //       // === END: SORT LOGIC ===

  //       addNotification(
  //         `Loaded ${res.data?.length || 0} floors successfully`,
  //         "success"
  //       );
  //     } catch (error) {
  //       setApiError("Failed to fetch levels/flats. Please try again.");
  //       setLevels([]);
  //       addNotification("Failed to load building data", "error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   })();
  // }, [towerId]);


  //   // Enhanced statistics with more insights
  //   const stats = useMemo(() => {
  //     const allFlats = levels.flatMap((l) => l.flats || []);
  //     const typeCount = {};
  //     const statusCount = {};
  //     const floorStats = {};

  //     allFlats.forEach((flat) => {
  //       const type = flat.flattype?.type_name || "Unknown";
  //       const status = flat.status || "unknown";
  //       typeCount[type] = (typeCount[type] || 0) + 1;
  //       statusCount[status] = (statusCount[status] || 0) + 1;
  //     });

  //     levels.forEach((level, index) => {
  //       const floorNum = levels.length - index;
  //       floorStats[floorNum] = {
  //         total: level.flats?.length || 0,
  //         available:
  //           level.flats?.filter((f) => f.status === "available").length || 0,
  //         occupied:
  //           level.flats?.filter((f) => f.status === "occupied").length || 0,
  //         occupancyRate: level.flats?.length
  //           ? Math.round(
  //               (level.flats.filter((f) => f.status === "occupied").length /
  //                 level.flats.length) *
  //                 100
  //             )
  //           : 0,
  //       };
  //     });

  //     return {
  //       totalFlats: allFlats.length,
  //       totalLevels: levels.length,
  //       typeBreakdown: typeCount,
  //       statusBreakdown: statusCount,
  //       floorStats,
  //       occupancyRate:
  //         Math.round(
  //           (allFlats.filter((f) => f.status === "occupied").length /
  //             allFlats.length) *
  //             100
  //         ) || 0,
  //       availableRate:
  //         Math.round(
  //           (allFlats.filter((f) => f.status === "available").length /
  //             allFlats.length) *
  //             100
  //         ) || 0,
  //       averageOccupancy:
  //         Math.round(
  //           Object.values(floorStats).reduce(
  //             (acc, floor) => acc + floor.occupancyRate,
  //             0
  //           ) / Object.keys(floorStats).length
  //         ) || 0,
  //     };
  //   }, [levels]);

  //   // Smart filtering and search
  //   const filteredAndSearchedLevels = useMemo(() => {
  //   let filtered = sortedLevels.map((level, index) => ({
  //       ...level,
  //       floorNumber: levels.length - index,
  //       flats: (level.flats || []).filter((flat) => {
  //         // Type filter
  //         const typeMatch =
  //           selectedType === "all" || flat.flattype?.type_name === selectedType;

  //         // Status filter
  //         const statusMatch =
  //           selectedStatuses.includes("all") ||
  //           selectedStatuses.some((status) => flat.status === status);

  //         // Search filter
  //         const searchMatch =
  //           !searchQuery ||
  //           flat.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //           (flat.flattype?.type_name || "")
  //             .toLowerCase()
  //             .includes(searchQuery.toLowerCase()) ||
  //           (flat.status || "").toLowerCase().includes(searchQuery.toLowerCase());

  //         return typeMatch && statusMatch && searchMatch;
  //       }),
  //     }));

  //     // Floor filter
  //     if (!selectedFloors.includes("all")) {
  //       filtered = filtered.filter((level) =>
  //         selectedFloors.includes(level.floorNumber.toString())
  //       );
  //     }

  //     // Remove empty floors after filtering
  //     filtered = filtered.filter((level) => level.flats.length > 0);

  //     // Sort floors
  //     if (sortBy === "occupancy") {
  //       filtered.sort((a, b) => {
  //         const aOcc =
  //           a.flats.filter((f) => f.status === "occupied").length /
  //           a.flats.length;
  //         const bOcc =
  //           b.flats.filter((f) => f.status === "occupied").length /
  //           b.flats.length;
  //         return bOcc - aOcc;
  //       });
  //     } else {
  //     }

  //     return filtered;
  //   }, [
  //     levels,
  //     selectedType,
  //     selectedStatuses,
  //     selectedFloors,
  //     searchQuery,
  //     sortBy,
  //     sortedLevels,
  //   ]);

  //   // Pagination logic
  //   const totalPages = Math.ceil(
  //     filteredAndSearchedLevels.length / floorsPerPage
  //   );
  //   const paginatedLevels = useMemo(() => {
  //     const startIndex = (currentPage - 1) * floorsPerPage;
  //     return filteredAndSearchedLevels.slice(
  //       startIndex,
  //       startIndex + floorsPerPage
  //     );
  //   }, [filteredAndSearchedLevels, currentPage, floorsPerPage]);

  //   // Enhanced flat status configuration
  //   const getFlatStatusConfig = (flat, checklistInfo) => {
  //   if (!flat)
  //     return {
  //       bg: "transparent",
  //       border: "transparent",
  //       text: "transparent",
  //       icon: "○",
  //     };

  //   const configs = {
  //     occupied: {
  //       bg: `${themeConfig.accent}25`,
  //       border: themeConfig.accent,
  //       text: themeConfig.textPrimary,
  //       icon: "●",
  //       label: "Occupied",
  //       pulse: false,
  //     },
  //     available: {
  //       bg: `${themeConfig.success}20`,
  //       border: themeConfig.success,
  //       text: themeConfig.success,
  //       icon: "○",
  //       label: "Available",
  //       pulse: true,
  //     },
  //     maintenance: {
  //       bg: `${themeConfig.warning}20`,
  //       border: themeConfig.warning,
  //       text: themeConfig.warning,
  //       icon: "⚠",
  //       label: "Maintenance",
  //       pulse: true,
  //     },
  //     reserved: {
  //       bg: `${themeConfig.error}20`,
  //       border: themeConfig.error,
  //       text: themeConfig.error,
  //       icon: "◐",
  //       label: "Reserved",
  //       pulse: false,
  //     },
  //     default: {
  //       bg: `${themeConfig.textSecondary}10`,
  //       border: themeConfig.textSecondary,
  //       text: themeConfig.textSecondary,
  //       icon: "□",
  //       label: "Unknown",
  //       pulse: false,
  //     },
  //   };

  //   const base = configs[flat.status?.toLowerCase()] || configs.default;

  //   // 💡 Agar is flat ke liye checklist info hai, to 3-stage colour use karo
  //   if (checklistInfo && checklistInfo.state) {
  //     const st = checklistInfo.state; // "started" | "in_progress" | "completed"

  //     if (st === "started") {
  //       return {
  //         ...base,
  //         bg: `${themeConfig.info}18`,    // light blue
  //         border: themeConfig.info,
  //         text: themeConfig.info,
  //         icon: "●",
  //         label: "Checklist • Started",
  //         pulse: false,
  //     };
  //     }

  //     if (st === "in_progress") {
  //       return {
  //         ...base,
  //         bg: `${themeConfig.warning}18`, // orange
  //         border: themeConfig.warning,
  //         text: themeConfig.warning,
  //         icon: "●",
  //         label: "Checklist • In progress",
  //         pulse: true,
  //       };
  //     }

  //     if (st === "completed") {
  //       return {
  //         ...base,
  //         bg: `${themeConfig.success}22`, // green
  //         border: themeConfig.success,
  //         text: themeConfig.success,
  //         icon: "✓",
  //         label: "Checklist • Completed",
  //         pulse: false,
  //       };
  //     }
  //   }

  //   return base;
  // };


  //   // const getFlatStatusConfig = (flat) => {
  //   //   if (!flat)
  //   //     return {
  //   //       bg: "transparent",
  //   //       border: "transparent",
  //   //       text: "transparent",
  //   //       icon: "○",
  //   //     };

  //   //   const configs = {
  //   //     occupied: {
  //   //       bg: `${themeConfig.accent}25`,
  //   //       border: themeConfig.accent,
  //   //       text: themeConfig.textPrimary,
  //   //       icon: "●",
  //   //       label: "Occupied",
  //   //       pulse: false,
  //   //     },
  //   //     available: {
  //   //       bg: `${themeConfig.success}20`,
  //   //       border: themeConfig.success,
  //   //       text: themeConfig.success,
  //   //       icon: "○",
  //   //       label: "Available",
  //   //       pulse: true,
  //   //     },
  //   //     maintenance: {
  //   //       bg: `${themeConfig.warning}20`,
  //   //       border: themeConfig.warning,
  //   //       text: themeConfig.warning,
  //   //       icon: "⚠",
  //   //       label: "Maintenance",
  //   //       pulse: true,
  //   //     },
  //   //     reserved: {
  //   //       bg: `${themeConfig.error}20`,
  //   //       border: themeConfig.error,
  //   //       text: themeConfig.error,
  //   //       icon: "◐",
  //   //       label: "Reserved",
  //   //       pulse: false,
  //   //     },
  //   //     default: {
  //   //       bg: `${themeConfig.textSecondary}10`,
  //   //       border: themeConfig.textSecondary,
  //   //       text: themeConfig.textSecondary,
  //   //       icon: "□",
  //   //       label: "Unknown",
  //   //       pulse: false,
  //   //     },
  //   //   };

  //   //   return configs[flat.status?.toLowerCase()] || configs.default;
  //   // };

  //   // Handle floor selection
  //   const handleFloorClick = (levelId) => {
  //     if (expandedFloor === levelId) {
  //       setExpandedFloor(null);
  //       setShowAllFlats((prev) => ({ ...prev, [levelId]: false }));
  //     } else {
  //       setExpandedFloor(levelId);
  //       setShowAllFlats((prev) => ({ ...prev, [levelId]: false }));
  //       addNotification("Floor expanded - Click flats to inspect", "info");
  //     }
  //   };

  //   // Handle flat selection for bulk operations
  //   const handleFlatSelect = (flatId, e) => {
  //     e.stopPropagation();
  //     setSelectedFlats((prev) => {
  //       const newSet = new Set(prev);
  //       if (newSet.has(flatId)) {
  //         newSet.delete(flatId);
  //       } else {
  //         newSet.add(flatId);
  //       }
  //       return newSet;
  //     });
  //   };

  //   // // Handle flat click navigation
  //   // const handleFlatClick = (flat) => {
  //   //   if (bulkMode) return;

  //   //   navigate(`/project/:projectId/level/:towerId/inspection/flat/${flat.id}`, {
  //   //     state: {
  //   //       projectId: projectIdFromState,
  //   //       flatId: flat.id,
  //   //       flatNumber: flat.number,
  //   //       flatType: flat.flattype?.type_name,
  //   //     },
  //   //   });
  //   // };
  //   const handleFlatClick = (flat, levelId) => {
  //   if (bulkMode) return;

  //   navigate(`/project/${projectId}/level/${towerId}/inspection/flat/${flat.id}`, {
  //     state: {
  //       projectId,
  //       towerId,
  //       purposeId: resolvedPurposeId,
  //       phaseId: resolvedPhaseId,
  //       levelId,
  //       flatId: flat.id,
  //       flatNumber: flat.number,
  //       flatType: flat.flattype?.type_name,
  //     },
  //   });
  // };

  //   const closeChecklistModal = () => {
  //     setChecklistModalOpen(false);
  //     setActiveLevelForModal(null);
  //   };

  //   // Clear all filters
  //   const clearAllFilters = () => {
  //     setSelectedType("all");
  //     setSelectedStatuses(["all"]);
  //     setSelectedFloors(["all"]);
  //     setSearchQuery("");
  //     setCurrentPage(1);
  //     addNotification("All filters cleared", "info");
  //   };

  //   // Get ordinal for floor numbers
  //   const getLevelOrdinal = (n) => {
  //     const suffixes = ["th", "st", "nd", "rd"];
  //     const v = n % 100;
  //     return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  //   };

  //   // Enhanced Flat Card Component
  // const FlatCard = ({ flat, isCompact = false, level, showingAll = false }) => {
  //   const checklistInfo = flatChecklistMap[flat.id]; // { state, ... } ya undefined

  //   const config = getFlatStatusConfig(flat, checklistInfo);
  //   const isSelected = selectedFlats.has(flat.id);
  //   const isHovered = hoveredFlat === flat.id;

  //     return (
  //       <div
  //         onClick={(e) => {
  //           e.stopPropagation();
  //           if (!bulkMode) handleFlatClick(flat, level?.id);
  //         }}
  //         onMouseEnter={() => setHoveredFlat(flat.id)}
  //         onMouseLeave={() => setHoveredFlat(null)}
  //         className={`
  //           group relative cursor-pointer transition-all duration-300 transform
  //           ${isHovered ? "scale-105 z-10" : "hover:scale-105"} 
  //           ${isSelected ? "ring-2 ring-offset-2" : ""}
  //           ${isCompact ? "p-2 rounded-lg" : "p-3 rounded-xl"} 
  //           border-2 backdrop-blur-sm
  //           ${config.pulse ? "animate-pulse" : ""}
  //         `}
  //         style={{
  //           background: config.bg,
  //           borderColor: config.border,
  //           boxShadow: isHovered
  //             ? `0 8px 32px ${config.border}40`
  //             : `0 2px 8px ${config.border}20`,
  //           ringColor: themeConfig.accent,
  //         }}
  //       >
  //         {/* Multi-select checkbox */}
  //         {bulkMode && (
  //           <div
  //             className="absolute top-2 left-2 z-20"
  //             onClick={(e) => handleFlatSelect(flat.id, e)}
  //           >
  //             <div
  //               className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
  //                 isSelected ? "bg-current" : "bg-transparent"
  //               }`}
  //               style={{ borderColor: config.border, color: config.border }}
  //             >
  //               {isSelected && (
  //                 <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
  //                   <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  //                 </svg>
  //               )}
  //             </div>
  //           </div>
  //         )}

  //         {/* Status Indicator */}
  //         <div
  //           className={`absolute top-1 right-1 w-3 h-3 rounded-full flex items-center justify-center text-xs ${
  //             config.pulse ? "animate-pulse" : ""
  //           }`}
  //           style={{ background: config.border, color: "white" }}
  //         >
  //           {config.icon}
  //         </div>

  //         {/* Flat Number */}
  //         <div
  //           className={`font-bold ${isCompact ? "text-sm" : "text-base"} mb-1 ${
  //             bulkMode ? "ml-6" : ""
  //           }`}
  //           style={{ color: config.text }}
  //         >
          

  // {getPrettyUnitNumber(flat.number)}
  //         </div>

  //         {/* Flat Type */}
  //         {flat.flattype?.type_name && (
  //           <div
  //             className={`${
  //               isCompact ? "text-xs" : "text-sm"
  //             } font-medium opacity-80 ${bulkMode ? "ml-6" : ""}`}
  //             style={{ color: config.text }}
  //           >
  //             {flat.flattype.type_name}
  //           </div>
  //         )}
  //         {checklistInfo && (
  //   <div
  //     className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
  //     style={{
  //       background:
  //         checklistInfo.state === "completed"
  //           ? themeConfig.success
  //           : checklistInfo.state === "in_progress"
  //           ? themeConfig.warning
  //           : themeConfig.info,
  //       color: "white",
  //     }}
  //   >
  //     {checklistInfo.state === "completed"
  //       ? "Checklist Completed"
  //       : checklistInfo.state === "in_progress"
  //       ? "Checklist In Progress"
  //       : "Checklist Started"}
  //   </div>
  // )}

  //         {/* Enhanced Hover Tooltip */}
  //         {/* Enhanced Hover Tooltip */}
  //         {/* Enhanced Hover Tooltip */}
  // {!showingAll && (
  // <div 
  //   className={`absolute ${viewMode === 'list' ? 'left-full ml-2' : 'top-full'} left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl border`}
  //   style={{ 
  //     background: themeConfig.cardBg, 
  //     color: themeConfig.textPrimary,
  //     borderColor: themeConfig.border
  //   }}
  // >
  //           <div className="text-sm font-semibold mb-1">
  //             {config.label} • Unit {flat.number}
  //           </div>
  //           <div className="text-xs opacity-75 mb-1">
  //             {flat.flattype?.type_name || "Unknown Type"}
  //           </div>
  //           <div
  //             className="text-xs font-medium"
  //             style={{ color: themeConfig.accent }}
  //           >
  //             Click to inspect →
  //           </div>
  //           {/* Arrow */}
  //           <div
  //             className={`absolute ${
  //               viewMode === "list"
  //                 ? "left-0 top-1/2 transform -translate-y-1/2 -translate-x-full"
  //                 : "bottom-full left-1/2 transform -translate-x-1/2"
  //             } w-0 h-0 border-4 border-transparent`}
  //             style={{
  //               [viewMode === "list" ? "borderRightColor" : "borderBottomColor"]:
  //                 themeConfig.cardBg,
  //             }}
  //           ></div>
  //         </div>
  //         )}
  //       </div>
  //     );
  //   };

  //   // Enhanced Floor Component
  //   const FloorComponent = ({ level, floorNumber }) => {
  //   const flats = level.flats || [];
  //   const isExpanded = expandedFloor === level.id;
  //   const showingAll = showAllFlats[level.id];
  //   const visibleFlats = showingAll ? flats : flats.slice(0, 5);
  //   const hasMore = flats.length > 5;
  //   const floorOccupancy = flats.length
  //     ? Math.round(
  //         (flats.filter((f) => f.status === "occupied").length / flats.length) *
  //           100
  //       )
  //     : 0;

  //   // 🔵 NEW: check if this floor has ANY checklist (flat-level)
  //   const hasChecklistOnFloor = flats.some(
  //     (flat) => !!flatChecklistMap[flat.id]
  //   );

  //   const levelMeta = levelChecklistMeta[level.id];
  //   const levelChecklistCount = Number.isFinite(levelMeta?.count)
  //     ? levelMeta.count
  //     : 0;
  //   const hasLevelChecklists = levelChecklistCount > 0;
  //   const isChecklistCountLoading = !!levelMeta?.loading;

  //   const floorBorderBase = hasChecklistOnFloor || hasLevelChecklists
  //     ? themeConfig.info // blue
  //     : themeConfig.border;

  //   const floorShadowBase = hasChecklistOnFloor || hasLevelChecklists
  //     ? themeConfig.info
  //     : themeConfig.border;

  //   const floorHeaderColor = hasChecklistOnFloor || hasLevelChecklists
  //     ? themeConfig.info
  //     : themeConfig.accent; // orange if no checklist


  //     return (
  //       <div
  //   className="border-2 rounded-2xl overflow-hidden transition-all duration-500 transform hover:scale-[1.01] hover:shadow-2xl"
  //   style={{
  //     background: themeConfig.cardBg,
  //     borderColor: isExpanded
  //       ? floorBorderBase
  //       : `${floorBorderBase}40`,
  //     boxShadow: isExpanded
  //       ? `0 12px 48px ${floorShadowBase}26`
  //       : `0 4px 16px ${floorShadowBase}15`,
  //   }}
  // >

  //         {/* Enhanced Floor Header */}
  //         <div
  //           onClick={() => handleFloorClick(level.id)}
  //           className={`
  //             className="relative cursor-pointer p-4 transition-all duration-300
  //             ${isExpanded ? "pb-6" : "hover:pb-5"}"
  //           `}
  //           style={{
  //             background: isExpanded
  //               ? `linear-gradient(135deg, ${themeConfig.accent}15, ${themeConfig.accent}08)`
  //               : `linear-gradient(135deg, ${themeConfig.headerBg}, ${themeConfig.cardBg})`,
  //           }}
  //         >
  //           {/* Animated Background Pattern */}
  //           <div
  //             className={`absolute inset-0 opacity-5 transition-opacity duration-500 ${
  //               isExpanded ? "opacity-10" : ""
  //             }`}
  //             style={{
  //               background: `repeating-linear-gradient(45deg, ${themeConfig.accent}30, ${themeConfig.accent}30 10px, transparent 10px, transparent 20px)`,
  //             }}
  //           ></div>

  //           <div className="relative z-10 flex items-center justify-between">
  //             <div className="flex items-center gap-4">
  //               {/* Enhanced Floor Badge */}
  //             <div
  //   className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3"
  //   style={{
  //     background: `linear-gradient(135deg, ${floorHeaderColor}, ${floorHeaderColor}dd)`,
  //   }}
  // >
  //                 <svg
  //                   width="24"
  //                   height="24"
  //                   viewBox="0 0 24 24"
  //                   fill="currentColor"
  //                 >
  //                   <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
  //                 </svg>
  //               </div>

  //               {/* Enhanced Floor Info */}
  //               <div>
  //             <h3 className="text-xl font-bold mb-1" style={{ color: themeConfig.textPrimary }}>
  //   {(level.name)}
  // </h3>


  //                 <div className="flex items-center gap-4 text-sm flex-wrap">
  //                   <span style={{ color: themeConfig.textSecondary }}>
  //                     {flats.length} Units
  //                   </span>
  //                 </div>
  //               </div>
  //             </div>

  //             {/* Enhanced Controls */}
  //             <div className="flex items-center gap-3">
  //               {/* Checklist count badge */}
  //               {levelMeta && (
  //                 <button
  //                   type="button"
  //                   onClick={(e) => {
  //                     e.stopPropagation();
  //                     if (!isChecklistCountLoading) {
  //                       setActiveLevelForModal(level);
  //                       setChecklistModalOpen(true);
  //                     }
  //                   }}
  //                   className="px-2 py-0.5 rounded-md text-xs font-medium transition-all hover:opacity-90"
  //                   style={{
  //                     background: `${themeConfig.info}20`,
  //                     color: themeConfig.info,
  //                     border: "none",
  //                     cursor: isChecklistCountLoading ? "not-allowed" : "pointer",
  //                     opacity: isChecklistCountLoading ? 0.6 : 1,
  //                   }}
  //                   disabled={isChecklistCountLoading}
  //                 >
  //                   {isChecklistCountLoading
  //                     ? "Loading…"
  //                     : `${levelChecklistCount} checklist${levelChecklistCount !== 1 ? "s" : ""}`}
  //                 </button>
  //               )}
  //               {/* Expand Indicator */}
  //               <div
  //                 className={`transform transition-all duration-300 ${
  //                   isExpanded ? "rotate-180" : ""
  //                 } p-2 rounded-full hover:bg-opacity-10`}
  //                 style={{
  //                   color: themeConfig.accent,
  //                   backgroundColor: `${themeConfig.accent}10`,
  //                 }}
  //               >
  //                 <svg
  //                   width="20"
  //                   height="20"
  //                   viewBox="0 0 24 24"
  //                   fill="currentColor"
  //                 >
  //                   <path d="M7 10l5 5 5-5z" />
  //                 </svg>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Enhanced Progress Bar */}
  //         <div
  //   className="absolute bottom-0 left-0 h-1 transition-all duration-700 rounded-full"
  //   style={{
  //     width: isExpanded ? "100%" : "0%",
  //     background: `linear-gradient(90deg, ${floorHeaderColor}, ${themeConfig.success})`,
  //   }}
  // ></div>

  //         </div>

  //         {/* Enhanced Expandable Section */}
  //         <div
  //           className={`transition-all duration-700 ease-out overflow-hidden ${
  //             isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
  //           }`}
  //         >
  //           <div className="p-6">
  //             {/* View Mode Toggle */}
  //             <div className="flex items-center justify-between mb-4">
  //               <div className="flex items-center gap-2">
  //                 <span
  //                   className="text-sm font-medium"
  //                   style={{ color: themeConfig.textSecondary }}
  //                 >
  //                   View:
  //                 </span>
  //                 <div
  //                   className="flex rounded-lg p-1"
  //                   style={{ background: `${themeConfig.textSecondary}15` }}
  //                 >
  //                   {["grid", "list"].map((mode) => (
  //                     <button
  //                       key={mode}
  //                       onClick={() => setViewMode(mode)}
  //                       className={`px-3 py-1 rounded text-xs font-medium transition-all ${
  //                         viewMode === mode ? "shadow" : ""
  //                       }`}
  //                       style={{
  //                         background:
  //                           viewMode === mode
  //                             ? themeConfig.accent
  //                             : "transparent",
  //                         color:
  //                           viewMode === mode
  //                             ? "white"
  //                             : themeConfig.textSecondary,
  //                       }}
  //                     >
  //                       {mode === "grid" ? "⊞" : "☰"}{" "}
  //                       {mode.charAt(0).toUpperCase() + mode.slice(1)}
  //                     </button>
  //                   ))}
  //                 </div>
  //               </div>

  //               {/* Bulk Actions */}
  //               <div className="flex items-center gap-2">
  //                 <button
  //                   onClick={() => setBulkMode(!bulkMode)}
  //                   className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
  //                     bulkMode ? "shadow" : ""
  //                   }`}
  //                   style={{
  //                     background: bulkMode
  //                       ? themeConfig.accent
  //                       : `${themeConfig.accent}20`,
  //                     color: bulkMode ? "white" : themeConfig.accent,
  //                   }}
  //                 >
  //                   {bulkMode ? "✓ Exit Bulk" : "☑ Bulk Select"}
  //                 </button>
  //                 {selectedFlats.size > 0 && (
  //                   <span
  //                     className="px-2 py-1 rounded-full text-xs font-bold"
  //                     style={{
  //                       background: `${themeConfig.success}20`,
  //                       color: themeConfig.success,
  //                     }}
  //                   >
  //                     {selectedFlats.size} selected
  //                   </span>
  //                 )}
  //               </div>
  //             </div>

  //             {/* Enhanced Flats Display */}
  //             <div
  //               className={`mb-4 ${
  //                 viewMode === "grid"
  //                   ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
  //                   : "space-y-2"
  //               }`}
  //             >
  //               {visibleFlats.map((flat, index) => (
  //                 <div
  //                   key={flat.id}
  //                   className={`transform transition-all duration-300 ${
  //                     viewMode === "list"
  //                       ? "flex items-center gap-4 p-2 rounded-lg hover:bg-opacity-50"
  //                       : ""
  //                   }`}
  //                   style={{
  //                     animationDelay: `${index * 50}ms`,
  //                     animation: isExpanded
  //                       ? "fadeInUp 0.4s ease-out forwards"
  //                       : "none",
  //                     backgroundColor:
  //                       viewMode === "list"
  //                         ? `${themeConfig.textSecondary}05`
  //                         : "transparent",
  //                   }}
  //                 >
  //                   <FlatCard
  //                     flat={flat}
  //                     isCompact={viewMode === "list"}
  //                     level={level}
  //                     showingAll={showingAll}
  //                   />
  //                 </div>
  //               ))}
  //             </div>

  //             {/* Enhanced Show More Button */}
  //             {/* Enhanced Show More/Less Button */}
  // {hasMore && (
  //   <div className="text-center mb-4">
  //     {!showingAll ? (
  //       <button
  //         onClick={() =>
  //           setShowAllFlats((prev) => ({ ...prev, [level.id]: true }))
  //         }
  //         className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 mx-auto"
  //         style={{
  //           background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
  //           color: "white",
  //           boxShadow: `0 4px 16px ${themeConfig.accent}40`,
  //         }}
  //       >
  //         <span>Show {flats.length - 5} More Units</span>
  //         <svg
  //           width="16"
  //           height="16"
  //           viewBox="0 0 24 24"
  //           fill="currentColor"
  //         >
  //           <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
  //         </svg>
  //       </button>
  //     ) : (
  //       <button
  //         onClick={() =>
  //           setShowAllFlats((prev) => ({ ...prev, [level.id]: false }))
  //         }
  //         className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 mx-auto"
  //         style={{
  //           background: `linear-gradient(135deg, ${themeConfig.textSecondary}, ${themeConfig.textSecondary}dd)`,
  //           color: "white",
  //           boxShadow: `0 4px 16px ${themeConfig.textSecondary}40`,
  //         }}
  //       >
  //         <span>Show Less Units</span>
  //         <svg
  //           width="16"
  //           height="16"
  //           viewBox="0 0 24 24"
  //           fill="currentColor"
  //           className="transform rotate-180"
  //         >
  //           <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
  //         </svg>
  //       </button>
  //     )}
  //   </div>
  // )}

  //             {/* Enhanced Floor Statistics */}
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   };

  //   // Pagination Component
  //   const PaginationComponent = () => {
  //     const getPageNumbers = () => {
  //       const pages = [];
  //       const maxVisiblePages = 5;
  //       let startPage = Math.max(
  //         1,
  //         currentPage - Math.floor(maxVisiblePages / 2)
  //       );
  //       let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  //       if (endPage - startPage + 1 < maxVisiblePages) {
  //         startPage = Math.max(1, endPage - maxVisiblePages + 1);
  //       }

  //       for (let i = startPage; i <= endPage; i++) {
  //         pages.push(i);
  //       }
  //       return pages;
  //     };

  //     if (totalPages <= 1) return null;

  //     return (
  //       <div className="flex items-center justify-center gap-2 mt-8">
  //         <button
  //           onClick={() => setCurrentPage(1)}
  //           disabled={currentPage === 1}
  //           className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
  //           style={{
  //             background: `${themeConfig.textSecondary}15`,
  //             color: themeConfig.textSecondary,
  //           }}
  //         >
  //           <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  //             <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" />
  //           </svg>
  //         </button>

  //         <button
  //           onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
  //           disabled={currentPage === 1}
  //           className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
  //           style={{
  //             background: `${themeConfig.textSecondary}15`,
  //             color: themeConfig.textSecondary,
  //           }}
  //         >
  //           <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  //             <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  //           </svg>
  //         </button>

  //         {getPageNumbers().map((page) => (
  //           <button
  //             key={page}
  //             onClick={() => setCurrentPage(page)}
  //             className={`px-3 py-2 rounded-lg font-medium transition-all hover:scale-105 ${
  //               currentPage === page ? "shadow-lg" : ""
  //             }`}
  //             style={{
  //               background:
  //                 currentPage === page
  //                   ? themeConfig.accent
  //                   : `${themeConfig.textSecondary}15`,
  //               color: currentPage === page ? "white" : themeConfig.textSecondary,
  //             }}
  //           >
  //             {page}
  //           </button>
  //         ))}

  //         <button
  //           onClick={() =>
  //             setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  //           }
  //           disabled={currentPage === totalPages}
  //           className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
  //           style={{
  //             background: `${themeConfig.textSecondary}15`,
  //             color: themeConfig.textSecondary,
  //           }}
  //         >
  //           <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  //             <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
  //           </svg>
  //         </button>

  //         <button
  //           onClick={() => setCurrentPage(totalPages)}
  //           disabled={currentPage === totalPages}
  //           className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
  //           style={{
  //             background: `${themeConfig.textSecondary}15`,
  //             color: themeConfig.textSecondary,
  //           }}
  //         >
  //           <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  //             <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
  //           </svg>
  //         </button>

  //         <div
  //           className="ml-4 text-sm"
  //           style={{ color: themeConfig.textSecondary }}
  //         >
  //           Page {currentPage} of {totalPages} ({filteredAndSearchedLevels.length}{" "}
  //           floors)
  //         </div>
  //       </div>
  //     );
  //   };

  //   // Notification Component
  //   const NotificationComponent = () => (
  //     <div
  //       className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 space-y-2"
  //       style={{ marginLeft: "110px" }}
  //     >
  //       {notifications.map((notification) => (
  //         <div
  //           key={notification.id}
  //           className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border-l-4 backdrop-blur-sm animate-fadeInRight"
  //           style={{
  //             background: `${themeConfig.cardBg}f0`,
  //             borderLeftColor: {
  //               success: themeConfig.accent,
  //               error: themeConfig.error,
  //               warning: themeConfig.warning,
  //               info: themeConfig.accent,
  //             }[notification.type],
  //             borderColor: `${themeConfig.border}40`,
  //           }}
  //         >
  //           <div
  //             className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
  //             style={{
  //               background: {
  //                 success: themeConfig.accent,
  //                 error: themeConfig.error,
  //                 warning: themeConfig.warning,
  //                 info: themeConfig.accent,
  //               }[notification.type],
  //             }}
  //           >
  //             {
  //               {
  //                 success: "✓",
  //                 error: "✗",
  //                 warning: "⚠",
  //                 info: "ℹ",
  //               }[notification.type]
  //             }
  //           </div>
  //           <span
  //             className="text-sm font-medium"
  //             style={{ color: themeConfig.textPrimary }}
  //           >
  //             {notification.message}
  //           </span>
  //         </div>
  //       ))}
  //     </div>
  //   );

  // // Enhanced Keyboard Shortcuts Modal
  // const ShortcutsModal = () =>
  //   showShortcuts && (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  //       <div
  //         className="max-w-lg w-full rounded-2xl p-6 shadow-2xl border-2 max-h-[80vh] overflow-y-auto"
  //         style={{
  //           background: themeConfig.cardBg,
  //           borderColor: themeConfig.border,
  //         }}
  //       >
  //         <div className="flex items-center justify-between mb-4">
  //           <h3
  //             className="text-lg font-bold flex items-center gap-2"
  //             style={{ color: themeConfig.textPrimary }}
  //           >
  //             <span>⌨️</span>
  //             Keyboard Shortcuts
  //           </h3>
  //           <button
  //             onClick={() => setShowShortcuts(false)}
  //             className="p-2 rounded-lg hover:bg-opacity-10 transition-all"
  //             style={{ color: themeConfig.textSecondary }}
  //           >
  //             ✕
  //           </button>
  //         </div>

  //         <div className="space-y-4">
  //           {/* Navigation Shortcuts */}
  //           <div>
  //             <h4 className="font-semibold mb-2 text-sm" style={{ color: themeConfig.accent }}>
  //               🧭 Navigation
  //             </h4>
  //             <div className="space-y-2 text-sm">
  //               {[
  //                 { keys: 'Ctrl + F', action: 'Focus search bar', icon: '🔍' },
  //                 { keys: 'Ctrl + K', action: 'Toggle filters panel', icon: '🎛️' },
  //                 { keys: 'Ctrl + ?', action: 'Show/hide shortcuts', icon: '⌨️' },
  //                 { keys: 'Escape', action: 'Close active panels', icon: '🚪' },
  //               ].map((shortcut, index) => (
  //                 <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ background: `${themeConfig.textSecondary}05` }}>
  //                   <div className="flex items-center gap-2">
  //                     <span>{shortcut.icon}</span>
  //                     <span style={{ color: themeConfig.textSecondary }}>
  //                       {shortcut.action}
  //                     </span>
  //                   </div>
  //                   <div
  //                     className="px-2 py-1 rounded font-mono text-xs font-bold"
  //                     style={{
  //                       background: themeConfig.accent,
  //                       color: 'white',
  //                     }}
  //                   >
  //                     {shortcut.keys}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           </div>

  //           {/* View Shortcuts */}
  //           <div>
  //             <h4 className="font-semibold mb-2 text-sm" style={{ color: themeConfig.success }}>
  //               👁️ View Controls
  //             </h4>
  //             <div className="space-y-2 text-sm">
  //               {[
  //                 { keys: 'S', action: 'Toggle statistics panel', icon: '📊' },
  //                 { keys: 'B', action: 'Toggle bulk selection mode', icon: '☑️' },
  //                 { keys: 'C', action: 'Clear selections (when active)', icon: '🗑️' },
  //               ].map((shortcut, index) => (
  //                 <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ background: `${themeConfig.textSecondary}05` }}>
  //                   <div className="flex items-center gap-2">
  //                     <span>{shortcut.icon}</span>
  //                     <span style={{ color: themeConfig.textSecondary }}>
  //                       {shortcut.action}
  //                     </span>
  //                   </div>
  //                   <div
  //                     className="px-2 py-1 rounded font-mono text-xs font-bold"
  //                     style={{
  //                       background: themeConfig.success,
  //                       color: 'white',
  //                     }}
  //                   >
  //                     {shortcut.keys}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           </div>

  //           {/* Interaction Shortcuts */}
  //           <div>
  //             <h4 className="font-semibold mb-2 text-sm" style={{ color: themeConfig.info }}>
  //               🖱️ Interactions
  //             </h4>
  //             <div className="space-y-2 text-sm">
  //               {[
  //                 { keys: 'Click Floor', action: 'Expand/collapse floor details', icon: '🏢' },
  //                 { keys: 'Click Unit', action: 'Navigate to inspection page', icon: '🔍' },
  //                 { keys: 'Hover Unit', action: 'Show quick unit details', icon: '💡' },
  //               ].map((shortcut, index) => (
  //                 <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ background: `${themeConfig.textSecondary}05` }}>
  //                   <div className="flex items-center gap-2">
  //                     <span>{shortcut.icon}</span>
  //                     <span style={{ color: themeConfig.textSecondary }}>
  //                       {shortcut.action}
  //                     </span>
  //                   </div>
  //                   <div
  //                     className="px-2 py-1 rounded font-mono text-xs font-bold"
  //                     style={{
  //                       background: themeConfig.info,
  //                       color: 'white',
  //                     }}
  //                   >
  //                     {shortcut.keys}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           </div>
  //         </div>

  //         {/* Pro Tip */}
  //         <div 
  //           className="mt-6 p-3 rounded-lg border-l-4"
  //           style={{ 
  //             background: `${themeConfig.accent}10`,
  //             borderLeftColor: themeConfig.accent 
  //           }}
  //         >
  //           <div className="flex items-center gap-2 mb-1">
  //             <span>💡</span>
  //             <span className="font-semibold text-xs" style={{ color: themeConfig.accent }}>
  //               Pro Tip
  //             </span>
  //           </div>
  //           <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
  //             Most shortcuts work globally, but avoid conflicts when typing in search or input fields.
  //           </p>
  //         </div>

  //         {/* Close button */}
  //         <button
  //           onClick={() => setShowShortcuts(false)}
  //           className="w-full mt-4 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
  //           style={{
  //             background: themeConfig.accent,
  //             color: 'white'
  //           }}
  //         >
  //           Got it! (Press Escape to close)
  //         </button>
  //       </div>
  //     </div>
  //   );
  //   // ADD after ShortcutsModal component:
  //   const FilterOverlay = () =>
  //     filterOverlay && (
  //       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  //         <div
  //           className="max-w-2xl w-full rounded-2xl p-6 shadow-2xl border-2 max-h-[80vh] overflow-y-auto"
  //           style={{
  //             background: themeConfig.cardBg,
  //             borderColor: themeConfig.border,
  //           }}
  //         >
  //           <div className="flex items-center justify-between mb-6">
  //             <h3
  //               className="text-xl font-bold"
  //               style={{ color: themeConfig.textPrimary }}
  //             >
  //               Filter Options
  //             </h3>
  //             <button
  //               onClick={() => setFilterOverlay(false)}
  //               className="p-2 rounded-lg hover:bg-opacity-10 transition-all"
  //               style={{ color: themeConfig.textSecondary }}
  //             >
  //               ✕
  //             </button>
  //           </div>

  //           <div className="space-y-6">
  //             {/* Floors Filter */}
  //             <div>
  //               <button
  //                 onClick={() =>
  //                   setActiveFilterSection(
  //                     activeFilterSection === "floors" ? null : "floors"
  //                   )
  //                 }
  //                 className="w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all"
  //                 style={{
  //                   background:
  //                     activeFilterSection === "floors"
  //                       ? `${themeConfig.accent}10`
  //                       : "transparent",
  //                   borderColor:
  //                     activeFilterSection === "floors"
  //                       ? themeConfig.accent
  //                       : themeConfig.border,
  //                   color: themeConfig.textPrimary,
  //                 }}
  //               >
  //                 <span className="font-medium">Floors</span>
  //                 <span
  //                   className={`transform transition-all ${
  //                     activeFilterSection === "floors" ? "rotate-180" : ""
  //                   }`}
  //                 >
  //                   ▼
  //                 </span>
  //               </button>

  //               {activeFilterSection === "floors" && (
  //                 <div
  //                   className="mt-2 p-3 rounded-lg border max-h-48 overflow-y-auto"
  //                   style={{ borderColor: `${themeConfig.border}40` }}
  //                 >
  //                   <div className="space-y-2">
  //                     <label className="flex items-center gap-2 cursor-pointer">
  //                       <input
  //                         type="checkbox"
  //                         checked={selectedFloors.includes("all")}
  //                         onChange={(e) => {
  //                           if (e.target.checked) {
  //                             setSelectedFloors(["all"]);
  //                           }
  //                         }}
  //                         className="rounded"
  //                       />
  //                       <span style={{ color: themeConfig.textPrimary }}>
  //                         All Floors ({stats.totalLevels})
  //                       </span>
  //                     </label>
  //                     {Object.entries(stats.floorStats).map(([floor, data]) => (
  //                       <label
  //                         key={floor}
  //                         className="flex items-center gap-2 cursor-pointer"
  //                       >
  //                         <input
  //                           type="checkbox"
  //                           checked={selectedFloors.includes(floor)}
  //                           onChange={(e) => {
  //                             if (e.target.checked) {
  //                               setSelectedFloors((prev) =>
  //                                 prev.filter((f) => f !== "all").concat(floor)
  //                               );
  //                             } else {
  //                               setSelectedFloors((prev) =>
  //                                 prev.filter((f) => f !== floor)
  //                               );
  //                             }
  //                           }}
  //                           className="rounded"
  //                         />
  //                         <span style={{ color: themeConfig.textPrimary }}>
  //                           Floor {floor} ({data.total} units,{" "}
  //                           {data.occupancyRate}% occupied)
  //                         </span>
  //                       </label>
  //                     ))}
  //                   </div>
  //                 </div>
  //               )}
  //             </div>

  //             {/* Unit Types Filter */}
  //             <div>
  //               <button
  //                 onClick={() =>
  //                   setActiveFilterSection(
  //                     activeFilterSection === "types" ? null : "types"
  //                   )
  //                 }
  //                 className="w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all"
  //                 style={{
  //                   background:
  //                     activeFilterSection === "types"
  //                       ? `${themeConfig.accent}10`
  //                       : "transparent",
  //                   borderColor:
  //                     activeFilterSection === "types"
  //                       ? themeConfig.accent
  //                       : themeConfig.border,
  //                   color: themeConfig.textPrimary,
  //                 }}
  //               >
  //                 <span className="font-medium">Unit Types</span>
  //                 <span
  //                   className={`transform transition-all ${
  //                     activeFilterSection === "types" ? "rotate-180" : ""
  //                   }`}
  //                 >
  //                   ▼
  //                 </span>
  //               </button>

  //               {activeFilterSection === "types" && (
  //                 <div
  //                   className="mt-2 p-3 rounded-lg border"
  //                   style={{ borderColor: `${themeConfig.border}40` }}
  //                 >
  //                   <div className="space-y-2">
  //                     <label className="flex items-center gap-2 cursor-pointer">
  //                       <input
  //                         type="radio"
  //                         name="unitType"
  //                         checked={selectedType === "all"}
  //                         onChange={() => setSelectedType("all")}
  //                         className="rounded"
  //                       />
  //                       <span style={{ color: themeConfig.textPrimary }}>
  //                         All Types ({stats.totalFlats})
  //                       </span>
  //                     </label>
  //                     {Object.entries(stats.typeBreakdown).map(
  //                       ([type, count]) => (
  //                         <label
  //                           key={type}
  //                           className="flex items-center gap-2 cursor-pointer"
  //                         >
  //                           <input
  //                             type="radio"
  //                             name="unitType"
  //                             checked={selectedType === type}
  //                             onChange={() => setSelectedType(type)}
  //                             className="rounded"
  //                           />
  //                           <span style={{ color: themeConfig.textPrimary }}>
  //                             {type} ({count} units)
  //                           </span>
  //                         </label>
  //                       )
  //                     )}
  //                   </div>
  //                 </div>
  //               )}
  //             </div>

  //             {/* Status Filter */}
  //             <div>
  //               <button
  //                 onClick={() =>
  //                   setActiveFilterSection(
  //                     activeFilterSection === "status" ? null : "status"
  //                   )
  //                 }
  //                 className="w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all"
  //                 style={{
  //                   background:
  //                     activeFilterSection === "status"
  //                       ? `${themeConfig.accent}10`
  //                       : "transparent",
  //                   borderColor:
  //                     activeFilterSection === "status"
  //                       ? themeConfig.accent
  //                       : themeConfig.border,
  //                   color: themeConfig.textPrimary,
  //                 }}
  //               >
  //                 <span className="font-medium">Status</span>
  //                 <span
  //                   className={`transform transition-all ${
  //                     activeFilterSection === "status" ? "rotate-180" : ""
  //                   }`}
  //                 >
  //                   ▼
  //                 </span>
  //               </button>

  //               {activeFilterSection === "status" && (
  //                 <div
  //                   className="mt-2 p-3 rounded-lg border"
  //                   style={{ borderColor: `${themeConfig.border}40` }}
  //                 >
  //                   <div className="space-y-2">
  //                     <label className="flex items-center gap-2 cursor-pointer">
  //                       <input
  //                         type="checkbox"
  //                         checked={selectedStatuses.includes("all")}
  //                         onChange={(e) => {
  //                           if (e.target.checked) {
  //                             setSelectedStatuses(["all"]);
  //                           }
  //                         }}
  //                         className="rounded"
  //                       />
  //                       <span style={{ color: themeConfig.textPrimary }}>
  //                         All Status ({stats.totalFlats})
  //                       </span>
  //                     </label>
  //                     {Object.entries(stats.statusBreakdown).map(
  //                       ([status, count]) => (
  //                         <label
  //                           key={status}
  //                           className="flex items-center gap-2 cursor-pointer"
  //                         >
  //                           <input
  //                             type="checkbox"
  //                             checked={selectedStatuses.includes(status)}
  //                             onChange={(e) => {
  //                               if (e.target.checked) {
  //                                 setSelectedStatuses((prev) =>
  //                                   prev.filter((s) => s !== "all").concat(status)
  //                                 );
  //                               } else {
  //                                 setSelectedStatuses((prev) =>
  //                                   prev.filter((s) => s !== status)
  //                                 );
  //                               }
  //                             }}
  //                             className="rounded"
  //                           />
  //                           <span style={{ color: themeConfig.textPrimary }}>
  //                             {status.charAt(0).toUpperCase() + status.slice(1)} (
  //                             {count})
  //                           </span>
  //                         </label>
  //                       )
  //                     )}
  //                   </div>
  //                 </div>
  //               )}
  //             </div>

  //             {/* Sort Options */}
  //             <div>
  //               <button
  //                 onClick={() =>
  //                   setActiveFilterSection(
  //                     activeFilterSection === "sort" ? null : "sort"
  //                   )
  //                 }
  //                 className="w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all"
  //                 style={{
  //                   background:
  //                     activeFilterSection === "sort"
  //                       ? `${themeConfig.accent}10`
  //                       : "transparent",
  //                   borderColor:
  //                     activeFilterSection === "sort"
  //                       ? themeConfig.accent
  //                       : themeConfig.border,
  //                   color: themeConfig.textPrimary,
  //                 }}
  //               >
  //                 <span className="font-medium">Sort By</span>
  //                 <span
  //                   className={`transform transition-all ${
  //                     activeFilterSection === "sort" ? "rotate-180" : ""
  //                   }`}
  //                 >
  //                   ▼
  //                 </span>
  //               </button>

  //               {activeFilterSection === "sort" && (
  //                 <div
  //                   className="mt-2 p-3 rounded-lg border"
  //                   style={{ borderColor: `${themeConfig.border}40` }}
  //                 >
  //                   <div className="space-y-2">
  //                     {[
  //                       { value: "floor", label: "Floor Number" },
  //                       { value: "occupancy", label: "Occupancy Rate" },
  //                     ].map((option) => (
  //                       <label
  //                         key={option.value}
  //                         className="flex items-center gap-2 cursor-pointer"
  //                       >
  //                         <input
  //                           type="radio"
  //                           name="sortBy"
  //                           checked={sortBy === option.value}
  //                           onChange={() => setSortBy(option.value)}
  //                           className="rounded"
  //                         />
  //                         <span style={{ color: themeConfig.textPrimary }}>
  //                           {option.label}
  //                         </span>
  //                       </label>
  //                     ))}
  //                   </div>
  //                 </div>
  //               )}
  //             </div>
  //           </div>

  //           <div className="flex justify-end gap-3 mt-6">
  //             <button
  //               onClick={clearAllFilters}
  //               className="px-4 py-2 rounded-lg font-medium transition-all"
  //               style={{
  //                 background: `${themeConfig.error}20`,
  //                 color: themeConfig.error,
  //               }}
  //             >
  //               Clear All
  //             </button>
  //             <button
  //               onClick={() => setFilterOverlay(false)}
  //               className="px-4 py-2 rounded-lg font-medium transition-all"
  //               style={{
  //                 background: themeConfig.accent,
  //                 color: "white",
  //               }}
  //             >
  //               Apply Filters
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   // Loading skeleton
  //   const LoadingSkeleton = () => (
  //     <div className="space-y-6">
  //       {[1, 2, 3].map((i) => (
  //         <div
  //           key={i}
  //           className="border-2 rounded-2xl overflow-hidden animate-pulse"
  //           style={{
  //             background: themeConfig.cardBg,
  //             borderColor: `${themeConfig.border}20`,
  //           }}
  //         >
  //           <div className="p-4 flex items-center gap-4">
  //             <div
  //               className="w-14 h-14 rounded-2xl"
  //               style={{ background: `${themeConfig.textSecondary}20` }}
  //             ></div>
  //             <div className="flex-1">
  //               <div
  //                 className="h-6 rounded mb-2"
  //                 style={{ background: `${themeConfig.textSecondary}20` }}
  //               ></div>
  //               <div
  //                 className="h-4 rounded w-2/3"
  //                 style={{ background: `${themeConfig.textSecondary}15` }}
  //               ></div>
  //             </div>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   );

  //   // Main loading state
  //   if (loading) {
  //     return (
  //       <div
  //         className="flex min-h-screen"
  //         style={{ background: themeConfig.pageBg }}
  //       >
  //         {/* <SiteBarHome /> */}
  //         <div className="ml-[220px] p-8 flex items-center justify-center">
  //           <div className="text-center">
  //             <div
  //               className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto mb-4"
  //               style={{
  //                 borderColor: `${themeConfig.accent}40`,
  //                 borderTopColor: "transparent",
  //               }}
  //             ></div>
  //             <div
  //               className="text-lg font-medium animate-pulse"
  //               style={{ color: themeConfig.textPrimary }}
  //             >
  //               Loading tower data...
  //             </div>
  //             <div
  //               className="text-sm mt-2"
  //               style={{ color: themeConfig.textSecondary }}
  //             >
  //               Preparing your building matrix
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   // Error state
  //   if (apiError) {
  //     return (
  //       <div
  //         className="flex min-h-screen"
  //         style={{ background: themeConfig.pageBg }}
  //       >
  //         <div className="ml-[220px] p-8 flex items-center justify-center">
  //           <div
  //             className="border-2 rounded-xl p-8 text-center max-w-md"
  //             style={{
  //               background: themeConfig.cardBg,
  //               borderColor: themeConfig.error,
  //             }}
  //           >
  //             <div className="text-4xl mb-4" style={{ color: themeConfig.error }}>
  //               ⚠️
  //             </div>
  //             <h3
  //               className="text-lg font-semibold mb-2"
  //               style={{ color: themeConfig.textPrimary }}
  //             >
  //               Error Loading Data
  //             </h3>
  //             <p style={{ color: themeConfig.textSecondary }}>{apiError}</p>
  //             <button
  //               onClick={() => window.location.reload()}
  //               className="mt-4 px-6 py-2 rounded-lg transition-colors"
  //               style={{
  //                 background: themeConfig.accent,
  //                 color: "white",
  //                 border: `2px solid ${themeConfig.accent}`,
  //               }}
  //             >
  //               Retry
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="flex min-h-screen" style={{ background: themeConfig.pageBg }}>

  //       {/* <SiteBarHome /> */}

  // <main
  //   className="py-6 px-6 w-full min-w-0 transition-all duration-300"
  //   style={{
  //     marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
  //     transition: "margin-left 0.3s"
  //   }}
  // >     {/* Enhanced Header with Search & Filters */}
  //         <div
  //           className="border-2 rounded-2xl p-6 mb-6 shadow-xl backdrop-blur-sm"
  //           style={{
  //             background: `${themeConfig.cardBg}f0`,
  //             borderColor: themeConfig.border,
  //             boxShadow: `0 8px 32px ${themeConfig.accent}20`,
  //           }}
  //         >
  //           <div className="flex flex-col gap-4">
  //             {/* Top Row - Title & Main Controls */}
  //             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  //               <div className="flex items-center gap-4">
  //                 <div
  //                   className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
  //                   style={{
  //                     background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
  //                   }}
  //                 >
  //                   <svg
  //                     width="32"
  //                     height="32"
  //                     viewBox="0 0 24 24"
  //                     fill="currentColor"
  //                   >
  //                     <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
  //                   </svg>
  //                 </div>

  //                 <div>
  //                 <h2 className="text-2xl font-bold" style={{ color: borderColor }}>
  //   {towerName}
  // </h2>

  //                   <p
  //                     className="text-sm"
  //                     style={{ color: themeConfig.textSecondary }}
  //                   >
  //                     Interactive Building Matrix • {stats.totalLevels} Floors •{" "}
  //                     {stats.totalFlats} Units
  //                   </p>
  //                 </div>
  //               </div>

  //               <div className="flex flex-wrap items-center gap-3">
  //                 <button
  //                   onClick={() => setShowStats(!showStats)}
  //                   className="px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
  //                   style={{
  //                     background: showStats
  //                       ? themeConfig.accent
  //                       : `${themeConfig.accent}20`,
  //                     color: showStats ? "white" : themeConfig.accent,
  //                     border: `2px solid ${themeConfig.accent}`,
  //                   }}
  //                 >
  //                   {showStats ? "Hide" : "Show"} Stats
  //                 </button>

  //                 <button
  //                   onClick={() => setShowShortcuts(true)}
  //                   className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
  //                   style={{
  //                     background: `${themeConfig.info}20`,
  //                     color: themeConfig.info,
  //                   }}
  //                   title="Keyboard Shortcuts (Ctrl + ?)"
  //                 >
  //                   Shortcuts
  //                 </button>
  //               </div>
  //             </div>

  //             {/* Search & Filter Row */}
  //             <div className="flex flex-col md:flex-row gap-4">
  //               {/* Enhanced Search */}
  //               <div className="flex-1 relative">
  //                 <input
  //                   ref={searchRef}
  //                   type="text"
  //                   value={searchQuery}
  //                   onChange={(e) => setSearchQuery(e.target.value)}
  //                   placeholder="Search flats by number, type, or status... (Ctrl+F)"
  //                   className="w-full px-4 py-3 pl-12 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
  //                   style={{
  //                     background: themeConfig.cardBg,
  //                     borderColor: searchQuery
  //                       ? themeConfig.accent
  //                       : themeConfig.border,
  //                     color: themeConfig.textPrimary,
  //                   }}
  //                 />
  //                 <div
  //                   className="absolute left-4 top-1/2 transform -translate-y-1/2"
  //                   style={{ color: themeConfig.textSecondary }}
  //                 >
  //                   <svg
  //                     width="16"
  //                     height="16"
  //                     viewBox="0 0 24 24"
  //                     fill="currentColor"
  //                   >
  //                     <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  //                   </svg>
  //                 </div>
  //                 {searchQuery && (
  //                   <button
  //                     onClick={() => setSearchQuery("")}
  //                     className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-opacity-10 transition-all"
  //                     style={{ color: themeConfig.textSecondary }}
  //                   >
  //                     ✕
  //                   </button>
  //                 )}
  //               </div>

  //               {/* Filter Toggle */}
  //               <button
  //                 onClick={() => setFilterOverlay(!filterOverlay)}
  //                 className={`px-4 py-3 rounded-xl font-medium transition-all transform hover:scale-105 flex items-center gap-2 ${
  //                   filterOverlay ? "shadow-lg" : ""
  //                 }`}
  //                 style={{
  //                   background: filterOverlay
  //                     ? themeConfig.accent
  //                     : `${themeConfig.accent}20`,
  //                   color: filterOverlay ? "white" : themeConfig.accent,
  //                   border: `2px solid ${themeConfig.accent}`,
  //                 }}
  //               >
  //                 <span>Filters</span>
  //                 {(selectedType !== "all" ||
  //                   !selectedStatuses.includes("all") ||
  //                   !selectedFloors.includes("all")) && (
  //                   <span
  //                     className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
  //                     style={{ background: "rgba(255,255,255,0.3)" }}
  //                   >
  //                     !
  //                   </span>
  //                 )}
  //               </button>
  //               {/* Clear Filters */}
  //               {(selectedType !== "all" ||
  //                 !selectedStatuses.includes("all") ||
  //                 !selectedFloors.includes("all") ||
  //                 searchQuery) && (
  //                 <button
  //                   onClick={clearAllFilters}
  //                   className="px-4 py-3 rounded-xl font-medium transition-all transform hover:scale-105 flex items-center gap-2"
  //                   style={{
  //                     background: `${themeConfig.error}20`,
  //                     color: themeConfig.error,
  //                     border: `2px solid ${themeConfig.error}`,
  //                   }}
  //                 >
  //                   <span>Clear</span>
  //                 </button>
  //               )}
  //             </div>

  //             {/* Advanced Filters Panel */}

  //             {/* Enhanced Stats Panel */}
  //             <div
  //               className={`transition-all duration-500 ease-out overflow-hidden ${
  //                 showStats ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
  //               }`}
  //             >
  //               <div
  //                 className="border-t-2 pt-4"
  //                 style={{ borderColor: `${themeConfig.border}30` }}
  //               >
  //                 <div className="grid grid-cols-2 gap-4">
  //                   {[
  //                     {
  //                       label: "Total Units",
  //                       value: stats.totalFlats,
  //                       color: themeConfig.accent,
  //                     },
  //                     {
  //                       label: "Floors",
  //                       value: stats.totalLevels,
  //                       color: themeConfig.success,
  //                     },
  //                   ].map((stat, index) => (
  //                     <div
  //                       key={stat.label}
  //                       className="text-center p-3 rounded-xl transition-all duration-300 hover:scale-105 cursor-default"
  //                       style={{ background: `${stat.color}15` }}
  //                     >
  //                       <div
  //                         className="text-2xl font-bold mb-1"
  //                         style={{ color: stat.color }}
  //                       >
  //                         {stat.value}
  //                       </div>
  //                       <div
  //                         className="text-xs font-medium"
  //                         style={{ color: themeConfig.textSecondary }}
  //                       >
  //                         {stat.label}
  //                       </div>
  //                     </div>
  //                   ))}
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>

  //         {(searchQuery ||
  //           selectedType !== "all" ||
  //           !selectedStatuses.includes("all") ||
  //           !selectedFloors.includes("all")) && (
  //           <div
  //             className="border rounded-xl p-4 mb-6"
  //             style={{
  //               background: `${themeConfig.info}10`,
  //               borderColor: `${themeConfig.info}30`,
  //             }}
  //           >
  //             <div className="flex items-center justify-between">
  //               <div className="flex items-center gap-3">
  //                 <div
  //                   className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
  //                   style={{ background: themeConfig.info, color: "white" }}
  //                 >
  //                   📋
  //                 </div>
  //                 <div>
  //                   <div
  //                     className="font-semibold text-sm"
  //                     style={{ color: themeConfig.textPrimary }}
  //                   >
  //                     Showing {filteredAndSearchedLevels.length} floors (
  //                     {filteredAndSearchedLevels.reduce(
  //                       (acc, level) => acc + level.flats.length,
  //                       0
  //                     )}{" "}
  //                     units)
  //                   </div>
  //                   <div
  //                     className="text-xs"
  //                     style={{ color: themeConfig.textSecondary }}
  //                   >
  //                     {searchQuery && `Search: "${searchQuery}" • `}
  //                     {selectedType !== "all" && `Type: ${selectedType} • `}
  //                     Filters applied
  //                   </div>
  //                 </div>
  //               </div>

  //               <div
  //                 className="text-sm"
  //                 style={{ color: themeConfig.textSecondary }}
  //               >
  //                 Page {currentPage} of {totalPages}
  //               </div>
  //             </div>
  //           </div>
  //         )}

  //         {/* Floors Display */}
  //         {paginatedLevels.length === 0 ? (
  //           <div
  //             className="border-2 rounded-2xl p-12 text-center"
  //             style={{
  //               background: themeConfig.cardBg,
  //               borderColor: `${themeConfig.border}40`,
  //             }}
  //           >
  //             <div className="text-6xl mb-4">🔍</div>
  //             <h3
  //               className="text-xl font-bold mb-2"
  //               style={{ color: themeConfig.textPrimary }}
  //             >
  //               No floors found
  //             </h3>
  //             <p className="mb-4" style={{ color: themeConfig.textSecondary }}>
  //               Try adjusting your search or filter criteria
  //             </p>
  //             <button
  //               onClick={clearAllFilters}
  //               className="px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
  //               style={{
  //                 background: themeConfig.accent,
  //                 color: "white",
  //               }}
  //             >
  //               Clear All Filters
  //             </button>
  //           </div>
  //         ) : (
  //           <div className="space-y-6">
  //             {paginatedLevels.map((level, index) => (
  //               <FloorComponent
  //                 key={level.id}
  //                 level={level}
  //                 floorNumber={level.floorNumber}
  //               />
  //             ))}
  //           </div>
  //         )}

  //         {/* Pagination */}
  //         <PaginationComponent />

  //         {/* Bulk Actions Panel */}
  //         {selectedFlats.size > 0 && (
  //           <div
  //             className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
  //             style={{ marginLeft: "110px" }} // Account for sidebar
  //           >
  //             <div
  //               className="flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-sm"
  //               style={{
  //                 background: `${themeConfig.cardBg}f0`,
  //                 borderColor: themeConfig.accent,
  //               }}
  //             >
  //               <div
  //                 className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
  //                 style={{ background: themeConfig.accent }}
  //               >
  //                 {selectedFlats.size}
  //               </div>

  //               <div>
  //                 <div
  //                   className="font-semibold"
  //                   style={{ color: themeConfig.textPrimary }}
  //                 >
  //                   {selectedFlats.size} units selected
  //                 </div>
  //                 <div
  //                   className="text-xs"
  //                   style={{ color: themeConfig.textSecondary }}
  //                 >
  //                   Choose an action below
  //                 </div>
  //               </div>

  //               <div className="flex items-center gap-2">
  //                 <button
  //   onClick={() => {
  //     // Bulk inspect action
  //     addNotification(
  //       `Bulk inspection started for ${selectedFlats.size} units`,
  //       "info"
  //     );
  //   }}
  //   className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 backdrop-blur-sm"
  //   style={{
  //     background: `${themeConfig.accent}20`,
  //     color: themeConfig.accent,
  //     border: `1px solid ${themeConfig.accent}40`,
  //   }}
  // >
  //   Inspect All
  // </button>

  // <button
  //   onClick={() => {
  //     setSelectedFlats(new Set());
  //     setBulkMode(false);
  //     addNotification("Selection cleared", "info");
  //   }}
  //   className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 backdrop-blur-sm"
  //   style={{
  //     background: `${themeConfig.error}20`,
  //     color: themeConfig.error,
  //     border: `1px solid ${themeConfig.error}40`,
  //   }}
  // >
  //   Clear
  // </button>
  //               </div>
  //             </div>
  //           </div>
  //         )}

  //         {/* Enhanced Footer */}
  //         <div className="mt-12 text-center">
  //           <div
  //             className="inline-flex items-center gap-4 px-6 py-3 rounded-xl"
  //             style={{
  //               background: `${themeConfig.textSecondary}10`,
  //               border: `1px solid ${themeConfig.textSecondary}20`,
  //             }}
  //           >
  //           </div>
  //         </div>
  //       </main>

  //       {/* Floating Action Button */}
  //       <div className="fixed bottom-6 right-6 z-50">
  //         <div className="relative">
  //           <button
  //             onClick={() => setQuickActions(!quickActions)}
  //             className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform ${
  //               quickActions ? "rotate-45 scale-110" : "hover:scale-110"
  //             }`}
  //             style={{
  //               background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
  //               color: "white",
  //             }}
  //           >
  //             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  //               <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  //             </svg>
  //           </button>

  //           {/* Quick Actions Menu */}
  //           <div
  //             className={`absolute bottom-16 right-0 transition-all duration-300 ${
  //               quickActions
  //                 ? "opacity-100 scale-100 translate-y-0"
  //                 : "opacity-0 scale-95 translate-y-4 pointer-events-none"
  //             }`}
  //           >
  //             <div className="space-y-2">
  //               {[
  //   {
  //     label: "Search",
  //     action: () => searchRef.current?.focus(),
  //   },
  //   {
  //     label: "Filters",
  //     action: () => setFilterOverlay(prev => !prev),
  //   },
  //   {
  //     label: "Stats",
  //     action: () => setShowStats(!showStats),
  //   },
  //   {
  //     label: "Shortcuts",
  //     action: () => setShowShortcuts(true),
  //   },
  // ].map((item, index) => (
  //   <button
  //     key={item.label}
  //     onClick={() => {
  //       item.action();
  //       setQuickActions(false);
  //     }}
  //     className="flex items-center justify-center px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 whitespace-nowrap backdrop-blur-sm w-32"     style={{
  //       background: `${themeConfig.accent}20`,
  //       color: themeConfig.accent,
  //       border: `1px solid ${themeConfig.accent}40`,
  //       animationDelay: `${index * 50}ms`,
  //     }}
  //   >
  //     <span className="font-medium">{item.label}</span>
  //   </button>
  // ))}
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Enhanced Notifications */}
  //       <NotificationComponent />

  //       {/* Keyboard Shortcuts Modal */}
  //       <ShortcutsModal />

  //       <FilterOverlay />

  //       <ChecklistTransferModal
  //         isOpen={checklistModalOpen && !!activeLevelForModal}
  //         onClose={closeChecklistModal}
  //         context={
  //           activeLevelForModal
  //             ? {
  //                 type: "level",
  //                 levelId: activeLevelForModal.id ?? activeLevelForModal.level_id,
  //                 buildingId: Number(towerId),
  //                 name: activeLevelForModal.name,
  //               }
  //             : null
  //         }
  //         projectId={resolvedProjectId}
  //         projectName={projectName}
  //         theme={theme}
  //         cardColor={cardColor}
  //         textColor={textColor}
  //         borderColor={borderColor}
  //       />

  //       {/* CSS Animations */}
  //       <style jsx>{`
  //         @keyframes fadeInUp {
  //           from {
  //             opacity: 0;
  //             transform: translateY(20px);
  //           }
  //           to {
  //             opacity: 1;
  //             transform: translateY(0);
  //           }
  //         }

  //         @keyframes fadeInRight {
  //           from {
  //             opacity: 0;
  //             transform: translateX(100px);
  //           }
  //           to {
  //             opacity: 1;
  //             transform: translateX(0);
  //           }
  //         }

  //         @keyframes pulse {
  //           0%,
  //           100% {
  //             opacity: 1;
  //           }
  //           50% {
  //             opacity: 0.7;
  //           }
  //         }

  //         .animate-fadeInRight {
  //           animation: fadeInRight 0.3s ease-out;
  //         }

  //         /* Custom scrollbar */
  //         ::-webkit-scrollbar {
  //           width: 8px;
  //         }

  //         ::-webkit-scrollbar-track {
  //           background: ${theme === "dark" ? "#2a2a35" : "#f8f6f3"};
  //           border-radius: 4px;
  //         }

  //         ::-webkit-scrollbar-thumb {
  //           background: ${themeConfig.accent};
  //           border-radius: 4px;
  //         }

  //         ::-webkit-scrollbar-thumb:hover {
  //           background: ${themeConfig.accent}dd;
  //         }

  //         /* Enhanced focus styles */
  //         *:focus {
  //           outline: 2px solid ${themeConfig.accent}40;
  //           outline-offset: 2px;
  //         }

  //         /* Selection styles */
  //         ::selection {
  //           background: ${themeConfig.accent}40;
  //           color: ${themeConfig.textPrimary};
  //         }
  //       `}</style>
  //     </div>
  //   );
  // }

  // export default FlatMatrixTable;
//! WORKING WITH LIVING:-
import React, { useEffect, useRef, useState, useMemo } from "react";
import { getBuildingsById, getLevelsWithFlatsByBuilding } from "../api";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import SiteBarHome from "./SiteBarHome";
import { useTheme } from "../ThemeContext";
import html2pdf from "html2pdf.js";
import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";
// import ChecklistTransferModal from "./ChecklistTransferModal";
import ChecklistTransferModal from "./ChecklistTransferModal.jsx";


function FlatMatrixTable() {
  const [levels, setLevels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  // const { towerId } = useParams(); // or whatever your param is!

  // Enhanced states for advanced features
  const [expandedFloor, setExpandedFloor] = useState(null);
  const [showAllFlats, setShowAllFlats] = useState({});
  const [hoveredFlat, setHoveredFlat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(["all"]);
  const [selectedFloors, setSelectedFloors] = useState(["all"]);
  const [sortBy, setSortBy] = useState("floor");
  const [quickActions, setQuickActions] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const SIDEBAR_WIDTH = 0;
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [floorsPerPage] = useState(10);

  // Multi-select states
  const [selectedFlats, setSelectedFlats] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);
const [sidebarOpen, setSidebarOpen] = React.useState(true); // default true for desktop

  const {projectId, towerId } = useParams();

  const { theme } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();
  // const projectIdFromState = location.state?.projectId;
  const projectIdFromState = location.state?.projectId || projectId;

const storedProject = (() => {
  try {
    return JSON.parse(localStorage.getItem("SELECTED_PROJECT") || "null");
  } catch {
    return null;
  }
})();

const projectName =
  location.state?.projectName ||
  storedProject?.name ||
  storedProject?.project_name ||
  "";

const resolvedProjectId = useMemo(
  () => resolveProjectId(projectIdFromState),
  [projectIdFromState]
);
  const pdfRef = useRef(null);
  const searchRef = useRef(null);

  // ADD after other useState declarations:
  const [filterOverlay, setFilterOverlay] = useState(false);
  const [activeFilterSection, setActiveFilterSection] = useState(null);
// const [flatChecklistMap, setFlatChecklistMap] = useState({}); // { [flatId]: true }
const [flatChecklistMap, setFlatChecklistMap] = useState({});
  // per-floor checklist meta from transfer-getchchklist (level_id)
  const [levelChecklistMeta, setLevelChecklistMeta] = useState({});
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [activeLevelForModal, setActiveLevelForModal] = useState(null);
  const [floorInitContextMap, setFloorInitContextMap] = useState({});
  const [floorInitReady, setFloorInitReady] = useState(false);
  const [floorInitRefreshKey, setFloorInitRefreshKey] = useState(0);

  // Enhanced Theme Configuration
  const ORANGE = "#ffbe63";
  const BG_OFFWHITE = "#fcfaf7";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";
  const iconColor = ORANGE;
  const [towerName, setTowerName] = useState("");

function resolvePhaseId(phaseIdFromState) {
  if (phaseIdFromState) return Number(phaseIdFromState);

  try {
    const qs = new URLSearchParams(window.location.search);
    const q = qs.get("phase_id");
    if (q) return Number(q);
  } catch {}

  const towerScopedKey =
    resolvedProjectId && towerId
      ? `SELECTED_PHASE_${resolvedProjectId}_${towerId}`
      : null;

  const fromLs =
    (towerScopedKey ? localStorage.getItem(towerScopedKey) : null) ||
    localStorage.getItem("SELECTED_PHASE_ID") ||
    localStorage.getItem("ACTIVE_PHASE_ID") ||
    localStorage.getItem("PHASE_ID");

  if (fromLs) return Number(fromLs);

  return null;
}

const resolvedPhaseId = useMemo(
  () => resolvePhaseId(location.state?.phaseId),
  [location.state?.phaseId, resolvedProjectId, towerId]
);


function resolvePurposeId(purposeIdFromState) {
  if (purposeIdFromState) return Number(purposeIdFromState);

  try {
    const qs = new URLSearchParams(window.location.search);
    const q = qs.get("purpose_id");
    if (q) return Number(q);
  } catch {}

  const fromLs =
    localStorage.getItem("SELECTED_PURPOSE_ID") ||
    localStorage.getItem("ACTIVE_PURPOSE_ID") ||
    localStorage.getItem("PURPOSE_ID");

  if (fromLs) return Number(fromLs);

  return null;
}

const resolvedPurposeId = useMemo(
  () => resolvePurposeId(location.state?.purposeId),
  [location.state?.purposeId]
);


useEffect(() => {
  // Example: Assume you have towerId in props, URL, or location.state
  if (!towerId) return;

  async function fetchTowerName() {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const response = await projectInstance.get(
        `/buildings/${towerId}/`,  // <-- or whatever your endpoint is!
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200 && response.data?.name) {
        setTowerName(response.data.name);
      } else {
        setTowerName(`Tower ${towerId}`);
      }
    } catch {
      setTowerName(`Tower ${towerId}`);
    }
  }

  fetchTowerName();
}, [towerId]);

const isInitializerRole = () => {
  const role = String(getWorkflowRole() || "").trim().toUpperCase();
  return role === "INTIALIZER" || role === "INITIALIZER";
};

const shouldCreateChecklistFromInitContext = (ctx) => {
  if (!ctx || typeof ctx !== "object") return false;

  const message = String(ctx.message || "").toLowerCase();
  const alreadyExists =
    message.includes("checklist already exists") ||
    message.includes("legacy checklist already exists") ||
    message.includes("live checklist already exists");

  if (alreadyExists) return false;
  if (!ctx.template_id) return false;

  return true;
};

const ensureFloorChecklistForInitializer = async (levelId) => {
  if (!isInitializerRole()) return null;
  if (!resolvedProjectId || !resolvedPhaseId || !towerId || !levelId) {
    console.log("SKIP_FLOOR_INIT_CONTEXT", {
      role: getWorkflowRole(),
      resolvedProjectId,
      resolvedPurposeId,
      resolvedPhaseId,
      towerId,
      levelId,
    });
    return null;
  }

  const buildingId = Number(towerId);

  try {
    const initParams = {
      project_id: resolvedProjectId,
      phase_id: resolvedPhaseId,
      building_id: buildingId,
      tower_id: buildingId,
      level_id: levelId,
    };

    if (resolvedPurposeId) {
      initParams.purpose_id = resolvedPurposeId;
    }

    // console.log("CALLING_FLOOR_INIT_CONTEXT", initParams);

    const initRes = await NEWchecklistInstance.get("/init-context/", {
      params: initParams,
    });

    const ctx = initRes?.data || {};

    setFloorInitContextMap((prev) => ({
      ...prev,
      [levelId]: ctx,
    }));

    if (shouldCreateChecklistFromInitContext(ctx)) {
      const createPayload = {
        ...ctx,
        project_id: ctx.project_id || resolvedProjectId,
        phase_id: ctx.phase_id || resolvedPhaseId,
        building_id: ctx.building_id || buildingId,
        tower_id: ctx.tower_id || buildingId,
        level_id: ctx.level_id || levelId,
      };

      if (ctx.purpose_id || resolvedPurposeId) {
        createPayload.purpose_id = ctx.purpose_id || resolvedPurposeId;
      }

      console.log("CALLING_CREATE_LIVE_CHECKLIST_FROM_TEMPLATE", createPayload);

      await NEWchecklistInstance.post("/create-live-checklist-from-template/", createPayload);
    }

    return ctx;
  } catch (error) {
    console.error("FLOOR_INIT_CONTEXT_OR_CREATE_FAILED", {
      levelId,
      projectId: resolvedProjectId,
      purposeId: resolvedPurposeId,
      phaseId: resolvedPhaseId,
      towerId: buildingId,
      error,
    });
    return null;
  }
};

useEffect(() => {
  if (!resolvedProjectId || !resolvedPhaseId || !towerId || !levels?.length) {
    // console.log("FLOOR_INIT_EFFECT_BLOCKED", {
    //   role: getWorkflowRole(),
    //   resolvedProjectId,
    //   resolvedPurposeId,
    //   resolvedPhaseId,
    //   towerId,
    //   levelsLength: levels?.length,
    // });
    setFloorInitReady(false);
    return;
  }

  if (!isInitializerRole()) {
    setFloorInitReady(true);
    return;
  }

  let cancelled = false;
  const validLevelIds = levels
    .map((lvl) => lvl?.id ?? lvl?.level_id)
    .filter((levelId) => levelId != null);

  const runInitializerFlow = async () => {
    setFloorInitReady(false);

    // console.log("INIT FLOOR CHECK", {
    //   role: getWorkflowRole(),
    //   resolvedProjectId,
    //   resolvedPurposeId,
    //   resolvedPhaseId,
    //   towerId,
    //   levelsLength: levels?.length,
    //   validLevelIds,
    // });

    try {
      for (const levelId of validLevelIds) {
        if (cancelled) return;
        await ensureFloorChecklistForInitializer(levelId);
      }

      if (!cancelled) {
        setFloorInitReady(true);
        setFloorInitRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("FLOOR_INITIALIZER_FLOW_FAILED", error);
      if (!cancelled) {
        setFloorInitReady(true);
        setFloorInitRefreshKey((prev) => prev + 1);
      }
    }
  };

  runInitializerFlow();

  return () => {
    cancelled = true;
  };
}, [resolvedProjectId, resolvedPurposeId, resolvedPhaseId, towerId, levels]);
// ---- Fetch flats that have checklist started for current role ----
// ---- Fetch flats that have checklist started for current role ----
useEffect(() => {
  async function loadChecklistFlats() {
    if (!resolvedProjectId) {
      console.warn("No project id found for checklist API");
      return;
    }

    const role = getWorkflowRole();
    if (!role) {
      console.warn("No role found (FLOW_ROLE / ROLE) for checklist API");
      return;
    }

    try {
      const res = await NEWchecklistInstance.get("/started-per-flat/", {
        params: {
          project_id: resolvedProjectId,
          phase_id: resolvedPhaseId,
          role,
          building_id: towerId, // <-- 147 in tumhare URL jaisa
        },
      });

      // ⚠️ Important: API = { project_id, role, ..., results: [...] }
      const payload = res.data || {};
      const results = Array.isArray(payload.results) ? payload.results : [];

      const map = {};

      results.forEach((row) => {
        if (!row.started_for_role) return;

        const flatId = row.flat_id || row.unit_id || row.flat;
        if (!flatId) return;

        const state = deriveChecklistState(row); // "started" | "in_progress" | "completed" | null
        if (!state) return;

        map[flatId] = {
          state,
          stageId: row.stage_id,
          raw: row,
        };
      });

      // console.log("Checklist map 👉", map);
      setFlatChecklistMap(map);
    } catch (err) {
      console.error("Failed to load checklist flats", err);
    }
  }

  loadChecklistFlats();
}, [resolvedProjectId, resolvedPhaseId, towerId]);

  // ---- Fetch transfer-getchchklist per floor (level_id) - same pattern as project towers ----
  useEffect(() => {
    if (!resolvedProjectId || !resolvedPhaseId || !towerId || !levels?.length) return;
    if (isInitializerRole() && !floorInitReady) return;

    let cancelled = false;
    const buildingId = Number(towerId);
    const role = String(getWorkflowRole() || "").trim().toLowerCase();

    const init = {};
    levels.forEach((lvl) => {
      const lid = lvl?.id ?? lvl?.level_id;
      if (lid != null) {
        init[lid] = { loading: true, count: 0, hasChecklist: false, error: false };
      }
    });
    setLevelChecklistMeta(init);

    const fetchMeta = async (levelId) => {
      try {
        const params = {
          project_id: resolvedProjectId,
          phase_id: resolvedPhaseId,
          tower_id: buildingId,
          building_id: buildingId,
          level_id: levelId,
          limit: 50,
          offset: 0,
        };

        if (role) {
          params.role_id = role;
        }

        const res = await NEWchecklistInstance.get("/transfer-getchchklist/", {
          params,
        });

        const d = res?.data || {};
        const rawCount = Number(d?.count);
        const count = Number.isFinite(rawCount)
          ? rawCount
          : (Array.isArray(d?.results) ? d.results.length : 0);

        return { loading: false, count, hasChecklist: count > 0, error: false };
      } catch (error) {
        console.error("FLOOR_TRANSFER_GETCHECKLIST_FAILED", {
          levelId,
          projectId: resolvedProjectId,
          phaseId: resolvedPhaseId,
          towerId: buildingId,
          role,
          error,
        });
        return { loading: false, count: 0, hasChecklist: false, error: true };
      }
    };

    const runWithConcurrency = async (items, limit) => {
      let idx = 0;
      const runners = new Array(Math.min(limit, items.length))
        .fill(0)
        .map(async () => {
          while (idx < items.length && !cancelled) {
            const currentIndex = idx++;
            const lvl = items[currentIndex];
            const levelId = lvl?.id ?? lvl?.level_id;
            if (levelId == null) continue;

            const meta = await fetchMeta(levelId);
            if (cancelled) return;

            setLevelChecklistMeta((prev) => ({
              ...prev,
              [levelId]: meta,
            }));
          }
        });

      await Promise.all(runners);
    };

    runWithConcurrency(levels, 6);

    return () => {
      cancelled = true;
    };
  }, [
    resolvedProjectId,
    resolvedPhaseId,
    towerId,
    levels,
    floorInitReady,
    floorInitRefreshKey,
  ]);


// console.log("FlatMatrixTable: towerId is", towerId);

const getOptionDisplayLabel = (option) => {
  return String(option?.name || option?.label || option?.choice || "").trim();
};


  const themeConfig = {
    pageBg: bgColor,
    cardBg: cardColor,
    textPrimary: textColor,
    textSecondary: theme === "dark" ? "#a0a0a0" : "#666",
    accent: ORANGE,
    border: borderColor,
    icon: iconColor,
    headerBg: theme === "dark" ? "#2a2a35" : "#f8f6f3",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  };
  // --- FLOOR SORTING HELPERS ---
 // Floor sorting helpers
const SPECIAL_FLOOR_ORDER = [
  "Ground", "Basement", "Podium", "Parking", "Terrace"
];

// Given a level name, returns: {type: "floor"/"special"/"other", number?, specialIndex?}
function classifyLevel(name) {
  const match = name.match(/floor\s*(\d+)/i);
  if (match) return { type: "floor", number: parseInt(match[1]) };
  const specialIndex = SPECIAL_FLOOR_ORDER.findIndex(
    (sp) => sp.toLowerCase() === name.toLowerCase()
  );
  if (specialIndex !== -1) return { type: "special", specialIndex };
  return { type: "other" };
}
function resolveProjectId(projectIdFromState) {
  // 1) from route state (preferred)
  if (projectIdFromState) return Number(projectIdFromState);

  // 2) from URL ?project_id=
  try {
    const qs = new URLSearchParams(window.location.search);
    const q = qs.get("project_id");
    if (q) return Number(q);
  } catch {}

  // 3) from localStorage ACTIVE_PROJECT_ID / PROJECT_ID
  const fromLs =
    localStorage.getItem("ACTIVE_PROJECT_ID") ||
    localStorage.getItem("PROJECT_ID");
  if (fromLs) return Number(fromLs);

  // 4) fallback: first ACCESSES project
  try {
    const accessStr = localStorage.getItem("ACCESSES");
    if (accessStr && accessStr !== "undefined") {
      const accesses = JSON.parse(accessStr);
      if (Array.isArray(accesses) && accesses[0]?.project_id) {
        return Number(accesses[0].project_id);
      }
    }
  } catch {}

  return null;
}

function getWorkflowRole() {
  // FLOW_ROLE = Maker / Checker / Supervisor / Initializer
  const flow = localStorage.getItem("FLOW_ROLE");
  if (flow) return flow.toUpperCase();

  const display = localStorage.getItem("ROLE");
  return display ? String(display).toUpperCase() : "";
}
function deriveChecklistState(row) {
  const total = row.total_items || 0;
  const started = row.started_items || 0;
  const hasChecklist =
    Array.isArray(row.checklists) && row.checklists.length > 0;
  const anyCompleted =
    hasChecklist &&
    row.checklists.some((c) => String(c.status).toLowerCase() === "completed");

  if (!hasChecklist) return null;

  // 1) ✅ Completed: koi bhi checklist completed hai
  if (anyCompleted) return "completed";

  // 2) ✅ In progress: kuch items start ho chuke hain
  if (started > 0 && started < total) return "in_progress";

  // 3) ✅ Started: checklist assign hai, par items abhi tak start nahi,
  // ya total = started (but not completed as per above)
  if (started > 0 || total > 0) return "started";

  return null;
}


function getPrettyUnitNumber(unitName) {
  if (!unitName) return "";
  // Basement (B001 → B1)
  const basement = unitName.match(/^B0*([1-9]\d*)$/i);
  if (basement) return `B${basement[1]}`;
  // Podium (P001 → Po1)
  const podium = unitName.match(/^P0*([1-9]\d*)$/i);
  if (podium) return `Po${podium[1]}`;
  // Parking (PK001 or PRK001 → Pk1)
  const parking = unitName.match(/^PK0*([1-9]\d*)$/i) || unitName.match(/^PRK0*([1-9]\d*)$/i);
  if (parking) return `Pk${parking[1]}`;
  // Ground (G001 → G1)
  const ground = unitName.match(/^G0*([1-9]\d*)$/i);
  if (ground) return `G${ground[1]}`;
  // Terrace (T001 → T1)
  const terrace = unitName.match(/^T0*([1-9]\d*)$/i);
  if (terrace) return `T${terrace[1]}`;
  // Otherwise, unchanged
  return unitName;
}

const sortedLevels = useMemo(() => {
  // First: floors numerically (lowest to highest), then specials (as ordered), then others
  return [...levels].sort((a, b) => {
    const ca = classifyLevel(a.name || "");
    const cb = classifyLevel(b.name || "");

    if (ca.type === "floor" && cb.type === "floor") {
      return ca.number - cb.number; // Floor 1, Floor 2, ...
    }
    if (ca.type === "floor") return -1;
    if (cb.type === "floor") return 1;

    if (ca.type === "special" && cb.type === "special") {
      return ca.specialIndex - cb.specialIndex;
    }
    if (ca.type === "special") return 1; // Specials after floors
    if (cb.type === "special") return -1;

    // If neither floor nor special, sort alphabetically
    return (a.name || "").localeCompare(b.name || "");
  });
}, [levels]);


  // Add notification system
  const addNotification = (message, type = "info") => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications((prev) => [...prev.slice(-2), notification]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Keyboard shortcuts
// Keyboard shortcuts - FIXED VERSION
useEffect(() => {
  const handleKeyboard = (e) => {
    // Check if user is typing in an input field
    const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
    
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          searchRef.current?.focus();
          addNotification("Search focused", "info");
          break;
        case 'k':
          e.preventDefault();
          setShowFilters(prev => !prev);
          addNotification("Filters toggled", "info");
          break;
        case '/':
        case '?':
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          addNotification("Shortcuts panel toggled", "info");
          break;
      }
    }
    
    // Handle escape key
    if (e.key === 'Escape') {
      if (selectedFlat) {
        setSelectedFlat(null);
      } else if (showShortcuts) {
        setShowShortcuts(false);
      } else if (showFilters || filterOverlay) {
        setShowFilters(false);
        setFilterOverlay(false);
      } else if (quickActions) {
        setQuickActions(false);
      }
      addNotification("Closed active panels", "info");
    }
    
    // Handle other shortcuts without modifier keys (only if not in input)
    if (!isInputFocused && !e.ctrlKey && !e.metaKey && !e.altKey) {
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          setShowStats(prev => !prev);
          addNotification("Stats toggled", "info");
          break;
        case 'b':
          e.preventDefault();
          setBulkMode(prev => !prev);
          addNotification("Bulk mode toggled", "info");
          break;
        case 'c':
          if (selectedFlats.size > 0) {
            e.preventDefault();
            setSelectedFlats(new Set());
            setBulkMode(false);
            addNotification("Selection cleared", "info");
          }
          break;
      }
    }
  };

  // Add event listener
  document.addEventListener("keydown", handleKeyboard);
  
  // Cleanup
  return () => {
    document.removeEventListener("keydown", handleKeyboard);
  };
}, [selectedFlat, showShortcuts, showFilters, filterOverlay, quickActions, selectedFlats.size]);

  useEffect(() => {
  setLoading(true);
  setApiError(null);
  (async () => {
    try {
      const res = await getLevelsWithFlatsByBuilding(towerId);


      setLevels(res.data || []);
      // === END: SORT LOGIC ===

      addNotification(
        `Loaded ${res.data?.length || 0} floors successfully`,
        "success"
      );
    } catch (error) {
      setApiError("Failed to fetch levels/flats. Please try again.");
      setLevels([]);
      addNotification("Failed to load building data", "error");
    } finally {
      setLoading(false);
    }
  })();
}, [towerId]);


  // Enhanced statistics with more insights
  const stats = useMemo(() => {
    const allFlats = levels.flatMap((l) => l.flats || []);
    const typeCount = {};
    const statusCount = {};
    const floorStats = {};

    allFlats.forEach((flat) => {
      const type = flat.flattype?.type_name || "Unknown";
      const status = flat.status || "unknown";
      typeCount[type] = (typeCount[type] || 0) + 1;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    levels.forEach((level, index) => {
      const floorNum = levels.length - index;
      floorStats[floorNum] = {
        total: level.flats?.length || 0,
        available:
          level.flats?.filter((f) => f.status === "available").length || 0,
        occupied:
          level.flats?.filter((f) => f.status === "occupied").length || 0,
        occupancyRate: level.flats?.length
          ? Math.round(
              (level.flats.filter((f) => f.status === "occupied").length /
                level.flats.length) *
                100
            )
          : 0,
      };
    });

    return {
      totalFlats: allFlats.length,
      totalLevels: levels.length,
      typeBreakdown: typeCount,
      statusBreakdown: statusCount,
      floorStats,
      occupancyRate:
        Math.round(
          (allFlats.filter((f) => f.status === "occupied").length /
            allFlats.length) *
            100
        ) || 0,
      availableRate:
        Math.round(
          (allFlats.filter((f) => f.status === "available").length /
            allFlats.length) *
            100
        ) || 0,
      averageOccupancy:
        Math.round(
          Object.values(floorStats).reduce(
            (acc, floor) => acc + floor.occupancyRate,
            0
          ) / Object.keys(floorStats).length
        ) || 0,
    };
  }, [levels]);

  // Smart filtering and search
  const filteredAndSearchedLevels = useMemo(() => {
  let filtered = sortedLevels.map((level, index) => ({
      ...level,
      floorNumber: levels.length - index,
      flats: (level.flats || []).filter((flat) => {
        // Type filter
        const typeMatch =
          selectedType === "all" || flat.flattype?.type_name === selectedType;

        // Status filter
        const statusMatch =
          selectedStatuses.includes("all") ||
          selectedStatuses.some((status) => flat.status === status);

        // Search filter
        const searchMatch =
          !searchQuery ||
          flat.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (flat.flattype?.type_name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (flat.status || "").toLowerCase().includes(searchQuery.toLowerCase());

        return typeMatch && statusMatch && searchMatch;
      }),
    }));

    // Floor filter
    if (!selectedFloors.includes("all")) {
      filtered = filtered.filter((level) =>
        selectedFloors.includes(level.floorNumber.toString())
      );
    }

    // Remove empty floors after filtering
    filtered = filtered.filter((level) => level.flats.length > 0);

    // Sort floors
    if (sortBy === "occupancy") {
      filtered.sort((a, b) => {
        const aOcc =
          a.flats.filter((f) => f.status === "occupied").length /
          a.flats.length;
        const bOcc =
          b.flats.filter((f) => f.status === "occupied").length /
          b.flats.length;
        return bOcc - aOcc;
      });
    } else {
    }

    return filtered;
  }, [
    levels,
    selectedType,
    selectedStatuses,
    selectedFloors,
    searchQuery,
    sortBy,
    sortedLevels,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(
    filteredAndSearchedLevels.length / floorsPerPage
  );
  const paginatedLevels = useMemo(() => {
    const startIndex = (currentPage - 1) * floorsPerPage;
    return filteredAndSearchedLevels.slice(
      startIndex,
      startIndex + floorsPerPage
    );
  }, [filteredAndSearchedLevels, currentPage, floorsPerPage]);

  // Enhanced flat status configuration
  const getFlatStatusConfig = (flat, checklistInfo) => {
  if (!flat)
    return {
      bg: "transparent",
      border: "transparent",
      text: "transparent",
      icon: "○",
    };

  const configs = {
    occupied: {
      bg: `${themeConfig.accent}25`,
      border: themeConfig.accent,
      text: themeConfig.textPrimary,
      icon: "●",
      label: "Occupied",
      pulse: false,
    },
    available: {
      bg: `${themeConfig.success}20`,
      border: themeConfig.success,
      text: themeConfig.success,
      icon: "○",
      label: "Available",
      pulse: true,
    },
    maintenance: {
      bg: `${themeConfig.warning}20`,
      border: themeConfig.warning,
      text: themeConfig.warning,
      icon: "⚠",
      label: "Maintenance",
      pulse: true,
    },
    reserved: {
      bg: `${themeConfig.error}20`,
      border: themeConfig.error,
      text: themeConfig.error,
      icon: "◐",
      label: "Reserved",
      pulse: false,
    },
    default: {
      bg: `${themeConfig.textSecondary}10`,
      border: themeConfig.textSecondary,
      text: themeConfig.textSecondary,
      icon: "□",
      label: "Unknown",
      pulse: false,
    },
  };

  const base = configs[flat.status?.toLowerCase()] || configs.default;

  // 💡 Agar is flat ke liye checklist info hai, to 3-stage colour use karo
  if (checklistInfo && checklistInfo.state) {
    const st = checklistInfo.state; // "started" | "in_progress" | "completed"

    if (st === "started") {
      return {
        ...base,
        bg: `${themeConfig.info}18`,    // light blue
        border: themeConfig.info,
        text: themeConfig.info,
        icon: "●",
        label: "Checklist • Started",
        pulse: false,
    };
    }

    if (st === "in_progress") {
      return {
        ...base,
        bg: `${themeConfig.warning}18`, // orange
        border: themeConfig.warning,
        text: themeConfig.warning,
        icon: "●",
        label: "Checklist • In progress",
        pulse: true,
      };
    }

    if (st === "completed") {
      return {
        ...base,
        bg: `${themeConfig.success}22`, // green
        border: themeConfig.success,
        text: themeConfig.success,
        icon: "✓",
        label: "Checklist • Completed",
        pulse: false,
      };
    }
  }

  return base;
};


  // const getFlatStatusConfig = (flat) => {
  //   if (!flat)
  //     return {
  //       bg: "transparent",
  //       border: "transparent",
  //       text: "transparent",
  //       icon: "○",
  //     };

  //   const configs = {
  //     occupied: {
  //       bg: `${themeConfig.accent}25`,
  //       border: themeConfig.accent,
  //       text: themeConfig.textPrimary,
  //       icon: "●",
  //       label: "Occupied",
  //       pulse: false,
  //     },
  //     available: {
  //       bg: `${themeConfig.success}20`,
  //       border: themeConfig.success,
  //       text: themeConfig.success,
  //       icon: "○",
  //       label: "Available",
  //       pulse: true,
  //     },
  //     maintenance: {
  //       bg: `${themeConfig.warning}20`,
  //       border: themeConfig.warning,
  //       text: themeConfig.warning,
  //       icon: "⚠",
  //       label: "Maintenance",
  //       pulse: true,
  //     },
  //     reserved: {
  //       bg: `${themeConfig.error}20`,
  //       border: themeConfig.error,
  //       text: themeConfig.error,
  //       icon: "◐",
  //       label: "Reserved",
  //       pulse: false,
  //     },
  //     default: {
  //       bg: `${themeConfig.textSecondary}10`,
  //       border: themeConfig.textSecondary,
  //       text: themeConfig.textSecondary,
  //       icon: "□",
  //       label: "Unknown",
  //       pulse: false,
  //     },
  //   };

  //   return configs[flat.status?.toLowerCase()] || configs.default;
  // };

  // Handle floor selection
  const handleFloorClick = (levelId) => {
    if (expandedFloor === levelId) {
      setExpandedFloor(null);
      setShowAllFlats((prev) => ({ ...prev, [levelId]: false }));
    } else {
      setExpandedFloor(levelId);
      setShowAllFlats((prev) => ({ ...prev, [levelId]: false }));
      addNotification("Floor expanded - Click flats to inspect", "info");
    }
  };

  // Handle flat selection for bulk operations
  const handleFlatSelect = (flatId, e) => {
    e.stopPropagation();
    setSelectedFlats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(flatId)) {
        newSet.delete(flatId);
      } else {
        newSet.add(flatId);
      }
      return newSet;
    });
  };

  // // Handle flat click navigation
  // const handleFlatClick = (flat) => {
  //   if (bulkMode) return;

  //   navigate(`/project/:projectId/level/:towerId/inspection/flat/${flat.id}`, {
  //     state: {
  //       projectId: projectIdFromState,
  //       flatId: flat.id,
  //       flatNumber: flat.number,
  //       flatType: flat.flattype?.type_name,
  //     },
  //   });
  // };
//   const handleFlatClick = (flat, levelId) => {
//   if (bulkMode) return;

//   navigate(`/project/${projectId}/tower/${towerId}/floor/${levelId}/flat-inspection/${flat.id}`, {
//     state: {
//       projectId,
//       towerId,
//       purposeId: resolvedPurposeId,
//       phaseId: resolvedPhaseId,
//       levelId,
//       flatId: flat.id,
//       flatNumber: flat.number,
//       flatType: flat.flattype?.type_name,
//     },
//   });
// };
const handleFlatClick = (flat, levelId) => {
  if (bulkMode) return;
  console.log("🟨 FLOOR -> FLAT click payload", {
    projectId,
    towerId,
    purposeId: resolvedPurposeId,
    phaseId: resolvedPhaseId,
    levelId,
    flatId: flat.id,
    flatNumber: flat.number,
    flatType: flat.flattype?.type_name,
  });

  navigate(`/project/${projectId}/tower/${towerId}/floor/${levelId}/flat-inspection/${flat.id}`, {
    state: {
      projectId,
      towerId,
      purposeId: resolvedPurposeId,
      phaseId: resolvedPhaseId,
      levelId,
      flatId: flat.id,
      flatNumber: flat.number,
      flatType: flat.flattype?.type_name,
    },
  });
};

  const closeChecklistModal = () => {
    setChecklistModalOpen(false);
    setActiveLevelForModal(null);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedType("all");
    setSelectedStatuses(["all"]);
    setSelectedFloors(["all"]);
    setSearchQuery("");
    setCurrentPage(1);
    addNotification("All filters cleared", "info");
  };

  // Get ordinal for floor numbers
  const getLevelOrdinal = (n) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  // Enhanced Flat Card Component
 const FlatCard = ({ flat, isCompact = false, level, showingAll = false }) => {
  const checklistInfo = flatChecklistMap[flat.id]; // { state, ... } ya undefined

  const config = getFlatStatusConfig(flat, checklistInfo);
  const isSelected = selectedFlats.has(flat.id);
  const isHovered = hoveredFlat === flat.id;

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (!bulkMode) handleFlatClick(flat, level?.id);
        }}
        onMouseEnter={() => setHoveredFlat(flat.id)}
        onMouseLeave={() => setHoveredFlat(null)}
        className={`
          group relative cursor-pointer transition-all duration-300 transform
          ${isHovered ? "scale-105 z-10" : "hover:scale-105"} 
          ${isSelected ? "ring-2 ring-offset-2" : ""}
          ${isCompact ? "p-2 rounded-lg" : "p-3 rounded-xl"} 
          border-2 backdrop-blur-sm
          ${config.pulse ? "animate-pulse" : ""}
        `}
        style={{
          background: config.bg,
          borderColor: config.border,
          boxShadow: isHovered
            ? `0 8px 32px ${config.border}40`
            : `0 2px 8px ${config.border}20`,
          ringColor: themeConfig.accent,
        }}
      >
        {/* Multi-select checkbox */}
        {bulkMode && (
          <div
            className="absolute top-2 left-2 z-20"
            onClick={(e) => handleFlatSelect(flat.id, e)}
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                isSelected ? "bg-current" : "bg-transparent"
              }`}
              style={{ borderColor: config.border, color: config.border }}
            >
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div
          className={`absolute top-1 right-1 w-3 h-3 rounded-full flex items-center justify-center text-xs ${
            config.pulse ? "animate-pulse" : ""
          }`}
          style={{ background: config.border, color: "white" }}
        >
          {config.icon}
        </div>

        {/* Flat Number */}
        <div
          className={`font-bold ${isCompact ? "text-sm" : "text-base"} mb-1 ${
            bulkMode ? "ml-6" : ""
          }`}
          style={{ color: config.text }}
        >
        

{getPrettyUnitNumber(flat.number)}
        </div>

        {/* Flat Type */}
        {flat.flattype?.type_name && (
          <div
            className={`${
              isCompact ? "text-xs" : "text-sm"
            } font-medium opacity-80 ${bulkMode ? "ml-6" : ""}`}
            style={{ color: config.text }}
          >
            {flat.flattype.type_name}
          </div>
        )}
        {checklistInfo && (
  <div
    className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
    style={{
      background:
        checklistInfo.state === "completed"
          ? themeConfig.success
          : checklistInfo.state === "in_progress"
          ? themeConfig.warning
          : themeConfig.info,
      color: "white",
    }}
  >
    {checklistInfo.state === "completed"
      ? "Checklist Completed"
      : checklistInfo.state === "in_progress"
      ? "Checklist In Progress"
      : "Checklist Started"}
  </div>
)}

        {/* Enhanced Hover Tooltip */}
        {/* Enhanced Hover Tooltip */}
        {/* Enhanced Hover Tooltip */}
{!showingAll && (
<div 
  className={`absolute ${viewMode === 'list' ? 'left-full ml-2' : 'top-full'} left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl border`}
  style={{ 
    background: themeConfig.cardBg, 
    color: themeConfig.textPrimary,
    borderColor: themeConfig.border
  }}
>
          <div className="text-sm font-semibold mb-1">
            {config.label} • Unit {flat.number}
          </div>
          <div className="text-xs opacity-75 mb-1">
            {flat.flattype?.type_name || "Unknown Type"}
          </div>
          <div
            className="text-xs font-medium"
            style={{ color: themeConfig.accent }}
          >
            Click to inspect →
          </div>
          {/* Arrow */}
          <div
            className={`absolute ${
              viewMode === "list"
                ? "left-0 top-1/2 transform -translate-y-1/2 -translate-x-full"
                : "bottom-full left-1/2 transform -translate-x-1/2"
            } w-0 h-0 border-4 border-transparent`}
            style={{
              [viewMode === "list" ? "borderRightColor" : "borderBottomColor"]:
                themeConfig.cardBg,
            }}
          ></div>
        </div>
        )}
      </div>
    );
  };

  // Enhanced Floor Component
  const FloorComponent = ({ level, floorNumber }) => {
  const flats = level.flats || [];
  const isExpanded = expandedFloor === level.id;
  const showingAll = showAllFlats[level.id];
  const visibleFlats = showingAll ? flats : flats.slice(0, 5);
  const hasMore = flats.length > 5;
  const floorOccupancy = flats.length
    ? Math.round(
        (flats.filter((f) => f.status === "occupied").length / flats.length) *
          100
      )
    : 0;

  // 🔵 NEW: check if this floor has ANY checklist (flat-level)
  const hasChecklistOnFloor = flats.some(
    (flat) => !!flatChecklistMap[flat.id]
  );

  const levelMeta = levelChecklistMeta[level.id];
  const levelChecklistCount = Number.isFinite(levelMeta?.count)
    ? levelMeta.count
    : 0;
  const hasLevelChecklists = levelChecklistCount > 0;
  const isChecklistCountLoading = !!levelMeta?.loading;

  const floorBorderBase = hasChecklistOnFloor || hasLevelChecklists
    ? themeConfig.info // blue
    : themeConfig.border;

  const floorShadowBase = hasChecklistOnFloor || hasLevelChecklists
    ? themeConfig.info
    : themeConfig.border;

  const floorHeaderColor = hasChecklistOnFloor || hasLevelChecklists
    ? themeConfig.info
    : themeConfig.accent; // orange if no checklist


    return (
      <div
  className="border-2 rounded-2xl overflow-hidden transition-all duration-500 transform hover:scale-[1.01] hover:shadow-2xl"
  style={{
    background: themeConfig.cardBg,
    borderColor: isExpanded
      ? floorBorderBase
      : `${floorBorderBase}40`,
    boxShadow: isExpanded
      ? `0 12px 48px ${floorShadowBase}26`
      : `0 4px 16px ${floorShadowBase}15`,
  }}
>

        {/* Enhanced Floor Header */}
        <div
          onClick={() => handleFloorClick(level.id)}
          className={`
            className="relative cursor-pointer p-4 transition-all duration-300
            ${isExpanded ? "pb-6" : "hover:pb-5"}"
          `}
          style={{
            background: isExpanded
              ? `linear-gradient(135deg, ${themeConfig.accent}15, ${themeConfig.accent}08)`
              : `linear-gradient(135deg, ${themeConfig.headerBg}, ${themeConfig.cardBg})`,
          }}
        >
          {/* Animated Background Pattern */}
          <div
            className={`absolute inset-0 opacity-5 transition-opacity duration-500 ${
              isExpanded ? "opacity-10" : ""
            }`}
            style={{
              background: `repeating-linear-gradient(45deg, ${themeConfig.accent}30, ${themeConfig.accent}30 10px, transparent 10px, transparent 20px)`,
            }}
          ></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Enhanced Floor Badge */}
             <div
  className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3"
  style={{
    background: `linear-gradient(135deg, ${floorHeaderColor}, ${floorHeaderColor}dd)`,
  }}
>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                </svg>
              </div>

              {/* Enhanced Floor Info */}
              <div>
             <h3 className="text-xl font-bold mb-1" style={{ color: themeConfig.textPrimary }}>
  {(level.name)}
</h3>


                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span style={{ color: themeConfig.textSecondary }}>
                    {flats.length} Units
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="flex items-center gap-3">
              {/* Checklist count badge */}
              {levelMeta && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isChecklistCountLoading) {
                      setActiveLevelForModal(level);
                      setChecklistModalOpen(true);
                    }
                  }}
                  className="px-2 py-0.5 rounded-md text-xs font-medium transition-all hover:opacity-90"
                  style={{
                    background: `${themeConfig.info}20`,
                    color: themeConfig.info,
                    border: "none",
                    cursor: isChecklistCountLoading ? "not-allowed" : "pointer",
                    opacity: isChecklistCountLoading ? 0.6 : 1,
                  }}
                  disabled={isChecklistCountLoading}
                >
                  {isChecklistCountLoading
                    ? "Loading…"
                    : `${levelChecklistCount} checklist${levelChecklistCount !== 1 ? "s" : ""}`}
                </button>
              )}
              {/* Expand Indicator */}
              <div
                className={`transform transition-all duration-300 ${
                  isExpanded ? "rotate-180" : ""
                } p-2 rounded-full hover:bg-opacity-10`}
                style={{
                  color: themeConfig.accent,
                  backgroundColor: `${themeConfig.accent}10`,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
         <div
  className="absolute bottom-0 left-0 h-1 transition-all duration-700 rounded-full"
  style={{
    width: isExpanded ? "100%" : "0%",
    background: `linear-gradient(90deg, ${floorHeaderColor}, ${themeConfig.success})`,
  }}
></div>

        </div>

        {/* Enhanced Expandable Section */}
        <div
          className={`transition-all duration-700 ease-out overflow-hidden ${
            isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: themeConfig.textSecondary }}
                >
                  View:
                </span>
                <div
                  className="flex rounded-lg p-1"
                  style={{ background: `${themeConfig.textSecondary}15` }}
                >
                  {["grid", "list"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        viewMode === mode ? "shadow" : ""
                      }`}
                      style={{
                        background:
                          viewMode === mode
                            ? themeConfig.accent
                            : "transparent",
                        color:
                          viewMode === mode
                            ? "white"
                            : themeConfig.textSecondary,
                      }}
                    >
                      {mode === "grid" ? "⊞" : "☰"}{" "}
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBulkMode(!bulkMode)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    bulkMode ? "shadow" : ""
                  }`}
                  style={{
                    background: bulkMode
                      ? themeConfig.accent
                      : `${themeConfig.accent}20`,
                    color: bulkMode ? "white" : themeConfig.accent,
                  }}
                >
                  {bulkMode ? "✓ Exit Bulk" : "☑ Bulk Select"}
                </button>
                {selectedFlats.size > 0 && (
                  <span
                    className="px-2 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: `${themeConfig.success}20`,
                      color: themeConfig.success,
                    }}
                  >
                    {selectedFlats.size} selected
                  </span>
                )}
              </div>
            </div>

            {/* Enhanced Flats Display */}
            <div
              className={`mb-4 ${
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                  : "space-y-2"
              }`}
            >
              {visibleFlats.map((flat, index) => (
                <div
                  key={flat.id}
                  className={`transform transition-all duration-300 ${
                    viewMode === "list"
                      ? "flex items-center gap-4 p-2 rounded-lg hover:bg-opacity-50"
                      : ""
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: isExpanded
                      ? "fadeInUp 0.4s ease-out forwards"
                      : "none",
                    backgroundColor:
                      viewMode === "list"
                        ? `${themeConfig.textSecondary}05`
                        : "transparent",
                  }}
                >
                  <FlatCard
                    flat={flat}
                    isCompact={viewMode === "list"}
                    level={level}
                    showingAll={showingAll}
                  />
                </div>
              ))}
            </div>

            {/* Enhanced Show More Button */}
            {/* Enhanced Show More/Less Button */}
{hasMore && (
  <div className="text-center mb-4">
    {!showingAll ? (
      <button
        onClick={() =>
          setShowAllFlats((prev) => ({ ...prev, [level.id]: true }))
        }
        className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 mx-auto"
        style={{
          background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
          color: "white",
          boxShadow: `0 4px 16px ${themeConfig.accent}40`,
        }}
      >
        <span>Show {flats.length - 5} More Units</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
        </svg>
      </button>
    ) : (
      <button
        onClick={() =>
          setShowAllFlats((prev) => ({ ...prev, [level.id]: false }))
        }
        className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 mx-auto"
        style={{
          background: `linear-gradient(135deg, ${themeConfig.textSecondary}, ${themeConfig.textSecondary}dd)`,
          color: "white",
          boxShadow: `0 4px 16px ${themeConfig.textSecondary}40`,
        }}
      >
        <span>Show Less Units</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="transform rotate-180"
        >
          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
        </svg>
      </button>
    )}
  </div>
)}

            {/* Enhanced Floor Statistics */}
          </div>
        </div>
      </div>
    );
  };

  // Pagination Component
  const PaginationComponent = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `${themeConfig.textSecondary}15`,
            color: themeConfig.textSecondary,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" />
          </svg>
        </button>

        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `${themeConfig.textSecondary}15`,
            color: themeConfig.textSecondary,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-2 rounded-lg font-medium transition-all hover:scale-105 ${
              currentPage === page ? "shadow-lg" : ""
            }`}
            style={{
              background:
                currentPage === page
                  ? themeConfig.accent
                  : `${themeConfig.textSecondary}15`,
              color: currentPage === page ? "white" : themeConfig.textSecondary,
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `${themeConfig.textSecondary}15`,
            color: themeConfig.textSecondary,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
        </button>

        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `${themeConfig.textSecondary}15`,
            color: themeConfig.textSecondary,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
          </svg>
        </button>

        <div
          className="ml-4 text-sm"
          style={{ color: themeConfig.textSecondary }}
        >
          Page {currentPage} of {totalPages} ({filteredAndSearchedLevels.length}{" "}
          floors)
        </div>
      </div>
    );
  };

  // Notification Component
  const NotificationComponent = () => (
    <div
      className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 space-y-2"
      style={{ marginLeft: "110px" }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border-l-4 backdrop-blur-sm animate-fadeInRight"
          style={{
            background: `${themeConfig.cardBg}f0`,
            borderLeftColor: {
              success: themeConfig.accent,
              error: themeConfig.error,
              warning: themeConfig.warning,
              info: themeConfig.accent,
            }[notification.type],
            borderColor: `${themeConfig.border}40`,
          }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
            style={{
              background: {
                success: themeConfig.accent,
                error: themeConfig.error,
                warning: themeConfig.warning,
                info: themeConfig.accent,
              }[notification.type],
            }}
          >
            {
              {
                success: "✓",
                error: "✗",
                warning: "⚠",
                info: "ℹ",
              }[notification.type]
            }
          </div>
          <span
            className="text-sm font-medium"
            style={{ color: themeConfig.textPrimary }}
          >
            {notification.message}
          </span>
        </div>
      ))}
    </div>
  );

// Enhanced Keyboard Shortcuts Modal
const ShortcutsModal = () =>
  showShortcuts && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="max-w-lg w-full rounded-2xl p-6 shadow-2xl border-2 max-h-[80vh] overflow-y-auto"
        style={{
          background: themeConfig.cardBg,
          borderColor: themeConfig.border,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-bold flex items-center gap-2"
            style={{ color: themeConfig.textPrimary }}
          >
            <span>⌨️</span>
            Keyboard Shortcuts
          </h3>
          <button
            onClick={() => setShowShortcuts(false)}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-all"
            style={{ color: themeConfig.textSecondary }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Navigation Shortcuts */}
          <div>
            <h4 className="font-semibold mb-2 text-sm" style={{ color: themeConfig.accent }}>
              🧭 Navigation
            </h4>
            <div className="space-y-2 text-sm">
              {[
                { keys: 'Ctrl + F', action: 'Focus search bar', icon: '🔍' },
                { keys: 'Ctrl + K', action: 'Toggle filters panel', icon: '🎛️' },
                { keys: 'Ctrl + ?', action: 'Show/hide shortcuts', icon: '⌨️' },
                { keys: 'Escape', action: 'Close active panels', icon: '🚪' },
              ].map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ background: `${themeConfig.textSecondary}05` }}>
                  <div className="flex items-center gap-2">
                    <span>{shortcut.icon}</span>
                    <span style={{ color: themeConfig.textSecondary }}>
                      {shortcut.action}
                    </span>
                  </div>
                  <div
                    className="px-2 py-1 rounded font-mono text-xs font-bold"
                    style={{
                      background: themeConfig.accent,
                      color: 'white',
                    }}
                  >
                    {shortcut.keys}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View Shortcuts */}
          <div>
            <h4 className="font-semibold mb-2 text-sm" style={{ color: themeConfig.success }}>
              👁️ View Controls
            </h4>
            <div className="space-y-2 text-sm">
              {[
                { keys: 'S', action: 'Toggle statistics panel', icon: '📊' },
                { keys: 'B', action: 'Toggle bulk selection mode', icon: '☑️' },
                { keys: 'C', action: 'Clear selections (when active)', icon: '🗑️' },
              ].map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ background: `${themeConfig.textSecondary}05` }}>
                  <div className="flex items-center gap-2">
                    <span>{shortcut.icon}</span>
                    <span style={{ color: themeConfig.textSecondary }}>
                      {shortcut.action}
                    </span>
                  </div>
                  <div
                    className="px-2 py-1 rounded font-mono text-xs font-bold"
                    style={{
                      background: themeConfig.success,
                      color: 'white',
                    }}
                  >
                    {shortcut.keys}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interaction Shortcuts */}
          <div>
            <h4 className="font-semibold mb-2 text-sm" style={{ color: themeConfig.info }}>
              🖱️ Interactions
            </h4>
            <div className="space-y-2 text-sm">
              {[
                { keys: 'Click Floor', action: 'Expand/collapse floor details', icon: '🏢' },
                { keys: 'Click Unit', action: 'Navigate to inspection page', icon: '🔍' },
                { keys: 'Hover Unit', action: 'Show quick unit details', icon: '💡' },
              ].map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ background: `${themeConfig.textSecondary}05` }}>
                  <div className="flex items-center gap-2">
                    <span>{shortcut.icon}</span>
                    <span style={{ color: themeConfig.textSecondary }}>
                      {shortcut.action}
                    </span>
                  </div>
                  <div
                    className="px-2 py-1 rounded font-mono text-xs font-bold"
                    style={{
                      background: themeConfig.info,
                      color: 'white',
                    }}
                  >
                    {shortcut.keys}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div 
          className="mt-6 p-3 rounded-lg border-l-4"
          style={{ 
            background: `${themeConfig.accent}10`,
            borderLeftColor: themeConfig.accent 
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span>💡</span>
            <span className="font-semibold text-xs" style={{ color: themeConfig.accent }}>
              Pro Tip
            </span>
          </div>
          <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
            Most shortcuts work globally, but avoid conflicts when typing in search or input fields.
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => setShowShortcuts(false)}
          className="w-full mt-4 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
          style={{
            background: themeConfig.accent,
            color: 'white'
          }}
        >
          Got it! (Press Escape to close)
        </button>
      </div>
    </div>
  );
  // ADD after ShortcutsModal component:
  const FilterOverlay = () =>
    filterOverlay && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div
          className="max-w-2xl w-full rounded-2xl p-6 shadow-2xl border-2 max-h-[80vh] overflow-y-auto"
          style={{
            background: themeConfig.cardBg,
            borderColor: themeConfig.border,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3
              className="text-xl font-bold"
              style={{ color: themeConfig.textPrimary }}
            >
              Filter Options
            </h3>
            <button
              onClick={() => setFilterOverlay(false)}
              className="p-2 rounded-lg hover:bg-opacity-10 transition-all"
              style={{ color: themeConfig.textSecondary }}
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Floors Filter */}
            <div>
              <button
                onClick={() =>
                  setActiveFilterSection(
                    activeFilterSection === "floors" ? null : "floors"
                  )
                }
                className="w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all"
                style={{
                  background:
                    activeFilterSection === "floors"
                      ? `${themeConfig.accent}10`
                      : "transparent",
                  borderColor:
                    activeFilterSection === "floors"
                      ? themeConfig.accent
                      : themeConfig.border,
                  color: themeConfig.textPrimary,
                }}
              >
                <span className="font-medium">Floors</span>
                <span
                  className={`transform transition-all ${
                    activeFilterSection === "floors" ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {activeFilterSection === "floors" && (
                <div
                  className="mt-2 p-3 rounded-lg border max-h-48 overflow-y-auto"
                  style={{ borderColor: `${themeConfig.border}40` }}
                >
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFloors.includes("all")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFloors(["all"]);
                          }
                        }}
                        className="rounded"
                      />
                      <span style={{ color: themeConfig.textPrimary }}>
                        All Floors ({stats.totalLevels})
                      </span>
                    </label>
                    {Object.entries(stats.floorStats).map(([floor, data]) => (
                      <label
                        key={floor}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFloors.includes(floor)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFloors((prev) =>
                                prev.filter((f) => f !== "all").concat(floor)
                              );
                            } else {
                              setSelectedFloors((prev) =>
                                prev.filter((f) => f !== floor)
                              );
                            }
                          }}
                          className="rounded"
                        />
                        <span style={{ color: themeConfig.textPrimary }}>
                          Floor {floor} ({data.total} units,{" "}
                          {data.occupancyRate}% occupied)
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Unit Types Filter */}
            <div>
              <button
                onClick={() =>
                  setActiveFilterSection(
                    activeFilterSection === "types" ? null : "types"
                  )
                }
                className="w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all"
                style={{
                  background:
                    activeFilterSection === "types"
                      ? `${themeConfig.accent}10`
                      : "transparent",
                  borderColor:
                    activeFilterSection === "types"
                      ? themeConfig.accent
                      : themeConfig.border,
                  color: themeConfig.textPrimary,
                }}
              >
                <span className="font-medium">Unit Types</span>
                <span
                  className={`transform transition-all ${
                    activeFilterSection === "types" ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {activeFilterSection === "types" && (
                <div
                  className="mt-2 p-3 rounded-lg border"
                  style={{ borderColor: `${themeConfig.border}40` }}
                >
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="unitType"
                        checked={selectedType === "all"}
                        onChange={() => setSelectedType("all")}
                        className="rounded"
                      />
                      <span style={{ color: themeConfig.textPrimary }}>
                        All Types ({stats.totalFlats})
                      </span>
                    </label>
                    {Object.entries(stats.typeBreakdown).map(
                      ([type, count]) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="unitType"
                            checked={selectedType === type}
                            onChange={() => setSelectedType(type)}
                            className="rounded"
                          />
                          <span style={{ color: themeConfig.textPrimary }}>
                            {type} ({count} units)
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <button
                onClick={() =>
                  setActiveFilterSection(
                    activeFilterSection === "status" ? null : "status"
                  )
                }
                className="w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all"
                style={{
                  background:
                    activeFilterSection === "status"
                      ? `${themeConfig.accent}10`
                      : "transparent",
                  borderColor:
                    activeFilterSection === "status"
                      ? themeConfig.accent
                      : themeConfig.border,
                  color: themeConfig.textPrimary,
                }}
              >
                <span className="font-medium">Status</span>
                <span
                  className={`transform transition-all ${
                    activeFilterSection === "status" ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {activeFilterSection === "status" && (
                <div
                  className="mt-2 p-3 rounded-lg border"
                  style={{ borderColor: `${themeConfig.border}40` }}
                >
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes("all")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStatuses(["all"]);
                          }
                        }}
                        className="rounded"
                      />
                      <span style={{ color: themeConfig.textPrimary }}>
                        All Status ({stats.totalFlats})
                      </span>
                    </label>
                    {Object.entries(stats.statusBreakdown).map(
                      ([status, count]) => (
                        <label
                          key={status}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStatuses.includes(status)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStatuses((prev) =>
                                  prev.filter((s) => s !== "all").concat(status)
                                );
                              } else {
                                setSelectedStatuses((prev) =>
                                  prev.filter((s) => s !== status)
                                );
                              }
                            }}
                            className="rounded"
                          />
                          <span style={{ color: themeConfig.textPrimary }}>
                            {status.charAt(0).toUpperCase() + status.slice(1)} (
                            {count})
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sort Options */}
            <div>
              <button
                onClick={() =>
                  setActiveFilterSection(
                    activeFilterSection === "sort" ? null : "sort"
                  )
                }
                className="w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all"
                style={{
                  background:
                    activeFilterSection === "sort"
                      ? `${themeConfig.accent}10`
                      : "transparent",
                  borderColor:
                    activeFilterSection === "sort"
                      ? themeConfig.accent
                      : themeConfig.border,
                  color: themeConfig.textPrimary,
                }}
              >
                <span className="font-medium">Sort By</span>
                <span
                  className={`transform transition-all ${
                    activeFilterSection === "sort" ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {activeFilterSection === "sort" && (
                <div
                  className="mt-2 p-3 rounded-lg border"
                  style={{ borderColor: `${themeConfig.border}40` }}
                >
                  <div className="space-y-2">
                    {[
                      { value: "floor", label: "Floor Number" },
                      { value: "occupancy", label: "Occupancy Rate" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="sortBy"
                          checked={sortBy === option.value}
                          onChange={() => setSortBy(option.value)}
                          className="rounded"
                        />
                        <span style={{ color: themeConfig.textPrimary }}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: `${themeConfig.error}20`,
                color: themeConfig.error,
              }}
            >
              Clear All
            </button>
            <button
              onClick={() => setFilterOverlay(false)}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: themeConfig.accent,
                color: "white",
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border-2 rounded-2xl overflow-hidden animate-pulse"
          style={{
            background: themeConfig.cardBg,
            borderColor: `${themeConfig.border}20`,
          }}
        >
          <div className="p-4 flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl"
              style={{ background: `${themeConfig.textSecondary}20` }}
            ></div>
            <div className="flex-1">
              <div
                className="h-6 rounded mb-2"
                style={{ background: `${themeConfig.textSecondary}20` }}
              ></div>
              <div
                className="h-4 rounded w-2/3"
                style={{ background: `${themeConfig.textSecondary}15` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Main loading state
  if (loading) {
    return (
      <div
        className="flex min-h-screen"
        style={{ background: themeConfig.pageBg }}
      >
        {/* <SiteBarHome /> */}
        <div className="ml-[220px] p-8 flex items-center justify-center">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto mb-4"
              style={{
                borderColor: `${themeConfig.accent}40`,
                borderTopColor: "transparent",
              }}
            ></div>
            <div
              className="text-lg font-medium animate-pulse"
              style={{ color: themeConfig.textPrimary }}
            >
              Loading tower data...
            </div>
            <div
              className="text-sm mt-2"
              style={{ color: themeConfig.textSecondary }}
            >
              Preparing your building matrix
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <div
        className="flex min-h-screen"
        style={{ background: themeConfig.pageBg }}
      >
        <div className="ml-[220px] p-8 flex items-center justify-center">
          <div
            className="border-2 rounded-xl p-8 text-center max-w-md"
            style={{
              background: themeConfig.cardBg,
              borderColor: themeConfig.error,
            }}
          >
            <div className="text-4xl mb-4" style={{ color: themeConfig.error }}>
              ⚠️
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: themeConfig.textPrimary }}
            >
              Error Loading Data
            </h3>
            <p style={{ color: themeConfig.textSecondary }}>{apiError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 rounded-lg transition-colors"
              style={{
                background: themeConfig.accent,
                color: "white",
                border: `2px solid ${themeConfig.accent}`,
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
     <div className="flex min-h-screen" style={{ background: themeConfig.pageBg }}>

      {/* <SiteBarHome /> */}

<main
  className="py-6 px-6 w-full min-w-0 transition-all duration-300"
  style={{
    marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
    transition: "margin-left 0.3s"
  }}
>     {/* Enhanced Header with Search & Filters */}
        <div
          className="border-2 rounded-2xl p-6 mb-6 shadow-xl backdrop-blur-sm"
          style={{
            background: `${themeConfig.cardBg}f0`,
            borderColor: themeConfig.border,
            boxShadow: `0 8px 32px ${themeConfig.accent}20`,
          }}
        >
          <div className="flex flex-col gap-4">
            {/* Top Row - Title & Main Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                  </svg>
                </div>

                <div>
                 <h2 className="text-2xl font-bold" style={{ color: borderColor }}>
  {towerName}
</h2>

                  <p
                    className="text-sm"
                    style={{ color: themeConfig.textSecondary }}
                  >
                    Interactive Building Matrix • {stats.totalLevels} Floors •{" "}
                    {stats.totalFlats} Units
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                  style={{
                    background: showStats
                      ? themeConfig.accent
                      : `${themeConfig.accent}20`,
                    color: showStats ? "white" : themeConfig.accent,
                    border: `2px solid ${themeConfig.accent}`,
                  }}
                >
                  {showStats ? "Hide" : "Show"} Stats
                </button>

                <button
                  onClick={() => setShowShortcuts(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: `${themeConfig.info}20`,
                    color: themeConfig.info,
                  }}
                  title="Keyboard Shortcuts (Ctrl + ?)"
                >
                  Shortcuts
                </button>
              </div>
            </div>

            {/* Search & Filter Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Enhanced Search */}
              <div className="flex-1 relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search flats by number, type, or status... (Ctrl+F)"
                  className="w-full px-4 py-3 pl-12 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: themeConfig.cardBg,
                    borderColor: searchQuery
                      ? themeConfig.accent
                      : themeConfig.border,
                    color: themeConfig.textPrimary,
                  }}
                />
                <div
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  style={{ color: themeConfig.textSecondary }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-opacity-10 transition-all"
                    style={{ color: themeConfig.textSecondary }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setFilterOverlay(!filterOverlay)}
                className={`px-4 py-3 rounded-xl font-medium transition-all transform hover:scale-105 flex items-center gap-2 ${
                  filterOverlay ? "shadow-lg" : ""
                }`}
                style={{
                  background: filterOverlay
                    ? themeConfig.accent
                    : `${themeConfig.accent}20`,
                  color: filterOverlay ? "white" : themeConfig.accent,
                  border: `2px solid ${themeConfig.accent}`,
                }}
              >
                <span>Filters</span>
                {(selectedType !== "all" ||
                  !selectedStatuses.includes("all") ||
                  !selectedFloors.includes("all")) && (
                  <span
                    className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                    style={{ background: "rgba(255,255,255,0.3)" }}
                  >
                    !
                  </span>
                )}
              </button>
              {/* Clear Filters */}
              {(selectedType !== "all" ||
                !selectedStatuses.includes("all") ||
                !selectedFloors.includes("all") ||
                searchQuery) && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-3 rounded-xl font-medium transition-all transform hover:scale-105 flex items-center gap-2"
                  style={{
                    background: `${themeConfig.error}20`,
                    color: themeConfig.error,
                    border: `2px solid ${themeConfig.error}`,
                  }}
                >
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Advanced Filters Panel */}

            {/* Enhanced Stats Panel */}
            <div
              className={`transition-all duration-500 ease-out overflow-hidden ${
                showStats ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div
                className="border-t-2 pt-4"
                style={{ borderColor: `${themeConfig.border}30` }}
              >
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Total Units",
                      value: stats.totalFlats,
                      color: themeConfig.accent,
                    },
                    {
                      label: "Floors",
                      value: stats.totalLevels,
                      color: themeConfig.success,
                    },
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      className="text-center p-3 rounded-xl transition-all duration-300 hover:scale-105 cursor-default"
                      style={{ background: `${stat.color}15` }}
                    >
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                      <div
                        className="text-xs font-medium"
                        style={{ color: themeConfig.textSecondary }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {(searchQuery ||
          selectedType !== "all" ||
          !selectedStatuses.includes("all") ||
          !selectedFloors.includes("all")) && (
          <div
            className="border rounded-xl p-4 mb-6"
            style={{
              background: `${themeConfig.info}10`,
              borderColor: `${themeConfig.info}30`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: themeConfig.info, color: "white" }}
                >
                  📋
                </div>
                <div>
                  <div
                    className="font-semibold text-sm"
                    style={{ color: themeConfig.textPrimary }}
                  >
                    Showing {filteredAndSearchedLevels.length} floors (
                    {filteredAndSearchedLevels.reduce(
                      (acc, level) => acc + level.flats.length,
                      0
                    )}{" "}
                    units)
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: themeConfig.textSecondary }}
                  >
                    {searchQuery && `Search: "${searchQuery}" • `}
                    {selectedType !== "all" && `Type: ${selectedType} • `}
                    Filters applied
                  </div>
                </div>
              </div>

              <div
                className="text-sm"
                style={{ color: themeConfig.textSecondary }}
              >
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
        )}

        {/* Floors Display */}
        {paginatedLevels.length === 0 ? (
          <div
            className="border-2 rounded-2xl p-12 text-center"
            style={{
              background: themeConfig.cardBg,
              borderColor: `${themeConfig.border}40`,
            }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: themeConfig.textPrimary }}
            >
              No floors found
            </h3>
            <p className="mb-4" style={{ color: themeConfig.textSecondary }}>
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              style={{
                background: themeConfig.accent,
                color: "white",
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedLevels.map((level, index) => (
              <FloorComponent
                key={level.id}
                level={level}
                floorNumber={level.floorNumber}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <PaginationComponent />

        {/* Bulk Actions Panel */}
        {selectedFlats.size > 0 && (
          <div
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
            style={{ marginLeft: "110px" }} // Account for sidebar
          >
            <div
              className="flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-sm"
              style={{
                background: `${themeConfig.cardBg}f0`,
                borderColor: themeConfig.accent,
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: themeConfig.accent }}
              >
                {selectedFlats.size}
              </div>

              <div>
                <div
                  className="font-semibold"
                  style={{ color: themeConfig.textPrimary }}
                >
                  {selectedFlats.size} units selected
                </div>
                <div
                  className="text-xs"
                  style={{ color: themeConfig.textSecondary }}
                >
                  Choose an action below
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
  onClick={() => {
    // Bulk inspect action
    addNotification(
      `Bulk inspection started for ${selectedFlats.size} units`,
      "info"
    );
  }}
  className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 backdrop-blur-sm"
  style={{
    background: `${themeConfig.accent}20`,
    color: themeConfig.accent,
    border: `1px solid ${themeConfig.accent}40`,
  }}
>
  Inspect All
</button>

<button
  onClick={() => {
    setSelectedFlats(new Set());
    setBulkMode(false);
    addNotification("Selection cleared", "info");
  }}
  className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 backdrop-blur-sm"
  style={{
    background: `${themeConfig.error}20`,
    color: themeConfig.error,
    border: `1px solid ${themeConfig.error}40`,
  }}
>
  Clear
</button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Footer */}
        <div className="mt-12 text-center">
          <div
            className="inline-flex items-center gap-4 px-6 py-3 rounded-xl"
            style={{
              background: `${themeConfig.textSecondary}10`,
              border: `1px solid ${themeConfig.textSecondary}20`,
            }}
          >
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <button
            onClick={() => setQuickActions(!quickActions)}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform ${
              quickActions ? "rotate-45 scale-110" : "hover:scale-110"
            }`}
            style={{
              background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
              color: "white",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>

          {/* Quick Actions Menu */}
          <div
            className={`absolute bottom-16 right-0 transition-all duration-300 ${
              quickActions
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4 pointer-events-none"
            }`}
          >
            <div className="space-y-2">
              {[
  {
    label: "Search",
    action: () => searchRef.current?.focus(),
  },
  {
    label: "Filters",
    action: () => setFilterOverlay(prev => !prev),
  },
  {
    label: "Stats",
    action: () => setShowStats(!showStats),
  },
  {
    label: "Shortcuts",
    action: () => setShowShortcuts(true),
  },
].map((item, index) => (
  <button
    key={item.label}
    onClick={() => {
      item.action();
      setQuickActions(false);
    }}
    className="flex items-center justify-center px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 whitespace-nowrap backdrop-blur-sm w-32"     style={{
      background: `${themeConfig.accent}20`,
      color: themeConfig.accent,
      border: `1px solid ${themeConfig.accent}40`,
      animationDelay: `${index * 50}ms`,
    }}
  >
    <span className="font-medium">{item.label}</span>
  </button>
))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Notifications */}
      <NotificationComponent />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal />

      <FilterOverlay />

      {/* <ChecklistTransferModal
        isOpen={checklistModalOpen && !!activeLevelForModal}
        onClose={closeChecklistModal}
        context={
          activeLevelForModal
            ? {
                type: "level",
                levelId: activeLevelForModal.id ?? activeLevelForModal.level_id,
                buildingId: Number(towerId),
                name: activeLevelForModal.name,
              }
            : null
        }
        projectId={resolvedProjectId}
        projectName={projectName}
        theme={theme}
        cardColor={cardColor}
        textColor={textColor}
        borderColor={borderColor}
      /> */}
 {/* <ChecklistTransferModal
  isOpen={checklistModalOpen && !!activeLevelForModal}
  onClose={closeChecklistModal}
  context={
    activeLevelForModal
      ? {
          type: "level",
          levelId: activeLevelForModal.id ?? activeLevelForModal.level_id,
          buildingId: Number(towerId),
          towerId: Number(towerId),
          name: activeLevelForModal.name,
        }
      : null
  }
  projectId={resolvedProjectId}
  projectName={projectName}
  phaseId={resolvedPhaseId}
  purposeId={resolvedPurposeId}
  roleId={getWorkflowRole()}
  theme={theme}
  cardColor={cardColor}
  textColor={textColor}
  borderColor={borderColor}
/> */}
<ChecklistTransferModal
  isOpen={checklistModalOpen && !!activeLevelForModal}
  onClose={closeChecklistModal}
  context={
    activeLevelForModal
      ? {
          type: "level",
          levelId: activeLevelForModal.id ?? activeLevelForModal.level_id,
          buildingId: Number(towerId),
          towerId: Number(towerId),
          name: activeLevelForModal.name,
        }
      : null
  }
  projectId={resolvedProjectId}
  projectName={projectName}
  phaseId={resolvedPhaseId}
  purposeId={resolvedPurposeId}
  roleId={getWorkflowRole?.() || localStorage.getItem("FLOW_ROLE") || localStorage.getItem("ROLE")}
  theme={theme}
  cardColor={cardColor}
  textColor={textColor}
  borderColor={borderColor}
/>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-fadeInRight {
          animation: fadeInRight 0.3s ease-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${theme === "dark" ? "#2a2a35" : "#f8f6f3"};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: ${themeConfig.accent};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${themeConfig.accent}dd;
        }

        /* Enhanced focus styles */
        *:focus {
          outline: 2px solid ${themeConfig.accent}40;
          outline-offset: 2px;
        }

        /* Selection styles */
        ::selection {
          background: ${themeConfig.accent}40;
          color: ${themeConfig.textPrimary};
        }
      `}</style>
    </div>
  );
}

export default FlatMatrixTable;