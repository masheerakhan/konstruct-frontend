import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { NEWchecklistInstance } from "../api/axiosInstance";

const flattenChecklists = (apiData) => {
  const results = Array.isArray(apiData?.results) ? apiData.results : [];
  const flattened = [];
  for (const r of results) {
    const legacy = Array.isArray(r?.checklists) ? r.checklists : [];
    const available = Array.isArray(r?.available_for_me) ? r.available_for_me : [];
    const assigned = Array.isArray(r?.assigned_to_me) ? r.assigned_to_me : [];
    for (const c of [...available, ...assigned, ...legacy]) {
      if (c && c.id != null) flattened.push(c);
    }
  }
  return flattened;
};

const applyChecklistUpdate = (data, updated) => {
  if (!data || !updated?.id) return data;
  const next = { ...data };
  if (!Array.isArray(next.results)) return next;
  const patchArr = (arr) =>
    Array.isArray(arr)
      ? arr.map((c) => (c?.id === updated.id ? { ...c, ...updated } : c))
      : arr;
  next.results = next.results.map((g) =>
    !g || typeof g !== "object"
      ? g
      : {
          ...g,
          available_for_me: patchArr(g.available_for_me),
          assigned_to_me: patchArr(g.assigned_to_me),
          checklists: patchArr(g.checklists),
        }
  );
  return next;
};

const applyItemUpdate = (data, patch) => {
  if (!data || !patch?.item_id) return data;
  const next = { ...data };
  if (!Array.isArray(next.results)) return next;
  const patchItems = (items) =>
    Array.isArray(items)
      ? items.map((it) =>
          it?.id === patch.item_id ? { ...it, status: patch.item_status } : it
        )
      : items;
  const patchCl = (cl) => {
    if (!cl || typeof cl !== "object") return cl;
    const n = { ...cl, status: patch.checklist_status ?? cl.status };
    if (Array.isArray(n.items)) n.items = patchItems(n.items);
    return n;
  };
  const patchArr = (arr) => (Array.isArray(arr) ? arr.map(patchCl) : arr);
  next.results = next.results.map((g) =>
    !g || typeof g !== "object"
      ? g
      : {
          ...g,
          available_for_me: patchArr(g.available_for_me),
          assigned_to_me: patchArr(g.assigned_to_me),
          checklists: patchArr(g.checklists),
        }
  );
  return next;
};

const applyMakerDone = (data, payload) => {
  const item = payload?.item;
  if (!data || !item?.id) return data;
  const next = { ...data };
  if (!Array.isArray(next.results)) return next;
  const submission = payload?.submission;
  const patchItems = (items) =>
    Array.isArray(items)
      ? items.map((it) =>
          it?.id === item.id
            ? { ...it, status: item.status, ...(submission ? { submission } : {}) }
            : it
        )
      : items;
  const patchCl = (cl) => {
    if (!cl || typeof cl !== "object") return cl;
    const n = { ...cl };
    if (cl?.id === item.checklist) {
      if (Array.isArray(n.items)) n.items = patchItems(n.items);
      if (payload?.checklist_status) n.status = payload.checklist_status;
    } else if (Array.isArray(n.items)) n.items = patchItems(n.items);
    return n;
  };
  const patchArr = (arr) => (Array.isArray(arr) ? arr.map(patchCl) : arr);
  next.results = next.results.map((g) =>
    !g || typeof g !== "object"
      ? g
      : {
          ...g,
          available_for_me: patchArr(g.available_for_me),
          assigned_to_me: patchArr(g.assigned_to_me),
          checklists: patchArr(g.checklists),
        }
  );
  return next;
};

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

const getRole = () => {
  const r = (
    localStorage.getItem("ACTIVE_ROLE") ||
    localStorage.getItem("FLOW_ROLE") ||
    localStorage.getItem("ROLE") ||
    ""
  )
    .trim()
    .toLowerCase();
  if (["maker", "checker", "supervisor", "initializer"].includes(r)) return r;
  return "checker";
};

const isYesNo = (op) => ["P", "N"].includes(String(op?.choice || "").toUpperCase());
const yesNoLabel = (op) => (String(op?.choice || "").toUpperCase() === "P" ? "YES" : "NO");

export default function ChecklistTransferModal({
  isOpen,
  onClose,
  context,
  projectId,
  projectName,
  theme,
  cardColor,
  textColor,
  borderColor,
}) {
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [activeRoleId, setActiveRoleId] = useState(getRole);
  const [startingById, setStartingById] = useState({});
  const [verifyingKey, setVerifyingKey] = useState({});
  const [remarkByItemId, setRemarkByItemId] = useState({});
  const [makerFilesByItemId, setMakerFilesByItemId] = useState({});
  const [makerSubmittingByItemId, setMakerSubmittingByItemId] = useState({});
  const [submittedItems, setSubmittedItems] = useState(new Set());
  const [showFullLogsByItemId, setShowFullLogsByItemId] = useState({});

  const isLevel = context?.type === "level";

  const getItemSubmissions = (cl, it, data) => {
    const fromItem = it?.submissions;
    const fromCl = Array.isArray(cl?.submissions) ? cl.submissions.filter((s) => s?.checklist_item?.id === it?.id) : [];
    const fromData = Array.isArray(data?.submissions) ? data.submissions.filter((s) => s?.checklist_item?.id === it?.id) : [];
    const list = fromItem ?? fromCl.length ? fromCl : fromData;
    return (list || []).slice().sort((a, b) => (b.attempts ?? b.id ?? 0) - (a.attempts ?? a.id ?? 0));
  };

  useEffect(() => {
    if (!isOpen || !context || !projectId) return;
    setActiveRoleId(getRole());
    setModalError("");
    setModalLoading(true);
    setModalData(null);
    setSubmittedItems(new Set());

    const params = {
      project_id: projectId,
      tower_id: context.buildingId,
      building_id: context.buildingId,
      limit: 50,
      offset: 0,
      role_id: getRole(),
    };
    if (isLevel && context.levelId != null) params.level_id = context.levelId;

    NEWchecklistInstance.get("/transfer-getchchklist/", { params })
      .then((res) => {
        setModalData(res?.data || {});
      })
      .catch(() => setModalError("Could not load checklist details."))
      .finally(() => setModalLoading(false));
  }, [isOpen, isLevel, context?.buildingId, context?.levelId, projectId]);

  const startChecklist = async (checklistId) => {
    if (!checklistId) return;
    setStartingById((p) => ({ ...p, [checklistId]: true }));
    try {
      const res = await NEWchecklistInstance.post(`/start-checklist/${checklistId}/`, {});
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
          "Failed to initialize."
      );
    } finally {
      setStartingById((p) => ({ ...p, [checklistId]: false }));
    }
  };

  const verifyChecklistItem = async ({ checklistItemId, option, item }) => {
    if (!checklistItemId || !option?.id || !["checker", "supervisor"].includes(activeRoleId))
      return;
    const choice = String(option?.choice || "").toUpperCase();
    if (choice !== "P" && choice !== "N") return;
    const k = `${checklistItemId}:${option.id}:${activeRoleId}`;
    
    // Prevent duplicate submissions
    if (verifyingKey[k] || submittedItems.has(k)) return;
    
    if (String(item?.status || "").toLowerCase() === "completed") {
      toast.success("Already completed ✅");
      return;
    }

    setVerifyingKey((p) => ({ ...p, [k]: true }));
    try {
      const body = {
        checklist_item_id: checklistItemId,
        role_id: activeRoleId,
        option_id: option.id,
      };
      if (activeRoleId === "checker")
        body.check_remark = (remarkByItemId[checklistItemId] || "").trim();
      else body.supervisor_remarks = (remarkByItemId[checklistItemId] || "").trim();

      const res = await NEWchecklistInstance.patch("/Decsion-makeing-forSuer-Inspector/", body);
      
      // Only proceed if we got a 200 response
      if (res.status === 200) {
        const payload = res?.data || {};
        toast.success(choice === "P" ? "Approved ✅" : "Rejected ✅");
        setModalData((p) => applyItemUpdate(p, payload));
        
        // Mark as submitted to prevent duplicate submissions
        setSubmittedItems((prev) => new Set(prev).add(k));
      }
    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
          e?.response?.data?.error ||
          e?.message ||
          "Verify failed."
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
    if (makerSubmittingByItemId[item.id] || submittedItems.has(submitKey)) return;

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
        
        // Mark as submitted
        setSubmittedItems((prev) => new Set(prev).add(submitKey));
      }
    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
          e?.response?.data?.error ||
          e?.message ||
          "Submit failed."
      );
    } finally {
      setMakerSubmittingByItemId((p) => ({ ...p, [item.id]: false }));
    }
  };

  const makerCanSubmit = (it) =>
    ["pending_for_maker", "tetmpory_maker", "temporary_maker", "rejected_by_checker"].includes(
      String(it?.status || "").toLowerCase()
    );

  if (!isOpen) return null;

  const headerLabel = isLevel ? "Floor" : "Tower / Building";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl"
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
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-8 py-6 border-b"
          style={{
            backgroundColor: cardColor,
            borderColor: `${borderColor}40`,
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3" style={{ color: textColor }}>
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
                  {context?.name || (isLevel ? `Floor ${context?.levelId}` : `Tower ${context?.id}`)}
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

        {/* Content */}
        <div className="overflow-y-auto p-8" style={{ maxHeight: "calc(90vh - 140px)" }}>
          {modalLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div
                className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4"
                style={{ borderColor: `${borderColor}40`, borderTopColor: "transparent" }}
              />
              <p className="text-lg" style={{ color: `${textColor}80` }}>
                Loading checklist details…
              </p>
            </div>
          ) : modalError ? (
            <div
              className="p-6 rounded-2xl text-center"
              style={{ backgroundColor: "#ff6b6b20", color: "#ff6b6b" }}
            >
              <p className="text-lg font-semibold">{modalError}</p>
            </div>
          ) : modalData ? (
            <>
              {/* Stage History */}
              {Array.isArray(modalData?.stage_history) &&
                modalData.stage_history.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4" style={{ color: textColor }}>
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
                          <div className="space-y-2 text-sm" style={{ color: textColor }}>
                            <p>
                              <span className="font-semibold">ID:</span> {sh.id}
                            </p>
                            <p>
                              <span className="font-semibold">Stage:</span> {sh.stage}
                            </p>
                            <p>
                              <span className="font-semibold">Status:</span> {sh.status}
                            </p>
                            <p className="text-xs" style={{ color: `${textColor}80` }}>
                              Started: {fmtDateTime(sh.started_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Checklists */}
              <div>
                <div className="flex items-baseline justify-between mb-6">
                  <h3 className="text-xl font-bold" style={{ color: textColor }}>
                    Available Checklists
                  </h3>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: `${borderColor}20`,
                      color: textColor,
                    }}
                  >
                    Total: {modalData?.count ?? 0}
                  </span>
                </div>

                {(() => {
                  const flat = flattenChecklists(modalData);
                  if (!flat.length) {
                    return (
                      <div
                        className="p-12 rounded-2xl text-center"
                        style={{ backgroundColor: `${borderColor}10` }}
                      >
                        <p className="text-lg" style={{ color: `${textColor}60` }}>
                          No checklists found for this {isLevel ? "floor" : "tower"}.
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-6">
                      {flat.map((cl) => {
                        const statusLower = String(cl?.status || "").toLowerCase();
                        const isInit =
                          !!cl?.initialized_at ||
                          statusLower === "in_progress" ||
                          statusLower === "work_in_progress";
                        const isStarting = !!startingById[cl.id];

                        return (
                          <div
                            key={cl.id}
                            className="rounded-2xl overflow-hidden"
                            style={{
                              backgroundColor: `${borderColor}10`,
                              border: `1px solid ${borderColor}30`,
                            }}
                          >
                            {/* Checklist Header */}
                            <div
                              className="p-6"
                              style={{
                                backgroundColor: `${borderColor}15`,
                                borderBottom: `1px solid ${borderColor}30`,
                              }}
                            >
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                  <h4 className="text-lg font-bold mb-2" style={{ color: textColor }}>
                                    {cl.name || `Checklist #${cl.id}`}
                                  </h4>
                                  <div className="flex flex-wrap gap-2 text-sm" style={{ color: `${textColor}80` }}>
                                    <span>ID: {cl.id}</span>
                                    <span>•</span>
                                    <span>Status: {cl.status}</span>
                                    <span>•</span>
                                    <span>Created: {fmtDateTime(cl.created_at)}</span>
                                  </div>
                                  {cl.initialized_at && (
                                    <p className="text-sm mt-2" style={{ color: `${textColor}80` }}>
                                      Initialized: {fmtDateTime(cl.initialized_at)}
                                    </p>
                                  )}
                                </div>
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

                            {/* Checklist Items */}
                            <div className="p-6 space-y-4">
                              {(Array.isArray(cl.items) ? cl.items : []).map((it) => {
                                const itStatus = String(it?.status || "").toLowerCase();
                                const done = itStatus === "completed";
                                const makerOk = makerCanSubmit(it);
                                const makerSub = !!makerSubmittingByItemId[it.id];
                                const makerKey = `maker:${it.id}`;
                                const alreadySubmitted = submittedItems.has(makerKey);

                                return (
                                  <div
                                    key={it.id}
                                    className="p-5 rounded-xl"
                                    style={{
                                      backgroundColor: cardColor,
                                      border: `1px solid ${borderColor}40`,
                                    }}
                                  >
                                    <div className="mb-4">
                                      <h5 className="font-bold mb-2" style={{ color: textColor }}>
                                        {it.title || `Item #${it.id}`}
                                      </h5>
                                      <div className="flex flex-wrap gap-2 text-sm" style={{ color: `${textColor}70` }}>
                                        <span
                                          className="px-3 py-1 rounded-full font-semibold"
                                          style={{
                                            backgroundColor: done ? "#4ade8020" : `${borderColor}20`,
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

                                    {/* Submission (if present) + Full logs */}
                                    {(() => {
                                      const itemSubmissions = getItemSubmissions(cl, it, modalData);
                                      const singleSubmission = it.submission ?? itemSubmissions[0];
                                      const hasLogs = itemSubmissions.length > 0;
                                      const showFull = !!showFullLogsByItemId[it.id];
                                      if (!singleSubmission && !itemSubmissions.length) return null;
                                      return (
                                        <div
                                          className="mb-4 p-4 rounded-xl space-y-2"
                                          style={{
                                            backgroundColor: `${borderColor}12`,
                                            border: `1px solid ${borderColor}30`,
                                          }}
                                        >
                                          <h6 className="text-sm font-bold" style={{ color: textColor }}>
                                            Submission
                                          </h6>
                                          {singleSubmission && (
                                            <div className="grid gap-2 text-sm" style={{ color: `${textColor}90` }}>
                                              <p>
                                                <span className="font-semibold">Status:</span>{" "}
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
                                                  <span className="font-semibold">Submitted at:</span>{" "}
                                                  {fmtDateTime(singleSubmission.maker_at)}
                                                </p>
                                              )}
                                              {singleSubmission.maker_remarks && (
                                                <p>
                                                  <span className="font-semibold">Remarks:</span>{" "}
                                                  {singleSubmission.maker_remarks}
                                                </p>
                                              )}
                                              {Array.isArray(singleSubmission.maker_media_multi) &&
                                                singleSubmission.maker_media_multi.length > 0 && (
                                                  <p>
                                                    <span className="font-semibold">Media:</span>{" "}
                                                    {singleSubmission.maker_media_multi.length} file(s)
                                                  </p>
                                                )}
                                            </div>
                                          )}
                                          {hasLogs && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setShowFullLogsByItemId((p) => ({ ...p, [it.id]: !p[it.id] }))
                                              }
                                              className="mt-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                                              style={{
                                                backgroundColor: `${borderColor}25`,
                                                color: textColor,
                                                border: `1px solid ${borderColor}40`,
                                              }}
                                            >
                                              {showFull ? "Hide full logs" : "Show full"}
                                            </button>
                                          )}
                                          {showFull && itemSubmissions.length > 0 && (
                                            <div className="mt-4 space-y-4 border-t pt-4" style={{ borderColor: `${borderColor}30` }}>
                                              <p className="text-xs font-bold uppercase" style={{ color: `${textColor}70` }}>
                                                Full submission logs ({itemSubmissions.length})
                                              </p>
                                              {itemSubmissions.map((sub, idx) => {
                                                const mediaUrls = [
                                                  ...(Array.isArray(sub.send_maker_media_multi) ? sub.send_maker_media_multi : []),
                                                  ...(sub.maker_media ? [sub.maker_media] : []),
                                                  ...(sub.reviewer_photo ? [sub.reviewer_photo] : []),
                                                  ...(sub.inspector_photo ? [sub.inspector_photo] : []),
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
                                                        style={{ backgroundColor: `${borderColor}20`, color: textColor }}
                                                      >
                                                        Attempt {sub.attempts ?? idx + 1}
                                                      </span>
                                                      <span
                                                        className="px-2 py-0.5 rounded font-medium"
                                                        style={{
                                                          backgroundColor:
                                                            String(sub.status || "").includes("rejected")
                                                              ? "#fef2f2"
                                                              : "#f0fdf4",
                                                          color: String(sub.status || "").includes("rejected")
                                                            ? "#dc2626"
                                                            : "#16a34a",
                                                        }}
                                                      >
                                                        {sub.status}
                                                      </span>
                                                    </div>
                                                    <div className="grid gap-1 text-xs" style={{ color: `${textColor}85` }}>
                                                      {sub.maker_id != null && (
                                                        <p><span className="font-semibold">Maker ID:</span> {sub.maker_id}</p>
                                                      )}
                                                      {sub.maker_at && (
                                                        <p><span className="font-semibold">Maker at:</span> {fmtDateTime(sub.maker_at)}</p>
                                                      )}
                                                      {sub.maker_remarks && (
                                                        <p><span className="font-semibold">Maker remarks:</span> {sub.maker_remarks}</p>
                                                      )}
                                                      {sub.checker_id != null && (
                                                        <p><span className="font-semibold">Checker ID:</span> {sub.checker_id}</p>
                                                      )}
                                                      {sub.checked_at && (
                                                        <p><span className="font-semibold">Checked at:</span> {fmtDateTime(sub.checked_at)}</p>
                                                      )}
                                                      {sub.checker_remarks && (
                                                        <p><span className="font-semibold">Checker remarks:</span> {sub.checker_remarks}</p>
                                                      )}
                                                      {sub.supervisor_id != null && (
                                                        <p><span className="font-semibold">Supervisor ID:</span> {sub.supervisor_id}</p>
                                                      )}
                                                      {sub.supervised_at && (
                                                        <p><span className="font-semibold">Supervised at:</span> {fmtDateTime(sub.supervised_at)}</p>
                                                      )}
                                                      {sub.supervisor_remarks && (
                                                        <p><span className="font-semibold">Supervisor remarks:</span> {sub.supervisor_remarks}</p>
                                                      )}
                                                      {sub.created_at && (
                                                        <p><span className="font-semibold">Created:</span> {fmtDateTime(sub.created_at)}</p>
                                                      )}
                                                    </div>
                                                    {mediaUrls.length > 0 && (
                                                      <div className="mt-2">
                                                        <p className="font-semibold text-xs mb-1" style={{ color: textColor }}>Files / images</p>
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
                                                              {/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url) ? "🖼 " : "📎 "}
                                                              {url.split("/").pop() || `File ${i + 1}`}
                                                            </a>
                                                          ))}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                          {mediaUrls.map((url, i) =>
                                                            /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url) ? (
                                                              <a
                                                                key={i}
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block rounded overflow-hidden border"
                                                                style={{ borderColor: `${borderColor}40` }}
                                                              >
                                                                <img src={url} alt="" className="w-20 h-20 object-cover" />
                                                              </a>
                                                            ) : null
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

                                    {/* Remark Input */}
                                    <div className="mb-4">
                                      <textarea
                                        rows={2}
                                        value={remarkByItemId[it.id] || ""}
                                        onChange={(e) =>
                                          setRemarkByItemId((p) => ({ ...p, [it.id]: e.target.value }))
                                        }
                                        placeholder="Add your remark here..."
                                        className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:ring-2 transition-all"
                                        style={{
                                          backgroundColor: theme === "dark" ? "#ffffff08" : "#00000005",
                                          color: textColor,
                                          border: `1px solid ${borderColor}40`,
                                          outline: "none",
                                        }}
                                      />
                                    </div>

                                    {/* Maker File Upload */}
                                    {activeRoleId === "maker" && (
                                      <div className="mb-4">
                                        <label
                                          className="block mb-2 text-sm font-semibold"
                                          style={{ color: textColor }}
                                        >
                                          Upload Files {it.photo_required && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                          type="file"
                                          multiple
                                          onChange={(e) =>
                                            setMakerFilesByItemId((p) => ({
                                              ...p,
                                              [it.id]: Array.from(e.target.files || []),
                                            }))
                                          }
                                          className="w-full text-sm p-2 rounded-lg"
                                          style={{
                                            color: textColor,
                                            backgroundColor: `${borderColor}10`,
                                            border: `1px solid ${borderColor}40`,
                                          }}
                                        />
                                        <p className="text-xs mt-2" style={{ color: `${textColor}60` }}>
                                          Selected: {(makerFilesByItemId[it.id] || []).length} file(s)
                                        </p>
                                      </div>
                                    )}

                                    {/* Options Count */}
                                    <p className="text-sm mb-4" style={{ color: `${textColor}70` }}>
                                      Options: {Array.isArray(it.options) ? it.options.length : 0}
                                    </p>

                                    {/* Action Buttons */}
                                    {activeRoleId === "maker" ? (
                                      <button
                                        disabled={!makerOk || done || makerSub || alreadySubmitted}
                                        onClick={() => submitMakerDone({ item: it })}
                                        className="w-full px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:hover:scale-100"
                                        style={{
                                          backgroundColor:
                                            !makerOk || done || alreadySubmitted
                                              ? theme === "dark"
                                                ? "#ffffff10"
                                                : "#00000010"
                                              : borderColor,
                                          color: !makerOk || done || alreadySubmitted ? textColor : "#1b1b1b",
                                          border: `1px solid ${borderColor}55`,
                                          opacity: !makerOk || done || alreadySubmitted ? 0.5 : 1,
                                          cursor: !makerOk || done || alreadySubmitted ? "not-allowed" : "pointer",
                                        }}
                                      >
                                        {alreadySubmitted ? "Already Submitted ✅" : makerSub ? "Submitting..." : "Submit (Maker)"}
                                      </button>
                                    ) : (activeRoleId === "checker" || activeRoleId === "supervisor") &&
                                      Array.isArray(it.options) &&
                                      it.options.length > 0 ? (
                                      <div className="flex gap-3">
                                        {it.options.map((op) => {
                                          const yn = isYesNo(op);
                                          const k = `${it.id}:${op.id}:${activeRoleId}`;
                                          const v = !!verifyingKey[k];
                                          const alreadySubmittedOption = submittedItems.has(k);

                                          return (
                                            <button
                                              key={op.id}
                                              disabled={!yn || done || v || alreadySubmittedOption}
                                              onClick={() =>
                                                verifyChecklistItem({
                                                  checklistItemId: it.id,
                                                  option: op,
                                                  item: it,
                                                })
                                              }
                                              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:hover:scale-100"
                                              title={
                                                !yn
                                                  ? "Only YES/NO"
                                                  : done
                                                  ? "Done"
                                                  : alreadySubmittedOption
                                                  ? "Already Submitted"
                                                  : "Submit"
                                              }
                                              style={{
                                                backgroundColor: !yn || alreadySubmittedOption
                                                  ? theme === "dark"
                                                    ? "#ffffff10"
                                                    : "#00000010"
                                                  : String(op?.choice || "").toUpperCase() === "P"
                                                  ? borderColor
                                                  : "#ff6b6b",
                                                color: !yn || alreadySubmittedOption ? textColor : "#1b1b1b",
                                                border: `1px solid ${borderColor}55`,
                                                opacity: !yn || done || alreadySubmittedOption ? 0.5 : 1,
                                                cursor: !yn || done || alreadySubmittedOption ? "not-allowed" : "pointer",
                                              }}
                                            >
                                              {alreadySubmittedOption
                                                ? "Submitted ✅"
                                                : v
                                                ? "Submitting..."
                                                : yn
                                                ? yesNoLabel(op)
                                                : op.name}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-center py-4" style={{ color: `${textColor}60` }}>
                                        No actions available for role: {String(activeRoleId || "").toUpperCase()}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </>
          ) : (
            <div
              className="p-12 rounded-2xl text-center"
              style={{ backgroundColor: `${borderColor}10` }}
            >
              <p className="text-lg" style={{ color: `${textColor}60` }}>
                No data available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}