/**
 * Parses permit-to-work Excel files and extracts checklist/question text.
 * Supports formats like BLASTING WORK PERMIT.xlsx (DMS-SAFETY style).
 * @param {ArrayBuffer} arrayBuffer - File content as ArrayBuffer (from FileReader).
 * @returns {{ questions: string[], errors: string[] }} Extracted question strings and any parse warnings.
 */
import * as XLSX from "xlsx";

const QUESTION_HEADER_PATTERNS = [
    /particulars?/i,
    /checklist/i,
    /question/i,
    /description/i,
    /item\s*\/?\s*description/i,
    /scope\s*of\s*work/i,
    /remarks?/i,
    /^sr\.?\s*no\.?$/i,
];

const MIN_QUESTION_LENGTH = 2;
const MAX_QUESTIONS = 500;

const FOOTER_START_PATTERNS = [
    /^note\b/i,
    /^notes\b/i,
    /^:-\s*/i,
    /^to be completed by/i,
    /^declaration\b/i,
    /^certif/i,             // Certification / Certificate
    /^this permit\b/i,
];

function isQuestionLike(value) {
    if (value == null) return false;
    const str = String(value).trim();
    if (str.length < MIN_QUESTION_LENGTH) return false;
    if (/^\d+$/.test(str)) return false;

    // NEW: skip the column header "Measure"
    if (/^measure$/i.test(str)) return false;

    return true;
}

function findQuestionColumnIndex(firstRow) {
    if (!Array.isArray(firstRow) || firstRow.length === 0) return 1;

    for (let col = 0; col < firstRow.length; col++) {
        const cell = firstRow[col];
        const label = cell != null ? String(cell).trim() : "";
        const matchesQuestion = QUESTION_HEADER_PATTERNS.some((re) => re.test(label));
        if (matchesQuestion) return col;
    }

    return 1;
}

export function parseQuestionsFromExcel(arrayBuffer) {
    const errors = [];
    const questions = [];
    const seen = new Set();
    let emptyRowsAfterQuestions = 0;

    try {
        const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
            return { questions: [], errors: ["No sheets found in the file."] };
        }

        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        if (!rows || rows.length === 0) {
            return { questions: [], errors: ["Sheet is empty."] };
        }

        const firstRow = rows[0];
        const questionColIndex = findQuestionColumnIndex(firstRow);

        for (let i = 1; i < rows.length; i++) {
            if (questions.length >= MAX_QUESTIONS) {
                errors.push(`Only first ${MAX_QUESTIONS} questions are imported.`);
                break;
            }

            const row = rows[i];
            const cell = Array.isArray(row) ? row[questionColIndex] : undefined;
            const text = cell != null ? String(cell).trim() : "";

            // 1) If we already captured questions and hit several empty rows, stop
            if (!text) {
                if (questions.length > 0) {
                    emptyRowsAfterQuestions += 1;
                    if (emptyRowsAfterQuestions >= 3) {
                        break;
                    }
                }
                // skip empty row
                continue;
            } else {
                emptyRowsAfterQuestions = 0;
            }

            // 2) If current cell looks like the start of footer / notes, stop
            if (FOOTER_START_PATTERNS.some((re) => re.test(text))) {
                break;
            }

            // 3) Normal question checks
            if (!isQuestionLike(text)) continue;

            const normalized = text.toLowerCase();
            if (seen.has(normalized)) continue;
            seen.add(normalized);

            questions.push(text);
        }

        if (questions.length === 0) {
            errors.push("No valid question rows found. Check that the sheet has a column like 'Particulars' or 'Checklist' with question text.");
        }
    } catch (e) {
        errors.push(e?.message || "Failed to read Excel file.");
    }

    return { questions, errors };
}
