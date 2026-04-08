import React from "react";

const getOptionLabel = (item) => {
  if (!item) return "-";
  return (
    item.name ||
    item.label ||
    item.title ||
    item.number ||
    item.unit_number ||
    item.floor_number ||
    item.building_name ||
    item.tower_name ||
    item.room_name ||
    `ID ${item.id}`
  );
};

const getSingleLabelById = (options = [], id) => {
  if (!id) return "-";
  const match = options.find((item) => Number(item.id) === Number(id));
  return match ? getOptionLabel(match) : id;
};

const getMultiLabelsByIds = (options = [], ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const idSet = new Set(ids.map(Number));

  return options
    .filter((item) => idSet.has(Number(item.id)))
    .map((item) => getOptionLabel(item));
};

const TemplateChecklistDetails = ({
  palette,
  template,
  onBack,
  onEdit,
  onInitialize,
  projectOptions = [],
  purposeOptions = [],
  phaseOptions = [],
  stageOptions = [],
  categoryOptions = [],
  buildingOptions = [],
  floorOptions = [],
  unitOptions = [],
  roomOptions = [],
}) => {
  if (!template) return null;

  const roomTypeIds = Array.isArray(template.room_types)
    ? template.room_types
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            return Number(item.room_type_id ?? item.room_id ?? item.id);
          }
          return Number(item);
        })
        .filter((value) => !Number.isNaN(value))
    : [];

  const projectName = getSingleLabelById(projectOptions, template.project_id);
  const purposeName = getSingleLabelById(purposeOptions, template.purpose_id);
  const phaseName = getSingleLabelById(phaseOptions, template.phase_id);
  const stageName = getSingleLabelById(stageOptions, template.stage_id);
  const categoryName = getSingleLabelById(categoryOptions, template.category);

  const selectedBuildings = getMultiLabelsByIds(
    buildingOptions,
    template.selected_building_ids || []
  );

  const selectedFloors = getMultiLabelsByIds(
    floorOptions,
    template.selected_floor_ids || []
  );

  const selectedUnits = getMultiLabelsByIds(
    unitOptions,
    template.selected_unit_ids || []
  );

  const selectedRooms = getMultiLabelsByIds(roomOptions, roomTypeIds);

  const renderChipList = (items = [], emptyText = "-") => {
    if (!items.length) {
      return (
        <div style={{ color: palette.textSecondary, marginTop: 8 }}>
          {emptyText}
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 10,
        }}
      >
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 13,
              background: palette.badge,
              color: palette.badgeText,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        borderRadius: 16,
        border: `2px solid ${palette.border}`,
        boxShadow: palette.shadow,
        background: palette.card,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "start",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: palette.text,
            }}
          >
            {template.name}
          </h2>
          <div style={{ color: palette.textSecondary, marginTop: 8 }}>
            {template.description || "No description provided."}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={onBack}
            style={{
              ...palette.secondaryBtn,
              borderRadius: 10,
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Back
          </button>
          <button
            onClick={() => onEdit(template)}
            style={{
              ...palette.successBtn,
              borderRadius: 10,
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Edit Template
          </button>
          <button
            onClick={() => onInitialize(template)}
            style={{
              ...palette.primaryBtn,
              borderRadius: 10,
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Initialize
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          ["Project", projectName],
          ["Purpose", purposeName],
          ["Phase", phaseName || "-"],
          ["Stage", stageName || "-"],
          ["Category", categoryName || "-"],
          ["Version", template.version || 1],
          ["Scope", template.applicable_scope || "-"],
          ["Target Type", template.question_target_type || "-"],
          ["Room Types Count", roomTypeIds.length || 0],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              border: `2px solid ${palette.border}`,
              borderRadius: 12,
              padding: 16,
              color: palette.text,
              background: palette.tableRowBg,
            }}
          >
            <div style={{ fontSize: 13, color: palette.textSecondary }}>
              {label}
            </div>
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            border: `2px solid ${palette.border}`,
            borderRadius: 14,
            padding: 18,
            background: palette.tableRowBg,
          }}
        >
          <div style={{ color: palette.text, fontWeight: 800, fontSize: 18 }}>
            Selected Buildings / Towers
          </div>
          {renderChipList(selectedBuildings, "No buildings selected")}
        </div>

        <div
          style={{
            border: `2px solid ${palette.border}`,
            borderRadius: 14,
            padding: 18,
            background: palette.tableRowBg,
          }}
        >
          <div style={{ color: palette.text, fontWeight: 800, fontSize: 18 }}>
            Selected Floors
          </div>
          {renderChipList(selectedFloors, "No floors selected")}
        </div>

        <div
          style={{
            border: `2px solid ${palette.border}`,
            borderRadius: 14,
            padding: 18,
            background: palette.tableRowBg,
          }}
        >
          <div style={{ color: palette.text, fontWeight: 800, fontSize: 18 }}>
            Selected Units
          </div>
          {renderChipList(selectedUnits, "No units selected")}
        </div>

        <div
          style={{
            border: `2px solid ${palette.border}`,
            borderRadius: 14,
            padding: 18,
            background: palette.tableRowBg,
          }}
        >
          <div style={{ color: palette.text, fontWeight: 800, fontSize: 18 }}>
            Selected Room Types
          </div>
          {renderChipList(selectedRooms, "No room types selected")}
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {(template.sections || []).map((section, sectionIndex) => (
          <div
            key={section.id || sectionIndex}
            style={{
              border: `2px solid ${palette.border}`,
              borderRadius: 14,
              padding: 18,
              background: palette.tableRowBg,
            }}
          >
            <div style={{ color: palette.text, fontWeight: 800, fontSize: 20 }}>
              {section.sequence || sectionIndex + 1}. {section.title}
            </div>

            {section.description ? (
              <div style={{ color: palette.textSecondary, marginTop: 6 }}>
                {section.description}
              </div>
            ) : null}

            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              {(section.questions || []).map((question, questionIndex) => (
                <div
                  key={question.id || questionIndex}
                  style={{
                    border: `1px solid ${palette.border}`,
                    borderRadius: 12,
                    padding: 16,
                    background: palette.card,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ color: palette.text, fontWeight: 700 }}>
                        {question.sequence || questionIndex + 1}.{" "}
                        {question.title}
                      </div>
                    </div>
                    <div style={{ color: palette.textSecondary }}>
                      Photo Required: {question.photo_required ? "Yes" : "No"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 14,
                    }}
                  >
                    {(question.options || []).map((option, optionIndex) => (
                      <span
                        key={option.id || optionIndex}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          fontWeight: 700,
                          fontSize: 13,
                          background:
                            option.choice === "P" ? "#dcfce7" : "#fee2e2",
                          color: option.choice === "P" ? "#166534" : "#991b1b",
                        }}
                      >
                        {option.name} ({option.choice})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateChecklistDetails;