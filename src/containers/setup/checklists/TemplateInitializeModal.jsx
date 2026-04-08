import React, { useEffect, useMemo, useState } from "react";
import {
  getChecklistTemplateInitializePreview,
  initializeChecklistTemplate,
} from "../../../api/checklistTemplateApi";
import { allinfobuildingtoflat } from "../../../api";
import { showToast } from "../../../utils/toast";

const TemplateInitializeModal = ({
  palette,
  template,
  isOpen,
  onClose,
  onInitialized,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  const [buildingTree, setBuildingTree] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [units, setUnits] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!isOpen || !template?.id) return;

    const loadAll = async () => {
      setLoading(true);
      try {
        const [previewRes, buildingRes] = await Promise.all([
          getChecklistTemplateInitializePreview(template.id, {
            project_id: template.project_id,
            purpose_id: template.purpose_id,
            phase_id: template.phase_id,
            stage_id: template.stage_id,
          }),
          allinfobuildingtoflat(template.project_id),
        ]);

        const previewData = previewRes?.data || {};
        setPreview(previewData);

        const questionIds = [];
        (previewData.sections || []).forEach((section) => {
          (section.questions || []).forEach((question) => {
            if (question.id) questionIds.push(question.id);
          });
        });
        setSelectedQuestionIds(questionIds);

        const rawTree =
          buildingRes?.data?.buildings ||
          buildingRes?.data?.results ||
          buildingRes?.data ||
          [];
        setBuildingTree(Array.isArray(rawTree) ? rawTree : []);
        setBuildings(Array.isArray(rawTree) ? rawTree : []);
      } catch (error) {
        showToast("Failed to load template initialization data.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [isOpen, template?.id, template?.project_id]);

  const selectedQuestionCount = useMemo(
    () => selectedQuestionIds.length,
    [selectedQuestionIds],
  );

  const handleBuildingChange = (value) => {
    setSelectedBuilding(value);
    setSelectedFloor("");
    setSelectedUnit("");
    setSelectedRoom("");
    setUnits([]);
    setRooms([]);

    const building = buildingTree.find(
      (item) => String(item.id) === String(value),
    );
    const levelList = building?.levels || building?.floors || [];
    setFloors(levelList);
  };

  const handleFloorChange = (value) => {
    setSelectedFloor(value);
    setSelectedUnit("");
    setSelectedRoom("");
    setRooms([]);

    const floor = floors.find((item) => String(item.id) === String(value));
    const flatList = floor?.flats || floor?.units || [];
    setUnits(flatList);
  };

  const handleUnitChange = (value) => {
    setSelectedUnit(value);
    setSelectedRoom("");

    const unit = units.find((item) => String(item.id) === String(value));
    const roomList = unit?.rooms || [];
    setRooms(roomList);
  };

  const toggleQuestion = (questionId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId],
    );
  };

  const handleSubmit = async () => {
    if (!template?.id) return;
    if (!selectedQuestionIds.length) {
      showToast("Select at least one question.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await initializeChecklistTemplate(template.id, {
        project_id: template.project_id,
        purpose_id: template.purpose_id,
        phase_id: template.phase_id,
        stage_id: template.stage_id,
        building_id: selectedBuilding || null,
        level_id: selectedFloor || null,
        flat_id: selectedUnit || null,
        room_id: selectedRoom || null,
        remarks: remarks || "",
        selected_question_ids: selectedQuestionIds,
      });

      showToast("Checklist initialized successfully.", "success");
      onInitialized?.(response?.data);
      onClose?.();
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to initialize checklist.";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !template) return null;

  const selectStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    background: palette.card,
    color: palette.text,
    border: `2px solid ${palette.border}`,
    fontWeight: 500,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: palette.card,
          borderRadius: 18,
          padding: 24,
          maxWidth: 1100,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: palette.shadow,
          border: `2px solid ${palette.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                color: palette.text,
              }}
            >
              Initialize Template
            </h3>
            <div style={{ color: palette.textSecondary, marginTop: 6 }}>
              {template.name}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              ...palette.dangerBtn,
              borderRadius: 10,
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        {loading ? (
          <div
            style={{
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: palette.text,
            }}
          >
            Loading initialization preview...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: palette.text,
                  }}
                >
                  Building
                </label>
                <select
                  style={selectStyle}
                  value={selectedBuilding}
                  onChange={(e) => handleBuildingChange(e.target.value)}
                >
                  <option value="">Select Building</option>
                  {buildings.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.building_name || `Building ${item.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: palette.text,
                  }}
                >
                  Floor
                </label>
                <select
                  style={selectStyle}
                  value={selectedFloor}
                  onChange={(e) => handleFloorChange(e.target.value)}
                >
                  <option value="">Select Floor</option>
                  {floors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.level_name || `Floor ${item.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: palette.text,
                  }}
                >
                  Unit
                </label>
                <select
                  style={selectStyle}
                  value={selectedUnit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                >
                  <option value="">Select Unit</option>
                  {units.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.flat_name || `Unit ${item.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: palette.text,
                  }}
                >
                  Room
                </label>
                <select
                  style={selectStyle}
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  <option value="">Select Room</option>
                  {rooms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.room_name || `Room ${item.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: palette.text,
                }}
              >
                Remarks
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 12,
                  background: palette.card,
                  color: palette.text,
                  border: `2px solid ${palette.border}`,
                }}
                placeholder="Enter remarks"
              />
            </div>

            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                border: `2px solid ${palette.border}`,
                color: palette.text,
                fontWeight: 700,
              }}
            >
              Selected Questions: {selectedQuestionCount}
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {(preview?.sections || []).map((section, sectionIndex) => (
                <div
                  key={section.id || sectionIndex}
                  style={{
                    border: `2px solid ${palette.border}`,
                    borderRadius: 14,
                    padding: 16,
                    background: palette.tableRowBg,
                  }}
                >
                  <div
                    style={{
                      color: palette.text,
                      fontWeight: 800,
                      fontSize: 20,
                    }}
                  >
                    {section.title}
                  </div>

                  <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                    {(section.questions || []).map(
                      (question, questionIndex) => {
                        const checked = selectedQuestionIds.includes(
                          question.id,
                        );
                        return (
                          <label
                            key={question.id || questionIndex}
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "start",
                              border: `1px solid ${palette.border}`,
                              borderRadius: 12,
                              padding: 14,
                              background: palette.card,
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleQuestion(question.id)}
                              style={{ marginTop: 4 }}
                            />
                            <div>
                              <div
                                style={{ color: palette.text, fontWeight: 700 }}
                              >
                                {question.title}
                              </div>
                              <div
                                style={{
                                  color: palette.textSecondary,
                                  marginTop: 6,
                                }}
                              >
                                {(question.options || [])
                                  .map((option) => option.name)
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            </div>
                          </label>
                        );
                      },
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "end",
                gap: 12,
                marginTop: 18,
              }}
            >
              <button
                onClick={onClose}
                style={{
                  ...palette.secondaryBtn,
                  borderRadius: 10,
                  padding: "10px 18px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  ...palette.primaryBtn,
                  borderRadius: 10,
                  padding: "10px 18px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Initializing..." : "Initialize Checklist"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TemplateInitializeModal;