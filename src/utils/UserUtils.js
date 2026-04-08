// ─────────────────────────────────────────────
// Shared utilities for Safety Inspection Dashboards
// ─────────────────────────────────────────────

/**
* Returns the current user's ID from localStorage USER_DATA.
*/
export function getCurrentUserId() {
   try {
       const raw = localStorage.getItem("USER_DATA");
       if (!raw || raw === "undefined") return null;
       const user = JSON.parse(raw);
       return user?.id ?? user?.user_id ?? null;
   } catch {
       return null;
   }
}

/**
* Converts a File object to a base64 string (without the data-URL prefix).
*/
export function fileToBase64(file) {
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
* Resolve which dashboard to show based on the logged-in user's role.
*
* Priority:
*   1) SAFETY_INSPECTION_ROLE or FLOW_ROLE in localStorage
*   2) ROLE in localStorage
*   3) USER_DATA.role / USER_DATA.roles[0]
*   4) Derived from assigned checklists (checker / maker / both)
*
* Returns: "checker" | "maker" | "both" | "initializer" | "supervisor" | null
*/
export function getSafetyInspectionRole(checklists, userId) {
   const raw = (v) => (typeof v === "string" ? v : "").trim().toLowerCase();

   const CHECKER_ROLES = ["checker"];
   const MAKER_ROLES = ["maker"];
   const INITIALIZER_ROLES = ["initializer", "intializer"]; // handles backend typo "INTIALIZER"
   const SUPERVISOR_ROLES = ["supervisor"];

   // Substring-inclusive matching (e.g. "safety_initializer", "SAFETY-INSPECTION-CHECKER")
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
       } catch { /* ignore */ }
   }

   if (matchesRole(role, CHECKER_ROLES)) return "checker";
   if (matchesRole(role, MAKER_ROLES)) return "maker";
   if (matchesRole(role, INITIALIZER_ROLES)) return "initializer";
   if (matchesRole(role, SUPERVISOR_ROLES)) return "supervisor";

   // Fallback: derive from checklist assignment metadata
   if (checklists && userId != null) {
       const asChecker = checklists.filter(
           (c) =>
               Number(c.current_assignee_id) === Number(userId) &&
               (c.current_assignee_role || "").toUpperCase() === "CHECKER"
       );
       const asMaker = checklists.filter(
           (c) =>
               Number(c.current_assignee_id) === Number(userId) &&
               (c.current_assignee_role || "").toUpperCase() === "MAKER"
       );
       if (asChecker.length > 0 && asMaker.length === 0) return "checker";
       if (asMaker.length > 0 && asChecker.length === 0) return "maker";
       if (asChecker.length > 0 && asMaker.length > 0) return "both";
   }

   return null;
}  