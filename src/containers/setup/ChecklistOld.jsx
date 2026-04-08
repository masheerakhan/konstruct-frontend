import { useState, useEffect } from "react";
import ChecklistForm from "./ChecklistForm";
import Checklistdetails from "./ChecklistDetails";
import {
  getProjectsByOwnership,
  getProjectUserDetails,
  Allprojects,
  getMyChecklists,
  deleteChecklistById,
} from "../../api";
import { showToast } from "../../utils/toast";
import { useTheme } from "../../ThemeContext";
import { useSidebar } from "../../components/SidebarContext";

// Palette setup
const ORANGE = "#ffbe63";
const BG_OFFWHITE = "#fcfaf7";
const SIDEBAR_WIDTH = 0;

const getPalette = (theme) => ({
  bg: theme === "dark" ? "#191922" : BG_OFFWHITE,
  card: theme === "dark" ? "#23232c" : "#fff",
  border: ORANGE,
  text: theme === "dark" ? "#fff" : "#222",
  textSecondary: theme === "dark" ? "#ffbe63b3" : "#b54b13b3",
  badge: ORANGE,
  badgeText: theme === "dark" ? "#23232c" : "#fff",
  shadow:
    theme === "dark"
      ? "0 4px 24px 0 rgba(255, 190, 99, 0.18)"
      : "0 4px 24px 0 rgba(255,190,99,0.12)",
  primaryBtn: {
    background: ORANGE,
    color: "#23232c",
    border: `2px solid ${ORANGE}`,
    fontWeight: 600,
  },
  secondaryBtn: {
    background: "#fff",
    color: "#b54b13",
    border: `2px solid ${ORANGE}`,
    fontWeight: 600,
  },
  dangerBtn: {
    background: "#ef4444",
    color: "#fff",
    border: `2px solid #ef4444`,
    fontWeight: 600,
  },
  successBtn: {
    background: "#10b981",
    color: "#fff",
    border: `2px solid #10b981`,
    fontWeight: 600,
  },
  infoBtn: {
    background: "#2563eb",
    color: "#fff",
    border: `2px solid #2563eb`,
    fontWeight: 600,
  },
  tableHeadBg: theme === "dark" ? "#191919" : "#fff7ea",
  tableHeadText: theme === "dark" ? "#ffbe63" : "#b54b13",
  tableRowBg: theme === "dark" ? "#23232c" : "#fff",
  icon: ORANGE,
  tableNoDataBg: theme === "dark" ? "#23232c" : "#fff7ea",
});

const Checklist = () => {
  const { theme } = useTheme();
  const palette = getPalette(theme);
  const { sidebarOpen } = useSidebar();

  // State
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [checklistData, setChecklistData] = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detailForm, setDetailForm] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  const [, setShowUserSelection] = useState(false);
  const [, setUserAccessProjectId] = useState(null);
  const [, setUserAccessCategoryId] = useState(null);
  const [, setCurrentChecklistId] = useState(null);
  const [, setRefreshTrigger] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick preview state
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const [previewChecklist, setPreviewChecklist] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sidebar movement
  const contentMarginLeft = sidebarOpen ? SIDEBAR_WIDTH : 0;

  // Filtering by project
  const byProject = selectedProjectId
    ? checklistData.filter(
        (item) => String(item.project_id) === String(selectedProjectId)
      )
    : checklistData;

  // Filtering by search query (name or ID)
  const filteredChecklistData = searchQuery.trim()
    ? byProject.filter((item) => {
        const q = searchQuery.trim().toLowerCase();
        return (
          (item.name && item.name.toLowerCase().includes(q)) ||
          String(item.id).includes(q)
        );
      })
    : byProject;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredChecklistData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredChecklistData.length / itemsPerPage);

  // Fetch user and project
  useEffect(() => {
    const role = localStorage.getItem("ROLE");
    const userString = localStorage.getItem("USER_DATA");
    const userData =
      userString && userString !== "undefined" ? JSON.parse(userString) : null;
    setUserData(userData);

    if (!userData) {
      setProjects([]);
      return;
    }

    const fetchProjects = async () => {
      try {
        let response = null;
        if (role === "Super Admin") {
          response = await Allprojects();
        } else if (role === "Admin") {
          response = await getProjectUserDetails();
        } else {
          const entity_id = userData.entity_id || null;
          const company_id = userData.company_id || null;
          const organization_id =
            userData.org || userData.organization_id || null;
          if (!entity_id && !company_id && !organization_id) {
            setProjects([]);
            return;
          }
          response = await getProjectsByOwnership({
            entity_id,
            company_id,
            organization_id,
          });
        }
        if (response && response.status === 200) {
          setProjects(response.data.projects || []);
        } else {
          setProjects([]);
          showToast("Failed to fetch projects.", "error");
        }
      } catch (err) {
        setProjects([]);
        showToast("Failed to fetch projects.", "error");
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setChecklistLoading(true);
      const fetchMyChecklists = async () => {
        try {
          const response = await getMyChecklists();
          if (response.status === 200) {
            setChecklistData(response.data || []);
          } else {
            setChecklistData([]);
            showToast("Failed to fetch your checklists.", "error");
          }
        } catch (err) {
          setChecklistData([]);
          showToast("Failed to fetch your checklists.", "error");
        } finally {
          setChecklistLoading(false);
        }
      };
      fetchMyChecklists();
    } else {
      setChecklistLoading(false);
    }
  }, [selectedProjectId]);

  const handleChecklistCreated = (newChecklist) => {
    if (
      newChecklist.project_id &&
      newChecklist.category_id &&
      newChecklist.id
    ) {
      setUserAccessProjectId(newChecklist.project_id);
      setUserAccessCategoryId(newChecklist.category_id);
      setCurrentChecklistId(newChecklist.id);
      setShowUserSelection(true);
      setRefreshTrigger((prev) => prev + 1);
      showToast(
        "Checklist created! Assign users to this checklist.",
        "success"
      );
    }
    setShowForm(false);
    setIsButtonDisabled(false);
  };

  const hideUserSelection = () => {
    setShowUserSelection(false);
    setUserAccessProjectId(null);
    setUserAccessCategoryId(null);
    setCurrentChecklistId(null);
  };

  const handleQuickPreview = (checklist) => {
    setPreviewChecklist(checklist);
    setShowQuickPreview(true);
  };

  const handleDeleteClick = (checklist) => {
    setChecklistToDelete(checklist);
    setShowDeleteConfirm(true);
  };
  const handleDeleteConfirm = async () => {
    if (!checklistToDelete) return;
    setIsDeleting(true);
    try {
      await deleteChecklistById(checklistToDelete.id);
      setChecklistData((prev) =>
        prev.filter((item) => item.id !== checklistToDelete.id)
      );
      showToast(
        `Checklist "${checklistToDelete.name}" deleted successfully!`,
        "success"
      );
      setShowDeleteConfirm(false);
      setChecklistToDelete(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete checklist";
      showToast(errorMessage, "error");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setChecklistToDelete(null);
  };

  // Pagination (palette only)
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const arr = [];
    const DOTS = (
      <span style={{ color: palette.border, fontWeight: 700 }}>…</span>
    );
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        arr.push(
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
              boxShadow: i === currentPage ? palette.shadow : "none",
              cursor: i === currentPage ? "default" : "pointer",
              transition: "background .18s,border .18s",
            }}
            disabled={i === currentPage}
          >
            {i}
          </button>
        );
      } else if (
        (i === 2 && currentPage > 3) ||
        (i === totalPages - 1 && currentPage < totalPages - 2)
      ) {
        arr.push(<span key={i}>{DOTS}</span>);
      }
    }
    return arr;
  };

  if (!userData)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: palette.bg }}
      >
        <div className="flex items-center space-x-4">
          <div
            className="animate-spin rounded-full h-8 w-8"
            style={{ borderBottom: `2px solid ${palette.border}` }}
          ></div>
          <span className="text-lg font-medium" style={{ color: palette.text }}>
            Loading...
          </span>
        </div>
      </div>
    );

  if (showForm) {
    return (
      <ChecklistForm
        setShowForm={setShowForm}
        checklist={selectedChecklist}
        projectOptions={projects}
        onChecklistCreated={handleChecklistCreated}
      />
    );
  } else if (detailForm && selectedChecklist) {
    return (
      <Checklistdetails
        setShowForm={setShowForm}
        setDetailForm={setDetailForm}
        checklist={selectedChecklist}
        projectId={selectedProjectId}
      />
    );
  }

  return (
    <div
      style={{
        background: palette.bg,
        minHeight: "100vh",
        marginLeft: contentMarginLeft,
        transition: "margin-left 0.35s cubic-bezier(.6,-0.17,.22,1.08)",
        padding: 16,
      }}
    >
      <div
        className="max-w-7xl mx-auto p-4 lg:p-8 rounded-2xl"
        style={{
          background: palette.card,
          border: `2px solid ${palette.border}`,
          boxShadow: palette.shadow,
        }}
      >
        {/* Header */}
        <div className="mb-8 flex items-center">
          <div
            className="p-3 rounded-xl flex items-center justify-center"
            style={{ background: palette.badge, color: palette.badgeText }}
          >
            <svg
              width="28"
              height="28"
              fill="none"
              stroke={palette.icon}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <rect width="24" height="24" rx="6" fill={palette.badge}></rect>
              <path d="M9 5H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2 2h2a2 2 0 0 1 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div className="ml-4">
            <h1 className="text-3xl font-bold" style={{ color: palette.text }}>
              Checklist Management
            </h1>
            <p
              className="text-lg mt-1"
              style={{ color: palette.textSecondary }}
            >
              Create, manage, and assign checklists to your team
            </p>
          </div>
        </div>

        {/* Controls - 3 equal columns, no block logic */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Project Dropdown */}
          <div className="flex flex-col justify-end">
            <label
              className="block text-lg font-semibold mb-3 flex items-center"
              style={{ color: palette.text }}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke={palette.icon}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v12" />
              </svg>
              <span className="ml-2">Select Project</span>
            </label>
            <select
              className="w-full p-4 rounded-xl font-medium"
              style={{
                background: palette.card,
                color: palette.text,
                border: `2px solid ${palette.border}`,
                fontWeight: 500,
              }}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col justify-end">
            <div
              className="flex items-center rounded-xl px-3"
              style={{
                background: palette.card,
                border: `2px solid ${palette.border}`,
                boxShadow: "0 1px 4px rgba(60,60,60,0.08)",
                width: "100%",
                maxWidth: "100%",
                minHeight: 56,
              }}
            >
              <svg
                width="19"
                height="19"
                fill="none"
                stroke={palette.icon}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: 8 }}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="flex-1 py-2 px-1 bg-transparent outline-none text-base"
                style={{
                  color: palette.text,
                  background: "none",
                  border: "none",
                }}
                placeholder="Search checklists…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Always reset to page 1 on search
                }}
              />
            </div>
          </div>

          {/* Create Checklist Button */}
          <div className="flex flex-col justify-end">
            <button
              disabled={isButtonDisabled}
              className="px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center"
              style={{
                ...palette.primaryBtn,
                opacity: isButtonDisabled ? 0.5 : 1,
                cursor: isButtonDisabled ? "not-allowed" : "pointer",
                transition: "all .18s",
                minWidth: "100%", // take full width of column
                minHeight: 56,
              }}
              onClick={() => {
                // Removed block logic, only opens the form
                setSelectedChecklist(null);
                setShowForm(true);
                hideUserSelection();
              }}
            >
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="#23232c"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                className="mr-2"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Checklist</span>
            </button>
          </div>
        </div>
        {/* ...rest of your file, unchanged... */}
        {/* Show UserSelectionTable after create */}
        {/* {showUserSelection &&
          userAccessProjectId &&
          userAccessCategoryId &&
          currentChecklistId && (
            <div className="mb-8">
              <div
                style={{
                  border: "2px solid #10b981",
                  borderRadius: 16,
                  background: "#e7fbe7",
                  marginBottom: 16,
                  padding: 18,
                  fontWeight: 600,
                  color: "#065f46",
                }}
              >
                Checklist created! Assign users to this checklist below.
                <button
                  onClick={hideUserSelection}
                  style={{
                    float: "right",
                    background: palette.dangerBtn.background,
                    color: palette.dangerBtn.color,
                    border: palette.dangerBtn.border,
                    borderRadius: 8,
                    padding: "4px 14px",
                    marginLeft: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
              <UserSelectionTable
                projectId={userAccessProjectId}
                categoryId={userAccessCategoryId}
                checklistId={currentChecklistId}
                refreshTrigger={refreshTrigger}
                onSendUsers={() => showToast("Users assigned!", "success")}
              />
            </div>
          )} */}

        {/* Table */}
        <div
          className="overflow-hidden rounded-xl border-2"
          style={{
            borderColor: palette.border,
            boxShadow: palette.shadow,
            background: palette.card,
            marginBottom: 16,
          }}
        >
          {checklistLoading ? (
            <div
              className="flex items-center justify-center py-24"
              style={{ minHeight: 280 }}
            >
              <div className="flex items-center space-x-4">
                <div
                  className="animate-spin rounded-full h-10 w-10"
                  style={{
                    borderWidth: 3,
                    borderStyle: "solid",
                    borderColor: `${palette.border}33`,
                    borderTopColor: palette.border,
                  }}
                />
                <span
                  className="text-lg font-medium"
                  style={{ color: palette.text }}
                >
                  Loading checklists...
                </span>
              </div>
            </div>
          ) : (
          <div className="overflow-x-auto min-w-full">
            <table className="w-full min-w-[800px]">
              <thead
                style={{
                  background: palette.tableHeadBg,
                  color: palette.tableHeadText,
                  borderBottom: `2px solid ${palette.border}`,
                }}
              >
                <tr>
                  {/* <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                    ID
                  </th> */}
                  <th className="font-bold p-4 text-left text-sm uppercase tracking-wider">
                    Checklist Name
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
                        transition: "background .12s",
                      }}
                    >
                      {/* <td className="p-4 font-semibold">
                        <div
                          style={{
                            background: palette.badge,
                            color: palette.badgeText,
                            borderRadius: 8,
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                          }}
                        >
                          {item.id}
                        </div>
                      </td> */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-lg">
                            {item.name || `Checklist ${item.id}`}
                          </span>
                          {/* <span
                            style={{
                              color: palette.textSecondary,
                              fontSize: 14,
                            }}
                          >
                            Created • ID: {item.id}
                          </span> */}
                        </div>
                      </td>
                      <td className="p-4">
                        <div
                          style={{
                            background: palette.badge,
                            color: palette.badgeText,
                            borderRadius: 12,
                            padding: "2px 16px",
                            fontWeight: 600,
                            fontSize: 14,
                            display: "inline-block",
                          }}
                        >
                          {item.items?.length || 0} Questions
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          style={{
                            color: "#222",
                            border: "#222",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontWeight: 600,
                            cursor: "pointer",
                            marginRight: 8,
                          }}
                          onClick={() => handleQuickPreview(item)}
                        >
                          <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke={palette.icon}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ marginRight: 6 }}
                            viewBox="0 0 24 24"
                          >
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-16"
                      style={{
                        color: palette.text,
                        background: palette.tableNoDataBg,
                        fontWeight: 600,
                        fontSize: 20,
                      }}
                    >
                      {searchQuery.trim()
                        ? "No checklists available for your search."
                        : "No checklists found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">{renderPagination()}</div>
      </div>

      {/* Quick Preview Modal */}
      {showQuickPreview && previewChecklist && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
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
              padding: 32,
              maxWidth: 520,
              width: "100%",
              boxShadow: palette.shadow,
              border: `2px solid ${palette.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    background: palette.infoBtn.background,
                    color: palette.infoBtn.color,
                    borderRadius: 12,
                    padding: 8,
                    marginRight: 8,
                  }}
                >
                  <svg
                    width={26}
                    height={26}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <circle cx={12} cy={12} r={10} />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3
                  style={{ fontSize: 22, fontWeight: 700, color: palette.text }}
                >
                  Quick Preview
                </h3>
              </div>
              <button
                onClick={() => setShowQuickPreview(false)}
                style={{
                  background: palette.dangerBtn.background,
                  color: palette.dangerBtn.color,
                  border: palette.dangerBtn.border,
                  borderRadius: 8,
                  padding: 6,
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: "pointer",
                }}
              >
                X
              </button>
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: palette.text,
                  marginBottom: 8,
                }}
              >
                {previewChecklist.name || `Checklist ${previewChecklist.id}`}
              </div>
              <div
                style={{
                  color: palette.textSecondary,
                  fontSize: 15,
                  marginBottom: 18,
                }}
              >
                ID: {previewChecklist.id} •{" "}
                {previewChecklist.items?.length || 0} Questions
              </div>
              <button
                onClick={() => {
                  setShowQuickPreview(false);
                  setSelectedChecklist(previewChecklist);
                  setDetailForm(true);
                }}
                style={{
                  ...palette.infoBtn,
                  borderRadius: 10,
                  padding: "12px 28px",
                  marginRight: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                View Details
              </button>
              <button
                onClick={() => {
                  setShowQuickPreview(false);
                  setSelectedChecklist(previewChecklist);
                  setShowForm(true);
                }}
                style={{
                  ...palette.successBtn,
                  borderRadius: 10,
                  padding: "12px 28px",
                  marginRight: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Edit Checklist
              </button>
              <button
                onClick={() => {
                  setShowQuickPreview(false);
                  handleDeleteClick(previewChecklist);
                }}
                style={{
                  ...palette.dangerBtn,
                  borderRadius: 10,
                  padding: "12px 28px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
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
              padding: 32,
              maxWidth: 420,
              width: "100%",
              boxShadow: palette.shadow,
              border: `2px solid ${palette.border}`,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div
                style={{
                  background: "#fffbe8",
                  borderRadius: "50%",
                  width: 66,
                  height: 66,
                  margin: "0 auto 18px auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width={34}
                  height={34}
                  fill="none"
                  stroke="#b54b13"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: palette.text,
                  marginBottom: 10,
                }}
              >
                Confirm Deletion
              </h3>
              <div
                style={{
                  color: palette.textSecondary,
                  fontSize: 16,
                  marginBottom: 18,
                }}
              >
                Are you sure you want to permanently delete this checklist?
              </div>
              {checklistToDelete && (
                <div
                  style={{
                    background: "#fffbe8",
                    border: "2px solid #ffe49b",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{ color: "#b54b13", fontWeight: 700, fontSize: 17 }}
                  >
                    "
                    {checklistToDelete.name ||
                      `Checklist ${checklistToDelete.id}`}
                    "
                  </div>
                  <div style={{ color: "#b54b13bb", fontSize: 13 }}>
                    {checklistToDelete.items?.length || 0} questions will be
                    permanently removed.
                  </div>
                </div>
              )}
              <div
                style={{ display: "flex", justifyContent: "center", gap: 18 }}
              >
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  style={{
                    ...palette.secondaryBtn,
                    borderRadius: 9,
                    padding: "10px 30px",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: isDeleting ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  style={{
                    ...palette.dangerBtn,
                    borderRadius: 9,
                    padding: "10px 30px",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: isDeleting ? "not-allowed" : "pointer",
                  }}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checklist;