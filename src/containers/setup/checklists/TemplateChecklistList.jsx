import React, { useMemo, useState } from "react";
import { countTemplateQuestions } from "./checklistFlowUtils";

const TemplateChecklistList = ({
  palette,
  templates = [],
  loading,
  onCreate,
  onEdit,
  onView,
  onInitialize,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return templates;

    return templates.filter((item) => {
      return (
        String(item.id).includes(q) ||
        (item.name || "").toLowerCase().includes(q) ||
        String(item.project_id || "").includes(q)
      );
    });
  }, [templates, searchQuery]);

  return (
    <div
      style={{
        overflow: "hidden",
        borderRadius: 16,
        border: `2px solid ${palette.border}`,
        boxShadow: palette.shadow,
        background: palette.card,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          padding: 20,
          borderBottom: `1px solid ${palette.border}`,
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              color: palette.text,
            }}
          >
            Checklist Templates
          </h2>
          <div style={{ color: palette.textSecondary, marginTop: 6 }}>
            Create and manage template-driven checklists.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: `2px solid ${palette.border}`,
              borderRadius: 12,
              background: palette.card,
              padding: "0 12px",
              minHeight: 48,
            }}
          >
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                color: palette.text,
                minWidth: 220,
              }}
            />
          </div>

          <button
            onClick={onCreate}
            style={{
              ...palette.primaryBtn,
              borderRadius: 12,
              padding: "12px 20px",
              cursor: "pointer",
            }}
          >
            Create Template
          </button>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            minHeight: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: palette.text,
          }}
        >
          Loading templates...
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div
          style={{
            minHeight: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 14,
            color: palette.text,
            background: palette.tableNoDataBg,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 22 }}>
            No templates found for this context.
          </div>
          <div style={{ color: palette.textSecondary }}>
            You can still create the first template from here.
          </div>
          <button
            onClick={onCreate}
            style={{
              ...palette.primaryBtn,
              borderRadius: 12,
              padding: "12px 20px",
              cursor: "pointer",
            }}
          >
            Create First Template
          </button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="w-full min-w-[1000px]">
            <thead
              style={{
                background: palette.tableHeadBg,
                color: palette.tableHeadText,
                borderBottom: `2px solid ${palette.border}`,
              }}
            >
              <tr>
                <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                  Template Name
                </th>
                <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                  Scope
                </th>
                <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                  Target Type
                </th>
                <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                  Questions
                </th>
                <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                  Version
                </th>
                <th className="font-bold p-4 text-center text-sm uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTemplates.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    background: palette.tableRowBg,
                    color: palette.text,
                    borderBottom: `1px solid ${palette.border}`,
                  }}
                >
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.applicable_scope || "-"}</td>
                  <td className="p-4">{item.question_target_type || "-"}</td>
                  <td className="p-4">{countTemplateQuestions(item)}</td>
                  <td className="p-4">{item.version || 1}</td>
                  <td className="p-4 text-center">
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => onView(item)}
                        style={{
                          ...palette.infoBtn,
                          borderRadius: 8,
                          padding: "8px 14px",
                          cursor: "pointer",
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        style={{
                          ...palette.successBtn,
                          borderRadius: 8,
                          padding: "8px 14px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onInitialize(item)}
                        style={{
                          ...palette.secondaryBtn,
                          borderRadius: 8,
                          padding: "8px 14px",
                          cursor: "pointer",
                        }}
                      >
                        Initialize
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        style={{
                          ...palette.dangerBtn,
                          borderRadius: 8,
                          padding: "8px 14px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TemplateChecklistList;
