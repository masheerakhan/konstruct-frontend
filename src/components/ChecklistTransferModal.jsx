import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { NEWchecklistInstance, projectInstance } from "../api/axiosInstance";

/* ------------------------------ Data helpers ------------------------------ */

const isDirectChecklist = (obj) =>
  !!obj &&
  typeof obj === "object" &&
  obj.id != null &&
  (Array.isArray(obj.items) ||
    "status" in obj ||
    "initialized_at" in obj ||
    "name" in obj);

// const flattenChecklists = (apiData) => {
//   const results = Array.isArray(apiData?.results) ? apiData.results : [];
//   const flattened = [];

//   for (const r of results) {
//     if (isDirectChecklist(r)) {
//       flattened.push(r);
//       continue;
//     }

//     const legacy = Array.isArray(r?.checklists) ? r.checklists : [];
//     const available = Array.isArray(r?.available_for_me)
//       ? r.available_for_me
//       : [];
//     const assigned = Array.isArray(r?.assigned_to_me) ? r.assigned_to_me : [];

//     for (const c of [...available, ...assigned, ...legacy]) {
//       if (c && c.id != null) flattened.push(c);
//     }
//   }

//   const seen = new Set();
//   return flattened.filter((c) => {
//     if (seen.has(c.id)) return false;
//     seen.add(c.id);
//     return true;
//   });
// };

const flattenChecklists = (apiData) => {
  const results = Array.isArray(apiData?.results) ? apiData.results : [];
  const userGenerated = Array.isArray(apiData?.user_generated_checklists)
    ? apiData.user_generated_checklists
    : [];

  const flattened = [];

  for (const r of results) {
    if (isDirectChecklist(r)) {
      flattened.push(r);
      continue;
    }

    const legacy = Array.isArray(r?.checklists) ? r.checklists : [];
    const available = Array.isArray(r?.available_for_me)
      ? r.available_for_me
      : [];
    const assigned = Array.isArray(r?.assigned_to_me) ? r.assigned_to_me : [];

    for (const c of [...available, ...assigned, ...legacy]) {
      if (c && c.id != null) flattened.push(c);
    }
  }

  for (const c of userGenerated) {
    if (c && c.id != null) flattened.push(c);
  }

  const seen = new Set();
  return flattened.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
};

const patchChecklistInResults = (data, patcher) => {
  if (!data) return data;
  const next = { ...data };
  if (!Array.isArray(next.results)) return next;

  next.results = next.results.map((r) => {
    if (isDirectChecklist(r)) return patcher(r);
    if (!r || typeof r !== "object") return r;

    const patchArr = (arr) => (Array.isArray(arr) ? arr.map(patcher) : arr);

    return {
      ...r,
      available_for_me: patchArr(r.available_for_me),
      assigned_to_me: patchArr(r.assigned_to_me),
      checklists: patchArr(r.checklists),
    };
  });

  return next;
};

const applyChecklistUpdate = (data, updated) => {
  if (!data || !updated?.id) return data;

  return patchChecklistInResults(data, (cl) =>
    cl?.id === updated.id ? { ...cl, ...updated } : cl,
  );
};

const applyItemUpdate = (data, patch) => {
  if (!data || !patch?.item_id) return data;

  return patchChecklistInResults(data, (cl) => {
    if (!cl || typeof cl !== "object") return cl;

    const next = { ...cl, status: patch.checklist_status ?? cl.status };

    if (Array.isArray(next.items)) {
      next.items = next.items.map((it) =>
        it?.id === patch.item_id
          ? { ...it, status: patch.item_status ?? it.status }
          : it,
      );
    }

    return next;
  });
};

const applyMakerDone = (data, payload) => {
  const item = payload?.item;
  if (!data || !item?.id) return data;

  const submission = payload?.submission;

  return patchChecklistInResults(data, (cl) => {
    if (!cl || typeof cl !== "object") return cl;

    const next = { ...cl };

    if (Array.isArray(next.items)) {
      next.items = next.items.map((it) =>
        it?.id === item.id
          ? {
              ...it,
              status: item.status ?? it.status,
              ...(submission ? { submission } : {}),
            }
          : it,
      );
    }

    if (cl?.id === item.checklist && payload?.checklist_status) {
      next.status = payload.checklist_status;
    }

    return next;
  });
};

/* ------------------------------ Misc utils ------------------------------ */

const fmtDateTime = (v) => {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(v);
  }
};

// const getRole = () => {
//   const r = (
//     localStorage.getItem("ACTIVE_ROLE") ||
//     localStorage.getItem("FLOW_ROLE") ||
//     localStorage.getItem("ROLE") ||
//     ""
//   )
//     .trim()
//     .toLowerCase();

//   if (
//     ["maker", "checker", "supervisor", "initializer", "intializer"].includes(r)
//   ) {
//     return r === "initializer" ? "intializer" : r;
//   }
//   return "checker";
// };

// const normalizeRole = (r) => {
//   const role = String(r || "")
//     .trim()
//     .toLowerCase();
//   if (role === "initializer") return "intializer";
//   return role;
// };

const getProjectRoleStorageKey = (pid) => `ACTIVE_ROLE_${pid}`;

const normalizeRole = (r) => {
  const role = String(r || "")
    .trim()
    .toLowerCase();

  if (!role) return "";
  if (role === "initializer") return "intializer";
  return role;
};

// const getRole = (pid, fallbackRoleId = "") => {
//   const projectRole = normalizeRole(
//     localStorage.getItem(getProjectRoleStorageKey(pid)),
//   );
//   if (projectRole) return projectRole;

//   const passedRole = normalizeRole(fallbackRoleId);
//   if (passedRole) return passedRole;

//   const flowRole = normalizeRole(localStorage.getItem("FLOW_ROLE"));
//   if (flowRole) return flowRole;

//   const directRole = normalizeRole(localStorage.getItem("ROLE"));
//   if (directRole) return directRole;

//   return "checker";
// };
const getRole = (pid, fallbackRoleId = "") => {
  const passedRole = normalizeRole(fallbackRoleId);
  if (passedRole) return passedRole;

  const projectRole = normalizeRole(
    localStorage.getItem(getProjectRoleStorageKey(pid)),
  );
  if (projectRole) return projectRole;

  const flowRole = normalizeRole(localStorage.getItem("FLOW_ROLE"));
  if (flowRole) return flowRole;

  const directRole = normalizeRole(localStorage.getItem("ROLE"));
  if (directRole) return directRole;

  return "checker";
};

const formatRoleLabel = (role) => {
  const r = normalizeRole(role);
  if (r === "maker") return "Maker";
  if (r === "checker") return "Checker";
  if (r === "supervisor") return "Supervisor";
  if (r === "intializer") return "Intializer";
  return role || "Unknown";
};

const getAccessToken = () =>
  localStorage.getItem("ACCESS_TOKEN") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("TOKEN") ||
  "";

const fetchStagesByPhase = async (phaseId) => {
  if (!phaseId) return [];

  const token = getAccessToken();
  const response = await fetch(
    `https://konstruct.world/projects/stages/by_phase/${phaseId}/`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Could not load stages.");
  }

  const data = await response.json();
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.data)
        ? data.data
        : [];

  return rows;
};

const isYesNo = (op) =>
  ["P", "N"].includes(String(op?.choice || "").toUpperCase());

const yesNoLabel = (op) =>
  String(op?.choice || "").toUpperCase() === "P" ? "YES" : "NO";

const getOptionDisplayLabel = (op) =>
  String(op?.name || op?.label || op?.choice || "").trim();

const getChecklistCollapseKey = (checklistId) => String(checklistId);

const toCount = (...values) => {
  for (const value of values) {
    if (Number.isFinite(Number(value))) return Number(value);
  }
  return 0;
};

const buildReportSummary = (reportData, visibleChecklists) => {
  const summary = reportData?.summary || {};
  const checklists = Array.isArray(visibleChecklists) ? visibleChecklists : [];

  if (!checklists.length) {
    return {
      total: toCount(
        summary.total_checkpoints,
        summary.total,
        summary.total_items,
      ),
      pending: toCount(summary.pending),
      completed: toCount(summary.completed),
      rejected: toCount(summary.rejected),
    };
  }

  const items = checklists.flatMap((checklist) =>
    Array.isArray(checklist?.items) ? checklist.items : [],
  );
  const statuses = items.map((item) =>
    String(item?.latest_submission_status || item?.status || "").toLowerCase(),
  );

  return {
    total: items.length,
    pending: statuses.filter((status) =>
      [
        "pending",
        "pending_for_inspector",
        "pending_for_maker",
        "pending_for_supervisor",
        "pending_supervisor",
        "pending_checker",
        "created",
        "in_progress",
        "not_started",
        "tetmpory_maker",
        "temporary_maker",
        "tetmpory_inspctor",
        "temporary_inspector",
      ].includes(status),
    ).length,
    completed: statuses.filter((status) => status === "completed").length,
    rejected: statuses.filter((status) => status.includes("rejected")).length,
  };
};

const DEFAULT_REPORT_FILTERS = {
  from_date: "",
  to_date: "",
  from_date_obj: null,
  to_date_obj: null,
  with_photos: false,
  category: "",
  category_id: "",
  stage_id: "",
  status: "",
  current_role: "",
};

/* ------------------------------- Component ------------------------------ */

export default function ChecklistTransferModal({
  isOpen,
  onClose,
  context,
  projectId,
  projectName,
  phaseId,
  purposeId,
  roleId,
  theme,
  cardColor,
  textColor,
  borderColor,
}) {
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  // const [activeRoleId, setActiveRoleId] = useState(getRole);

  const [activeRoleId, setActiveRoleId] = useState(() =>
    getRole(projectId, roleId),
  );

  const [startingById, setStartingById] = useState({});
  const [verifyingKey, setVerifyingKey] = useState({});
  const [remarkByItemId, setRemarkByItemId] = useState({});
  const [makerFilesByItemId, setMakerFilesByItemId] = useState({});
  const [makerSubmittingByItemId, setMakerSubmittingByItemId] = useState({});
  const [submittedItems, setSubmittedItems] = useState(new Set());
  const [showFullLogsByItemId, setShowFullLogsByItemId] = useState({});
  const [collapsedChecklistMap, setCollapsedChecklistMap] = useState({});

  const [downloadingReport, setDownloadingReport] = useState(false);
  const [activeTab, setActiveTab] = useState("checklists");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportData, setReportData] = useState(null);
  const [selectedReportChecklistIds, setSelectedReportChecklistIds] = useState(
    [],
  );
  const [reportFilters, setReportFilters] = useState(DEFAULT_REPORT_FILTERS);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [stageOptions, setStageOptions] = useState([]);
  const [startingItemById, setStartingItemById] = useState({});

  const isLevel = context?.type === "level";

  const flatChecklists = useMemo(
    () => flattenChecklists(modalData),
    [modalData],
  );

  const reportChecklistOptions = useMemo(() => {
    const source = [
      ...flatChecklists,
      ...(Array.isArray(reportData?.checklists) ? reportData.checklists : []),
    ];

    const seen = new Set();
    return source
      .filter((cl) => {
        const id = cl?.id;
        if (id == null || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((cl) => ({
        id: cl.id,
        name: String(cl.name || cl.title || `Checklist #${cl.id}`).trim(),
      }));
  }, [reportData, flatChecklists]);

  const visibleReportChecklists = useMemo(() => {
    const list = Array.isArray(reportData?.checklists)
      ? reportData.checklists
      : [];
    if (!selectedReportChecklistIds.length) return list;

    const selectedSet = new Set(
      selectedReportChecklistIds.map((id) => Number(id)),
    );
    return list.filter((cl) => selectedSet.has(Number(cl?.id)));
  }, [reportData, selectedReportChecklistIds]);

  const reportSummary = useMemo(
    () => buildReportSummary(reportData, visibleReportChecklists),
    [reportData, visibleReportChecklists],
  );

  const initializerCanStartItem = (item) => {
    const st = String(item?.status || "").toLowerCase();
    return ["not_started", "pending"].includes(st);
  };

  const getItemSubmissions = (cl, it, data) => {
    const fromItem = Array.isArray(it?.submissions) ? it.submissions : [];
    const fromCl = Array.isArray(cl?.submissions)
      ? cl.submissions.filter((s) => s?.checklist_item?.id === it?.id)
      : [];
    const fromData = Array.isArray(data?.submissions)
      ? data.submissions.filter((s) => s?.checklist_item?.id === it?.id)
      : [];

    const list =
      fromItem.length > 0 ? fromItem : fromCl.length > 0 ? fromCl : fromData;

    return (list || [])
      .slice()
      .sort((a, b) => (b.attempts ?? b.id ?? 0) - (a.attempts ?? a.id ?? 0));
  };

  const toggleChecklistCollapsed = (checklistId) => {
    const key = getChecklistCollapseKey(checklistId);
    setCollapsedChecklistMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAllChecklists = () => {
    const next = {};
    for (const cl of flatChecklists)
      next[getChecklistCollapseKey(cl.id)] = false;
    setCollapsedChecklistMap(next);
  };

  const collapseAllChecklists = () => {
    const next = {};
    for (const cl of flatChecklists)
      next[getChecklistCollapseKey(cl.id)] = true;
    setCollapsedChecklistMap(next);
  };

  useEffect(() => {
    if (!isOpen || !context || !projectId) return;

    // const resolvedRole = normalizeRole(roleId) || getRole();
    const resolvedRole = getRole(projectId, roleId);
    setActiveRoleId(resolvedRole);
    setModalError("");
    setModalLoading(true);
    setModalData(null);
    setSubmittedItems(new Set());
    setCollapsedChecklistMap({});
    setActiveTab("checklists");
    setReportData(null);
    setReportError("");
    setSelectedReportChecklistIds([]);
    setReportFilters(DEFAULT_REPORT_FILTERS);

    const params = {
      project_id: projectId,
      tower_id: context.buildingId,
      building_id: context.buildingId,
      limit: 50,
      offset: 0,
      role_id: resolvedRole,
    };

    if (phaseId != null) params.phase_id = phaseId;
    if (purposeId != null) params.purpose_id = purposeId;
    if (isLevel && context.levelId != null) params.level_id = context.levelId;
    if (context.flatId != null) params.flat_id = context.flatId;
    if (context.roomId != null) params.room_id = context.roomId;
    if (context.zoneId != null) params.zone_id = context.zoneId;
    if (context.subzoneId != null) params.subzone_id = context.subzoneId;

    NEWchecklistInstance.get("/transfer-getchchklist/", { params })
      .then((res) => {
        setModalData(res?.data || {});
      })
      .catch(() => setModalError("Could not load checklist details."))
      .finally(() => setModalLoading(false));
  }, [isOpen, context, projectId, isLevel, phaseId, purposeId, roleId]);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    projectInstance
      .get("/categories/", {
        params: { project_id: projectId },
      })
      .then((res) => {
        const rows = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.results)
            ? res.data.results
            : [];
        setCategoryOptions(rows);
      })
      .catch(() => setCategoryOptions([]));
  }, [isOpen, projectId]);

  useEffect(() => {
    if (!isOpen || !phaseId) {
      setStageOptions([]);
      setReportFilters((prev) => ({
        ...prev,
        stage_id: "",
      }));
      return;
    }

    fetchStagesByPhase(phaseId)
      .then((rows) => {
        setStageOptions(rows);
        setReportFilters((prev) => {
          const selectedStillExists = rows.some(
            (stage) => String(stage?.id) === String(prev.stage_id),
          );
          return selectedStillExists
            ? prev
            : {
                ...prev,
                stage_id: "",
              };
        });
      })
      .catch(() => setStageOptions([]));
  }, [isOpen, phaseId]);

  const updateReportFilter = (key, value) => {
    setReportFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "from_date" ? { from_date_obj: value || null } : {}),
      ...(key === "to_date" ? { to_date_obj: value || null } : {}),
    }));
  };

  const buildReportParams = (overrides = {}) => {
    const params = {
      project_id: projectId,
      tower_id: context?.towerId ?? context?.buildingId,
      building_id: context?.buildingId,
      // role_id: activeRoleId || normalizeRole(roleId) || getRole(),
      role_id: activeRoleId || getRole(projectId, roleId),
    };

    if (phaseId != null) params.phase_id = phaseId;
    if (purposeId != null) params.purpose_id = purposeId;
    if (isLevel && context?.levelId != null) params.level_id = context.levelId;
    if (context?.flatId != null) params.flat_id = context.flatId;
    if (context?.roomId != null) params.room_id = context.roomId;
    if (context?.zoneId != null) params.zone_id = context.zoneId;
    if (context?.subzoneId != null) params.subzone_id = context.subzoneId;

    const filterParams = {
      from_date: reportFilters.from_date || undefined,
      to_date: reportFilters.to_date || undefined,
      with_photos: reportFilters.with_photos ? true : undefined,
      category_id: reportFilters.category_id || undefined,
      stage_id: reportFilters.stage_id || undefined,
      status: reportFilters.status || undefined,
      current_role: reportFilters.current_role || undefined,
      checklist_id: selectedReportChecklistIds.length
        ? selectedReportChecklistIds.join(",")
        : undefined,
    };

    const merged = { ...params, ...filterParams, ...overrides };
    Object.keys(merged).forEach((key) => {
      if (merged[key] == null || merged[key] === "") delete merged[key];
    });

    return merged;
  };

  const fetchViewReport = async (overrides = {}) => {
    if (!projectId || !context?.buildingId) {
      toast.error("Missing report context.");
      return;
    }

    const targetId = isLevel ? context?.levelId : context?.buildingId;

    if (!targetId) {
      toast.error(`Missing ${isLevel ? "floor" : "tower"} id.`);
      return;
    }

    const endpoint = isLevel
      ? `/reports/floor-overview/${targetId}/`
      : `/reports/tower-overview/${targetId}/`;

    const params = buildReportParams(overrides);

    setReportLoading(true);
    setReportError("");

    try {
      const res = await NEWchecklistInstance.get(endpoint, { params });
      const data = res?.data || {};
      setReportData(data);

      const idsFromOverride = String(overrides.checklist_id || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      setSelectedReportChecklistIds((prev) => {
        if (idsFromOverride.length) return idsFromOverride;

        const returnedIds = (
          Array.isArray(data?.checklists) ? data.checklists : []
        )
          .map((cl) => String(cl?.id || ""))
          .filter(Boolean);

        if (!prev.length) return [];
        return prev.filter((id) => returnedIds.includes(String(id)));
      });
    } catch (e) {
      setReportError(
        e?.response?.data?.detail ||
          e?.response?.data?.error ||
          e?.message ||
          "Could not load report.",
      );
    } finally {
      setReportLoading(false);
    }
  };

  const clearReportFilters = async () => {
    setReportFilters(DEFAULT_REPORT_FILTERS);
    setSelectedReportChecklistIds([]);

    if (!projectId || !context?.buildingId) return;

    const targetId = isLevel ? context?.levelId : context?.buildingId;
    if (!targetId) return;

    const endpoint = isLevel
      ? `/reports/floor-overview/${targetId}/`
      : `/reports/tower-overview/${targetId}/`;

    setReportLoading(true);
    setReportError("");
    try {
      const params = {
        project_id: projectId,
        tower_id: context?.towerId ?? context?.buildingId,
        building_id: context?.buildingId,
        role_id: activeRoleId || normalizeRole(roleId) || getRole(),
      };
      if (phaseId != null) params.phase_id = phaseId;
      if (purposeId != null) params.purpose_id = purposeId;
      if (isLevel && context?.levelId != null)
        params.level_id = context.levelId;
      if (context?.flatId != null) params.flat_id = context.flatId;
      if (context?.roomId != null) params.room_id = context.roomId;
      if (context?.zoneId != null) params.zone_id = context.zoneId;
      if (context?.subzoneId != null) params.subzone_id = context.subzoneId;

      const res = await NEWchecklistInstance.get(endpoint, { params });
      setReportData(res?.data || {});
    } catch (e) {
      setReportError(
        e?.response?.data?.detail ||
          e?.response?.data?.error ||
          e?.message ||
          "Could not load report.",
      );
    } finally {
      setReportLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!projectId || !context?.buildingId) {
      toast.error("Missing report context.");
      return;
    }

    const targetId = isLevel ? context?.levelId : context?.buildingId;

    if (!targetId) {
      toast.error(`Missing ${isLevel ? "floor" : "tower"} id.`);
      return;
    }

    const endpoint = isLevel
      ? `/reports/floor-overview/${targetId}/download/`
      : `/reports/tower-overview/${targetId}/download/`;

    const params = buildReportParams();

    setDownloadingReport(true);

    try {
      const response = await NEWchecklistInstance.get(endpoint, {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const fileBaseName =
        selectedReportChecklistIds.length === 1
          ? reportChecklistOptions.find(
              (x) => String(x.id) === String(selectedReportChecklistIds[0]),
            )?.name ||
            (isLevel
              ? `floor_${targetId}_overview`
              : `tower_${targetId}_overview`)
          : selectedReportChecklistIds.length > 1
            ? isLevel
              ? `floor_${targetId}_selected_checklists`
              : `tower_${targetId}_selected_checklists`
            : isLevel
              ? `floor_${targetId}_overview`
              : `tower_${targetId}_overview`;

      const safeFileName = `${fileBaseName.replace(/[^\w\-]+/g, "_")}.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = safeFileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded ✅");
    } catch (e) {
      console.error("REPORT_DOWNLOAD_FAILED", e);
      toast.error(
        e?.response?.data?.detail ||
          e?.response?.data?.error ||
          "Could not download report.",
      );
    } finally {
      setDownloadingReport(false);
    }
  };

  const startChecklist = async (checklistId) => {
    if (!checklistId) return;
    setStartingById((p) => ({ ...p, [checklistId]: true }));

    try {
      const res = await NEWchecklistInstance.post(
        `/start-checklist/${checklistId}/`,
        {},
      );
      const updated = res?.data?.checklist;
      if (!updated?.id) {
        toast.error("Initialized, but response missing checklist.");
        return;
      }
      toast.success("Checklist initialized ✅");
      setModalData((p) => applyChecklistUpdate(p, updated));
    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
          e?.response?.data?.error ||
          e?.message ||
          "Failed to initialize.",
      );
    } finally {
      setStartingById((p) => ({ ...p, [checklistId]: false }));
    }
  };

  const startChecklistItem = async (checklistId, itemId) => {
    if (!checklistId || !itemId) return;

    setStartingItemById((prev) => ({ ...prev, [itemId]: true }));

    try {
      const res = await NEWchecklistInstance.post(
        `/start-checklist-item/${checklistId}/${itemId}/`,
        {},
      );

      const payload = res?.data || {};
      const updatedItem = payload?.item || {};

      toast.success(payload?.message || "Question initialized ✅");

      setModalData((prev) =>
        patchChecklistInResults(prev, (cl) => {
          if (!cl || typeof cl !== "object") return cl;

          const next = {
            ...cl,
            status:
              Number(cl?.id) === Number(checklistId)
                ? (payload?.checklist_status ?? cl.status)
                : cl.status,
          };

          if (Array.isArray(next.items)) {
            next.items = next.items.map((it) =>
              Number(it?.id) === Number(itemId)
                ? {
                    ...it,
                    status:
                      updatedItem?.status ?? payload?.item_status ?? it.status,
                  }
                : it,
            );
          }

          return next;
        }),
      );
    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
          e?.response?.data?.error ||
          e?.message ||
          "Failed to initialize question.",
      );
    } finally {
      setStartingItemById((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const verifyChecklistItem = async ({ checklistItemId, option, item }) => {
    if (
      !checklistItemId ||
      !option?.id ||
      !["checker", "supervisor"].includes(activeRoleId)
    ) {
      return;
    }

    const choice = String(option?.choice || "").toUpperCase();
    if (choice !== "P" && choice !== "N") return;

    const k = `${checklistItemId}:${option.id}:${activeRoleId}`;
    if (verifyingKey[k] || submittedItems.has(k)) return;

    if (String(item?.status || "").toLowerCase() === "completed") {
      toast.success("Already completed ✅");
      return;
    }

    setVerifyingKey((p) => ({ ...p, [k]: true }));

    try {
      const body = {
        checklist_item_id: checklistItemId,
        role: activeRoleId,
        option_id: option.id,
      };

      if (activeRoleId === "checker") {
        body.check_remark = (remarkByItemId[checklistItemId] || "").trim();
      } else {
        body.supervisor_remarks = (
          remarkByItemId[checklistItemId] || ""
        ).trim();
      }

      const res = await NEWchecklistInstance.patch(
        "/Decsion-makeing-forSuer-Inspector/",
        body,
      );

      if (res.status === 200) {
        const payload = res?.data || {};
        toast.success(choice === "P" ? "Approved ✅" : "Rejected ✅");
        setModalData((p) => applyItemUpdate(p, payload));
        setSubmittedItems((prev) => new Set(prev).add(k));
      }
    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
          e?.response?.data?.error ||
          e?.message ||
          "Verify failed.",
      );
    } finally {
      setVerifyingKey((p) => ({ ...p, [k]: false }));
    }
  };

  const submitMakerDone = async ({ item }) => {
    if (!item?.id || activeRoleId !== "maker") return;

    const st = String(item?.status || "").toLowerCase();
    const allowed = [
      "pending_for_maker",
      "tetmpory_maker",
      "temporary_maker",
      "rejected_by_checker",
    ].includes(st);

    if (!allowed) {
      toast.error("Not pending for maker.");
      return;
    }

    const files = makerFilesByItemId[item.id] || [];
    if (item?.photo_required && !files.length) {
      toast.error("Photo required.");
      return;
    }

    const submitKey = `maker:${item.id}`;
    if (makerSubmittingByItemId[item.id] || submittedItems.has(submitKey))
      return;

    setMakerSubmittingByItemId((p) => ({ ...p, [item.id]: true }));

    try {
      const fd = new FormData();
      fd.append("checklist_item_id", item.id);

      const remark = (remarkByItemId[item.id] || "").trim();
      if (remark) {
        fd.append("maker_remarks", remark);
        fd.append("remark", remark);
      }

      files.forEach((f) => fd.append("maker_media_multi", f));

      const res = await NEWchecklistInstance.post("/done-maker/", fd);

      if (res.status === 200) {
        const payload = res?.data || {};
        toast.success(payload?.detail || "Submitted ✅");
        setModalData((p) => applyMakerDone(p, payload));
        setRemarkByItemId((p) => ({ ...p, [item.id]: "" }));
        setMakerFilesByItemId((p) => ({ ...p, [item.id]: [] }));
        setSubmittedItems((prev) => new Set(prev).add(submitKey));
      }
    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
          e?.response?.data?.error ||
          e?.message ||
          "Submit failed.",
      );
    } finally {
      setMakerSubmittingByItemId((p) => ({ ...p, [item.id]: false }));
    }
  };

  const makerCanSubmit = (it) =>
    [
      "pending_for_maker",
      "tetmpory_maker",
      "temporary_maker",
      "rejected_by_checker",
    ].includes(String(it?.status || "").toLowerCase());

  const renderReportTab = () => (
    <div
      className="p-6 rounded-2xl"
      style={{
        backgroundColor: `${borderColor}10`,
        border: `1px solid ${borderColor}30`,
      }}
    >
      <div className="flex items-center justify-between gap-4 mb-5">
        <h3 className="text-xl font-bold" style={{ color: textColor }}>
          {isLevel ? "Floor Report" : "Tower Report"}
        </h3>

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fetchViewReport()}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{
              backgroundColor: `${borderColor}20`,
              color: textColor,
              border: `1px solid ${borderColor}40`,
            }}
          >
            Refresh Report
          </button>

          <button
            type="button"
            onClick={downloadReport}
            disabled={downloadingReport}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:hover:scale-100"
            style={{
              backgroundColor: borderColor,
              color: "#1b1b1b",
              border: `1px solid ${borderColor}40`,
              opacity: downloadingReport ? 0.7 : 1,
            }}
          >
            {downloadingReport ? "Downloading..." : "Download Report"}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <label
            className="block text-sm font-bold"
            style={{ color: textColor }}
          >
            Report Filters
          </label>

          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => fetchViewReport()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: `${borderColor}20`,
                color: textColor,
                border: `1px solid ${borderColor}35`,
              }}
            >
              Apply Filters
            </button>

            <button
              type="button"
              onClick={clearReportFilters}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: `${borderColor}18`,
                color: textColor,
                border: `1px solid ${borderColor}35`,
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: `${textColor}85` }}
            >
              Checklists
            </label>
            <select
              multiple
              value={selectedReportChecklistIds}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map(
                  (opt) => opt.value,
                );
                setSelectedReportChecklistIds(values);
              }}
              className="w-full px-4 py-3 rounded-xl"
              style={{
                backgroundColor: theme === "dark" ? "#ffffff08" : "#00000005",
                color: textColor,
                border: `1px solid ${borderColor}40`,
                outline: "none",
                minHeight: "140px",
              }}
            >
              {reportChecklistOptions.map((opt) => (
                <option key={opt.id} value={String(opt.id)}>
                  {opt.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs" style={{ color: `${textColor}70` }}>
              Leave empty to show all returned checklists.
            </p>
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: `${textColor}85` }}
            >
              From Date
            </label>
            <input
              type="date"
              value={reportFilters.from_date}
              onChange={(e) => updateReportFilter("from_date", e.target.value)}
              className="w-full px-4 py-3 rounded-xl"
              style={{
                backgroundColor: theme === "dark" ? "#ffffff08" : "#00000005",
                color: textColor,
                border: `1px solid ${borderColor}40`,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: `${textColor}85` }}
            >
              To Date
            </label>
            <input
              type="date"
              value={reportFilters.to_date}
              onChange={(e) => updateReportFilter("to_date", e.target.value)}
              className="w-full px-4 py-3 rounded-xl"
              style={{
                backgroundColor: theme === "dark" ? "#ffffff08" : "#00000005",
                color: textColor,
                border: `1px solid ${borderColor}40`,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: `${textColor}85` }}
            >
              Category
            </label>
            <select
              value={reportFilters.category_id}
              onChange={(e) => {
                const value = e.target.value;
                const selected = categoryOptions.find(
                  (cat) => String(cat?.id) === String(value),
                );
                setReportFilters((prev) => ({
                  ...prev,
                  category_id: value,
                  category:
                    selected?.name ||
                    selected?.category ||
                    selected?.title ||
                    "",
                }));
                fetchViewReport({ category_id: value || undefined });
              }}
              className="w-full px-4 py-3 rounded-xl"
              style={{
                backgroundColor: theme === "dark" ? "#ffffff08" : "#00000005",
                color: textColor,
                border: `1px solid ${borderColor}40`,
                outline: "none",
              }}
            >
              <option value="">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name ||
                    cat.category ||
                    cat.title ||
                    `Category ${cat.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: `${textColor}85` }}
            >
              Stage
            </label>
            <select
              value={reportFilters.stage_id}
              onChange={(e) => {
                const value = e.target.value;
                updateReportFilter("stage_id", value);
                fetchViewReport({ stage_id: value || undefined });
              }}
              disabled={!phaseId}
              className="w-full px-4 py-3 rounded-xl"
              style={{
                backgroundColor: theme === "dark" ? "#ffffff08" : "#00000005",
                color: textColor,
                border: `1px solid ${borderColor}40`,
                outline: "none",
                opacity: phaseId ? 1 : 0.7,
              }}
            >
              <option value="">
                {phaseId ? "All Stages" : "Select phase first"}
              </option>
              {stageOptions.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name || stage.title || `Stage ${stage.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: `${textColor}85` }}
            >
              Checklist Status
            </label>
            <select
              value={reportFilters.status}
              onChange={(e) => updateReportFilter("status", e.target.value)}
              className="w-full px-4 py-3 rounded-xl"
              style={{
                backgroundColor: theme === "dark" ? "#ffffff08" : "#00000005",
                color: textColor,
                border: `1px solid ${borderColor}40`,
                outline: "none",
              }}
            >
              <option value="">All Statuses</option>
              <option value="started">Started</option>
              <option value="not_started">Not Started</option>
              <option value="work_in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: `${textColor}85` }}
            >
              Current Role
            </label>
            <select
              value={reportFilters.current_role}
              onChange={(e) =>
                updateReportFilter("current_role", e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl"
              style={{
                backgroundColor: theme === "dark" ? "#ffffff08" : "#00000005",
                color: textColor,
                border: `1px solid ${borderColor}40`,
                outline: "none",
              }}
            >
              <option value="">All Roles</option>
              <option value="checker">Checker</option>
              <option value="maker">Maker</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          <label className="inline-flex items-center gap-3 mt-6">
            <input
              type="checkbox"
              checked={reportFilters.with_photos}
              onChange={(e) =>
                updateReportFilter("with_photos", e.target.checked)
              }
            />
            <span style={{ color: textColor }}>With photos only</span>
          </label>
        </div>
      </div>

      {reportLoading ? (
        <p style={{ color: `${textColor}80` }}>Loading report...</p>
      ) : reportError ? (
        <p style={{ color: "#ff6b6b" }}>{reportError}</p>
      ) : reportData ? (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: `${borderColor}12` }}
            >
              <p className="text-sm" style={{ color: `${textColor}70` }}>
                Total
              </p>
              <p className="text-xl font-bold" style={{ color: textColor }}>
                {reportSummary.total}
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: `${borderColor}12` }}
            >
              <p className="text-sm" style={{ color: `${textColor}70` }}>
                Pending
              </p>
              <p className="text-xl font-bold" style={{ color: textColor }}>
                {reportSummary.pending}
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: `${borderColor}12` }}
            >
              <p className="text-sm" style={{ color: `${textColor}70` }}>
                Completed
              </p>
              <p className="text-xl font-bold" style={{ color: textColor }}>
                {reportSummary.completed}
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: `${borderColor}12` }}
            >
              <p className="text-sm" style={{ color: `${textColor}70` }}>
                Rejected
              </p>
              <p className="text-xl font-bold" style={{ color: textColor }}>
                {reportSummary.rejected}
              </p>
            </div>
          </div>

          {visibleReportChecklists.length ? (
            <div className="space-y-6">
              {visibleReportChecklists.map((checklist) => {
                const checklistItems = Array.isArray(checklist?.items)
                  ? checklist.items
                  : [];

                return (
                  <div
                    key={checklist.id}
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: `${borderColor}12`,
                      border: `1px solid ${borderColor}30`,
                    }}
                  >
                    <div className="mb-4">
                      <h4
                        className="font-bold mb-2"
                        style={{ color: textColor }}
                      >
                        {checklist.name || `Checklist #${checklist.id}`}
                      </h4>

                      <div
                        className="flex flex-wrap gap-3 text-sm"
                        style={{ color: `${textColor}80` }}
                      >
                        <span>ID: {checklist.id}</span>
                        {(checklist.current_status || checklist.status) && (
                          <>
                            <span>•</span>
                            <span>
                              Status:{" "}
                              {checklist.current_status || checklist.status}
                            </span>
                          </>
                        )}
                        <>
                          <span>•</span>
                          <span>Total Questions: {checklistItems.length}</span>
                        </>
                        {checklist.room_name && (
                          <>
                            <span>•</span>
                            <span>Room: {checklist.room_name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {checklistItems.length ? (
                      <div className="space-y-4">
                        {checklistItems.map((item) => {
                          const submissions = Array.isArray(item?.submissions)
                            ? item.submissions
                            : [];

                          return (
                            <div
                              key={item.id}
                              className="p-4 rounded-xl"
                              style={{
                                backgroundColor: `${borderColor}10`,
                                border: `1px solid ${borderColor}30`,
                              }}
                            >
                              <div className="mb-4">
                                <h5
                                  className="font-bold mb-2"
                                  style={{ color: textColor }}
                                >
                                  {item.title || `Question #${item.id}`}
                                </h5>

                                <div
                                  className="flex flex-wrap gap-3 text-sm"
                                  style={{ color: `${textColor}80` }}
                                >
                                  <span>Item ID: {item.id}</span>
                                  <span>•</span>
                                  <span>
                                    Current Status:{" "}
                                    {item.latest_submission_status ||
                                      item.status ||
                                      "-"}
                                  </span>
                                  {item.section_title && (
                                    <>
                                      <span>•</span>
                                      <span>Section: {item.section_title}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {submissions.length ? (
                                <div className="space-y-3">
                                  {submissions.map((sub, attemptIdx) => {
                                    const mediaUrls = [
                                      ...(sub.maker_media
                                        ? [sub.maker_media]
                                        : []),
                                      ...(sub.reviewer_photo
                                        ? [sub.reviewer_photo]
                                        : []),
                                      ...(sub.inspector_photo
                                        ? [sub.inspector_photo]
                                        : []),
                                    ].filter(Boolean);

                                    return (
                                      <div
                                        key={sub.id || attemptIdx}
                                        className="p-4 rounded-xl"
                                        style={{
                                          backgroundColor: cardColor,
                                          border: `1px solid ${borderColor}25`,
                                        }}
                                      >
                                        <div className="flex flex-wrap gap-2 items-center mb-3">
                                          <span
                                            className="px-2 py-0.5 rounded font-medium text-xs"
                                            style={{
                                              backgroundColor: `${borderColor}20`,
                                              color: textColor,
                                            }}
                                          >
                                            Attempt {attemptIdx + 1}
                                          </span>

                                          <span
                                            className="px-2 py-0.5 rounded font-medium text-xs"
                                            style={{
                                              backgroundColor: `${borderColor}20`,
                                              color: textColor,
                                            }}
                                          >
                                            Submission ID: {sub.id}
                                          </span>

                                          <span
                                            className="px-2 py-0.5 rounded font-medium text-xs"
                                            style={{
                                              backgroundColor: String(
                                                sub.status || "",
                                              ).includes("rejected")
                                                ? "#fee2e2"
                                                : String(
                                                      sub.status || "",
                                                    ).includes("completed")
                                                  ? "#dcfce7"
                                                  : `${borderColor}20`,
                                              color: String(
                                                sub.status || "",
                                              ).includes("rejected")
                                                ? "#991b1b"
                                                : String(
                                                      sub.status || "",
                                                    ).includes("completed")
                                                  ? "#166534"
                                                  : textColor,
                                            }}
                                          >
                                            {sub.status || "-"}
                                          </span>
                                        </div>

                                        <div
                                          className="grid gap-1 text-sm"
                                          style={{ color: textColor }}
                                        >
                                          <p>
                                            <span className="font-semibold">
                                              Maker Name:
                                            </span>{" "}
                                            {sub.maker_name || "-"}
                                          </p>
                                          <p>
                                            <span className="font-semibold">
                                              Maker Submitted At:
                                            </span>{" "}
                                            {fmtDateTime(sub.maker_at)}
                                          </p>
                                          <p>
                                            <span className="font-semibold">
                                              Maker Remarks:
                                            </span>{" "}
                                            {sub.maker_remarks ?? "-"}
                                          </p>
                                          <p>
                                            <span className="font-semibold">
                                              Checker Name:
                                            </span>{" "}
                                            {sub.checker_name || "-"}
                                          </p>
                                          <p>
                                            <span className="font-semibold">
                                              Checked At:
                                            </span>{" "}
                                            {fmtDateTime(sub.checked_at)}
                                          </p>
                                          <p>
                                            <span className="font-semibold">
                                              Checker Remarks:
                                            </span>{" "}
                                            {sub.checker_remarks ?? "-"}
                                          </p>
                                          <p>
                                            <span className="font-semibold">
                                              Supervisor Name:
                                            </span>{" "}
                                            {sub.supervisor_name || "-"}
                                          </p>
                                          <p>
                                            <span className="font-semibold">
                                              Supervised At:
                                            </span>{" "}
                                            {fmtDateTime(sub.supervised_at)}
                                          </p>
                                          <p>
                                            <span className="font-semibold">
                                              Supervisor Remarks:
                                            </span>{" "}
                                            {sub.supervisor_remarks ?? "-"}
                                          </p>
                                        </div>

                                        {mediaUrls.length > 0 && (
                                          <div className="mt-3">
                                            <p
                                              className="font-semibold text-xs mb-2"
                                              style={{ color: textColor }}
                                            >
                                              Files / Images
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                              {mediaUrls.map((url, i) => (
                                                <a
                                                  key={i}
                                                  href={url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium truncate max-w-[220px]"
                                                  style={{
                                                    backgroundColor: `${borderColor}20`,
                                                    color: borderColor,
                                                  }}
                                                >
                                                  {/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(
                                                    url,
                                                  )
                                                    ? "🖼 "
                                                    : "📎 "}
                                                  {url.split("/").pop() ||
                                                    `File ${i + 1}`}
                                                </a>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div
                                  className="p-4 rounded-xl text-sm"
                                  style={{
                                    backgroundColor: `${borderColor}08`,
                                    color: `${textColor}70`,
                                    border: `1px solid ${borderColor}25`,
                                  }}
                                >
                                  No submission attempts for this question.
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        className="p-4 rounded-xl text-sm"
                        style={{
                          backgroundColor: `${borderColor}08`,
                          color: `${textColor}70`,
                          border: `1px solid ${borderColor}25`,
                        }}
                      >
                        No question data found for this checklist.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="p-4 rounded-xl text-sm"
              style={{
                backgroundColor: `${borderColor}08`,
                color: `${textColor}70`,
                border: `1px solid ${borderColor}25`,
              }}
            >
              {Array.isArray(reportData?.checklists) &&
              reportData.checklists.length
                ? "No checklist matched the current selection."
                : "Report loaded. No checklist rows are available, but the summary is shown above."}
            </div>
          )}
        </>
      ) : (
        <p style={{ color: `${textColor}80` }}>
          Open the report tab to load report data.
        </p>
      )}
    </div>
  );

  const renderChecklistTab = () => {
    if (modalLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4"
            style={{
              borderColor: `${borderColor}40`,
              borderTopColor: "transparent",
            }}
          />
          <p className="text-lg" style={{ color: `${textColor}80` }}>
            Loading checklist details…
          </p>
        </div>
      );
    }

    if (modalError) {
      return (
        <div
          className="p-6 rounded-2xl text-center"
          style={{ backgroundColor: "#ff6b6b20", color: "#ff6b6b" }}
        >
          <p className="text-lg font-semibold">{modalError}</p>
        </div>
      );
    }

    return (
      <>
        {Array.isArray(modalData?.stage_history) &&
          modalData.stage_history.length > 0 && (
            <div className="mb-8">
              <h3
                className="text-xl font-bold mb-4"
                style={{ color: textColor }}
              >
                Current Stage History
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {modalData.stage_history.slice(0, 3).map((sh) => (
                  <div
                    key={sh.id}
                    className="p-4 rounded-2xl"
                    style={{
                      backgroundColor: `${borderColor}15`,
                      border: `1px solid ${borderColor}30`,
                    }}
                  >
                    <div
                      className="space-y-2 text-sm"
                      style={{ color: textColor }}
                    >
                      <p>
                        <span className="font-semibold">ID:</span> {sh.id}
                      </p>
                      <p>
                        <span className="font-semibold">Stage:</span> {sh.stage}
                      </p>
                      <p>
                        <span className="font-semibold">Status:</span>{" "}
                        {sh.status}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: `${textColor}80` }}
                      >
                        Started: {fmtDateTime(sh.started_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div>
          <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
            <h3 className="text-xl font-bold" style={{ color: textColor }}>
              Available Checklists
            </h3>
            <div className="flex gap-2 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: `${borderColor}20`,
                  color: textColor,
                }}
              >
                Total: {modalData?.count ?? 0}
              </span>

              <button
                type="button"
                onClick={expandAllChecklists}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  backgroundColor: `${borderColor}20`,
                  color: textColor,
                  border: `1px solid ${borderColor}40`,
                }}
              >
                Expand all
              </button>

              <button
                type="button"
                onClick={collapseAllChecklists}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  backgroundColor: `${borderColor}20`,
                  color: textColor,
                  border: `1px solid ${borderColor}40`,
                }}
              >
                Collapse all
              </button>
            </div>
          </div>

          {!flatChecklists.length ? (
            <div
              className="p-12 rounded-2xl text-center"
              style={{ backgroundColor: `${borderColor}10` }}
            >
              <p className="text-lg" style={{ color: `${textColor}60` }}>
                No checklists found for this {isLevel ? "floor" : "tower"}.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {flatChecklists.map((cl) => {
                const statusLower = String(cl?.status || "").toLowerCase();
                const isInit =
                  !!cl?.initialized_at ||
                  statusLower === "in_progress" ||
                  statusLower === "work_in_progress";
                const isStarting = !!startingById[cl.id];
                const isCollapsed =
                  !!collapsedChecklistMap[getChecklistCollapseKey(cl.id)];

                const showBulkInitializeButton =
                  activeRoleId === "intializer" &&
                  String(cl?.status || "").toLowerCase() === "not_started";
                return (
                  <div
                    key={cl.id}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      backgroundColor: `${borderColor}10`,
                      border: `1px solid ${borderColor}30`,
                    }}
                  >
                    <div
                      className="p-6"
                      style={{
                        backgroundColor: `${borderColor}15`,
                        borderBottom: `1px solid ${borderColor}30`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                        <div className="flex-1">
                          <h4
                            className="text-lg font-bold mb-2"
                            style={{ color: textColor }}
                          >
                            {cl.name || `Checklist #${cl.id}`}
                          </h4>
                          <div
                            className="flex flex-wrap gap-2 text-sm"
                            style={{ color: `${textColor}80` }}
                          >
                            <span>ID: {cl.id}</span>
                            <span>•</span>
                            <span>Status: {cl.status}</span>
                            <span>•</span>
                            <span>Created: {fmtDateTime(cl.created_at)}</span>
                          </div>
                          {cl.initialized_at && (
                            <p
                              className="text-sm mt-2"
                              style={{ color: `${textColor}80` }}
                            >
                              Initialized: {fmtDateTime(cl.initialized_at)}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => toggleChecklistCollapsed(cl.id)}
                            className="px-4 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                            style={{
                              backgroundColor: `${borderColor}20`,
                              color: textColor,
                              border: `1px solid ${borderColor}40`,
                            }}
                          >
                            {isCollapsed ? "Expand" : "Collapse"}
                          </button>
                          {showBulkInitializeButton && (
                            <button
                              disabled={isInit || isStarting}
                              onClick={() => startChecklist(cl.id)}
                              className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:hover:scale-100"
                              style={{
                                backgroundColor: isInit
                                  ? theme === "dark"
                                    ? "#ffffff10"
                                    : "#00000010"
                                  : borderColor,
                                color: isInit ? textColor : "#1b1b1b",
                                border: `1px solid ${borderColor}55`,
                                opacity: isInit ? 0.6 : 1,
                                cursor: isInit ? "not-allowed" : "pointer",
                              }}
                            >
                              {isStarting
                                ? "Initializing..."
                                : isInit
                                  ? "Initialized ✅"
                                  : "Start / Initialize"}
                            </button>
                          )}
                        </div>
                      </div>

                      <div
                        className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: `${borderColor}25`,
                          color: textColor,
                        }}
                      >
                        Items: {Array.isArray(cl.items) ? cl.items.length : 0}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="p-6 space-y-4">
                        {(Array.isArray(cl.items) ? cl.items : []).map((it) => {
                          const itStatus = String(
                            it?.status || "",
                          ).toLowerCase();
                          const done = itStatus === "completed";
                          const makerOk = makerCanSubmit(it);
                          const makerSub = !!makerSubmittingByItemId[it.id];
                          const makerKey = `maker:${it.id}`;
                          const alreadySubmitted = submittedItems.has(makerKey);

                          const showItemInitializeButton =
                            activeRoleId === "intializer" &&
                            initializerCanStartItem(it);

                          return (
                            <div
                              key={it.id}
                              className="p-5 rounded-xl"
                              style={{
                                backgroundColor: cardColor,
                                border: `1px solid ${borderColor}40`,
                              }}
                            >
                              {/* <div className="mb-4">
                                <h5
                                  className="font-bold mb-2"
                                  style={{ color: textColor }}
                                >
                                  {it.title || `Item #${it.id}`}
                                </h5>
                                <div
                                  className="flex flex-wrap gap-2 text-sm"
                                  style={{ color: `${textColor}70` }}
                                >
                                  <span
                                    className="px-3 py-1 rounded-full font-semibold"
                                    style={{
                                      backgroundColor: done
                                        ? "#4ade8020"
                                        : `${borderColor}20`,
                                      color: done ? "#4ade80" : textColor,
                                    }}
                                  >
                                    {it.status}
                                  </span>
                                  {it.photo_required && (
                                    <span
                                      className="px-3 py-1 rounded-full font-semibold"
                                      style={{
                                        backgroundColor: `${borderColor}20`,
                                        color: textColor,
                                      }}
                                    >
                                      📷 Photo required
                                    </span>
                                  )}
                                </div>
                              </div> */}
                              <div className="mb-4">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                  <div className="flex-1 min-w-0">
                                    <h5
                                      className="font-bold mb-2"
                                      style={{ color: textColor }}
                                    >
                                      {it.title || `Item #${it.id}`}
                                    </h5>

                                    <div
                                      className="flex flex-wrap gap-2 text-sm"
                                      style={{ color: `${textColor}70` }}
                                    >
                                      <span
                                        className="px-3 py-1 rounded-full font-semibold"
                                        style={{
                                          backgroundColor: done
                                            ? "#4ade8020"
                                            : `${borderColor}20`,
                                          color: done ? "#4ade80" : textColor,
                                        }}
                                      >
                                        {it.status}
                                      </span>

                                      {it.photo_required && (
                                        <span
                                          className="px-3 py-1 rounded-full font-semibold"
                                          style={{
                                            backgroundColor: `${borderColor}20`,
                                            color: textColor,
                                          }}
                                        >
                                          📷 Photo required
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {showItemInitializeButton && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        startChecklistItem(cl.id, it.id)
                                      }
                                      disabled={!!startingItemById[it.id]}
                                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 disabled:hover:scale-100"
                                      style={{
                                        backgroundColor: borderColor,
                                        color: "#1b1b1b",
                                        border: `1px solid ${borderColor}40`,
                                        opacity: startingItemById[it.id]
                                          ? 0.7
                                          : 1,
                                      }}
                                    >
                                      {startingItemById[it.id]
                                        ? "Initializing..."
                                        : "Initialize Question"}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {(() => {
                                const itemSubmissions = getItemSubmissions(
                                  cl,
                                  it,
                                  modalData,
                                );
                                const singleSubmission =
                                  it.submission ?? itemSubmissions[0];
                                const hasLogs = itemSubmissions.length > 0;
                                const showFull = !!showFullLogsByItemId[it.id];

                                if (
                                  !singleSubmission &&
                                  !itemSubmissions.length
                                )
                                  return null;

                                return (
                                  <div
                                    className="mb-4 p-4 rounded-xl space-y-2"
                                    style={{
                                      backgroundColor: `${borderColor}12`,
                                      border: `1px solid ${borderColor}30`,
                                    }}
                                  >
                                    <h6
                                      className="text-sm font-bold"
                                      style={{ color: textColor }}
                                    >
                                      Submission
                                    </h6>

                                    {singleSubmission && (
                                      <div
                                        className="grid gap-2 text-sm"
                                        style={{ color: `${textColor}90` }}
                                      >
                                        <p>
                                          <span className="font-semibold">
                                            Status:
                                          </span>{" "}
                                          <span
                                            className="px-2 py-0.5 rounded font-medium"
                                            style={{
                                              backgroundColor: `${borderColor}25`,
                                              color: textColor,
                                            }}
                                          >
                                            {singleSubmission.status}
                                          </span>
                                        </p>

                                        {singleSubmission.maker_at && (
                                          <p>
                                            <span className="font-semibold">
                                              Submitted at:
                                            </span>{" "}
                                            {fmtDateTime(
                                              singleSubmission.maker_at,
                                            )}
                                          </p>
                                        )}

                                        {singleSubmission.maker_remarks && (
                                          <p>
                                            <span className="font-semibold">
                                              Remarks:
                                            </span>{" "}
                                            {singleSubmission.maker_remarks}
                                          </p>
                                        )}

                                        {Array.isArray(
                                          singleSubmission.maker_media_multi,
                                        ) &&
                                          singleSubmission.maker_media_multi
                                            .length > 0 && (
                                            <p>
                                              <span className="font-semibold">
                                                Media:
                                              </span>{" "}
                                              {
                                                singleSubmission
                                                  .maker_media_multi.length
                                              }{" "}
                                              file(s)
                                            </p>
                                          )}
                                      </div>
                                    )}

                                    {hasLogs && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setShowFullLogsByItemId((p) => ({
                                            ...p,
                                            [it.id]: !p[it.id],
                                          }))
                                        }
                                        className="mt-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                                        style={{
                                          backgroundColor: `${borderColor}25`,
                                          color: textColor,
                                          border: `1px solid ${borderColor}40`,
                                        }}
                                      >
                                        {showFull
                                          ? "Hide full logs"
                                          : "Show full"}
                                      </button>
                                    )}

                                    {showFull && itemSubmissions.length > 0 && (
                                      <div
                                        className="mt-4 space-y-4 border-t pt-4"
                                        style={{
                                          borderColor: `${borderColor}30`,
                                        }}
                                      >
                                        <p
                                          className="text-xs font-bold uppercase"
                                          style={{ color: `${textColor}70` }}
                                        >
                                          Full submission logs (
                                          {itemSubmissions.length})
                                        </p>

                                        {itemSubmissions.map((sub, idx) => {
                                          const mediaUrls = [
                                            ...(Array.isArray(
                                              sub.send_maker_media_multi,
                                            )
                                              ? sub.send_maker_media_multi
                                              : []),
                                            ...(sub.maker_media
                                              ? [sub.maker_media]
                                              : []),
                                            ...(sub.reviewer_photo
                                              ? [sub.reviewer_photo]
                                              : []),
                                            ...(sub.inspector_photo
                                              ? [sub.inspector_photo]
                                              : []),
                                          ].filter(Boolean);

                                          return (
                                            <div
                                              key={sub.id ?? idx}
                                              className="p-3 rounded-lg space-y-2 text-sm"
                                              style={{
                                                backgroundColor: `${borderColor}08`,
                                                border: `1px solid ${borderColor}25`,
                                              }}
                                            >
                                              <div className="flex flex-wrap gap-2 items-center">
                                                <span
                                                  className="px-2 py-0.5 rounded font-medium"
                                                  style={{
                                                    backgroundColor: `${borderColor}20`,
                                                    color: textColor,
                                                  }}
                                                >
                                                  Attempt{" "}
                                                  {sub.attempts ?? idx + 1}
                                                </span>

                                                <span
                                                  className="px-2 py-0.5 rounded font-medium"
                                                  style={{
                                                    backgroundColor: String(
                                                      sub.status || "",
                                                    ).includes("rejected")
                                                      ? "#fef2f2"
                                                      : "#f0fdf4",
                                                    color: String(
                                                      sub.status || "",
                                                    ).includes("rejected")
                                                      ? "#dc2626"
                                                      : "#16a34a",
                                                  }}
                                                >
                                                  {sub.status}
                                                </span>
                                              </div>

                                              <div
                                                className="grid gap-1 text-xs"
                                                style={{
                                                  color: `${textColor}85`,
                                                }}
                                              >
                                                {sub.maker_id != null && (
                                                  <p>
                                                    <span className="font-semibold">
                                                      Maker ID:
                                                    </span>{" "}
                                                    {sub.maker_id}
                                                  </p>
                                                )}
                                                {sub.maker_at && (
                                                  <p>
                                                    <span className="font-semibold">
                                                      Maker at:
                                                    </span>{" "}
                                                    {fmtDateTime(sub.maker_at)}
                                                  </p>
                                                )}
                                                {sub.maker_remarks && (
                                                  <p>
                                                    <span className="font-semibold">
                                                      Maker remarks:
                                                    </span>{" "}
                                                    {sub.maker_remarks}
                                                  </p>
                                                )}
                                                {sub.checker_id != null && (
                                                  <p>
                                                    <span className="font-semibold">
                                                      Checker ID:
                                                    </span>{" "}
                                                    {sub.checker_id}
                                                  </p>
                                                )}
                                                {sub.checked_at && (
                                                  <p>
                                                    <span className="font-semibold">
                                                      Checked at:
                                                    </span>{" "}
                                                    {fmtDateTime(
                                                      sub.checked_at,
                                                    )}
                                                  </p>
                                                )}
                                                {sub.checker_remarks && (
                                                  <p>
                                                    <span className="font-semibold">
                                                      Checker remarks:
                                                    </span>{" "}
                                                    {sub.checker_remarks}
                                                  </p>
                                                )}
                                                {sub.supervisor_id != null && (
                                                  <p>
                                                    <span className="font-semibold">
                                                      Supervisor ID:
                                                    </span>{" "}
                                                    {sub.supervisor_id}
                                                  </p>
                                                )}
                                                {sub.supervised_at && (
                                                  <p>
                                                    <span className="font-semibold">
                                                      Supervised at:
                                                    </span>{" "}
                                                    {fmtDateTime(
                                                      sub.supervised_at,
                                                    )}
                                                  </p>
                                                )}
                                                {sub.supervisor_remarks && (
                                                  <p>
                                                    <span className="font-semibold">
                                                      Supervisor remarks:
                                                    </span>{" "}
                                                    {sub.supervisor_remarks}
                                                  </p>
                                                )}
                                                {sub.created_at && (
                                                  <p>
                                                    <span className="font-semibold">
                                                      Created:
                                                    </span>{" "}
                                                    {fmtDateTime(
                                                      sub.created_at,
                                                    )}
                                                  </p>
                                                )}
                                              </div>

                                              {mediaUrls.length > 0 && (
                                                <div className="mt-2">
                                                  <p
                                                    className="font-semibold text-xs mb-1"
                                                    style={{ color: textColor }}
                                                  >
                                                    Files / images
                                                  </p>

                                                  <div className="flex flex-wrap gap-2">
                                                    {mediaUrls.map((url, i) => (
                                                      <a
                                                        key={i}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium truncate max-w-[200px]"
                                                        style={{
                                                          backgroundColor: `${borderColor}20`,
                                                          color: borderColor,
                                                        }}
                                                      >
                                                        {/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(
                                                          url,
                                                        )
                                                          ? "🖼 "
                                                          : "📎 "}
                                                        {url.split("/").pop() ||
                                                          `File ${i + 1}`}
                                                      </a>
                                                    ))}
                                                  </div>

                                                  <div className="flex flex-wrap gap-2 mt-2">
                                                    {mediaUrls.map((url, i) =>
                                                      /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(
                                                        url,
                                                      ) ? (
                                                        <a
                                                          key={i}
                                                          href={url}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="block rounded overflow-hidden border"
                                                          style={{
                                                            borderColor: `${borderColor}40`,
                                                          }}
                                                        >
                                                          <img
                                                            src={url}
                                                            alt=""
                                                            className="w-20 h-20 object-cover"
                                                          />
                                                        </a>
                                                      ) : null,
                                                    )}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                              <div className="mb-4">
                                <textarea
                                  rows={2}
                                  value={remarkByItemId[it.id] || ""}
                                  onChange={(e) =>
                                    setRemarkByItemId((p) => ({
                                      ...p,
                                      [it.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Add your remark here..."
                                  className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:ring-2 transition-all"
                                  style={{
                                    backgroundColor:
                                      theme === "dark"
                                        ? "#ffffff08"
                                        : "#00000005",
                                    color: textColor,
                                    border: `1px solid ${borderColor}40`,
                                    outline: "none",
                                  }}
                                />
                              </div>

                              {activeRoleId === "maker" && (
                                <div className="mb-4">
                                  <label
                                    className="block mb-2 text-sm font-semibold"
                                    style={{ color: textColor }}
                                  >
                                    Upload Files{" "}
                                    {it.photo_required && (
                                      <span className="text-red-500">*</span>
                                    )}
                                  </label>

                                  <input
                                    type="file"
                                    multiple
                                    onChange={(e) =>
                                      setMakerFilesByItemId((p) => ({
                                        ...p,
                                        [it.id]: Array.from(
                                          e.target.files || [],
                                        ),
                                      }))
                                    }
                                    className="w-full text-sm p-2 rounded-lg"
                                    style={{
                                      color: textColor,
                                      backgroundColor: `${borderColor}10`,
                                      border: `1px solid ${borderColor}30`,
                                    }}
                                  />
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                {["checker", "supervisor"].includes(
                                  activeRoleId,
                                ) &&
                                  Array.isArray(it?.options) &&
                                  it.options.map((op) => {
                                    if (!isYesNo(op)) return null;

                                    const choice = String(
                                      op?.choice || "",
                                    ).toUpperCase();
                                    const k = `${it.id}:${op.id}:${activeRoleId}`;
                                    const loading = !!verifyingKey[k];
                                    const submitted = submittedItems.has(k);

                                    return (
                                      <button
                                        key={op.id}
                                        type="button"
                                        disabled={loading || submitted || done}
                                        onClick={() =>
                                          verifyChecklistItem({
                                            checklistItemId: it.id,
                                            option: op,
                                            item: it,
                                          })
                                        }
                                        className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:hover:scale-100"
                                        style={{
                                          backgroundColor:
                                            choice === "P"
                                              ? "#dcfce7"
                                              : "#fee2e2",
                                          color:
                                            choice === "P"
                                              ? "#166534"
                                              : "#991b1b",
                                          border: `1px solid ${borderColor}30`,
                                          opacity:
                                            loading || submitted || done
                                              ? 0.6
                                              : 1,
                                        }}
                                      >
                                        {loading
                                          ? "Submitting..."
                                          : submitted
                                            ? `${yesNoLabel(op)} Sent`
                                            : yesNoLabel(op)}
                                      </button>
                                    );
                                  })}

                                {activeRoleId === "maker" && makerOk && (
                                  <button
                                    type="button"
                                    disabled={makerSub || alreadySubmitted}
                                    onClick={() =>
                                      submitMakerDone({ item: it })
                                    }
                                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:hover:scale-100"
                                    style={{
                                      backgroundColor: borderColor,
                                      color: "#1b1b1b",
                                      border: `1px solid ${borderColor}30`,
                                      opacity:
                                        makerSub || alreadySubmitted ? 0.7 : 1,
                                    }}
                                  >
                                    {makerSub
                                      ? "Submitting..."
                                      : alreadySubmitted
                                        ? "Submitted ✅"
                                        : "Submit"}
                                  </button>
                                )}
                              </div>

                              {Array.isArray(it?.options) &&
                                it.options.length > 0 && (
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {it.options.map((op) => (
                                      <span
                                        key={op.id}
                                        className="px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{
                                          backgroundColor: `${borderColor}15`,
                                          color: textColor,
                                          border: `1px solid ${borderColor}25`,
                                        }}
                                      >
                                        {getOptionDisplayLabel(op)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  };

  if (!isOpen) return null;

  const headerLabel = isLevel ? "Floor" : "Tower / Building";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: cardColor,
          border: `2px solid ${borderColor}`,
          boxShadow:
            theme === "dark"
              ? "0 30px 70px rgba(0,0,0,0.6)"
              : "0 30px 70px rgba(0,0,0,0.25)",
        }}
      >
        <div
          className="sticky top-0 z-10 px-8 py-6 border-b"
          style={{
            backgroundColor: cardColor,
            borderColor: `${borderColor}40`,
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2
                className="text-2xl font-bold mb-3"
                style={{ color: textColor }}
              >
                Checklist Transfer
              </h2>

              <div className="flex flex-wrap gap-3">
                <span
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: `${borderColor}20`,
                    color: textColor,
                  }}
                >
                  {headerLabel}:{" "}
                  {context?.name ||
                    (isLevel
                      ? `Floor ${context?.levelId}`
                      : `Tower ${context?.id}`)}
                </span>

                <span
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: `${borderColor}20`,
                    color: textColor,
                  }}
                >
                  Project: {projectName || `Project ${projectId}`}
                </span>

                <span
                  className="px-4 py-2 rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: borderColor,
                    color: "#1b1b1b",
                  }}
                >
                  Role: {String(activeRoleId || "").toUpperCase()}
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("checklists")}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    backgroundColor:
                      activeTab === "checklists"
                        ? borderColor
                        : `${borderColor}20`,
                    color: activeTab === "checklists" ? "#1b1b1b" : textColor,
                    border: `1px solid ${borderColor}40`,
                  }}
                >
                  Checklists
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("report");
                    if (!reportData && !reportLoading) fetchViewReport();
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    backgroundColor:
                      activeTab === "report" ? borderColor : `${borderColor}20`,
                    color: activeTab === "report" ? "#1b1b1b" : textColor,
                    border: `1px solid ${borderColor}40`,
                  }}
                >
                  Report
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110"
              style={{
                backgroundColor: `${borderColor}20`,
                color: textColor,
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div
          className="overflow-y-auto p-8"
          style={{ maxHeight: "calc(90vh - 140px)" }}
        >
          {activeTab === "checklists"
            ? renderChecklistTab()
            : renderReportTab()}
        </div>
      </div>
    </div>
  );
}
