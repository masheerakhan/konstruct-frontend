import React from "react";
import ChecklistForm from "../ChecklistForm";
import Checklistdetails from "../ChecklistDetails";
import LegacyChecklistList from "./LegacyChecklistList";

const LegacyChecklistWrapper = ({
  palette,
  context,
  selectedChecklist,
  setSelectedChecklist,
  showForm,
  setShowForm,
  detailForm,
  setDetailForm,
  projects,
  onChecklistCreated,
}) => {
  if (showForm) {
    return (
      <ChecklistForm
        setShowForm={setShowForm}
        checklist={selectedChecklist}
        projectOptions={projects}
        onChecklistCreated={onChecklistCreated}
      />
    );
  }

  if (detailForm && selectedChecklist) {
    return (
      <Checklistdetails
        checklist={selectedChecklist}
        setShowForm={setShowForm}
        setDetailForm={setDetailForm}
        projectId={context.project_id}
      />
    );
  }

  return (
    <LegacyChecklistList
      palette={palette}
      context={context}
      setShowForm={setShowForm}
      setDetailForm={setDetailForm}
      setSelectedChecklist={setSelectedChecklist}
    />
  );
};

export default LegacyChecklistWrapper;
