export const normalizeId = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const createEmptyOption = () => ({
  name: "",
  choice: "P",
});

export const createEmptyQuestion = (sequence = 1) => ({
  title: "",
  description: "",
  photo_required: false,
  sequence,
  options: [createEmptyOption()],
});

export const createEmptySection = (sequence = 1) => ({
  title: `Section ${sequence}`,
  description: "",
  sequence,
  questions: [createEmptyQuestion(1)],
});

export const buildTemplatePayload = (formData) => ({
  name: formData.name?.trim() || "",
  description: formData.description || "",
  project_id: normalizeId(formData.project_id),
  purpose_id: normalizeId(formData.purpose_id),
  phase_id: normalizeId(formData.phase_id),
  stage_id: normalizeId(formData.stage_id),
  category: normalizeId(formData.category),
  category_level1: normalizeId(formData.category_level1),
  category_level2: normalizeId(formData.category_level2),
  category_level3: normalizeId(formData.category_level3),
  category_level4: normalizeId(formData.category_level4),
  category_level5: normalizeId(formData.category_level5),
  category_level6: normalizeId(formData.category_level6),
  applicable_scope: formData.applicable_scope || null,
  question_target_type: formData.question_target_type || null,
  room_types: (formData.room_types || [])
    .map((item) => {
      if (typeof item === "object" && item?.room_type_id) {
        return { room_type_id: Number(item.room_type_id) };
      }
      const parsedId = Number(item);
      if (Number.isNaN(parsedId)) return null;
      return { room_type_id: parsedId };
    })
    .filter(Boolean),
  sections: (formData.sections || []).map((section, sectionIndex) => ({
    title: section.title?.trim() || `Section ${sectionIndex + 1}`,
    description: section.description || "",
    sequence: sectionIndex + 1,
    questions: (section.questions || []).map((question, questionIndex) => ({
      title: question.title?.trim() || "",
      description: question.description || "",
      photo_required: !!question.photo_required,
      sequence: questionIndex + 1,
      options: (question.options || []).map((option) => ({
        name: option.name?.trim() || "",
        choice: option.choice || "P",
      })),
    })),
  })),
});

export const mapTemplateResponseToForm = (data) => ({
  name: data?.name || "",
  description: data?.description || "",
  project_id: data?.project_id || "",
  purpose_id: data?.purpose_id || "",
  phase_id: data?.phase_id || "",
  stage_id: data?.stage_id || "",
  category: data?.category || "",
  category_level1: data?.category_level1 || "",
  category_level2: data?.category_level2 || "",
  category_level3: data?.category_level3 || "",
  category_level4: data?.category_level4 || "",
  category_level5: data?.category_level5 || "",
  category_level6: data?.category_level6 || "",
  applicable_scope: data?.applicable_scope || "",
  question_target_type: data?.question_target_type || "",

  // important for edit-mode mapping
  room_types: Array.isArray(data?.room_types)
    ? data.room_types
        .map((room) => {
          if (typeof room === "object" && room !== null) {
            return String(
              room.room_type_id ??
                room.room_id ??
                room.id ??
                ""
            );
          }
          return String(room);
        })
        .filter(Boolean)
    : [],

  selected_building_ids: Array.isArray(data?.selected_building_ids)
    ? data.selected_building_ids.map(String)
    : data?.building_id
      ? [String(data.building_id)]
      : [],

  selected_floor_ids: Array.isArray(data?.selected_floor_ids)
    ? data.selected_floor_ids.map(String)
    : data?.floor_id
      ? [String(data.floor_id)]
      : [],

  selected_unit_ids: Array.isArray(data?.selected_unit_ids)
    ? data.selected_unit_ids.map(String)
    : data?.unit_id
      ? [String(data.unit_id)]
      : [],

  // optional convenience fallbacks
  building_id:
    Array.isArray(data?.selected_building_ids) && data.selected_building_ids.length
      ? String(data.selected_building_ids[0])
      : data?.building_id
        ? String(data.building_id)
        : "",

  floor_id:
    Array.isArray(data?.selected_floor_ids) && data.selected_floor_ids.length
      ? String(data.selected_floor_ids[0])
      : data?.floor_id
        ? String(data.floor_id)
        : "",

  sections:
    data?.sections?.length > 0
      ? data.sections.map((section, sectionIndex) => ({
          id: section.id,
          title: section.title || `Section ${sectionIndex + 1}`,
          description: section.description || "",
          sequence: section.sequence || sectionIndex + 1,
          questions:
            section.questions?.length > 0
              ? section.questions.map((question, questionIndex) => ({
                  id: question.id,
                  title: question.title || "",
                  description: question.description || "",
                  photo_required: !!question.photo_required,
                  sequence: question.sequence || questionIndex + 1,
                  options:
                    question.options?.length > 0
                      ? question.options.map((option) => ({
                          id: option.id,
                          name: option.name || "",
                          choice: option.choice || "P",
                        }))
                      : [createEmptyOption()],
                }))
              : [createEmptyQuestion(1)],
        }))
      : [createEmptySection(1)],
});

export const validateTemplatePayload = (payload) => {
  if (!payload.name) return "Template name is required.";
  if (!payload.project_id) return "Project is required.";
  if (!payload.purpose_id) return "Purpose is required.";
  if (!payload.category) return "Category is required.";
  if (!payload.sections?.length) return "At least one section is required.";

  for (const section of payload.sections) {
    if (!section.questions?.length) {
      return "Each section must have at least one question.";
    }
    for (const question of section.questions) {
      if (!question.title) return "Each question must have a title.";
      if (!question.options?.length) {
        return "Each question must have at least one option.";
      }
      for (const option of question.options) {
        if (!option.name) return "Each option name is required.";
      }
    }
  }

  return null;
};

export const countTemplateQuestions = (template) =>
  (template.sections || []).reduce(
    (sum, section) => sum + (section.questions?.length || 0),
    0
  );