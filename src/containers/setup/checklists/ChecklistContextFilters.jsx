import React from "react";

const ChecklistContextFilters = ({
  projects = [],
  purposes = [],
  phases = [],
  stages = [],
  categories = [],
  value,
  onChange,
}) => {
  const handle = (key) => (e) => onChange(key, e.target.value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <select
        value={value.project_id || ""}
        onChange={handle("project_id")}
        className="border rounded-lg p-3"
      >
        <option value="">Select Project</option>
        {projects.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <select
        value={value.purpose_id || ""}
        onChange={handle("purpose_id")}
        className="border rounded-lg p-3"
      >
        <option value="">Select Purpose</option>
        {purposes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <select
        value={value.phase_id || ""}
        onChange={handle("phase_id")}
        className="border rounded-lg p-3"
      >
        <option value="">Select Phase</option>
        {phases.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <select
        value={value.stage_id || ""}
        onChange={handle("stage_id")}
        className="border rounded-lg p-3"
      >
        <option value="">Select Stage</option>
        {stages.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <select
        value={value.category || ""}
        onChange={handle("category")}
        className="border rounded-lg p-3"
      >
        <option value="">Select Category</option>
        {categories.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <div className="flex items-center rounded-lg border p-3 bg-gray-50">
        <span className="text-sm font-medium">
          {value.mode === "template" ? "Template Mode" : "Legacy Mode"}
        </span>
      </div>
    </div>
  );
};

export default ChecklistContextFilters;