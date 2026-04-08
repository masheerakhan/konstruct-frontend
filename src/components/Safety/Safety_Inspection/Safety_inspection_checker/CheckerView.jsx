import React, { useState, useEffect } from "react";
import {
    Clock,
    Eye,
    CheckCircle,
    CheckCircle2,
    CalendarDays,
    ClipboardCheck,
    ClipboardList,
    Send,
    Wrench,
    CircleAlert,
    ArrowLeft,
    FileSignature,
    Hourglass,
    Calendar,
} from "lucide-react";
import {
    listSafetyChecklists,
    getSafetyChecklist,
    submitSafetyChecklist,
    approveSafetyChecklist,
    rejectSafetyChecklist,
    resolveActiveProjectId,
} from "../../../../api";
import { showToast } from "../../../../utils/toast";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getCurrentUserId() {
    try {
        const raw = localStorage.getItem("USER_DATA");
        if (!raw || raw === "undefined") return null;
        const user = JSON.parse(raw);
        return user?.id ?? user?.user_id ?? null;
    } catch {
        return null;
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result || "";
            const commaIndex = result.indexOf(",");
            resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Resolve which dashboards to show.
 * Priority:
 *   1) SAFETY_INSPECTION_ROLE or FLOW_ROLE in localStorage (CHECKER / MAKER / INITIALIZER / SUPERVISOR)
 *   2) ROLE in localStorage
 *   3) USER_DATA.role / USER_DATA.roles[0]
 *   4) Derive from assigned checklists (checker / maker / both)
 * Returns: "checker" | "maker" | "both" | "initializer" | "supervisor" | null
 */
function getSafetyInspectionRole(checklists, userId) {
    const raw = (v) => (typeof v === "string" ? v : "").trim().toLowerCase();
    const CHECKER_ROLES = ["checker"];
    const MAKER_ROLES = ["maker"];
    const INITIALIZER_ROLES = ["initializer", "intializer"]; // "intializer" handles backend typo INTIALIZER
    const SUPERVISOR_ROLES = ["supervisor"];

    // Helper to make role matching more robust (case- and format-insensitive).
    // Treat any value that contains the keyword (e.g. "safety_initializer", "SAFETY-INSPECTION-CHECKER")
    // as that role, while preserving the existing return values.
    const matchesRole = (roleValue, keywords) => {
        const r = raw(roleValue);
        if (!r) return false;
        return keywords.some((kw) => r === kw || r.includes(kw));
    };

    let role = raw(
        localStorage.getItem("SAFETY_INSPECTION_ROLE") ||
        localStorage.getItem("FLOW_ROLE")
    );
    if (!role) role = raw(localStorage.getItem("ROLE"));
    if (!role) {
        try {
            const ud = localStorage.getItem("USER_DATA");
            if (ud && ud !== "undefined") {
                const data = JSON.parse(ud);
                role = raw(data?.role || data?.roles?.[0]);
            }
        } catch { }
    }

    if (matchesRole(role, CHECKER_ROLES)) return "checker";
    if (matchesRole(role, MAKER_ROLES)) return "maker";
    if (matchesRole(role, INITIALIZER_ROLES)) return "initializer";
    if (matchesRole(role, SUPERVISOR_ROLES)) return "supervisor";

    // Derive from checklist assignments
    if (checklists && userId != null) {
        const asChecker = checklists.filter(
            (c) =>
                Number(c.current_assignee_id) === Number(userId) &&
                (c.current_assignee_role || "").toUpperCase() === "CHECKER"
        );
        const asMakerList = checklists.filter(
            (c) =>
                Number(c.current_assignee_id) === Number(userId) &&
                (c.current_assignee_role || "").toUpperCase() === "MAKER"
        );
        if (asChecker.length > 0 && asMakerList.length === 0) return "checker";
        if (asMakerList.length > 0 && asChecker.length === 0) return "maker";
        if (asChecker.length > 0 && asMakerList.length > 0) return "both";
    }

    return null;
}

// ─────────────────────────────────────────────
// Mock data for Initializer / Supervisor
// (replace with real API calls as needed)
// ─────────────────────────────────────────────
const mockInitializerData = {
    counters: { pending: 0, initialized: 0, completed: 0 },
    tasks: {
        pending: [],
        initialized: [],
        completed: [],
    },
};

const mockSupervisorData = {
    counters: { assigned: 0, pending: 0, completed: 0, total: 0 },
    tasks: {
        assigned: [],
        pending: [],
        completed: [],
    },
};

// ─────────────────────────────────────────────
// Initializer Dashboard
// ─────────────────────────────────────────────
function InitializerDashboard() {
    const data = mockInitializerData;

    const counterColors = {
        pending: "text-orange-500",
        initialized: "text-blue-600",
        completed: "text-green-600",
    };

    const counterIcons = {
        pending: <Eye className="h-4 w-4" />,
        initialized: <FileSignature className="h-4 w-4" />,
        completed: <CheckCircle2 className="h-4 w-4" />,
    };

    const sectionConfig = [
        {
            key: "pending",
            label: "Pending Verification",
            icon: <Eye className="h-4 w-4 text-muted-foreground" />,
            tasks: data.tasks.pending,
            count: data.counters.pending,
        },
        {
            key: "initialized",
            label: "Initialized",
            icon: <FileSignature className="h-4 w-4 text-muted-foreground" />,
            tasks: data.tasks.initialized,
            count: data.counters.initialized,
        },
        {
            key: "completed",
            label: "Completed",
            icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
            tasks: data.tasks.completed,
            count: data.counters.completed,
        },
    ];

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-10">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                        <ClipboardList className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                            Initializer Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your initializations
                        </p>
                    </div>
                </div>

                {/* Counters */}
                <div className="mb-8 flex gap-4">
                    {["pending", "initialized", "completed"].map((key) => (
                        <div
                            key={key}
                            className="flex-1 min-w-0 rounded-xl border border-border bg-card p-5"
                        >
                            <div className="mb-2 flex items-center gap-1.5">
                                <span className={counterColors[key]}>{counterIcons[key]}</span>
                                <span
                                    className={`text-sm font-medium capitalize ${counterColors[key]}`}
                                >
                                    {key}
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-foreground tabular-nums">
                                {data.counters[key]}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Sections */}
                {sectionConfig.map(({ key, label, icon, tasks, count }) => (
                    <div key={key} className="mb-6">
                        <div className="mb-3 flex items-center gap-2">
                            {icon}
                            <h2 className="text-base font-semibold text-foreground">{label}</h2>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                {count}
                            </span>
                        </div>
                        <div className="rounded-xl border border-border bg-card">
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="cursor-pointer border-b border-border p-4 transition-colors last:border-b-0 hover:bg-muted/50"
                                    >
                                        <p className="text-sm font-medium text-foreground">
                                            {task.title}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            ID: {task.id} • {task.date}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4">
                                    <p className="text-sm text-muted-foreground">No items</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Supervisor Dashboard
// ─────────────────────────────────────────────
function SupervisorDashboard() {
    const data = mockSupervisorData;

    const counterColors = {
        assigned: "text-orange-500",
        pending: "text-purple-600",
        completed: "text-green-600",
        total: "text-indigo-600",
    };

    const counterIcons = {
        assigned: <Clock className="h-4 w-4" />,
        pending: <Eye className="h-4 w-4" />,
        completed: <CheckCircle2 className="h-4 w-4" />,
        total: <Calendar className="h-4 w-4" />,
    };

    const sectionConfig = [
        {
            key: "assigned",
            label: "Assigned Inspections",
            icon: <Clock className="h-4 w-4 text-muted-foreground" />,
            tasks: data.tasks.assigned,
            count: data.counters.assigned,
        },
        {
            key: "pending",
            label: "Pending",
            icon: <Eye className="h-4 w-4 text-muted-foreground" />,
            tasks: data.tasks.pending,
            count: data.counters.pending,
        },
        {
            key: "completed",
            label: "Completed Inspections",
            icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
            tasks: data.tasks.completed,
            count: data.counters.completed,
        },
    ];

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-10">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                        <ClipboardList className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                            Supervisor Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your inspections
                        </p>
                    </div>
                </div>

                {/* Counters */}
                <div className="mb-8 flex gap-4">
                    {["assigned", "pending", "completed", "total"].map((key) => (
                        <div
                            key={key}
                            className="flex-1 min-w-0 rounded-xl border border-border bg-card p-5"
                        >
                            <div className="mb-2 flex items-center gap-1.5">
                                <span className={counterColors[key]}>{counterIcons[key]}</span>
                                <span
                                    className={`text-sm font-medium capitalize ${counterColors[key]}`}
                                >
                                    {key}
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-foreground tabular-nums">
                                {data.counters[key]}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Sections */}
                {sectionConfig.map(({ key, label, icon, tasks, count }) => (
                    <div key={key} className="mb-6">
                        <div className="mb-3 flex items-center gap-2">
                            {icon}
                            <h2 className="text-base font-semibold text-foreground">{label}</h2>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                {count}
                            </span>
                        </div>
                        <div className="rounded-xl border border-border bg-card">
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="cursor-pointer border-b border-border p-4 transition-colors last:border-b-0 hover:bg-muted/50"
                                    >
                                        <p className="text-sm font-medium text-foreground">
                                            {task.title}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            ID: {task.id} • {task.date}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4">
                                    <p className="text-sm text-muted-foreground">No items</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Checker + Maker Dashboard (existing logic — unchanged)
// ─────────────────────────────────────────────
function CheckerMakerDashboard() {
    const userId = getCurrentUserId();
    const [projectId, setProjectId] = useState("");
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [rejectRemarks, setRejectRemarks] = useState("");
    const [selectedRejectIds, setSelectedRejectIds] = useState(new Set());
    const [makerRemarks, setMakerRemarks] = useState({});
    const [makerMedia, setMakerMedia] = useState({});
    const [verificationAnswers, setVerificationAnswers] = useState({});
    const [checkerView, setCheckerView] = useState("dashboard");
    const [inspectionAnswers, setInspectionAnswers] = useState({});
    const [reviewerMedia, setReviewerMedia] = useState({});

    const fetchList = async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const params = { assigned_to_me: true };
            if (projectId) params.project_id = projectId;
            const res = await listSafetyChecklists(params);
            const data = res?.data;
            const list = Array.isArray(data) ? data : data?.results ?? [];
            setChecklists(list);
        } catch (err) {
            const msg =
                err?.response?.data?.detail || err?.message || "Failed to load checklists.";
            setError(msg);
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setProjectId(String(resolveActiveProjectId?.() || ""));
    }, []);

    useEffect(() => {
        fetchList();
    }, [userId, projectId]);

    const assignedToMe = checklists;

    const asChecker = assignedToMe.filter(
        (c) => (c.current_assignee_role || "").toUpperCase() === "CHECKER"
    );
    const asMaker = assignedToMe.filter(
        (c) => (c.current_assignee_role || "").toUpperCase() === "MAKER"
    );

    const checkerAssigned = asChecker.filter((c) => c.status === "in_progress");
    const checkerPending = asChecker.filter((c) => c.status === "in_progress");
    const checkerCompleted = asChecker.filter((c) => c.status === "completed");

    const makerPending = asMaker.filter(
        (c) =>
            c.status !== "completed" &&
            Number(c.current_assignee_id) === Number(userId)
    );
    const makerSubmitted = asMaker.filter(
        (c) =>
            c.status === "in_progress" &&
            Number(c.current_assignee_id) !== Number(userId)
    );
    const makerCompleted = asMaker.filter((c) => c.status === "completed");

    const safetyRole = getSafetyInspectionRole(checklists, userId);
    const showCheckerDashboard =
        safetyRole === null || safetyRole === "checker" || safetyRole === "both";
    const showMakerDashboard =
        safetyRole === null || safetyRole === "maker" || safetyRole === "both";

    const pendingCheckerItems =
        detail?.items?.flatMap((item) => {
            const subs = item.submissions || [];
            return subs
                .filter((s) => s.status === "pending_checker" && s.checker_id != null)
                .map((sub) => ({ item, sub }));
        }) ?? [];

    const makerEditableItems =
        detail?.items
            ?.map((item) => {
                const subs = item.submissions || [];
                const sub = subs.find((s) =>
                    [
                        "Pending for Maker",
                        "rejected_by_checker",
                        "rejected_by_supervisor",
                        "created",
                    ].includes(s.status)
                );
                if (!sub) return null;
                return { item, sub };
            })
            .filter(Boolean) ?? [];

    // ── navigation helpers ──────────────────────────────────────
    const backToDashboard = () => {
        setCheckerView("dashboard");
        setDetail(null);
        setInspectionAnswers({});
        setSelectedRejectIds(new Set());
        setRejectRemarks("");
        setVerificationAnswers({});
        setReviewerMedia({});
    };

    const closeDetail = () => {
        setDetail(null);
        setCheckerView("dashboard");
        fetchList();
    };

    // ── open helpers ────────────────────────────────────────────
    const openAssignedInspection = async (cl) => {
        setDetail(null);
        setDetailLoading(true);
        setInspectionAnswers({});
        setReviewerMedia({});
        try {
            const res = await getSafetyChecklist(cl.id);
            const data = res?.data || null;
            setDetail(data);
            const initial = {};
            (data?.items || []).forEach((item) => {
                const subs = item.submissions || [];
                const sub = subs[subs.length - 1];
                if (sub) initial[sub.id] = null;
            });
            setInspectionAnswers(initial);
            setCheckerView("inspection");
        } catch (err) {
            showToast(err?.response?.data?.detail || "Failed to load checklist", "error");
        } finally {
            setDetailLoading(false);
        }
    };

    const openPendingVerification = async (cl) => {
        setDetail(null);
        setDetailLoading(true);
        setSelectedRejectIds(new Set());
        setRejectRemarks("");
        setReviewerMedia({});
        try {
            const res = await getSafetyChecklist(cl.id);
            const data = res?.data || null;
            setDetail(data);
            const initial = {};
            (data?.items || []).forEach((entry) => {
                const { sub } =
                    (entry.submissions || [])
                        .map((s) => ({ item: entry, sub: s }))
                        .find(({ sub }) => sub.status === "pending_checker") || {};
                if (sub && (sub.maker_remarks || sub.has_photo || (sub.images || []).length)) {
                    initial[sub.id] = "yes";
                }
            });
            setVerificationAnswers(initial);
            setCheckerView("verification");
        } catch (err) {
            showToast(err?.response?.data?.detail || "Failed to load checklist", "error");
        } finally {
            setDetailLoading(false);
        }
    };

    const openMakerFix = async (cl) => {
        setDetail(null);
        setDetailLoading(true);
        setMakerRemarks({});
        setMakerMedia({});
        try {
            const res = await getSafetyChecklist(cl.id);
            const data = res?.data || null;
            setDetail(data);
            const initialRemarks = {};
            (data?.items || []).forEach((entry) => {
                const { sub } =
                    (entry.submissions || [])
                        .map((s) => ({ item: entry, sub: s }))
                        .find(({ sub }) =>
                            [
                                "Pending for Maker",
                                "rejected_by_checker",
                                "rejected_by_supervisor",
                                "created",
                            ].includes(sub.status)
                        ) || {};
                if (sub) initialRemarks[sub.id] = makerRemarks[sub.id] ?? "";
            });
            setMakerRemarks(initialRemarks);
            setCheckerView("maker_fix");
        } catch (err) {
            showToast(err?.response?.data?.detail || "Failed to load checklist", "error");
        } finally {
            setDetailLoading(false);
        }
    };

    // ── submit helpers ──────────────────────────────────────────
    const handleSubmit = async () => {
        if (!detail) return;
        setSubmitting(true);
        try {
            const makerStatuses = [
                "Pending for Maker",
                "rejected_by_checker",
                "rejected_by_supervisor",
                "created",
            ];
            const submissions = (detail.items || [])
                .map((item) => {
                    const sub = (item.submissions || []).find((s) =>
                        makerStatuses.includes(s.status)
                    );
                    if (!sub) return null;
                    const payload = {
                        submission_id: sub.id,
                        maker_remarks: makerRemarks[sub.id] ?? "",
                    };
                    const media = makerMedia[sub.id];
                    if (media) payload.maker_media_base64 = media;
                    return payload;
                })
                .filter(Boolean);
            await submitSafetyChecklist(detail.id, submissions.length ? { submissions } : {});
            showToast("Submitted successfully", "success");
            backToDashboard();
            fetchList();
        } catch (err) {
            showToast(err?.response?.data?.detail || "Submit failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitSingleFix = async (submissionId) => {
        if (!detail) return;
        const submissions = [];
        (detail.items || []).forEach((item) => {
            const sub = (item.submissions || []).find((s) => s.id === submissionId);
            if (!sub) return;
            const payload = {
                submission_id: sub.id,
                maker_remarks: makerRemarks[sub.id] ?? "",
            };
            const media = makerMedia[sub.id];
            if (media) payload.maker_media_base64 = media;
            submissions.push(payload);
        });
        if (!submissions.length) {
            showToast("Could not find fix to submit.", "error");
            return;
        }
        setSubmitting(true);
        try {
            await submitSafetyChecklist(detail.id, { submissions });
            showToast("Fix submitted.", "success");
            const res = await getSafetyChecklist(detail.id);
            const data = res?.data || null;
            setDetail(data);
            const nextRemarks = {};
            (data?.items || []).forEach((entry) => {
                const { sub } =
                    (entry.submissions || [])
                        .map((s) => ({ item: entry, sub: s }))
                        .find(({ sub }) =>
                            [
                                "Pending for Maker",
                                "rejected_by_checker",
                                "rejected_by_supervisor",
                                "created",
                            ].includes(sub.status)
                        ) || {};
                if (sub) nextRemarks[sub.id] = makerRemarks[sub.id] ?? "";
            });
            setMakerRemarks(nextRemarks);
            setMakerMedia((prev) => {
                const copy = { ...prev };
                delete copy[submissionId];
                return copy;
            });
            fetchList();
        } catch (err) {
            showToast(err?.response?.data?.detail || "Submit fix failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleInspectionAnswer = (submissionId, value) =>
        setInspectionAnswers((prev) => ({ ...prev, [submissionId]: value }));

    const handleInspectionSubmit = async () => {
        if (!detail) return;
        const allSubs =
            (detail.items || []).flatMap((item) => item.submissions || []).filter(Boolean) || [];
        if (allSubs.length === 0) {
            showToast("No items to inspect", "error");
            return;
        }
        const failIds = allSubs
            .filter((sub) => inspectionAnswers[sub.id] === "no")
            .map((sub) => sub.id);
        setSubmitting(true);
        try {
            if (failIds.length > 0) {
                const rejections = failIds.map((submissionId) => {
                    const row = { submission_id: submissionId };
                    const b64 = reviewerMedia[submissionId];
                    if (b64) row.reviewer_media_base64 = b64;
                    return row;
                });
                await rejectSafetyChecklist(detail.id, {
                    submission_ids: failIds,
                    rejections,
                });
                showToast("Inspection submitted. Fix requests sent to Maker.", "success");
            } else {
                const submissions = allSubs.map((sub) => {
                    const row = { submission_id: sub.id };
                    const b64 = reviewerMedia[sub.id];
                    if (b64) row.reviewer_media_base64 = b64;
                    return row;
                });
                await approveSafetyChecklist(detail.id, { submissions });
                showToast("Inspection approved successfully.", "success");
            }
            backToDashboard();
            fetchList();
        } catch (err) {
            showToast(err?.response?.data?.detail || "Submit inspection failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerificationAnswer = (submissionId, value) =>
        setVerificationAnswers((prev) => ({ ...prev, [submissionId]: value }));

    const handleVerificationSubmit = async () => {
        if (!detail) return;
        const subs =
            (detail.items || [])
                .flatMap((item) => item.submissions || [])
                .filter((sub) => sub && sub.status === "pending_checker" && sub.checker_id != null) ||
            [];
        if (subs.length === 0) {
            showToast("No items pending verification", "error");
            return;
        }
        const rejectIds = subs
            .filter((sub) => verificationAnswers[sub.id] === "no")
            .map((sub) => sub.id);
        setSubmitting(true);
        try {
            if (rejectIds.length > 0) {
                const rejections = rejectIds.map((submissionId) => {
                    const row = { submission_id: submissionId };
                    const b64 = reviewerMedia[submissionId];
                    if (b64) row.reviewer_media_base64 = b64;
                    return row;
                });
                await rejectSafetyChecklist(detail.id, {
                    submission_ids: rejectIds,
                    rejections,
                });
                showToast("Rejected fixes sent back to Maker.", "success");
            } else {
                const submissions = subs.map((sub) => {
                    const row = { submission_id: sub.id };
                    const b64 = reviewerMedia[sub.id];
                    if (b64) row.reviewer_media_base64 = b64;
                    return row;
                });
                await approveSafetyChecklist(detail.id, { submissions });
                showToast("Verification approved successfully.", "success");
            }
            backToDashboard();
            fetchList();
        } catch (err) {
            showToast(err?.response?.data?.detail || "Verification submit failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── render ───────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-10">
            <div className="mx-auto max-w-4xl">
                {!userId && (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        User not found in session. Log in or ensure USER_DATA is set in localStorage.
                    </div>
                )}

                {loading && (
                    <div className="py-8 text-center text-muted-foreground">Loading…</div>
                )}
                {!loading && error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* ── CHECKER: INSPECTION VIEW ── */}
                        {showCheckerDashboard && checkerView === "inspection" && detail && (
                            <section>
                                <button
                                    type="button"
                                    onClick={backToDashboard}
                                    className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </button>
                                <div className="mb-4 rounded-lg border bg-card p-4">
                                    <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                                        {detail.name}
                                    </h1>
                                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                        {(detail.items || []).length} questions • Tap Yes or No for each item
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {(detail.items || []).map((item, idx) => {
                                        const subs = item.submissions || [];
                                        const sub = subs[subs.length - 1];
                                        if (!sub) return null;
                                        const val = inspectionAnswers[sub.id];
                                        return (
                                            <div key={item.id} className="rounded-lg border bg-card p-4">
                                                <div className="mb-3 flex items-center gap-2">
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-sm font-medium text-foreground sm:text-base">
                                                        {item.title}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex flex-col gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleInspectionAnswer(sub.id, "yes")}
                                                        className={`flex items-center justify-start rounded-md border px-3 py-2 text-sm font-medium transition-colors ${val === "yes"
                                                            ? "border-green-500 bg-green-500 text-white"
                                                            : "border-border bg-muted text-foreground hover:bg-muted/80"
                                                            }`}
                                                    >
                                                        Yes
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleInspectionAnswer(sub.id, "no")}
                                                        className={`flex items-center justify-start rounded-md border px-3 py-2 text-sm font-medium transition-colors ${val === "no"
                                                            ? "border-red-500 bg-red-500 text-white"
                                                            : "border-border bg-muted text-foreground hover:bg-muted/80"
                                                            }`}
                                                    >
                                                        No
                                                    </button>
                                                    {sub.has_photo && sub.photo_url ? (
                                                        <a
                                                            href={sub.photo_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-medium text-primary underline"
                                                        >
                                                            View maker photo
                                                        </a>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">
                                                            No photo uploaded for this item.
                                                        </p>
                                                    )}
                                                    <div className="mt-1">
                                                        <p className="mb-1 text-xs text-muted-foreground">
                                                            Optional: attach photo with your decision
                                                        </p>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                try {
                                                                    const base64 = await fileToBase64(file);
                                                                    setReviewerMedia((prev) => ({
                                                                        ...prev,
                                                                        [sub.id]: base64,
                                                                    }));
                                                                } catch {
                                                                    showToast("Failed to read image file", "error");
                                                                }
                                                            }}
                                                            className="block w-full text-xs text-muted-foreground"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={handleInspectionSubmit}
                                        disabled={submitting}
                                        className="flex w-full items-center justify-center rounded-md bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-60"
                                    >
                                        {submitting ? "Submitting…" : "Submit Inspection"}
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* ── CHECKER: VERIFICATION VIEW ── */}
                        {showCheckerDashboard && checkerView === "verification" && detail && (
                            <section>
                                <button
                                    type="button"
                                    onClick={backToDashboard}
                                    className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </button>
                                <div className="mb-4 flex items-center justify-between rounded-lg border bg-card p-4">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground sm:text-base">
                                            {detail.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {pendingCheckerItems.length} item(s) to verify
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                                        fix submitted
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {pendingCheckerItems.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No items pending verification.
                                        </p>
                                    ) : (
                                        pendingCheckerItems.map(({ item, sub }, idx) => {
                                            const val = verificationAnswers[sub.id] || "yes";
                                            return (
                                                <div key={sub.id} className="rounded-lg bg-muted/60 p-4">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-foreground">
                                                            {idx + 1}
                                                        </span>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {item.title}
                                                        </p>
                                                    </div>
                                                    {sub.maker_remarks && (
                                                        <p className="mb-1 text-xs text-muted-foreground">
                                                            Fix: {sub.maker_remarks}
                                                        </p>
                                                    )}
                                                    {sub.supervisor_remarks ? (
                                                        <p className="mb-1 text-xs text-amber-800">
                                                            Supervisor: {sub.supervisor_remarks}
                                                        </p>
                                                    ) : null}
                                                    {sub.checker_remarks ? (
                                                        <p className="mb-1 text-xs text-amber-800">
                                                            Checker: {sub.checker_remarks}
                                                        </p>
                                                    ) : null}
                                                    {sub.has_photo && sub.photo_url ? (
                                                        <a
                                                            href={sub.photo_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mb-2 inline-block text-xs font-medium text-primary underline"
                                                        >
                                                            View current photo
                                                        </a>
                                                    ) : (
                                                        <p className="mb-2 text-xs text-muted-foreground">
                                                            No photo on file for this item.
                                                        </p>
                                                    )}
                                                    <div className="mb-2">
                                                        <p className="mb-1 text-xs text-muted-foreground">
                                                            Optional: attach photo with verification
                                                        </p>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                try {
                                                                    const base64 = await fileToBase64(file);
                                                                    setReviewerMedia((prev) => ({
                                                                        ...prev,
                                                                        [sub.id]: base64,
                                                                    }));
                                                                } catch {
                                                                    showToast("Failed to read image file", "error");
                                                                }
                                                            }}
                                                            className="block w-full text-xs text-muted-foreground"
                                                        />
                                                    </div>
                                                    <div className="mt-2 flex flex-col gap-2">
                                                        {["yes", "no", "na"].map((opt) => (
                                                            <button
                                                                key={opt}
                                                                type="button"
                                                                onClick={() => handleVerificationAnswer(sub.id, opt)}
                                                                className={`flex items-center justify-start rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${val === opt
                                                                    ? opt === "yes"
                                                                        ? "border-green-500 bg-green-500 text-white"
                                                                        : opt === "no"
                                                                            ? "border-red-500 bg-red-500 text-white"
                                                                            : "border-slate-500 bg-slate-500 text-white"
                                                                    : "border-border bg-white text-foreground hover:bg-muted"
                                                                    }`}
                                                            >
                                                                {opt === "na" ? "N/A" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                {pendingCheckerItems.length > 0 && (
                                    <div className="mt-6">
                                        <button
                                            type="button"
                                            onClick={handleVerificationSubmit}
                                            disabled={submitting}
                                            className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
                                        >
                                            {submitting ? "Submitting…" : "Submit Verification"}
                                        </button>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ── MAKER: FIX VIEW ── */}
                        {showMakerDashboard && checkerView === "maker_fix" && detail && (
                            <section>
                                <button
                                    type="button"
                                    onClick={backToDashboard}
                                    className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </button>
                                <div className="mb-4 rounded-lg border bg-card p-4">
                                    <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                                        {detail.name}
                                    </h1>
                                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                        {makerEditableItems.length} item(s) to fix
                                    </p>
                                </div>
                                {makerEditableItems.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No items pending for you right now.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {makerEditableItems.map(({ item, sub }, idx) => (
                                            <div key={item.id} className="rounded-lg border bg-card p-4">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-sm font-medium text-foreground sm:text-base">
                                                        {item.title}
                                                    </span>
                                                </div>
                                                {sub.supervisor_remarks ? (
                                                    <p className="mt-1 text-xs text-amber-800">
                                                        Supervisor: {sub.supervisor_remarks}
                                                    </p>
                                                ) : null}
                                                {sub.checker_remarks ? (
                                                    <p className="mt-1 text-xs text-amber-800">
                                                        Checker: {sub.checker_remarks}
                                                    </p>
                                                ) : null}
                                                {sub.has_photo && sub.photo_url ? (
                                                    <a
                                                        href={sub.photo_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 inline-block text-xs font-medium text-primary underline"
                                                    >
                                                        View photo from review
                                                    </a>
                                                ) : null}
                                                <textarea
                                                    className="mt-2 w-full rounded border p-2 text-sm"
                                                    placeholder="Remarks (what was fixed / checked)"
                                                    value={makerRemarks[sub.id] ?? ""}
                                                    onChange={(e) =>
                                                        setMakerRemarks((prev) => ({
                                                            ...prev,
                                                            [sub.id]: e.target.value,
                                                        }))
                                                    }
                                                    rows={2}
                                                />
                                                {item.photo_required && (
                                                    <div className="mt-3">
                                                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                                                            Upload photo (required)
                                                        </p>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                try {
                                                                    const base64 = await fileToBase64(file);
                                                                    setMakerMedia((prev) => ({
                                                                        ...prev,
                                                                        [sub.id]: base64,
                                                                    }));
                                                                } catch {
                                                                    showToast("Failed to read image file", "error");
                                                                }
                                                            }}
                                                            className="block w-full text-xs text-muted-foreground"
                                                        />
                                                    </div>
                                                )}
                                                <div className="mt-3 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSubmitSingleFix(sub.id)}
                                                        disabled={submitting}
                                                        className="inline-flex items-center rounded-md border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
                                                    >
                                                        <Send className="mr-1.5 h-3.5 w-3.5" />
                                                        Submit Fix
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {makerEditableItems.length > 0 && (
                                    <div className="mt-6">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            {submitting ? "Submitting…" : "Submit Fixes"}
                                        </button>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ── DASHBOARDS ── */}
                        {checkerView === "dashboard" && (
                            <>
                                {/* CHECKER DASHBOARD */}
                                {showCheckerDashboard && (
                                    <section className="mb-10">
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                                                <ClipboardCheck className="h-5 w-5 text-orange-500" />
                                            </div>
                                            <div>
                                                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                                                    Checker Dashboard
                                                </h1>
                                                <p className="text-sm text-muted-foreground">
                                                    Manage your inspections
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                                            {[
                                                { key: "assigned", label: "Assigned", icon: <Clock className="h-3.5 w-3.5" />, color: "hsl(35, 90%, 50%)", count: checkerAssigned.length },
                                                { key: "pending", label: "Pending", icon: <Eye className="h-3.5 w-3.5" />, color: "hsl(280, 70%, 50%)", count: checkerPending.length },
                                                { key: "completed", label: "Completed", icon: <CheckCircle className="h-3.5 w-3.5" />, color: "hsl(145, 65%, 42%)", count: checkerCompleted.length },
                                                { key: "total", label: "Total", icon: <CalendarDays className="h-3.5 w-3.5" />, color: "hsl(220, 70%, 50%)", count: asChecker.length },
                                            ].map(({ key, label, icon, color, count }) => (
                                                <div key={key} className="rounded-lg border bg-card p-4">
                                                    <div className="mb-1 flex items-center gap-1.5" style={{ color }}>
                                                        {icon}
                                                        <span className="text-xs font-medium">{label}</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-foreground">{count}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Assigned Inspections */}
                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-sm font-semibold text-foreground sm:text-base">
                                                    Assigned Inspections
                                                </h2>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                    {checkerAssigned.length}
                                                </span>
                                            </div>
                                            <div className="rounded-lg border bg-card">
                                                {checkerAssigned.length === 0 ? (
                                                    <p className="p-4 text-sm text-muted-foreground">No items</p>
                                                ) : (
                                                    checkerAssigned.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex flex-col gap-3 border-b border-border/50 p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-foreground">{item.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.created_at
                                                                        ? new Date(item.created_at).toLocaleDateString()
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                                                                    assigned
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openAssignedInspection(item)}
                                                                    className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
                                                                >
                                                                    Start Inspection
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Pending Verification */}
                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-sm font-semibold text-foreground sm:text-base">
                                                    Pending Verification
                                                </h2>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                    {checkerPending.length}
                                                </span>
                                            </div>
                                            <div className="rounded-lg border bg-card">
                                                {checkerPending.length === 0 ? (
                                                    <p className="p-4 text-sm text-muted-foreground">No items</p>
                                                ) : (
                                                    checkerPending.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex flex-col gap-2 border-b border-border/50 p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-foreground">{item.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.created_at
                                                                        ? new Date(item.created_at).toLocaleDateString()
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => openPendingVerification(item)}
                                                                className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                                                            >
                                                                Review Fixes
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Completed Inspections */}
                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-sm font-semibold text-foreground sm:text-base">
                                                    Completed Inspections
                                                </h2>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                    {checkerCompleted.length}
                                                </span>
                                            </div>
                                            <div className="rounded-lg border bg-card">
                                                {checkerCompleted.length === 0 ? (
                                                    <p className="p-4 text-sm text-muted-foreground">No items</p>
                                                ) : (
                                                    checkerCompleted.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex flex-col gap-2 border-b border-border/50 p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-foreground">{item.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.created_at
                                                                        ? new Date(item.created_at).toLocaleDateString()
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                            <span className="rounded-full border border-green-200 bg-green-50 px-3 py-0.5 text-xs font-medium text-green-600">
                                                                approved
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* MAKER DASHBOARD */}
                                {showMakerDashboard && (
                                    <section>
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                                                <Wrench className="h-5 w-5 text-orange-500" />
                                            </div>
                                            <div>
                                                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                                                    Maker Dashboard
                                                </h1>
                                                <p className="text-sm text-muted-foreground">
                                                    Fix failed inspection items
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
                                            {[
                                                { label: "Pending", icon: <CircleAlert className="h-3.5 w-3.5 text-red-500" />, colorCls: "text-red-600", count: makerPending.length },
                                                { label: "Submitted", icon: <Send className="h-3.5 w-3.5 text-red-500" />, colorCls: "text-red-600", count: makerSubmitted.length },
                                                { label: "Done", icon: <CheckCircle className="h-3.5 w-3.5 text-green-600" />, colorCls: "text-green-600", count: makerCompleted.length },
                                            ].map(({ label, icon, colorCls, count }) => (
                                                <div key={label} className="rounded-lg border bg-card p-4">
                                                    <div className="mb-1 flex items-center gap-1.5">
                                                        {icon}
                                                        <span className={`text-xs font-medium ${colorCls}`}>{label}</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-foreground">{count}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pending Fix Requests */}
                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-sm font-semibold text-foreground sm:text-base">
                                                    Pending Fix Requests
                                                </h2>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                    {makerPending.length}
                                                </span>
                                            </div>
                                            <div className="rounded-lg border bg-card">
                                                {makerPending.length === 0 ? (
                                                    <p className="p-4 text-sm text-muted-foreground">No items</p>
                                                ) : (
                                                    makerPending.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex flex-col gap-2 border-b border-border/50 p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-foreground">{item.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.created_at
                                                                        ? new Date(item.created_at).toLocaleDateString()
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => openMakerFix(item)}
                                                                className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
                                                            >
                                                                Start Now
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Fix Submitted */}
                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Send className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-sm font-semibold text-foreground sm:text-base">
                                                    Fix Submitted
                                                </h2>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                    {makerSubmitted.length}
                                                </span>
                                            </div>
                                            <div className="rounded-lg border bg-card">
                                                {makerSubmitted.length === 0 ? (
                                                    <p className="p-4 text-sm text-muted-foreground">No items</p>
                                                ) : (
                                                    makerSubmitted.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex flex-col gap-2 border-b border-border/50 p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-foreground">{item.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.created_at
                                                                        ? new Date(item.created_at).toLocaleDateString()
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Completed */}
                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-sm font-semibold text-foreground sm:text-base">
                                                    Completed
                                                </h2>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                    {makerCompleted.length}
                                                </span>
                                            </div>
                                            <div className="rounded-lg border bg-card">
                                                {makerCompleted.length === 0 ? (
                                                    <p className="p-4 text-sm text-muted-foreground">No items</p>
                                                ) : (
                                                    makerCompleted.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex flex-col gap-2 border-b border-border/50 p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-foreground">{item.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.created_at
                                                                        ? new Date(item.created_at).toLocaleDateString()
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                            <span className="rounded-full border border-green-200 bg-green-50 px-3 py-0.5 text-xs font-medium text-green-600">
                                                                Completed
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Root: resolves role and renders correct dashboard
// ─────────────────────────────────────────────
function UnifiedDashboard() {
    // Read role once on mount; checklists not yet loaded so pass [] for derivation.
    // CheckerMakerDashboard internally re-derives after data loads.
    const userId = getCurrentUserId();
    const [resolvedRole, setResolvedRole] = useState(() =>
        getSafetyInspectionRole([], userId)
    );

    // Allow role to be updated after CheckerMakerDashboard loads its checklists
    // by exposing a callback — but for initializer/supervisor we resolve immediately.
    const isInitializer = resolvedRole === "initializer";
    const isSupervisor = resolvedRole === "supervisor";
    const isCheckerOrMaker =
        resolvedRole === "checker" ||
        resolvedRole === "maker" ||
        resolvedRole === "both" ||
        resolvedRole === null; // default: show checker/maker dashboard

    if (isInitializer) return <InitializerDashboard />;
    if (isSupervisor) return <SupervisorDashboard />;
    return <CheckerMakerDashboard />;
}

export default UnifiedDashboard;
