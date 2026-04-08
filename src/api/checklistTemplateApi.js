import axios from "axios";

const CHECKLIST_BASE = "https://konstruct.world/checklists";
const PROJECT_BASE = "https://konstruct.world/projects";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN") || ""}`,
});

export const getChecklistTemplates = (params = {}) =>
  axios.get(`${CHECKLIST_BASE}/checklist-templates/`, {
    params,
    headers: authHeaders(),
  });

export const getChecklistTemplateById = (id) =>
  axios.get(`${CHECKLIST_BASE}/checklist-templates/${id}/`, {
    headers: authHeaders(),
  });

export const createChecklistTemplate = (payload) =>
  axios.post(`${CHECKLIST_BASE}/checklist-templates/`, payload, {
    headers: authHeaders(),
  });

export const updateChecklistTemplateById = (id, payload) =>
  axios.put(`${CHECKLIST_BASE}/checklist-templates/${id}/`, payload, {
    headers: authHeaders(),
  });

export const deleteChecklistTemplateById = (id) =>
  axios.delete(`${CHECKLIST_BASE}/checklist-templates/${id}/`, {
    headers: authHeaders(),
  });

export const getChecklistTemplateInitializePreview = (id, params = {}) =>
  axios.get(`${CHECKLIST_BASE}/checklist-templates/${id}/initialize-preview/`, {
    params,
    headers: authHeaders(),
  });

export const initializeChecklistTemplate = (id, payload) =>
  axios.post(`${CHECKLIST_BASE}/checklist-templates/${id}/initialize/`, payload, {
    headers: authHeaders(),
  });

export const getRoomsByProject = (projectId) =>
  axios.get(`${PROJECT_BASE}/rooms/by_project/`, {
    params: { project_id: projectId },
    headers: authHeaders(),
  });