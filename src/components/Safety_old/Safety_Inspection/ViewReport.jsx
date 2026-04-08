import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { downloadSafetyReport } from "../../../api"; // or downloadSafetyReport
import { showToast } from "../../../utils/toast";

const ViewReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        const loadPdf = async () => {
            try {
                setLoading(true);
                const res = await downloadSafetyReport(id); // or downloadSafetyReport(id)
                if (!alive) return;

                const blob = res?.data;
                if (!blob) {
                    showToast("Empty PDF response", "error");
                    setLoading(false);
                    return;
                }
                const url = window.URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch (err) {
                const msg =
                    err?.response?.data?.detail ||
                    err?.message ||
                    "Failed to load report.";
                showToast(msg, "error");
            } finally {
                if (alive) setLoading(false);
            }
        };

        loadPdf();
        return () => {
            alive = false;
            if (pdfUrl) {
                window.URL.revokeObjectURL(pdfUrl);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleBack = () => {
        // go back to list; use exact path you use for list view
        navigate("/safetyInspections");
    };

    return (
        <div className="min-h-screen bg-content-bg p-4 sm:p-6">
            <div className="mx-auto max-w-6xl bg-card rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col h-[calc(100vh-2rem)]">
                {/* Header with Back */}
                <div className="mb-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                    <h1 className="text-sm sm:text-base font-semibold text-foreground">
                        Safety Inspection Report #{id}
                    </h1>
                    <div />
                </div>

                {/* Content */}
                <div className="flex-1 rounded-lg border border-border bg-background overflow-hidden">
                    {loading && (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Loading report…
                        </div>
                    )}
                    {!loading && !pdfUrl && (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Report not available.
                        </div>
                    )}
                    {!loading && pdfUrl && (
                        <iframe
                            title={`Safety report ${id}`}
                            src={pdfUrl}
                            className="w-full h-full"
                            style={{ border: "none" }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewReport;