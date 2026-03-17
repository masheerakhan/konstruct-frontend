import React, { useState, useEffect } from "react";
import {
    Clock,
    Eye,
    CheckCircle,
    CalendarDays,
    ClipboardCheck,
    Send,
    Wrench,
    CircleAlert,
    X,
    Check,
    XCircle,
    ArrowLeft,
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
            if (commaIndex >= 0) {
                resolve(result.slice(commaIndex + 1));
            } else {
                resolve(result);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Resolve safety inspection role: "checker" | "maker" | "both" | null.
 * Used to show only the relevant dashboard (checker sees Checker, maker sees Maker).
 * 1) SAFETY_INSPECTION_ROLE or FLOW_ROLE in localStorage (CHECKER/MAKER)
 * 2) ROLE in localStorage (checker/maker)
 * 3) USER_DATA.role or USER_DATA.roles
 * 4) Derive from assigned checklists (only checker → checker, only maker → maker, both → "both")
 * To force a single role for a user, set SAFETY_INSPECTION_ROLE to "CHECKER" or "MAKER" in localStorage.
 */
function getSafetyInspectionRole(checklists, userId) {
    const raw = (v) => (typeof v === "string" ? v : "").trim().toLowerCase();
    const isChecker = (r) => ["checker"].includes(raw(r));
    const isMaker = (r) => ["maker"].includes(raw(r));

    let role = raw(localStorage.getItem("SAFETY_INSPECTION_ROLE") || localStorage.getItem("FLOW_ROLE"));
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
    if (isChecker(role)) return "checker";
    if (isMaker(role)) return "maker";

    if (checklists && userId != null) {
        const asChecker = checklists.filter(
            (c) => Number(c.current_assignee_id) === Number(userId) && (c.current_assignee_role || "").toUpperCase() === "CHECKER"
        );
        const asMakerList = checklists.filter(
            (c) => Number(c.current_assignee_id) === Number(userId) && (c.current_assignee_role || "").toUpperCase() === "MAKER"
        );
        if (asChecker.length > 0 && asMakerList.length === 0) return "checker";
        if (asMakerList.length > 0 && asChecker.length === 0) return "maker";
        if (asChecker.length > 0 && asMakerList.length > 0) return "both";
    }

    return null;
}

function CheckerView() {
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
    const [verificationAnswers, setVerificationAnswers] = useState({}); // submissionId -> 'yes' | 'no' | 'na'
    const [checkerView, setCheckerView] = useState("dashboard"); // 'dashboard' | 'inspection' | 'verification'
    const [inspectionAnswers, setInspectionAnswers] = useState({}); // submissionId -> 'yes' | 'no'

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
            const msg = err?.response?.data?.detail || err?.message || "Failed to load checklists.";
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
    const asOther = assignedToMe.filter((c) => {
        const r = (c.current_assignee_role || "").toUpperCase();
        return r && r !== "CHECKER" && r !== "MAKER";
    });

    const checkerAssigned = asChecker.filter((c) => c.status === "in_progress");
    const checkerPending = asChecker.filter((c) => c.status === "in_progress");
    const checkerCompleted = asChecker.filter((c) => c.status === "completed");

    // Maker view:
    // - Pending: any checklist currently assigned to this Maker and not completed
    //   (includes first-time assignment with status "not_started" and ongoing "in_progress")
    // - Submitted: Maker worked on it but currently assignee is someone else (typically Checker) and status is in_progress
    // - Completed: status completed
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
    const showCheckerDashboard = safetyRole === null || safetyRole === "checker" || safetyRole === "both";
    const showMakerDashboard = safetyRole === null || safetyRole === "maker" || safetyRole === "both";

    const currentAssigneeRole =
        detail?.current_assignee_role ||
        detail?.workflow_assignments?.find(
            (a) => Number(a.user_id) === Number(detail?.current_assignee_id)
        )?.role;
    const isAssignedToMe =
        detail && userId != null && Number(detail.current_assignee_id) === Number(userId);
    const isChecker =
        isAssignedToMe && (currentAssigneeRole || "").toUpperCase() === "CHECKER";
    const isMaker =
        isAssignedToMe && (currentAssigneeRole || "").toUpperCase() === "MAKER";

    const openDetail = async (cl) => {
        setDetail(null);
        setDetailLoading(true);
        setSelectedRejectIds(new Set());
        setRejectRemarks("");
        setMakerRemarks({});
        try {
            const res = await getSafetyChecklist(cl.id);
            setDetail(res?.data || null);
        } catch (err) {
            showToast(err?.response?.data?.detail || "Failed to load checklist", "error");
        } finally {
            setDetailLoading(false);
        }
    };

    const openAssignedInspection = async (cl) => {
        setDetail(null);
        setDetailLoading(true);
        setInspectionAnswers({});
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
                if (
                    sub &&
                    (sub.maker_remarks || sub.maker_media || (sub.images || []).length)
                ) {
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
                            ["Pending for Maker", "rejected_by_checker", "created"].includes(
                                sub.status
                            )
                        ) || {};
                if (sub) {
                    initialRemarks[sub.id] = makerRemarks[sub.id] ?? "";
                }
            });
            setMakerRemarks(initialRemarks);
            setCheckerView("maker_fix");
        } catch (err) {
            showToast(err?.response?.data?.detail || "Failed to load checklist", "error");
        } finally {
            setDetailLoading(false);
        }
    };

    const backToDashboard = () => {
        setCheckerView("dashboard");
        setDetail(null);
        setInspectionAnswers({});
        setSelectedRejectIds(new Set());
        setRejectRemarks("");
        setVerificationAnswers({});
    };

    const closeDetail = () => {
        setDetail(null);
        setCheckerView("dashboard");
        fetchList();
    };

    const handleSubmit = async () => {
        if (!detail) return;
        setSubmitting(true);
        try {
            const submissions =
                (detail.items || [])
                    .map((item) => {
                        const sub = item.submissions?.[0];
                        if (!sub) return null;
                        const payload = {
                            submission_id: sub.id,
                            maker_remarks: makerRemarks[sub.id] ?? "",
                        };
                        const media = makerMedia[sub.id];
                        if (media) {
                            payload.maker_media_base64 = media;
                        }
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

        // Build payload for just this one submission
        const submissions = [];
        (detail.items || []).forEach((item) => {
            const sub = (item.submissions || []).find((s) => s.id === submissionId);
            if (!sub) return;
            const payload = {
                submission_id: sub.id,
                maker_remarks: makerRemarks[sub.id] ?? "",
            };
            const media = makerMedia[sub.id];
            if (media) {
                payload.maker_media_base64 = media;
            }
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
            backToDashboard();
            fetchList();
        } catch (err) {
            showToast(
                err?.response?.data?.detail || "Submit fix failed",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };


    const handleApprove = async () => {
        if (!detail) return;
        setSubmitting(true);
        try {
            await approveSafetyChecklist(detail.id);
            showToast("Approved", "success");
            closeDetail();
        } catch (err) {
            showToast(err?.response?.data?.detail || "Approve failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!detail || selectedRejectIds.size === 0) {
            showToast("Select at least one question to reject", "error");
            return;
        }
        setSubmitting(true);
        try {
            await rejectSafetyChecklist(detail.id, {
                submission_ids: Array.from(selectedRejectIds),
                remarks: rejectRemarks,
            });
            showToast("Rejected; sent back to Maker", "success");
            closeDetail();
        } catch (err) {
            showToast(err?.response?.data?.detail || "Reject failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleReject = (submissionId) => {
        setSelectedRejectIds((prev) => {
            const next = new Set(prev);
            if (next.has(submissionId)) next.delete(submissionId);
            else next.add(submissionId);
            return next;
        });
    };

    // const pendingCheckerItems =
    //     detail?.items
    //         ?.flatMap((item) => {
    //             const subs = item.submissions || [];
    //             return subs
    //                 .filter((s) => s.status === "pending_checker")
    //                 .map((sub) => ({ item, sub }));
    //         }) ?? [];


    const pendingCheckerItems =
        detail?.items
            ?.flatMap((item) => {
                const subs = item.submissions || [];
                return subs
                    // Only submissions that were previously touched by a checker
                    // (checker_id != null) and are now pending_checker again
                    .filter((s) => s.status === "pending_checker" && s.checker_id != null)
                    .map((sub) => ({ item, sub }));
            }) ?? [];


    const makerEditableItems =
        detail?.items
            ?.map((item) => {
                const subs = item.submissions || [];
                const sub = subs.find((s) =>
                    ["Pending for Maker", "rejected_by_checker", "created"].includes(
                        s.status
                    )
                );
                if (!sub) return null;
                return { item, sub };
            })
            .filter(Boolean) ?? [];

    const statusLabel = (s) => {
        if (!s) return "—";
        const v = String(s);
        if (v === "pending_checker") return "Pending verification";
        if (v === "Pending for Maker") return "Pending";
        if (v === "rejected_by_checker") return "Rejected";
        if (v === "completed") return "Completed";
        return v;
    };

    const handleInspectionAnswer = (submissionId, value) => {
        setInspectionAnswers((prev) => ({
            ...prev,
            [submissionId]: value,
        }));
    };

    const handleInspectionSubmit = async () => {
        if (!detail) return;
        const allSubs =
            (detail.items || [])
                .flatMap((item) => item.submissions || [])
                .filter(Boolean) || [];

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
                await rejectSafetyChecklist(detail.id, {
                    submission_ids: failIds,
                });
                showToast("Inspection submitted. Fix requests sent to Maker.", "success");
            } else {
                await approveSafetyChecklist(detail.id);
                showToast("Inspection approved successfully.", "success");
            }
            backToDashboard();
            fetchList();
        } catch (err) {
            showToast(
                err?.response?.data?.detail || "Submit inspection failed",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerificationAnswer = (submissionId, value) => {
        setVerificationAnswers((prev) => ({
            ...prev,
            [submissionId]: value,
        }));
    };

    const handleVerificationSubmit = async () => {
        if (!detail) return;

        const subs =
            (detail.items || [])
                .flatMap((item) => item.submissions || [])
                .filter(
                    (sub) =>
                        sub &&
                        sub.status === "pending_checker" &&
                        sub.checker_id != null
                ) || [];

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
                await rejectSafetyChecklist(detail.id, {
                    submission_ids: rejectIds,
                });
                showToast("Rejected fixes sent back to Maker.", "success");
            } else {
                // Approve all remaining pending_checker items (including 'yes' and 'na')
                await approveSafetyChecklist(detail.id);
                showToast("Verification approved successfully.", "success");
            }

            backToDashboard();
            fetchList();
        } catch (err) {
            showToast(
                err?.response?.data?.detail || "Verification submit failed",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

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
                        {/* ========== CHECKER: FULL INSPECTION VIEW (start inspection) ========== */}
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

                                {detailLoading && !detail.items && (
                                    <div className="py-8 text-center text-muted-foreground">
                                        Loading inspection…
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {(detail.items || []).map((item, idx) => {
                                        const subs = item.submissions || [];
                                        const sub = subs[subs.length - 1];
                                        if (!sub) return null;
                                        const val = inspectionAnswers[sub.id];
                                        const yesActive = val === "yes";
                                        const noActive = val === "no";
                                        return (
                                            <div
                                                key={item.id}
                                                className="rounded-lg border bg-card p-4"
                                            >
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
                                                        onClick={() =>
                                                            handleInspectionAnswer(sub.id, "yes")
                                                        }
                                                        className={`flex items-center justify-start rounded-md border px-3 py-2 text-sm font-medium transition-colors ${yesActive
                                                            ? "border-green-500 bg-green-500 text-white"
                                                            : "border-border bg-muted text-foreground hover:bg-muted/80"
                                                            }`}
                                                    >
                                                        Yes
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleInspectionAnswer(sub.id, "no")
                                                        }
                                                        className={`flex items-center justify-start rounded-md border px-3 py-2 text-sm font-medium transition-colors ${noActive
                                                            ? "border-red-500 bg-red-500 text-white"
                                                            : "border-border bg-muted text-foreground hover:bg-muted/80"
                                                            }`}
                                                    >
                                                        No
                                                    </button>
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

                        {/* ========== CHECKER: PENDING VERIFICATION VIEW (fixes from Maker) ========== */}
                        {showCheckerDashboard &&
                            checkerView === "verification" &&
                            detail && (
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
                                                const yesActive = val === "yes";
                                                const noActive = val === "no";
                                                const naActive = val === "na";
                                                return (
                                                    <div
                                                        key={sub.id}
                                                        className="rounded-lg bg-muted/60 p-4"
                                                    >
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
                                                        {(sub.images && sub.images.length > 0) ||
                                                            sub.maker_media ? (
                                                            <p className="mb-2 text-xs font-medium text-foreground">
                                                                Photo attached
                                                            </p>
                                                        ) : null}
                                                        <div className="mt-2 flex flex-col gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleVerificationAnswer(
                                                                        sub.id,
                                                                        "yes"
                                                                    )
                                                                }
                                                                className={`flex items-center justify-start rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${yesActive
                                                                    ? "border-green-500 bg-green-500 text-white"
                                                                    : "border-border bg-white text-foreground hover:bg-muted"
                                                                    }`}
                                                            >
                                                                Yes
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleVerificationAnswer(
                                                                        sub.id,
                                                                        "no"
                                                                    )
                                                                }
                                                                className={`flex items-center justify-start rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${noActive
                                                                    ? "border-red-500 bg-red-500 text-white"
                                                                    : "border-border bg-white text-foreground hover:bg-muted"
                                                                    }`}
                                                            >
                                                                No
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleVerificationAnswer(
                                                                        sub.id,
                                                                        "na"
                                                                    )
                                                                }
                                                                className={`flex items-center justify-start rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${naActive
                                                                    ? "border-slate-500 bg-slate-500 text-white"
                                                                    : "border-border bg-white text-foreground hover:bg-muted"
                                                                    }`}
                                                            >
                                                                N/A
                                                            </button>
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

                        {/* ========== MAKER: FIX VIEW (questions + remarks + optional photo) ========== */}
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
                                        {makerEditableItems.map(({ item, sub }, idx) => {
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="rounded-lg border bg-card p-4"
                                                >
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-sm font-medium text-foreground sm:text-base">
                                                            {item.title}
                                                        </span>
                                                    </div>
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
                                                                    const file =
                                                                        e.target.files?.[0];
                                                                    if (!file) return;
                                                                    try {
                                                                        const base64 =
                                                                            await fileToBase64(
                                                                                file
                                                                            );
                                                                        setMakerMedia(
                                                                            (prev) => ({
                                                                                ...prev,
                                                                                [sub.id]:
                                                                                    base64,
                                                                            })
                                                                        );
                                                                    } catch {
                                                                        showToast(
                                                                            "Failed to read image file",
                                                                            "error"
                                                                        );
                                                                    }
                                                                }}
                                                                className="block w-full text-xs text-muted-foreground"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
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

                        {/* ========== DASHBOARDS ========== */}
                        {checkerView === "dashboard" && (
                            <>
                                {/* ========== CHECKER DASHBOARD — only for checker role ========== */}
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
                                            <div className="rounded-lg border bg-card p-4">
                                                <div className="mb-1 flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" style={{ color: "hsl(35, 90%, 50%)" }} />
                                                    <span className="text-xs font-medium" style={{ color: "hsl(35, 90%, 50%)" }}>Assigned</span>
                                                </div>
                                                <p className="text-2xl font-bold text-foreground">{checkerAssigned.length}</p>
                                            </div>
                                            <div className="rounded-lg border bg-card p-4">
                                                <div className="mb-1 flex items-center gap-1.5">
                                                    <Eye className="h-3.5 w-3.5" style={{ color: "hsl(280, 70%, 50%)" }} />
                                                    <span className="text-xs font-medium" style={{ color: "hsl(280, 70%, 50%)" }}>Pending</span>
                                                </div>
                                                <p className="text-2xl font-bold text-foreground">{checkerPending.length}</p>
                                            </div>
                                            <div className="rounded-lg border bg-card p-4">
                                                <div className="mb-1 flex items-center gap-1.5">
                                                    <CheckCircle className="h-3.5 w-3.5" style={{ color: "hsl(145, 65%, 42%)" }} />
                                                    <span className="text-xs font-medium" style={{ color: "hsl(145, 65%, 42%)" }}>Completed</span>
                                                </div>
                                                <p className="text-2xl font-bold text-foreground">{checkerCompleted.length}</p>
                                            </div>
                                            <div className="rounded-lg border bg-card p-4">
                                                <div className="mb-1 flex items-center gap-1.5">
                                                    <CalendarDays className="h-3.5 w-3.5" style={{ color: "hsl(220, 70%, 50%)" }} />
                                                    <span className="text-xs font-medium" style={{ color: "hsl(220, 70%, 50%)" }}>Total</span>
                                                </div>
                                                <p className="text-2xl font-bold text-foreground">{asChecker.length}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-sm font-semibold text-foreground sm:text-base">Assigned Inspections</h2>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{checkerAssigned.length}</span>
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
                                                                <p className="font-medium text-foreground">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.created_at
                                                                        ? new Date(
                                                                            item.created_at
                                                                        ).toLocaleDateString()
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

                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-sm font-semibold text-foreground sm:text-base">Pending Verification</h2>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{checkerPending.length}</span>
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
                                                                <p className="font-medium text-foreground">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.created_at
                                                                        ? new Date(
                                                                            item.created_at
                                                                        ).toLocaleDateString()
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openPendingVerification(item)
                                                                }
                                                                className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                                                            >
                                                                Review Fixes
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-sm font-semibold text-foreground sm:text-base">Completed Inspections</h2>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{checkerCompleted.length}</span>
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
                                                                <p className="font-medium text-foreground">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.created_at
                                                                        ? new Date(
                                                                            item.created_at
                                                                        ).toLocaleDateString()
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-0.5 text-xs font-medium text-green-600">
                                                                    approved
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* ========== MAKER DASHBOARD — only for maker role ========== */}
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
                                            <div className="rounded-lg border bg-card p-4">
                                                <div className="mb-1 flex items-center gap-1.5">
                                                    <CircleAlert className="h-3.5 w-3.5 text-red-500" />
                                                    <span className="text-xs font-medium text-red-600">Pending</span>
                                                </div>
                                                <p className="text-2xl font-bold text-foreground">{makerPending.length}</p>
                                            </div>
                                            <div className="rounded-lg border bg-card p-4">
                                                <div className="mb-1 flex items-center gap-1.5">
                                                    <Send className="h-3.5 w-3.5 text-red-500" />
                                                    <span className="text-xs font-medium text-red-600">Submitted</span>
                                                </div>
                                                <p className="text-2xl font-bold text-foreground">{makerSubmitted.length}</p>
                                            </div>
                                            <div className="rounded-lg border bg-card p-4">
                                                <div className="mb-1 flex items-center gap-1.5">
                                                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                                    <span className="text-xs font-medium text-green-600">Done</span>
                                                </div>
                                                <p className="text-2xl font-bold text-foreground">{makerCompleted.length}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-sm font-semibold text-foreground sm:text-base">Pending Fix Requests</h2>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{makerPending.length}</span>
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
                                                                <p className="font-medium text-foreground">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.created_at
                                                                        ? new Date(
                                                                            item.created_at
                                                                        ).toLocaleDateString()
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

                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Send className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-sm font-semibold text-foreground sm:text-base">Fix Submitted</h2>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{makerSubmitted.length}</span>
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
                                                                <p className="font-medium text-foreground">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.created_at
                                                                        ? new Date(
                                                                            item.created_at
                                                                        ).toLocaleDateString()
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-sm font-semibold text-foreground sm:text-base">Completed</h2>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{makerCompleted.length}</span>
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
                                                                <p className="font-medium text-foreground">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.created_at
                                                                        ? new Date(
                                                                            item.created_at
                                                                        ).toLocaleDateString()
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-0.5 text-xs font-medium text-green-600">
                                                                    Completed
                                                                </span>
                                                            </div>
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

            {/* Detail modal removed for checker/maker flows; all views are inline. */}
        </div>
    );
}

export default CheckerView;
