import React, { useState, useRef } from "react";
import {
    ShieldCheck,
    MapPin,
    User,
    FileText,
    Upload,
    Plus,
    Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { parseQuestionsFromExcel } from "./utils/parsePermitExcel";
import { useNavigate } from "react-router-dom";

// Permit types and their visible fields (from docs/fields.txt)
const PERMIT_TYPES = [
    "Blasting Work",
    "Confined Space Work",
    "Electrical Work",
    "Excavation Work",
    "General Work",
    "Height Work",
    "Hot Work",
    "Lifting permit",
    "Night work",
    "Open manhole cutout",
];

const PERMIT_TYPE_FIELDS = {
    "Blasting Work": ["applicant", "contractor", "typeAndScope", "validity", "dateAndtime", "desiredDateTime", "expiryDateTime", "remarks"],
    "Confined Space Work": ["applicant", "contractor", "typeAndScope", "location", "validity", "dateAndtime", "desiredDateTime", "expiryDateTime", "remarks"],
    "Electrical Work": ["applicant", "contractor", "typeAndScope", "location", "validity", "dateAndtime", "desiredDateTime", "expiryDateTime", "remarks"],
    "Excavation Work": ["applicant", "contractor", "typeAndScope", "equipments", "validity", "dateAndtime", "desiredDateTime", "expiryDateTime", "noWorkmens", "remarks"],
    "General Work": ["applicant", "contractor", "typeAndScope", "location", "validity", "dateAndtime", "desiredDateTime", "expiryDateTime", "remarks"],
    "Height Work": ["applicant", "contractor", "typeAndScope", "location", "validity", "dateAndtime", "desiredDateTime", "expiryDateTime", "remarks"],
    "Hot Work": ["applicant", "contractor", "typeAndScope", "location", "validity", "dateAndtime", "desiredDateTime", "expiryDateTime", "remarks"],
    "Lifting permit": ["applicant", "contractor", "typeAndScope", "location", "equipments", "validity", "dateAndtime", "desiredDateTime", "expiryDateTime", "workers", "remarks"],
    "Night work": ["applicant", "contractor", "typeAndScope", "validity", "dateAndtime", "desiredDateTime", "expiryDateTime", "location", "noWorkmens", "remarks"],
    "Open manhole cutout": ["applicant", "contractor", "typeAndScope", "location", "validity", "dateAndtime", "desiredDateTime", "expiryDateTime", "activity", "activityDate", "activityStartTime", "activityEndTime", "remarks"],
};

const MAX_BULK_UPLOAD_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_BULK_UPLOAD_TYPES = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
];
const DEFAULT_QUESTION_OPTIONS = [
    { value: "Yes", submission: "P" },
    { value: "No", submission: "N" },
    { value: "N/A", submission: "NA" },
];

function PermitToWork() {
    const navigate = useNavigate();
    // FORM STATE

    const [form, setForm] = useState({
        type: "",
        contractor: "",
        location: "",
        typeAndScope: "",
        dateAndtime: "",
        validity: "",
        desiredDateTime: "",
        expiryDateTime: "",
        equipments: [],
        noWorkmens: "",
        workers: [
            { name: "", designation: "" }
        ],
        workerId: "",
        activity: "",
        activityDate: "",
        activityStartTime: "",
        activityEndTime: "",
        extension: "",
        applicant: "",
        authority: "",
        remarks: "",
    });

    // STATES
    const [questions, setQuestions] = useState([]);
    const [errors, setErrors] = useState({});
    const [questionCount, setQuestionCount] = useState(1);
    const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
    const bulkUploadInputRef = useRef(null);

    const showField = (fieldName) => {
        if (!form.type) return false;
        return PERMIT_TYPE_FIELDS[form.type]?.includes(fieldName) ?? false;
    };

    // VALIDATOR HANDLER
    const validateForm = () => {
        const newErrors = {};

        // fiels validation
        if (!form.type) newErrors.type = "Permit type is required";
        if (!form.applicant) newErrors.applicant = "Applicant is required";
        if (!form.contractor) newErrors.contractor = "contractor is required";


        // fields visiual management
        if (showField("location") && !form.location) newErrors.location = "Location is required";
        if (showField("dateAndtime") && !form.dateAndtime) newErrors.dateAndtime = "Start date required";

        if (
            showField("activityStartTime") &&
            form.activityStartTime &&
            form.activityEndTime &&
            form.activityEndTime <= form.activityStartTime
        ) {
            newErrors.activityEndTime = "End time must be after start time";
        }

        if (showField("workers")) {
            form.workers.forEach((w, i) => {
                if (!w.name) newErrors[`worker_${i}`] = "Worker name required";
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // HANDLERS 

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    /* Bulk Upload Handler */
    const handleBulkUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const name = (file.name || "").toLowerCase();
        const isExcel =
            name.endsWith(".xlsx") ||
            name.endsWith(".xls") ||
            ALLOWED_BULK_UPLOAD_TYPES.includes(file.type);
        if (!isExcel) {
            toast.error("Please upload an Excel file (.xlsx or .xls).");
            e.target.value = "";
            return;
        }

        if (file.size > MAX_BULK_UPLOAD_FILE_SIZE_BYTES) {
            toast.error("File is too large. Maximum size is 5MB.");
            e.target.value = "";
            return;
        }

        setBulkUploadLoading(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const arrayBuffer = event.target?.result;
                if (!arrayBuffer || !(arrayBuffer instanceof ArrayBuffer)) {
                    toast.error("Could not read file.");
                    return;
                }
                const { questions: extracted, errors: parseErrors } =
                    parseQuestionsFromExcel(arrayBuffer);

                if (parseErrors.length > 0) {
                    parseErrors.forEach((msg) => toast.error(msg));
                }
                if (extracted.length === 0) {
                    setBulkUploadLoading(false);
                    if (bulkUploadInputRef.current) bulkUploadInputRef.current.value = "";
                    return;
                }

                const newQuestions = extracted.map((question) => ({
                    question: question.trim(),
                    photo_required: false,
                    options: [...DEFAULT_QUESTION_OPTIONS],
                }));
                // Log questions + options as JSON in console
                console.log(
                    "Bulk-uploaded safety checklist:",
                    JSON.stringify(newQuestions, null, 2)
                );
                setQuestions((prev) => [...prev, ...newQuestions]);
                toast.success(`${newQuestions.length} question(s) added from Excel.`);
            } catch (err) {
                toast.error(err?.message || "Failed to process Excel file.");
            } finally {
                setBulkUploadLoading(false);
                if (bulkUploadInputRef.current) bulkUploadInputRef.current.value = "";
            }
        };

        reader.onerror = () => {
            toast.error("Failed to read file.");
            setBulkUploadLoading(false);
            if (bulkUploadInputRef.current) bulkUploadInputRef.current.value = "";
        };

        reader.readAsArrayBuffer(file);
    };



    // QUESTION HANDLER
    const handleAddQuestion = () => {
        const count = Number(questionCount) || 1;

        const newQuestions = Array.from({ length: count }, () => ({
            question: "",
            photo_required: false,
            options: [
                { value: "Yes", submission: "P" },
                { value: "No", submission: "N" },
                { value: "N/A", submission: "NA" },
            ],
        }));

        setQuestions((prev) => [...prev, ...newQuestions]);
    };

    const handleRemoveQuestion = (index) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleQuestionOptionAdd = (qIdx) => {
        setQuestions((prev) => {
            const updated = [...prev];
            updated[qIdx].options.push({ value: "", submission: "P" });
            return updated;
        });
    };

    const handleQuestionOptionChange = (qIdx, field, value, optIdx) => {
        setQuestions((prev) => {
            const updated = [...prev];
            updated[qIdx].options[optIdx][field] = value;
            return updated;
        });
    };

    const handlePhotoRequiredChange = (qIdx, checked) => {
        setQuestions((prev) => {
            const updated = [...prev];
            updated[qIdx].photo_required = checked;
            return updated;
        });
    };

    const handleRemoveOption = (qIdx, optIdx) => {
        setQuestions((prev) => {
            const updated = [...prev];
            updated[qIdx].options.splice(optIdx, 1);
            return updated;
        });
    };

    // WORKER HANDLERS
    const handleWorkerChange = (index, field, value) => {
        const updated = [...form.workers];
        updated[index][field] = value;
        setForm({ ...form, workers: updated });
    };

    const addWorker = () => {
        setForm({
            ...form,
            workers: [...form.workers, { name: "", designation: "" }]
        });
    };

    const removeWorker = (index) => {
        if (form.workers.length === 1) return; // prevent removing last row

        const updated = form.workers.filter((_, i) => i !== index);
        setForm({ ...form, workers: updated });
    };

    // EQUIPMENTS WORKER
    const handleEquipmentAdd = (value) => {
        if (!form.equipments.includes(value)) {
            setForm({ ...form, equipments: [...form.equipments, value] });
        }
    };

    const removeEquipment = (value) => {
        setForm({
            ...form,
            equipments: form.equipments.filter((e) => e !== value),
        });
    };


    const handleSubmit = () => {
        if (!validateForm()) return;

        const checklistName = `Permit to work ${form.type}`;

        const payload = {
            source: "PERMIT_TO_WORK",
            permitType: form.type,
            checklistName,
            // raw permit form data
            permitForm: { ...form },
            // questions in the exact shape ChecklistForm already uses
            questions: questions.map((q) => ({
                question: q.question?.trim() || "",
                photo_required: !!q.photo_required,
                options: (q.options || []).map((opt) => ({
                    value: opt.value?.trim() || "",
                    submission: opt.submission || "P",
                })),
            })),
        };

        // Optional: log once for debugging
        console.log("Navigating to Checklist with payload:", payload);

        navigate("/Checklist", {
            state: {
                fromPermitToWork: true,
                payload,
            },
        });
    };



    return (
        <div className="p-6 lg:p-10 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-xl bg-orange-500 text-white">
                        <ShieldCheck />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Permit To Work</h1>
                        <p className="text-gray-500 text-sm">
                            Complete this form to request work authorization
                        </p>
                    </div>
                </div>

                {/* Permit Type + Applicant */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="font-semibold">Permit Type</label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-2"
                        >
                            <option value="" disabled>Select type</option>
                            {PERMIT_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        {errors.type && (
                            <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                        )}
                    </div>

                    <div>
                        <label className="font-semibold">Permit Applicant</label>
                        <div className="flex items-center border rounded-lg mt-2 px-3">
                            <User size={18} className="text-gray-400" />
                            <input
                                type="text"
                                name="applicant"
                                value={form.applicant}
                                onChange={handleChange}
                                className="w-full p-2 outline-none"
                                placeholder="Permit applicant name"
                            />
                        </div>
                        {errors.applicant && (
                            <p className="text-red-500 text-sm mt-1">{errors.applicant}</p>
                        )}
                    </div>
                </div>

                {/* Contractor + Scope */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="font-semibold">Contractor</label>
                        <input
                            name="contractor"
                            value={form.contractor}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-2"
                        />

                        {errors.contractor && (
                            <p className="text-red-500 text-sm mt-1">{errors.contractor}</p>
                        )}
                    </div>


                    <div>
                        <label className="font-semibold">Type & Scope Of Work</label>
                        <input
                            name="typeAndScope"
                            value={form.typeAndScope}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-2"
                        />
                    </div>
                </div>

                {/* Location */}
                {showField("location") && (
                    <div className="mb-6">
                        <label className="font-semibold">Location</label>
                        <div className="flex items-center border rounded-lg mt-2 px-3">
                            <MapPin size={18} className="text-gray-400" />
                            <input
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                className="w-full p-2 outline-none"
                            />
                        </div>
                    </div>)}

                {showField("noWorkmens") && (
                    <div className="mb-6">
                        <label className="font-semibold">Number of workmens</label>
                        <input
                            type="number"
                            name="noWorkmens"
                            value={form.noWorkmens}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-2"
                        />
                    </div>
                )}

                {/* Date Section */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="font-semibold">Start Date & Time</label>
                        <input
                            type="datetime-local"
                            name="dateAndtime"
                            value={form.dateAndtime}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-2"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">Work Validity Date</label>
                        <input
                            type="date"
                            name="validity"
                            value={form.validity}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-2"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">Expiry Date & Time</label>
                        <input
                            type="datetime-local"
                            name="expiryDateTime"
                            value={form.expiryDateTime}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-2"
                        />
                    </div>
                </div>

                {/* Worker Details */}
                {showField("workers") && (
                    <div className="mb-6">
                        <label className="font-semibold">Workers</label>

                        {form.workers.map((worker, index) => (
                            <div key={index} className="grid md:grid-cols-3 gap-4 mt-3">
                                <input
                                    value={worker.name}
                                    onChange={(e) =>
                                        handleWorkerChange(index, "name", e.target.value)
                                    }
                                    placeholder="Worker Name"
                                    className="border rounded-lg p-2"
                                />

                                <input
                                    value={worker.designation}
                                    onChange={(e) =>
                                        handleWorkerChange(index, "designation", e.target.value)
                                    }
                                    placeholder="Designation"
                                    className="border rounded-lg p-2"
                                />

                                <button
                                    type="button"
                                    onClick={() => removeWorker(index)}
                                    disabled={form.workers.length === 1}
                                    className={`rounded-lg px-3 text-white ${form.workers.length === 1
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-red-500"
                                        }`}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addWorker}
                            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg"
                        >
                            Add Worker
                        </button>
                    </div>)}

                {/* Activity */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {showField("activity") && (
                        <div>
                            <label className="font-semibold">Activity</label>
                            <input
                                name="activity"
                                value={form.activity}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2 mt-2"
                            />
                        </div>)}

                    {showField("activityDate") && (
                        <div>
                            <label className="font-semibold">Activity Date</label>
                            <input
                                type="date"
                                name="activityDate"
                                value={form.activityDate}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2 mt-2"
                            />
                        </div>)}

                    {showField("equipments") && (
                        <div>
                            <label className="font-semibold">Equipments Used</label>

                            <select
                                onChange={(e) => handleEquipmentAdd(e.target.value)}
                                className="w-full border rounded-lg p-2 mt-2"
                            >
                                <option value="">Select Equipment</option>
                                <option value="Drill Machine">Drill Machine</option>
                                <option value="Welding Machine">Welding Machine</option>
                                <option value="Ladder">Ladder</option>
                                <option value="Generator">Generator</option>
                            </select>

                            <div className="flex flex-wrap gap-2 mt-3">
                                {form.equipments.map((eq, i) => (
                                    <div
                                        key={i}
                                        className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center gap-2"
                                    >
                                        {eq}
                                        <button
                                            onClick={() => removeEquipment(eq)}
                                            className="text-red-500"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>)}
                </div>
                {(showField("activityStartTime") || showField("activityEndTime")) && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="font-semibold">From Time</label>
                            <input
                                type="time"
                                name="activityStartTime"
                                value={form.activityStartTime}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2 mt-2"
                            />
                        </div>

                        <div>
                            <label className="font-semibold">To Time</label>
                            <input
                                type="time"
                                name="activityEndTime"
                                value={form.activityEndTime}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2 mt-2"
                            />
                        </div>
                    </div>)}

                {/* Safety Checklist */}
                <div className="flex items-center justify-between mt-8 mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <FileText size={18} /> Safety Checklist
                    </h2>

                    <div className="flex gap-3 items-center">

                        {/* Bulk Upload */}
                        <div className="relative">
                            <input
                                ref={bulkUploadInputRef}
                                type="file"
                                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                onChange={handleBulkUpload}
                                disabled={bulkUploadLoading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <button
                                type="button"
                                disabled={bulkUploadLoading}
                                className="px-4 py-2 rounded-xl bg-orange-500 text-white flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {bulkUploadLoading ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} /> Bulk Upload
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Question Count Input */}
                        <input
                            type="number"
                            min="1"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(e.target.value)}
                            className="w-24 border rounded-xl p-2 text-center"
                            placeholder="No."
                        />

                        {/* Add Question */}
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="px-4 py-2 rounded-xl bg-orange-500 text-white flex items-center gap-2"
                        >
                            <Plus size={18} /> Add Question
                        </button>
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    {questions.map((q, qIdx) => (
                        <div
                            key={qIdx}
                            className="p-6 rounded-xl border bg-gray-50"
                        >
                            <div className="flex justify-between mb-4">
                                <h3 className="font-bold">Question {qIdx + 1}</h3>

                                <button
                                    onClick={() => handleRemoveQuestion(qIdx)}
                                    className="px-3 py-1 rounded text-red-500"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <textarea
                                value={q.question}
                                onChange={(e) => {
                                    setQuestions((prev) => {
                                        const updated = [...prev];
                                        updated[qIdx].question = e.target.value;
                                        return updated;
                                    });
                                }}
                                className="w-full border rounded-lg p-2 mb-3"
                            />

                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    checked={!!q.photo_required}
                                    onChange={(e) =>
                                        handlePhotoRequiredChange(qIdx, e.target.checked)
                                    }
                                />
                                <span className="text-sm text-gray-700">
                                    Photo required
                                </span>
                            </div>

                            <div className="space-y-2">
                                {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex gap-2">
                                        <input
                                            value={opt.value}
                                            onChange={(e) =>
                                                handleQuestionOptionChange(
                                                    qIdx,
                                                    "value",
                                                    e.target.value,
                                                    optIdx
                                                )
                                            }
                                            className="border rounded-lg p-2 flex-1"
                                        />

                                        <select
                                            value={opt.submission}
                                            onChange={(e) =>
                                                handleQuestionOptionChange(
                                                    qIdx,
                                                    "submission",
                                                    e.target.value,
                                                    optIdx
                                                )
                                            }
                                            className="border rounded-lg p-2"
                                        >
                                            <option value="P">Pass</option>
                                            <option value="N">Fail</option>
                                            <option value="NA">N/A</option>
                                        </select>

                                        <button
                                            onClick={() => handleRemoveOption(qIdx, optIdx)}
                                            className="px-2 bg-red-400 text-white rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={() => handleQuestionOptionAdd(qIdx)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded"
                                >
                                    Add Option
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Remarks */}
                <div className="mt-8">
                    <textarea
                        name="remarks"
                        value={form.remarks}
                        onChange={handleChange}
                        rows={4}
                        className="w-full border rounded-lg p-3"
                        placeholder="Remarks"
                    />
                </div>



                {/* Footer */}
                <div className="flex justify-end gap-4 mt-8">
                    <button className="px-6 py-2 border rounded-lg">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg"
                    >
                        Submit Permit
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PermitToWork;
