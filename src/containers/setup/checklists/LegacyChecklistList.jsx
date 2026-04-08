import React, { useEffect, useMemo, useState } from "react";
import { getMyChecklists } from "../../../api";
import { showToast } from "../../../utils/toast";
import { countTemplateQuestions } from "./checklistFlowUtils";

const LegacyChecklistList = ({
  palette,
  context,
  setShowForm,
  setDetailForm,
  setSelectedChecklist,
}) => {
  const [loading, setLoading] = useState(true);
  const [checklists, setChecklists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLegacyChecklists = async () => {
    setLoading(true);
    try {
      const params = {
        project_id: context.project_id || undefined,
        purpose_id: context.purpose_id || undefined,
        phase_id: context.phase_id || undefined,
        stage_id: context.stage_id || undefined,
        category: context.category || undefined,
      };
      const response = await getMyChecklists(params);
      const data = response?.data?.results || response?.data || [];
      setChecklists(Array.isArray(data) ? data : []);
    } catch (error) {
      setChecklists([]);
      showToast("Failed to fetch legacy checklists.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegacyChecklists();
  }, [
    context.project_id,
    context.purpose_id,
    context.phase_id,
    context.stage_id,
    context.category,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, checklists]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return checklists;

    return checklists.filter((item) => {
      return (
        String(item.id).includes(q) ||
        (item.name || "").toLowerCase().includes(q) ||
        (item.project_name || "").toLowerCase().includes(q) ||
        (item.purpose_name || "").toLowerCase().includes(q) ||
        (item.stage_name || "").toLowerCase().includes(q) ||
        (item.status || "").toLowerCase().includes(q)
      );
    });
  }, [checklists, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const DOTS = (
      <span style={{ color: palette.border, fontWeight: 700 }}>…</span>
    );

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            style={{
              padding: "0.45rem 1rem",
              margin: "0 0.22rem",
              borderRadius: 10,
              background: i === currentPage ? palette.badge : "transparent",
              color: i === currentPage ? palette.badgeText : palette.text,
              border:
                i === currentPage ? `2px solid ${palette.border}` : "none",
              fontWeight: i === currentPage ? 700 : 500,
              fontSize: 15,
              cursor: i === currentPage ? "default" : "pointer",
            }}
            disabled={i === currentPage}
          >
            {i}
          </button>,
        );
      } else if (
        (i === 2 && currentPage > 3) ||
        (i === totalPages - 1 && currentPage < totalPages - 2)
      ) {
        pages.push(<span key={i}>{DOTS}</span>);
      }
    }

    return pages;
  };

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
            Legacy Checklists
          </h2>
          <div style={{ color: palette.textSecondary, marginTop: 6 }}>
            Existing live checklist flow remains editable here.
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
              placeholder="Search legacy checklists..."
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
            onClick={() => {
              setSelectedChecklist(null);
              setShowForm(true);
            }}
            style={{
              ...palette.primaryBtn,
              borderRadius: 12,
              padding: "12px 20px",
              cursor: "pointer",
            }}
          >
            Create Legacy Checklist
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
          Loading legacy checklists...
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="w-full min-w-[900px]">
              <thead
                style={{
                  background: palette.tableHeadBg,
                  color: palette.tableHeadText,
                  borderBottom: `2px solid ${palette.border}`,
                }}
              >
                <tr>
                  <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                    Checklist Name
                  </th>
                  <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                    Project
                  </th>
                  <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                    Status
                  </th>
                  <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="font-bold p-4 text-center text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        background: palette.tableRowBg,
                        color: palette.text,
                        borderBottom: `1px solid ${palette.border}`,
                      }}
                    >
                      <td className="p-4">
                        {item.name || `Checklist ${item.id}`}
                      </td>
                      <td className="p-4">
                        {item.project_name || item.project_id || "-"}
                      </td>
                      <td className="p-4">
                        {item.purpose_name || item.purpose_id || "-"}
                      </td>
                      <td className="p-4">
                        {item.stage_name || item.stage_id || "-"}
                      </td>
                      <td className="p-4">{item.status || "-"}</td>
                      <td className="p-4">
                        {item.items?.length ||
                          countTemplateQuestions(item) ||
                          0}
                      </td>
                      <td className="p-4 text-center">
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() => {
                              setSelectedChecklist(item);
                              setDetailForm(true);
                            }}
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
                            onClick={() => {
                              setSelectedChecklist(item);
                              setShowForm(true);
                            }}
                            style={{
                              ...palette.successBtn,
                              borderRadius: 8,
                              padding: "8px 14px",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16"
                      style={{
                        color: palette.text,
                        background: palette.tableNoDataBg,
                        fontWeight: 600,
                        fontSize: 20,
                      }}
                    >
                      No legacy checklists found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            className="mt-8 flex justify-center"
            style={{ paddingBottom: 20 }}
          >
            {renderPagination()}
          </div>
        </>
      )}
    </div>
  );
};

export default LegacyChecklistList;
