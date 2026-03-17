// import React, { useEffect, useState } from "react";
// import Layout1 from "../components/Layout1";
// import axiosInstance from "../api/axiosInstance";
// import  projectInstance  from '../api/axiosInstance';
// import { useTheme } from "../ThemeContext";
// import axios from "axios";

// function UsersManagement() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Filter and search state
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("all");
//   const [projectFilter, setProjectFilter] = useState("all");
//   const [expandedRows, setExpandedRows] = useState({});

//   const { theme } = useTheme();

//   const palette =
//     theme === "dark"
//       ? {
//           card: "bg-slate-800 border-slate-700 text-slate-100",
//           border: "border-slate-700",
//           text: "text-slate-100",
//           subtext: "text-slate-300",
//           shadow: "shadow-xl",
//           input: "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400",
//         }
//       : {
//           card: "bg-white border-gray-200 text-gray-900",
//           border: "border-gray-200",
//           text: "text-gray-900",
//           subtext: "text-gray-600",
//           shadow: "shadow",
//           input: "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
//         };

//   // Fetch users created by current user
//   const fetchUsers = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axiosInstance.get("/users-by-creator/");
//       setUsers(res.data);
//     } catch (err) {
//       setError("Failed to load users");
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const [isSuperAdmin, setIsSuperAdmin] = useState(false);

//   useEffect(() => {
//     fetchUsers();
//   }, []);
// useEffect(() => {
//   if (!users?.length) return;
//   const ids = new Set();
//   users.forEach(u => u.accesses?.forEach(a => {
//     if (a.project_id && !projectNameCache[a.project_id]) ids.add(a.project_id);
//   }));
//   ids.forEach(id => fetchProjectName(id));
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [users]);

//   const getUniqueRoles = () => {
//     const roles = new Set();
//     users.forEach((user) => {
//       user.accesses?.forEach((access) => {
//         access.roles?.forEach((role) => {
//           roles.add(role.role);
//         });
//       });
//     });
//     return Array.from(roles);
//   };
//   useEffect(() => {
//   let userData = null;
//   try {
//     const s = localStorage.getItem("USER_DATA");
//     if (s) userData = JSON.parse(s);
//   } catch {}

//   if (!userData) {
//     const token =
//       localStorage.getItem("ACCESS_TOKEN") ||
//       localStorage.getItem("TOKEN") ||
//       localStorage.getItem("token");
//     if (token) userData = decodeJWT(token);
//   }

//   const rolee =
//     localStorage.getItem("ROLE") ||
//     userData?.role ||
//     userData?.roles?.[0] ||
//     "";

//   const isSA =
//     (typeof rolee === "string" &&
//       rolee.toLowerCase().includes("super admin")) ||
//     userData?.superadmin === true ||
//     userData?.is_superadmin === true ||
//     userData?.is_staff === true;

//   setIsSuperAdmin(!!isSA);
// }, []);

//   const getUniqueProjects = () => {
//   const ids = new Set();
//   users.forEach((user) => {
//     user.accesses?.forEach((access) => {
//       if (access.project_id) ids.add(access.project_id);
//     });
//   });

//   return Array.from(ids)
//     .map((id) => ({
//       id,
//       name: projectNameCache[id] || `Project ${id}`,
//     }))
//     .sort((a, b) => a.name.localeCompare(b.name));
// };

//   const filteredUsers = users.filter((user) => {
//   const term = searchTerm.toLowerCase();

//   const matchesSearch =
//     user.username.toLowerCase().includes(term) ||
//     user.email?.toLowerCase().includes(term) ||
//     user.id.toString().includes(term) ||
//     // 🟢 also match project NAMES
//     user.accesses?.some((a) =>
//       (projectNameCache[a.project_id] || "").toLowerCase().includes(term)
//     );

//   const matchesRole =
//     roleFilter === "all" ||
//     user.accesses?.some((access) =>
//       access.roles?.some((role) => role.role === roleFilter)
//     );

//   const matchesProject =
//     projectFilter === "all" ||
//     user.accesses?.some(
//       (access) => String(access.project_id) === String(projectFilter)
//     );

//   return matchesSearch && matchesRole && matchesProject;
// });

//   const getRoleColor = (role) => {
//     switch (role.toLowerCase()) {
//       case "maker":
//         return theme === "dark"
//           ? "bg-green-900 text-green-300"
//           : "bg-green-100 text-green-700";
//       case "inspector":
//         return theme === "dark"
//           ? "bg-blue-900 text-blue-300"
//           : "bg-blue-100 text-blue-700";
//       case "checker":
//         return theme === "dark"
//           ? "bg-orange-900 text-orange-300"
//           : "bg-orange-100 text-orange-700";
//       case "supervisor":
//         return theme === "dark"
//           ? "bg-purple-900 text-purple-300"
//           : "bg-purple-100 text-purple-700";
//       case "admin":
//         return theme === "dark"
//           ? "bg-red-900 text-red-300"
//           : "bg-red-100 text-red-700";
//       default:
//         return theme === "dark"
//           ? "bg-slate-700 text-slate-200"
//           : "bg-gray-100 text-gray-700";
//     }
//   };

//   const [projectNameCache, setProjectNameCache] = useState({}); // { [id]: "Project Name" }

// const getProjectNameById = (id) =>
//   projectNameCache[id] ? projectNameCache[id] : `Project ${id}`;

// const fetchProjectName = async (id) => {
//   if (!id || projectNameCache[id]) return; // already cached or bad id
//   try {
//     // ✅ use HTTPS and the /projects/projects/ path
//     const res = await axios.get(`https://konstruct.world/projects/projects/${id}/`, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN") || ""}`,
//       },
//     });
//     const name = res.data?.name || `Project ${id}`;
//     setProjectNameCache((prev) => ({ ...prev, [id]: name }));
//   } catch {
//     // cache a readable fallback so we don't refetch forever
//     setProjectNameCache((prev) => ({ ...prev, [id]: `Project ${id}` }));
//   }
// };

//   const toggleRowExpansion = (userId) => {
//     setExpandedRows((prev) => ({
//       ...prev,
//       [userId]: !prev[userId],
//     }));
//   };

//   const showAccessRoles = !isSuperAdmin;

//   const handleEditUser = (userId) => {
//     alert(`Edit user ${userId} - Feature to be implemented`);
//   };

//   const handleDeleteUser = (userId) => {
//     if (window.confirm("Are you sure you want to delete this user?")) {
//       alert(`Delete user ${userId} - Feature to be implemented`);
//     }
//   };

//   const handleManageAccess = (userId) => {
//     alert(`Manage access for user ${userId} - Feature to be implemented`);
//   };

//   // --- Helper for JWT decode (same as in your other file) ---
// function decodeJWT(token) {
//   try {
//     const base64Url = token.split(".")[1];
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     const jsonPayload = decodeURIComponent(
//       atob(base64)
//         .split("")
//         .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//         .join("")
//     );
//     return JSON.parse(jsonPayload);
//   } catch {
//     return null;
//   }
// }

//   return (
//     <>
//       {/* Main content - fills the space, no max-w or mx-auto */}
//       <main className="w-full min-h-[calc(100vh-64px)] p-6 bg-transparent">
//         <h2 className={`text-2xl font-bold mb-6 ${palette.text}`}>Users Management</h2>

//         {/* Header Stats */}
//         <div className={`rounded-lg ${palette.card} ${palette.shadow} p-4 mb-6 ${palette.border} border`}>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className={`text-center p-3 rounded-lg ${theme === "dark" ? "bg-blue-900" : "bg-blue-50"}`}>
//               <div className="text-2xl font-bold text-blue-600">{users.length}</div>
//               <div className={`text-sm ${palette.subtext}`}>Total Users Created</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${theme === "dark" ? "bg-green-900" : "bg-green-50"}`}>
//               <div className="text-2xl font-bold text-green-600">
//                 {users.filter((u) => u.accesses?.length > 0).length}
//               </div>
//               <div className={`text-sm ${palette.subtext}`}>Users with Access</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${theme === "dark" ? "bg-purple-900" : "bg-purple-50"}`}>
//               <div className="text-2xl font-bold text-purple-600">
//                 {getUniqueProjects().length}
//               </div>
//               <div className={`text-sm ${palette.subtext}`}>Projects Assigned</div>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className={`rounded-lg ${palette.card} ${palette.shadow} p-6 mb-6 ${palette.border} border`}>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Search */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${palette.text}`}>Search Users</label>
//               <input
//                 type="text"
//                 placeholder="Search by username, email, or ID..."
//                 className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             {/* Role Filter */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${palette.text}`}>Filter by Role</label>
//               <select
//                 className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
//                 value={roleFilter}
//                 onChange={(e) => setRoleFilter(e.target.value)}
//               >
//                 <option value="all">All Roles</option>
//                 {getUniqueRoles().map((role) => (
//                   <option key={role} value={role}>
//                     {role.charAt(0).toUpperCase() + role.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {/* Project Filter */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${palette.text}`}>Filter by Project</label>
//               <select
//   className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
//   value={projectFilter}
//   onChange={(e) => setProjectFilter(e.target.value)}
// >
//   <option value="all">All Projects</option>
//   {getUniqueProjects().map((p) => (
//     <option key={p.id} value={String(p.id)}>
//       {p.name}
//     </option>
//   ))}
// </select>
//             </div>
//           </div>
//           {/* Active Filters Display */}
//           {(searchTerm || roleFilter !== "all" || projectFilter !== "all") && (
//             <div className="mt-4 flex flex-wrap gap-2">
//               <span className={`text-sm ${palette.subtext}`}>Active filters:</span>
//               {searchTerm && (
//                 <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
//                   Search: "{searchTerm}"
//                 </span>
//               )}
//               {roleFilter !== "all" && (
//                 <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
//                   Role: {roleFilter}
//                 </span>
//               )}
//              {projectFilter !== "all" && (
//   <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
//     Project: {projectNameCache[projectFilter] || `Project ${projectFilter}`}
//   </span>
// )}
//               <button
//                 onClick={() => {
//                   setSearchTerm("");
//                   setRoleFilter("all");
//                   setProjectFilter("all");
//                 }}
//                 className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200"
//               >
//                 Clear All
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Users Table */}
//         <div className={`rounded-lg ${palette.card} ${palette.shadow} overflow-hidden ${palette.border} border`}>
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
//               <span className={palette.subtext}>Loading users...</span>
//             </div>
//           ) : error ? (
//             <div className="text-center py-12">
//               <p className="text-red-500 mb-4">{error}</p>
//               <button
//                 onClick={fetchUsers}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
//               >
//                 Try Again
//               </button>
//             </div>
//           ) : filteredUsers.length === 0 ? (
//             <div className="text-center py-12">
//               <p className={palette.subtext}>
//                 {users.length === 0
//                   ? "No users created yet."
//                   : "No users match the current filters."}
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Desktop Table */}
//               <div className="hidden lg:block overflow-x-auto">
//                 <table className={`min-w-full divide-y ${palette.border} border`}>
//                   <thead className={theme === "dark" ? "bg-slate-900" : "bg-gray-50"}>
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User Details</th>
//                           {showAccessRoles && (

//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Access & Projects</th>
//                           )}

//                               {showAccessRoles && (

//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Roles</th>
//                               )}
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className={theme === "dark" ? "bg-slate-800" : "bg-white"}>
//                     {filteredUsers.map((user) => (
//                       <tr key={user.id} className={theme === "dark" ? "hover:bg-slate-700" : "hover:bg-gray-50"}>
//                         {/* User Details */}
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className="flex-shrink-0 h-10 w-10">
//                               <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
//                                 {user.username.charAt(0).toUpperCase()}
//                               </div>
//                             </div>
//                             <div className="ml-4">
//                               <div className={`text-sm font-medium ${palette.text}`}>
//                                 {user.username}
//                               </div>
//                               {/* <div className="text-sm text-gray-500">
//                                 ID: {user.id}
//                               </div> */}
//                               {user.email && (
//                                 <div className="text-sm text-gray-500">
//                                   {user.email}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         {/* Access & Projects */}
//                               {showAccessRoles &&(

//                         <td className="px-6 py-4">
//                           {user.accesses && user.accesses.length > 0 ? (
//                             <div className="space-y-1">
//                               {user.accesses
//                                 .slice(0, 2)
//                                 .map((access, index) => (
//                                   <div key={index} className="text-sm">
//                                     <span className="font-medium text-gray-900">
//   {access.project_name || getProjectNameById(access.project_id)}
//                                     </span>
//                                     <div className="text-xs text-gray-500">
//                                       {access.building_id &&
//                                         `Building: ${access.building_id}`}
//                                       {access.zone_id &&
//                                         ` | Zone: ${access.zone_id}`}
//                                       {access.flat_id &&
//                                         ` | Flat: ${access.flat_id}`}
//                                     </div>
//                                   </div>
//                                 ))}
//                               {user.accesses.length > 2 && (
//                                 <div className="text-xs text-blue-600">
//                                   +{user.accesses.length - 2} more
//                                 </div>
//                               )}
//                             </div>
//                           ) : (
//                             <span className="text-sm text-gray-500">
//                               No access assigned
//                             </span>
//                           )}
//                         </td>
//                               )}
//                         {/* Roles */}
//                               {showAccessRoles &&(

//                         <td className="px-6 py-4">
//                           <div className="flex flex-wrap gap-1">
//                             {user.accesses && user.accesses.length > 0 ? (
//                               (() => {
//                                 const allRoles = new Set();
//                                 user.accesses.forEach((access) => {
//                                   access.roles?.forEach((role) => {
//                                     allRoles.add(role.role);
//                                   });
//                                 });
//                                 return Array.from(allRoles)
//                                   .slice(0, 3)
//                                   .map((role) => (
//                                     <span
//                                       key={role}
//                                       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
//                                         role
//                                       )}`}
//                                     >
//                                       {role}
//                                     </span>
//                                   ));
//                               })()
//                             ) : (
//                               <span className="text-sm text-gray-500">
//                                 No roles
//                               </span>
//                             )}
//                           </div>
//                         </td>
//                               )}
//                         {/* Status */}
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                               user.has_access
//                                 ? theme === "dark"
//                                   ? "bg-green-900 text-green-300"
//                                   : "bg-green-100 text-green-800"
//                                 : theme === "dark"
//                                 ? "bg-red-900 text-red-300"
//                                 : "bg-red-100 text-red-800"
//                             }`}
//                           >
//                             {user.has_access ? "Active" : "Inactive"}
//                           </span>
//                         </td>
//                         {/* Actions */}
//                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                           <div className="flex justify-end gap-2">
//                             <button
//                               onClick={() => handleEditUser(user.id)}
//                               className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
//                             >
//                               Edit
//                             </button>
//                             <button
//                               onClick={() => handleManageAccess(user.id)}
//                               className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
//                             >
//                               Access
//                             </button>
//                             <button
//                               onClick={() => handleDeleteUser(user.id)}
//                               className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               {/* Mobile Cards */}
//               <div className="lg:hidden">
//                 {filteredUsers.map((user) => (
//                   <div
//                     key={user.id}
//                     className={`border-b ${palette.border} p-4`}
//                   >
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center">
//                         <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
//                           {user.username.charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                           <div className={`font-medium ${palette.text}`}>
//                             {user.username}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             ID: {user.id}
//                           </div>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => toggleRowExpansion(user.id)}
//                         className="text-blue-600 hover:text-blue-800"
//                       >
//                         {expandedRows[user.id] ? "▲" : "▼"}
//                       </button>
//                     </div>
//                     {/* Roles Preview */}
//                     {!isSuperAdmin && (

//                     <div className="flex flex-wrap gap-1 mb-3">
//                       {user.accesses && user.accesses.length > 0 ? (
//                         (() => {
//                           const allRoles = new Set();
//                           user.accesses.forEach((access) => {
//                             access.roles?.forEach((role) => {
//                               allRoles.add(role.role);
//                             });
//                           });
//                           return Array.from(allRoles)
//                             .slice(0, 2)
//                             .map((role) => (
//                               <span
//                                 key={role}
//                                 className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
//                                   role
//                                 )}`}
//                               >
//                                 {role}
//                               </span>
//                             ));
//                         })()
//                       ) : (
//                         <span className="text-sm text-gray-500">No roles</span>
//                       )}
//                     </div>
//                     )}
//                     {/* Expanded Details */}
//                     {expandedRows[user.id] && (
//                       <div className="mt-3 pt-3 border-t border-gray-100">
//                         {user.email && (
//                           <div className="mb-2">
//                             <span className="text-sm font-medium">
//                               Email:{" "}
//                             </span>
//                             <span className="text-sm text-gray-600">
//                               {user.email}
//                             </span>
//                           </div>
//                         )}
//                         <div className="mb-2">
//                           <span className="text-sm font-medium">Status: </span>
//                           <span
//                             className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                               user.has_access
//                                 ? theme === "dark"
//                                   ? "bg-green-900 text-green-300"
//                                   : "bg-green-100 text-green-800"
//                                 : theme === "dark"
//                                 ? "bg-red-900 text-red-300"
//                                 : "bg-red-100 text-red-800"
//                             }`}
//                           >
//                             {user.has_access ? "Active" : "Inactive"}
//                           </span>
//                         </div>
//                         {!isSuperAdmin&&user.accesses && user.accesses.length > 0 && (
//                           <div className="mb-3">
//                             <div className="text-sm font-medium mb-1">
//                               Project Access:
//                             </div>
//                             {user.accesses.map((access, index) => (
//                               <div
//                                 key={index}
//                                 className="text-sm text-gray-600 ml-2"
//                               >
// • {access.project_name || getProjectNameById(access.project_id)}
//                                 {access.building_id &&
//                                   ` (Building: ${access.building_id})`}
//                                 {access.zone_id &&
//                                   ` (Zone: ${access.zone_id})`}
//                                 {access.flat_id &&
//                                   ` (Flat: ${access.flat_id})`}
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                         {/* Actions */}
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => handleEditUser(user.id)}
//                             className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
//                           >
//                             Edit
//                           </button>
//                           <button
//                             onClick={() => handleManageAccess(user.id)}
//                             className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
//                           >
//                             Manage Access
//                           </button>
//                           <button
//                             onClick={() => handleDeleteUser(user.id)}
//                             className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//         {/* Results Summary */}
//         {!loading && !error && (
//           <div className={`mt-4 text-sm ${palette.subtext} text-center`}>
//             Showing {filteredUsers.length} of {users.length} users
//           </div>
//         )}
//       </main>
//     </>
//   );
// }

// export default UsersManagement;

// import React, { useEffect, useState } from "react";
// import axiosInstance from "../api/axiosInstance";
// import { useTheme } from "../ThemeContext";
// import axios from "axios";

// // --- Helper for JWT decode (same as in your other file) ---
// function decodeJWT(token) {
//   try {
//     const base64Url = token.split(".")[1];
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     const jsonPayload = decodeURIComponent(
//       atob(base64)
//         .split("")
//         .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//         .join("")
//     );
//     return JSON.parse(jsonPayload);
//   } catch {
//     return null;
//   }
// }

// function UsersManagement() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Filter and search state
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("all");
//   const [projectFilter, setProjectFilter] = useState("all");
//   const [expandedRows, setExpandedRows] = useState({});

//   const { theme } = useTheme();

//   const palette =
//     theme === "dark"
//       ? {
//           card: "bg-slate-800 border-slate-700 text-slate-100",
//           border: "border-slate-700",
//           text: "text-slate-100",
//           subtext: "text-slate-300",
//           shadow: "shadow-xl",
//           input:
//             "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400",
//         }
//       : {
//           card: "bg-white border-gray-200 text-gray-900",
//           border: "border-gray-200",
//           text: "text-gray-900",
//           subtext: "text-gray-600",
//           shadow: "shadow",
//           input:
//             "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
//         };

//   const [isSuperAdmin, setIsSuperAdmin] = useState(false);

//   // ✅ Edit Modal state
//   const [editOpen, setEditOpen] = useState(false);
//   const [editUser, setEditUser] = useState(null);
//   const [editSaving, setEditSaving] = useState(false);
//   const [editErr, setEditErr] = useState("");
//   const [editForm, setEditForm] = useState({
//     username: "",
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone_number: "",
//     new_password: "",
//     confirm_password: "",
//   });

//   // Fetch users created by current user
//   const fetchUsers = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axiosInstance.get("/users-by-creator/");
//       setUsers(res.data || []);
//     } catch (err) {
//       setError("Failed to load users");
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   useEffect(() => {
//     let userData = null;
//     try {
//       const s = localStorage.getItem("USER_DATA");
//       if (s) userData = JSON.parse(s);
//     } catch {}

//     if (!userData) {
//       const token =
//         localStorage.getItem("ACCESS_TOKEN") ||
//         localStorage.getItem("TOKEN") ||
//         localStorage.getItem("token");
//       if (token) userData = decodeJWT(token);
//     }

//     const rolee =
//       localStorage.getItem("ROLE") ||
//       userData?.role ||
//       userData?.roles?.[0] ||
//       "";

//     const isSA =
//       (typeof rolee === "string" &&
//         rolee.toLowerCase().includes("super admin")) ||
//       userData?.superadmin === true ||
//       userData?.is_superadmin === true ||
//       userData?.is_staff === true;

//     setIsSuperAdmin(!!isSA);
//   }, []);

//   const showAccessRoles = !isSuperAdmin;

//   const getUniqueRoles = () => {
//     const roles = new Set();
//     users.forEach((user) => {
//       user.accesses?.forEach((access) => {
//         access.roles?.forEach((role) => {
//           roles.add(role.role);
//         });
//       });
//     });
//     return Array.from(roles);
//   };

//   const [projectNameCache, setProjectNameCache] = useState({}); // { [id]: "Project Name" }

//   const getProjectNameById = (id) =>
//     projectNameCache[id] ? projectNameCache[id] : `Project ${id}`;

//   const fetchProjectName = async (id) => {
//     if (!id || projectNameCache[id]) return; // already cached or bad id
//     try {
//       const res = await axios.get(
//         `https://konstruct.world/projects/projects/${id}/`,
//         {
//           headers: {
//             Authorization: `Bearer ${
//               localStorage.getItem("ACCESS_TOKEN") || ""
//             }`,
//           },
//         }
//       );
//       const name = res.data?.name || `Project ${id}`;
//       setProjectNameCache((prev) => ({ ...prev, [id]: name }));
//     } catch {
//       setProjectNameCache((prev) => ({ ...prev, [id]: `Project ${id}` }));
//     }
//   };

//   useEffect(() => {
//     if (!users?.length) return;
//     const ids = new Set();
//     users.forEach((u) =>
//       u.accesses?.forEach((a) => {
//         if (a.project_id && !projectNameCache[a.project_id]) ids.add(a.project_id);
//       })
//     );
//     ids.forEach((id) => fetchProjectName(id));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [users]);

//   const getUniqueProjects = () => {
//     const ids = new Set();
//     users.forEach((user) => {
//       user.accesses?.forEach((access) => {
//         if (access.project_id) ids.add(access.project_id);
//       });
//     });

//     return Array.from(ids)
//       .map((id) => ({
//         id,
//         name: projectNameCache[id] || `Project ${id}`,
//       }))
//       .sort((a, b) => a.name.localeCompare(b.name));
//   };

//   const filteredUsers = users.filter((user) => {
//     const term = (searchTerm || "").toLowerCase();

//     const matchesSearch =
//       (user.username || "").toLowerCase().includes(term) ||
//       (user.email || "").toLowerCase().includes(term) ||
//       String(user.id || "").includes(term) ||
//       user.accesses?.some((a) =>
//         (projectNameCache[a.project_id] || "").toLowerCase().includes(term)
//       );

//     const matchesRole =
//       roleFilter === "all" ||
//       user.accesses?.some((access) =>
//         access.roles?.some((role) => role.role === roleFilter)
//       );

//     const matchesProject =
//       projectFilter === "all" ||
//       user.accesses?.some(
//         (access) => String(access.project_id) === String(projectFilter)
//       );

//     return matchesSearch && matchesRole && matchesProject;
//   });

//   const getRoleColor = (role) => {
//     switch ((role || "").toLowerCase()) {
//       case "maker":
//         return theme === "dark"
//           ? "bg-green-900 text-green-300"
//           : "bg-green-100 text-green-700";
//       case "inspector":
//         return theme === "dark"
//           ? "bg-blue-900 text-blue-300"
//           : "bg-blue-100 text-blue-700";
//       case "checker":
//         return theme === "dark"
//           ? "bg-orange-900 text-orange-300"
//           : "bg-orange-100 text-orange-700";
//       case "supervisor":
//         return theme === "dark"
//           ? "bg-purple-900 text-purple-300"
//           : "bg-purple-100 text-purple-700";
//       case "admin":
//         return theme === "dark"
//           ? "bg-red-900 text-red-300"
//           : "bg-red-100 text-red-700";
//       default:
//         return theme === "dark"
//           ? "bg-slate-700 text-slate-200"
//           : "bg-gray-100 text-gray-700";
//     }
//   };

//   const toggleRowExpansion = (userId) => {
//     setExpandedRows((prev) => ({
//       ...prev,
//       [userId]: !prev[userId],
//     }));
//   };

//   // ✅ Open edit modal
//   const handleEditUser = (userId) => {
//     const u = users.find((x) => x.id === userId);
//     if (!u) return;

//     setEditErr("");
//     setEditUser(u);
//     setEditForm({
//       username: u.username || "",
//       first_name: u.first_name || "",
//       last_name: u.last_name || "",
//       email: u.email || "",
//       phone_number: u.phone_number || "",
//       new_password: "",
//       confirm_password: "",
//     });
//     setEditOpen(true);
//   };

//   const closeEdit = () => {
//     setEditOpen(false);
//     setEditUser(null);
//     setEditErr("");
//     setEditSaving(false);
//     setEditForm({
//       username: "",
//       first_name: "",
//       last_name: "",
//       email: "",
//       phone_number: "",
//       new_password: "",
//       confirm_password: "",
//     });
//   };

//   // ✅ Save edit (details + optional password)
//   const saveEdit = async () => {
//     if (!editUser?.id) return;

//     setEditErr("");

//     // Basic validation
//     const uname = (editForm.username || "").trim();
//     if (!uname) {
//       setEditErr("Username is required.");
//       return;
//     }

//     const np = (editForm.new_password || "").trim();
//     const cp = (editForm.confirm_password || "").trim();
//     if (np || cp) {
//       if (np.length < 6) {
//         setEditErr("New password must be at least 6 characters.");
//         return;
//       }
//       if (np !== cp) {
//         setEditErr("New password and confirm password do not match.");
//         return;
//       }
//     }

//     const userPayload = {
//       username: uname,
//       first_name: (editForm.first_name || "").trim(),
//       last_name: (editForm.last_name || "").trim(),
//       email: (editForm.email || "").trim(),
//       phone_number: (editForm.phone_number || "").trim(),
//       ...(np ? { password: np } : {}),
//     };

//     setEditSaving(true);
//     try {
//       // ✅ Backend: PATCH users/access-full-patch/<user_id>/
//       await axiosInstance.patch(`/users/access-full-patch/${editUser.id}/`, {
//         user: userPayload,
//       });

//       // Refresh list so table stays correct
//       await fetchUsers();
//       closeEdit();
//       window.alert("User updated successfully.");
//     } catch (e) {
//       const msg =
//         e?.response?.data?.detail ||
//         (typeof e?.response?.data === "object"
//           ? JSON.stringify(e.response.data)
//           : "") ||
//         "Failed to update user.";
//       setEditErr(msg);
//     } finally {
//       setEditSaving(false);
//     }
//   };

//   const handleDeleteUser = (userId) => {
//     if (window.confirm("Are you sure you want to delete this user?")) {
//       alert(`Delete user ${userId} - Feature to be implemented`);
//     }
//   };

//   const handleManageAccess = (userId) => {
//     alert(`Manage access for user ${userId} - Feature to be implemented`);
//   };

//   return (
//     <>
//       <main className="w-full min-h-[calc(100vh-64px)] p-6 bg-transparent">
//         <h2 className={`text-2xl font-bold mb-6 ${palette.text}`}>
//           Users Management
//         </h2>

//         {/* Header Stats */}
//         <div
//           className={`rounded-lg ${palette.card} ${palette.shadow} p-4 mb-6 ${palette.border} border`}
//         >
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div
//               className={`text-center p-3 rounded-lg ${
//                 theme === "dark" ? "bg-blue-900" : "bg-blue-50"
//               }`}
//             >
//               <div className="text-2xl font-bold text-blue-600">
//                 {users.length}
//               </div>
//               <div className={`text-sm ${palette.subtext}`}>
//                 Total Users Created
//               </div>
//             </div>
//             <div
//               className={`text-center p-3 rounded-lg ${
//                 theme === "dark" ? "bg-green-900" : "bg-green-50"
//               }`}
//             >
//               <div className="text-2xl font-bold text-green-600">
//                 {users.filter((u) => u.accesses?.length > 0).length}
//               </div>
//               <div className={`text-sm ${palette.subtext}`}>
//                 Users with Access
//               </div>
//             </div>
//             <div
//               className={`text-center p-3 rounded-lg ${
//                 theme === "dark" ? "bg-purple-900" : "bg-purple-50"
//               }`}
//             >
//               <div className="text-2xl font-bold text-purple-600">
//                 {getUniqueProjects().length}
//               </div>
//               <div className={`text-sm ${palette.subtext}`}>
//                 Projects Assigned
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div
//           className={`rounded-lg ${palette.card} ${palette.shadow} p-6 mb-6 ${palette.border} border`}
//         >
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Search */}
//             <div>
//               <label
//                 className={`block text-sm font-medium mb-2 ${palette.text}`}
//               >
//                 Search Users
//               </label>
//               <input
//                 type="text"
//                 placeholder="Search by username, email, or ID..."
//                 className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             {/* Role Filter */}
//             <div>
//               <label
//                 className={`block text-sm font-medium mb-2 ${palette.text}`}
//               >
//                 Filter by Role
//               </label>
//               <select
//                 className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
//                 value={roleFilter}
//                 onChange={(e) => setRoleFilter(e.target.value)}
//               >
//                 <option value="all">All Roles</option>
//                 {getUniqueRoles().map((role) => (
//                   <option key={role} value={role}>
//                     {role.charAt(0).toUpperCase() + role.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Project Filter */}
//             <div>
//               <label
//                 className={`block text-sm font-medium mb-2 ${palette.text}`}
//               >
//                 Filter by Project
//               </label>
//               <select
//                 className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
//                 value={projectFilter}
//                 onChange={(e) => setProjectFilter(e.target.value)}
//               >
//                 <option value="all">All Projects</option>
//                 {getUniqueProjects().map((p) => (
//                   <option key={p.id} value={String(p.id)}>
//                     {p.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Active Filters Display */}
//           {(searchTerm || roleFilter !== "all" || projectFilter !== "all") && (
//             <div className="mt-4 flex flex-wrap gap-2">
//               <span className={`text-sm ${palette.subtext}`}>
//                 Active filters:
//               </span>
//               {searchTerm && (
//                 <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
//                   Search: "{searchTerm}"
//                 </span>
//               )}
//               {roleFilter !== "all" && (
//                 <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
//                   Role: {roleFilter}
//                 </span>
//               )}
//               {projectFilter !== "all" && (
//                 <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
//                   Project:{" "}
//                   {projectNameCache[projectFilter] || `Project ${projectFilter}`}
//                 </span>
//               )}
//               <button
//                 onClick={() => {
//                   setSearchTerm("");
//                   setRoleFilter("all");
//                   setProjectFilter("all");
//                 }}
//                 className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200"
//               >
//                 Clear All
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Users Table */}
//         <div
//           className={`rounded-lg ${palette.card} ${palette.shadow} overflow-hidden ${palette.border} border`}
//         >
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
//               <span className={palette.subtext}>Loading users...</span>
//             </div>
//           ) : error ? (
//             <div className="text-center py-12">
//               <p className="text-red-500 mb-4">{error}</p>
//               <button
//                 onClick={fetchUsers}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
//               >
//                 Try Again
//               </button>
//             </div>
//           ) : filteredUsers.length === 0 ? (
//             <div className="text-center py-12">
//               <p className={palette.subtext}>
//                 {users.length === 0
//                   ? "No users created yet."
//                   : "No users match the current filters."}
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Desktop Table */}
//               <div className="hidden lg:block overflow-x-auto">
//                 <table className={`min-w-full divide-y ${palette.border} border`}>
//                   <thead className={theme === "dark" ? "bg-slate-900" : "bg-gray-50"}>
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                         User Details
//                       </th>

//                       {showAccessRoles && (
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                           Access & Projects
//                         </th>
//                       )}

//                       {showAccessRoles && (
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                           Roles
//                         </th>
//                       )}

//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody className={theme === "dark" ? "bg-slate-800" : "bg-white"}>
//                     {filteredUsers.map((user) => (
//                       <tr
//                         key={user.id}
//                         className={theme === "dark" ? "hover:bg-slate-700" : "hover:bg-gray-50"}
//                       >
//                         {/* User Details */}
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className="flex-shrink-0 h-10 w-10">
//                               <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
//                                 {(user.username || "?").charAt(0).toUpperCase()}
//                               </div>
//                             </div>
//                             <div className="ml-4">
//                               <div className={`text-sm font-medium ${palette.text}`}>
//                                 {user.username}
//                               </div>
//                               {user.email && (
//                                 <div className="text-sm text-gray-500">{user.email}</div>
//                               )}
//                               {user.phone_number && (
//                                 <div className="text-xs text-gray-500">{user.phone_number}</div>
//                               )}
//                             </div>
//                           </div>
//                         </td>

//                         {/* Access & Projects */}
//                         {showAccessRoles && (
//                           <td className="px-6 py-4">
//                             {user.accesses && user.accesses.length > 0 ? (
//                               <div className="space-y-1">
//                                 {user.accesses.slice(0, 2).map((access, index) => (
//                                   <div key={index} className="text-sm">
//                                     <span className="font-medium text-gray-900">
//                                       {access.project_name || getProjectNameById(access.project_id)}
//                                     </span>
//                                     <div className="text-xs text-gray-500">
//                                       {access.building_id && `Building: ${access.building_id}`}
//                                       {access.zone_id && ` | Zone: ${access.zone_id}`}
//                                       {access.flat_id && ` | Flat: ${access.flat_id}`}
//                                     </div>
//                                   </div>
//                                 ))}
//                                 {user.accesses.length > 2 && (
//                                   <div className="text-xs text-blue-600">
//                                     +{user.accesses.length - 2} more
//                                   </div>
//                                 )}
//                               </div>
//                             ) : (
//                               <span className="text-sm text-gray-500">No access assigned</span>
//                             )}
//                           </td>
//                         )}

//                         {/* Roles */}
//                         {showAccessRoles && (
//                           <td className="px-6 py-4">
//                             <div className="flex flex-wrap gap-1">
//                               {user.accesses && user.accesses.length > 0 ? (
//                                 (() => {
//                                   const allRoles = new Set();
//                                   user.accesses.forEach((access) => {
//                                     access.roles?.forEach((role) => {
//                                       allRoles.add(role.role);
//                                     });
//                                   });
//                                   return Array.from(allRoles)
//                                     .slice(0, 3)
//                                     .map((role) => (
//                                       <span
//                                         key={role}
//                                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}
//                                       >
//                                         {role}
//                                       </span>
//                                     ));
//                                 })()
//                               ) : (
//                                 <span className="text-sm text-gray-500">No roles</span>
//                               )}
//                             </div>
//                           </td>
//                         )}

//                         {/* Status */}
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                               user.has_access
//                                 ? theme === "dark"
//                                   ? "bg-green-900 text-green-300"
//                                   : "bg-green-100 text-green-800"
//                                 : theme === "dark"
//                                 ? "bg-red-900 text-red-300"
//                                 : "bg-red-100 text-red-800"
//                             }`}
//                           >
//                             {user.has_access ? "Active" : "Inactive"}
//                           </span>
//                         </td>

//                         {/* Actions */}
//                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                           <div className="flex justify-end gap-2">
//                             <button
//                               onClick={() => handleEditUser(user.id)}
//                               className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
//                             >
//                               Edit
//                             </button>
//                             <button
//                               onClick={() => handleManageAccess(user.id)}
//                               className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
//                             >
//                               Access
//                             </button>
//                             <button
//                               onClick={() => handleDeleteUser(user.id)}
//                               className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Mobile Cards */}
//               <div className="lg:hidden">
//                 {filteredUsers.map((user) => (
//                   <div key={user.id} className={`border-b ${palette.border} p-4`}>
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center">
//                         <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
//                           {(user.username || "?").charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                           <div className={`font-medium ${palette.text}`}>
//                             {user.username}
//                           </div>
//                           <div className="text-sm text-gray-500">ID: {user.id}</div>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => toggleRowExpansion(user.id)}
//                         className="text-blue-600 hover:text-blue-800"
//                       >
//                         {expandedRows[user.id] ? "▲" : "▼"}
//                       </button>
//                     </div>

//                     {/* Roles Preview */}
//                     {!isSuperAdmin && (
//                       <div className="flex flex-wrap gap-1 mb-3">
//                         {user.accesses && user.accesses.length > 0 ? (
//                           (() => {
//                             const allRoles = new Set();
//                             user.accesses.forEach((access) => {
//                               access.roles?.forEach((role) => allRoles.add(role.role));
//                             });
//                             return Array.from(allRoles)
//                               .slice(0, 2)
//                               .map((role) => (
//                                 <span
//                                   key={role}
//                                   className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}
//                                 >
//                                   {role}
//                                 </span>
//                               ));
//                           })()
//                         ) : (
//                           <span className="text-sm text-gray-500">No roles</span>
//                         )}
//                       </div>
//                     )}

//                     {/* Expanded Details */}
//                     {expandedRows[user.id] && (
//                       <div className="mt-3 pt-3 border-t border-gray-100">
//                         {user.email && (
//                           <div className="mb-2">
//                             <span className="text-sm font-medium">Email: </span>
//                             <span className="text-sm text-gray-600">{user.email}</span>
//                           </div>
//                         )}

//                         {user.phone_number && (
//                           <div className="mb-2">
//                             <span className="text-sm font-medium">Phone: </span>
//                             <span className="text-sm text-gray-600">{user.phone_number}</span>
//                           </div>
//                         )}

//                         <div className="mb-2">
//                           <span className="text-sm font-medium">Status: </span>
//                           <span
//                             className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                               user.has_access
//                                 ? theme === "dark"
//                                   ? "bg-green-900 text-green-300"
//                                   : "bg-green-100 text-green-800"
//                                 : theme === "dark"
//                                 ? "bg-red-900 text-red-300"
//                                 : "bg-red-100 text-red-800"
//                             }`}
//                           >
//                             {user.has_access ? "Active" : "Inactive"}
//                           </span>
//                         </div>

//                         {!isSuperAdmin && user.accesses?.length > 0 && (
//                           <div className="mb-3">
//                             <div className="text-sm font-medium mb-1">Project Access:</div>
//                             {user.accesses.map((access, index) => (
//                               <div key={index} className="text-sm text-gray-600 ml-2">
//                                 • {access.project_name || getProjectNameById(access.project_id)}
//                                 {access.building_id && ` (Building: ${access.building_id})`}
//                                 {access.zone_id && ` (Zone: ${access.zone_id})`}
//                                 {access.flat_id && ` (Flat: ${access.flat_id})`}
//                               </div>
//                             ))}
//                           </div>
//                         )}

//                         {/* Actions */}
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => handleEditUser(user.id)}
//                             className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
//                           >
//                             Edit
//                           </button>
//                           <button
//                             onClick={() => handleManageAccess(user.id)}
//                             className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
//                           >
//                             Manage Access
//                           </button>
//                           <button
//                             onClick={() => handleDeleteUser(user.id)}
//                             className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>

//         {/* Results Summary */}
//         {!loading && !error && (
//           <div className={`mt-4 text-sm ${palette.subtext} text-center`}>
//             Showing {filteredUsers.length} of {users.length} users
//           </div>
//         )}
//       </main>

//       {/* ✅ Edit User Modal */}
//       {editOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/50"
//             onClick={closeEdit}
//           />
//           <div
//             className={`relative w-full max-w-xl rounded-xl ${palette.card} ${palette.border} border ${palette.shadow} p-6`}
//           >
//             <div className="flex items-center justify-between mb-4">
//               <h3 className={`text-lg font-semibold ${palette.text}`}>
//                 Edit User (ID: {editUser?.id})
//               </h3>
//               <button
//                 onClick={closeEdit}
//                 className={`px-3 py-1 rounded ${theme === "dark" ? "bg-slate-700" : "bg-gray-100"}`}
//               >
//                 ✕
//               </button>
//             </div>

//             {editErr ? (
//               <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-3 py-2 text-sm">
//                 {editErr}
//               </div>
//             ) : null}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${palette.text}`}>
//                   Username *
//                 </label>
//                 <input
//                   className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                   value={editForm.username}
//                   onChange={(e) =>
//                     setEditForm((p) => ({ ...p, username: e.target.value }))
//                   }
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${palette.text}`}>
//                   Phone Number
//                 </label>
//                 <input
//                   className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                   value={editForm.phone_number}
//                   onChange={(e) =>
//                     setEditForm((p) => ({ ...p, phone_number: e.target.value }))
//                   }
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${palette.text}`}>
//                   First Name
//                 </label>
//                 <input
//                   className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                   value={editForm.first_name}
//                   onChange={(e) =>
//                     setEditForm((p) => ({ ...p, first_name: e.target.value }))
//                   }
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${palette.text}`}>
//                   Last Name
//                 </label>
//                 <input
//                   className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                   value={editForm.last_name}
//                   onChange={(e) =>
//                     setEditForm((p) => ({ ...p, last_name: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className={`block text-sm font-medium mb-1 ${palette.text}`}>
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                   value={editForm.email}
//                   onChange={(e) =>
//                     setEditForm((p) => ({ ...p, email: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="md:col-span-2 mt-2">
//                 <div className={`text-sm font-semibold ${palette.text}`}>
//                   Change Password (optional)
//                 </div>
//                 <div className={`text-xs ${palette.subtext}`}>
//                   Agar password blank chhoda to password change nahi hoga.
//                 </div>
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${palette.text}`}>
//                   New Password
//                 </label>
//                 <input
//                   type="password"
//                   className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                   value={editForm.new_password}
//                   onChange={(e) =>
//                     setEditForm((p) => ({ ...p, new_password: e.target.value }))
//                   }
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${palette.text}`}>
//                   Confirm Password
//                 </label>
//                 <input
//                   type="password"
//                   className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
//                   value={editForm.confirm_password}
//                   onChange={(e) =>
//                     setEditForm((p) => ({ ...p, confirm_password: e.target.value }))
//                   }
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end gap-2 mt-6">
//               <button
//                 onClick={closeEdit}
//                 disabled={editSaving}
//                 className={`px-4 py-2 rounded-lg ${
//                   theme === "dark" ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-100 hover:bg-gray-200"
//                 } ${palette.text}`}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={saveEdit}
//                 disabled={editSaving}
//                 className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 {editSaving ? "Saving..." : "Save Changes"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default UsersManagement;

import React, { useEffect, useMemo, useState, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { useTheme } from "../ThemeContext";
import axios from "axios";
import {
  getPurposeByProjectId,
  // getChecklistCategories,
  getCategoriesSimpleByProject,
  getPhaseByPurposeId,
} from "../api/index.js";

// --- Helper for JWT decode ---
function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Keep same spelling as backend choices
const ROLE_OPTIONS = [
  "Intializer",
  "SUPERVISOR",
  "CHECKER",
  "STAFF",
  "MAKER",
  "SECURITY_GUARD",
  "PROJECT_MANAGER",
  "PROJECT_HEAD",
];

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState({});
  const [phasesByProjectCache, setPhasesByProjectCache] = useState({});
  const [phasesByPurposeCache, setPhasesByPurposeCache] = useState({});
  const [stagesByProjectCache, setStagesByProjectCache] = useState({});
  const fetchedProjectsRef = useRef(new Set());

  const { theme } = useTheme();

  const palette =
    theme === "dark"
      ? {
          card: "bg-slate-800 border-slate-700 text-slate-100",
          border: "border-slate-700",
          text: "text-slate-100",
          subtext: "text-slate-300",
          shadow: "shadow-xl",
          input:
            "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400",
        }
      : {
          card: "bg-white border-gray-200 text-gray-900",
          border: "border-gray-200",
          text: "text-gray-900",
          subtext: "text-gray-600",
          shadow: "shadow",
          input:
            "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
        };

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Edit Modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState("");
  const [editForm, setEditForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    new_password: "",
    confirm_password: "",
  });

  // Access/Roles Modal state
  const [accessOpen, setAccessOpen] = useState(false);
  const [accessUser, setAccessUser] = useState(null);
  const [selectedAccessId, setSelectedAccessId] = useState(null);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedPhaseId, setSelectedPhaseId] = useState("");
  const [selectedStageId, setSelectedStageId] = useState("");

  const [rolesDraft, setRolesDraft] = useState([]);
  const [accessActiveDraft, setAccessActiveDraft] = useState(true);
  const [accessSaving, setAccessSaving] = useState(false);
  const [accessErr, setAccessErr] = useState("");
  const [userToggleSaving, setUserToggleSaving] = useState(false);

  const [projectNameCache, setProjectNameCache] = useState({});
  // const [stageNameCache, setStageNameCache] = useState({});
  // const [stagesByPhaseCache, setStagesByPhaseCache] = useState({});
  // const fetchedPhasesRef = useRef(new Set());
  const [stageNameCache, setStageNameCache] = useState({});
  const [purposesByProjectCache, setPurposesByProjectCache] = useState({});
  const [selectedPurposeId, setSelectedPurposeId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/users-by-creator/");
      const nextUsers = Array.isArray(res.data) ? res.data : [];
      setUsers(nextUsers);
      return nextUsers;
    } catch (err) {
      setError("Failed to load users");
      setUsers([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const storedUserData = useMemo(() => {
    try {
      const raw = localStorage.getItem("USER_DATA");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let userData = storedUserData;
    try {
      const s = localStorage.getItem("USER_DATA");
      if (s) userData = JSON.parse(s);
    } catch {}

    if (!userData) {
      const token =
        localStorage.getItem("ACCESS_TOKEN") ||
        localStorage.getItem("TOKEN") ||
        localStorage.getItem("token");
      if (token) userData = decodeJWT(token);
    }

    const rolee =
      localStorage.getItem("ROLE") ||
      userData?.role ||
      userData?.roles?.[0] ||
      "";

    const isSA =
      (typeof rolee === "string" &&
        rolee.toLowerCase().includes("super admin")) ||
      userData?.superadmin === true ||
      userData?.is_superadmin === true ||
      userData?.is_staff === true;

    setIsSuperAdmin(!!isSA);
  }, [storedUserData]);

  const showAccessRoles = !isSuperAdmin;

  // const allowedAccesses = useMemo(() => {
  //   try {
  //     const raw = JSON.parse(localStorage.getItem("ACCESSES")) || [];
  //     return Array.isArray(raw) ? raw : [];
  //   } catch {
  //     return [];
  //   }
  // }, []);

  const allowedAccesses = useMemo(() => {
    return Array.isArray(storedUserData?.accesses)
      ? storedUserData.accesses
      : [];
  }, [storedUserData]);

  const allowedProjects = useMemo(() => {
    const seen = new Set();

    return allowedAccesses
      .filter((a) => a?.project_id)
      .filter((a) => {
        const key = String(a.project_id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((a) => ({
        id: a.project_id,
        name:
          a.project_name ||
          projectNameCache[a.project_id] ||
          `Project ${a.project_id}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allowedAccesses, projectNameCache]);

  const allowedProjectIdsSet = useMemo(
    () => new Set(allowedProjects.map((p) => String(p.id))),
    [allowedProjects],
  );


  const fetchProjectName = async (id) => {
    if (!id || projectNameCache[id]) return;
    try {
      const res = await axios.get(
        `https://konstruct.world/projects/projects/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("ACCESS_TOKEN") || ""
            }`,
          },
        },
      );
      const name = res.data?.name || `Project ${id}`;
      setProjectNameCache((prev) => ({ ...prev, [id]: name }));
    } catch {
      setProjectNameCache((prev) => ({ ...prev, [id]: `Project ${id}` }));
    }
  };

  const getProjectNameById = (id) =>
    projectNameCache[id] ? projectNameCache[id] : `Project ${id}`;

    const accessOptions = useMemo(() => {
      return (accessUser?.accesses || [])
        .filter((a) => allowedProjectIdsSet.has(String(a.project_id)))
        .sort((a, b) => {
          const projectA = String(
            a.project_name || getProjectNameById(a.project_id),
          );
          const projectB = String(
            b.project_name || getProjectNameById(b.project_id),
          );
          if (projectA !== projectB) return projectA.localeCompare(projectB);
          const phaseA = Number(a.phase_id || 0);
          const phaseB = Number(b.phase_id || 0);
          if (phaseA !== phaseB) return phaseA - phaseB;
          const stageA = Number(a.stage_id || 0);
          const stageB = Number(b.stage_id || 0);
          return stageA - stageB;
        });
    }, [accessUser, allowedProjectIdsSet, projectNameCache]);

const getPurposeLabel = (access) => {
  if (!access) return "-";

  if (typeof access.purpose_name === "string") return access.purpose_name;
  if (typeof access.name === "string") return access.name;

  if (access?.name?.purpose?.name) return access.name.purpose.name;
  if (access?.purpose?.name) return access.purpose.name;
  if (access?.purpose_label) return access.purpose_label;

  if (access.purpose_id || access.purpose_id === 0) {
    return `Purpose ${access.purpose_id}`;
  }

  return "-";
};
  const fmtStage = (a) => {
    const id = a?.stage_id;
    if (id === null || id === undefined || id === "") return "Stage: -";

    const key = String(id);
    const name = stageNameCache[key];
    return name ? `Stage: ${name}` : `Stage: #${id}`;
  };

  const getStageLabelById = (stageId) => {
    if (!stageId) return "Select Stage";
    return stageNameCache[String(stageId)] || `Stage ${stageId}`;
  };

  const getScopeLabel = (access) => {
    const scopeParts = [];
    if (access?.building_id) scopeParts.push(`B:${access.building_id}`);
    if (access?.zone_id) scopeParts.push(`Z:${access.zone_id}`);
    if (access?.flat_id) scopeParts.push(`F:${access.flat_id}`);
    return scopeParts.length ? scopeParts.join(" | ") : "Project-level";
  };

  const getAccessLabel = (access) => {
    const projectName =
      access.project_name || getProjectNameById(access.project_id);
    const purposeText = getPurposeLabel(access);
    const stageText = fmtStage(access);
    const scopeText = getScopeLabel(access);
    return `${projectName} — ${purposeText} — ${stageText} — ${scopeText}`;
  };

  // const fetchStagesByPhase = async (phaseId) => {
  //   if (!phaseId) return;

  //   const key = String(phaseId);
  //   if (fetchedPhasesRef.current.has(key)) return;

  //   fetchedPhasesRef.current.add(key);

  //   try {
  //     const res = await axios.get(
  //       `https://konstruct.world/projects/stages/by_phase/${phaseId}/`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${
  //             localStorage.getItem("ACCESS_TOKEN") || ""
  //           }`,
  //         },
  //       },
  //     );

  //     const list = Array.isArray(res.data) ? res.data : [];

  //     setStageNameCache((prev) => {
  //       const next = { ...prev };
  //       list.forEach((s) => {
  //         if (s?.id) next[String(s.id)] = s?.name || `Stage ${s.id}`;
  //       });
  //       return next;
  //     });

  //     setStagesByPhaseCache((prev) => ({
  //       ...prev,
  //       [key]: list,
  //     }));
  //   } catch {
  //     setStagesByPhaseCache((prev) => ({
  //       ...prev,
  //       [key]: prev[key] || [],
  //     }));
  //   }
  // };
const fetchPurposePhaseStageByProject = async (projectId, force = false) => {
  if (!projectId) return;

  const key = String(projectId);

  if (!force && fetchedProjectsRef.current.has(key)) return;
  fetchedProjectsRef.current.add(key);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN") || ""}`,
  };

  try {
    const purposeRes = await getPurposeByProjectId(projectId);

    // keep stage optional if you want
    const stageRes = await axios.get(
      `https://konstruct.world/projects/get-stage-details-by-project-id/${projectId}/`,
      { headers },
    );

    const purposeList = Array.isArray(purposeRes.data) ? purposeRes.data : [];
    const stageList = Array.isArray(stageRes.data) ? stageRes.data : [];

    setPurposesByProjectCache((prev) => ({
      ...prev,
      [key]: purposeList,
    }));

    setStagesByProjectCache((prev) => ({
      ...prev,
      [key]: stageList,
    }));

    setStageNameCache((prev) => {
      const next = { ...prev };
      stageList.forEach((s) => {
        if (s?.id) {
          next[String(s.id)] = s?.name || s?.stage_name || `Stage ${s.id}`;
        }
      });
      return next;
    });
  } catch (err) {
    console.log("fetchPurposePhaseStageByProject error", err);

    setPurposesByProjectCache((prev) => ({
      ...prev,
      [key]: prev[key] || [],
    }));

    setStagesByProjectCache((prev) => ({
      ...prev,
      [key]: prev[key] || [],
    }));
  }
};

const fetchPhasesByPurpose = async (purposeId, force = false) => {
  if (!purposeId) return;

  const key = String(purposeId);

  if (!force && phasesByPurposeCache[key]) return;

  try {
    const res = await getPhaseByPurposeId(purposeId);
    const list = Array.isArray(res.data) ? res.data : [];

    setPhasesByPurposeCache((prev) => ({
      ...prev,
      [key]: list,
    }));
  } catch {
    setPhasesByPurposeCache((prev) => ({
      ...prev,
      [key]: prev[key] || [],
    }));
  }
};

  const fetchPhasesAndStagesByProject = async (projectId, force = false) => {
  if (!projectId) return;

  const key = String(projectId);

  if (!force && fetchedProjectsRef.current.has(key)) return;
  fetchedProjectsRef.current.add(key);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN") || ""}`,
  };

  try {
    const [phaseRes, stageRes] = await Promise.all([
      axios.get(
        `https://konstruct.world/projects/phases/by-project/${projectId}/`,
        { headers },
      ),
      axios.get(
        `https://konstruct.world/projects/get-stage-details-by-project-id/${projectId}/`,
        { headers },
      ),
    ]);

    const phaseList = Array.isArray(phaseRes.data) ? phaseRes.data : [];
    const stageList = Array.isArray(stageRes.data) ? stageRes.data : [];

    setPhasesByProjectCache((prev) => ({
      ...prev,
      [key]: phaseList,
    }));

    setStagesByProjectCache((prev) => ({
      ...prev,
      [key]: stageList,
    }));

    setStageNameCache((prev) => {
      const next = { ...prev };
      stageList.forEach((s) => {
        if (s?.id) {
          next[String(s.id)] = s?.name || s?.stage_name || `Stage ${s.id}`;
        }
      });
      return next;
    });
  } catch {
    setPhasesByProjectCache((prev) => ({
      ...prev,
      [key]: prev[key] || [],
    }));

    setStagesByProjectCache((prev) => ({
      ...prev,
      [key]: prev[key] || [],
    }));
  }
};

  // useEffect(() => {
  //   if (!users?.length) return;

  //   const ids = new Set();
  //   users.forEach((u) =>
  //     u.accesses?.forEach((a) => {
  //       if (a?.project_id && !projectNameCache[a.project_id]) {
  //         ids.add(a.project_id);
  //       }
  //     }),
  //   );

  //   ids.forEach((id) => fetchProjectName(id));
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [users]);

  // useEffect(() => {
  //   const ids = new Set();

  //   users.forEach((u) =>
  //     u.accesses?.forEach((a) => {
  //       if (a?.phase_id) ids.add(String(a.phase_id));
  //     }),
  //   );

  //   allowedAccesses.forEach((a) => {
  //     if (a?.phase_id) ids.add(String(a.phase_id));
  //   });

  //   ids.forEach((pid) => fetchStagesByPhase(pid));
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [users, allowedAccesses]);

  // useEffect(() => {
  //   if (selectedPhaseId) {
  //     fetchStagesByPhase(selectedPhaseId);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedPhaseId]);
 useEffect(() => {
   if (!users?.length) return;

   const ids = new Set();

   users.forEach((u) =>
     u.accesses?.forEach((a) => {
       if (a?.project_id && !projectNameCache[a.project_id]) {
         ids.add(a.project_id);
       }
     }),
   );

   allowedAccesses.forEach((a) => {
     if (a?.project_id && !projectNameCache[a.project_id]) {
       ids.add(a.project_id);
     }
   });

   ids.forEach((id) => fetchProjectName(id));
 }, [users, allowedAccesses, projectNameCache]);

const purposeOptions = useMemo(() => {
  if (!selectedProjectId) return [];

  const list = purposesByProjectCache[String(selectedProjectId)] || [];

  return list
    .map((p) => ({
      id: p?.id,
      name:
        p?.name?.purpose?.name ||
        p?.name?.name ||
        p?.purpose_name ||
        `Purpose ${p?.id}`,
    }))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}, [selectedProjectId, purposesByProjectCache]);

const organizationId = useMemo(() => {
  return storedUserData?.org || "";
}, [storedUserData]);

const fetchCategories = async () => {
  if (!organizationId) return;

  try {
    const res = await getCategoriesSimpleByProject();
    const list = Array.isArray(res.data) ? res.data : [];
    setCategories(list);
  } catch (err) {
    setCategories([]);
  }
};

useEffect(() => {
  fetchCategories();
}, []);
  // const phaseOptions = useMemo(() => {
  //   if (!selectedProjectId) return [];

  //   const map = new Map();

  //   [...allowedAccesses, ...(accessUser?.accesses || [])]
  //     .filter((a) => String(a?.project_id) === String(selectedProjectId))
  //     .forEach((a) => {
  //       if (!a?.phase_id && a?.phase_id !== 0) return;
  //       const key = String(a.phase_id);
  //       if (!map.has(key)) {
  //         map.set(key, {
  //           id: a.phase_id,
  //           name:
  //             a.phase_name ||
  //             a.phase?.name ||
  //             a.phase_label ||
  //             `Phase ${a.phase_id}`,
  //         });
  //       }
  //     });

  //   return Array.from(map.values()).sort((a, b) =>
  //     String(a.name).localeCompare(String(b.name)),
  //   );
  // }, [allowedAccesses, accessUser, selectedProjectId]);

  const phaseOptions = useMemo(() => {
    if (!selectedPurposeId) return [];

    const list = phasesByPurposeCache[String(selectedPurposeId)] || [];

    return list
      .map((p) => ({
        id: p.id,
        name: p.name || p.phase_name || `Phase ${p.id}`,
      }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [selectedPurposeId, phasesByPurposeCache]);

  // const stageOptions = useMemo(() => {
  //   if (!selectedPhaseId) return [];

  //   const map = new Map();
  //   const fromApi = stagesByPhaseCache[String(selectedPhaseId)] || [];
  //   fromApi.forEach((s) => {
  //     if (s?.id) {
  //       map.set(String(s.id), {
  //         id: s.id,
  //         name: s.name || `Stage ${s.id}`,
  //       });
  //     }
  //   });

  //   [...allowedAccesses, ...(accessUser?.accesses || [])]
  //     .filter((a) => String(a?.phase_id) === String(selectedPhaseId))
  //     .forEach((a) => {
  //       if (!a?.stage_id && a?.stage_id !== 0) return;
  //       const key = String(a.stage_id);
  //       if (!map.has(key)) {
  //         map.set(key, {
  //           id: a.stage_id,
  //           name:
  //             a.stage_name ||
  //             stageNameCache[key] ||
  //             a.stage?.name ||
  //             `Stage ${a.stage_id}`,
  //         });
  //       }
  //     });

  //   return Array.from(map.values()).sort((a, b) =>
  //     String(a.name).localeCompare(String(b.name)),
  //   );
  // }, [
  //   allowedAccesses,
  //   accessUser,
  //   selectedPhaseId,
  //   stageNameCache,
  //   stagesByPhaseCache,
  // ]);
const stageOptions = useMemo(() => {
  if (!selectedProjectId) return [];

  const list = stagesByProjectCache[String(selectedProjectId)] || [];

  const filtered = selectedPhaseId
    ? list.filter(
        (s) =>
          String(s?.phase_id || s?.phase || s?.phase_details?.id || "") ===
          String(selectedPhaseId),
      )
    : list;

  return filtered
    .map((s) => ({
      id: s.id,
      name: s.name || s.stage_name || `Stage ${s.id}`,
    }))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}, [selectedProjectId, selectedPhaseId, stagesByProjectCache]);

  const selectedAccess = useMemo(() => {
    if (!accessUser?.accesses?.length || !selectedAccessId) return null;
    return (
      accessUser.accesses.find(
        (a) => String(a.id) === String(selectedAccessId),
      ) || null
    );
  }, [accessUser, selectedAccessId]);

  const getUniqueRoles = () => {
    const roles = new Set();
    users.forEach((user) => {
      user.accesses?.forEach((access) => {
        access.roles?.forEach((role) => {
          if (role?.role) roles.add(role.role);
        });
      });
    });
    return Array.from(roles);
  };

  const categoryOptions = useMemo(() => {
    if (!selectedProjectId) return [];

    return categories
      .filter((c) => String(c.project) === String(selectedProjectId))
      .map((c) => ({
        id: c.id,
        name: c.name || `Category ${c.id}`,
      }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [categories, selectedProjectId]);

  const filteredUsers = users.filter((user) => {
    const term = (searchTerm || "").toLowerCase();

    const matchesSearch =
      (user.username || "").toLowerCase().includes(term) ||
      (user.email || "").toLowerCase().includes(term) ||
      String(user.id || "").includes(term) ||
      user.accesses?.some((a) =>
        (projectNameCache[a.project_id] || "").toLowerCase().includes(term),
      );

    const matchesRole =
      roleFilter === "all" ||
      user.accesses?.some((access) =>
        access.roles?.some((role) => role.role === roleFilter),
      );

    const matchesProject =
      projectFilter === "all" ||
      user.accesses?.some(
        (access) => String(access.project_id) === String(projectFilter),
      );

    return matchesSearch && matchesRole && matchesProject;
  });

  const getRoleColor = (role) => {
    switch ((role || "").toLowerCase()) {
      case "maker":
        return theme === "dark"
          ? "bg-green-900 text-green-300"
          : "bg-green-100 text-green-700";
      case "checker":
        return theme === "dark"
          ? "bg-orange-900 text-orange-300"
          : "bg-orange-100 text-orange-700";
      case "supervisor":
        return theme === "dark"
          ? "bg-purple-900 text-purple-300"
          : "bg-purple-100 text-purple-700";
      case "admin":
        return theme === "dark"
          ? "bg-red-900 text-red-300"
          : "bg-red-100 text-red-700";
      case "intializer":
      case "initializer":
        return theme === "dark"
          ? "bg-blue-900 text-blue-300"
          : "bg-blue-100 text-blue-700";
      default:
        return theme === "dark"
          ? "bg-slate-700 text-slate-200"
          : "bg-gray-100 text-gray-700";
    }
  };

  const toggleRowExpansion = (userId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // const populateFromAccess = async (access) => {
  //   if (!access) return;

  //   setSelectedAccessId(String(access.id));
  //   setSelectedProjectId(access.project_id ? String(access.project_id) : "");
  //   setSelectedPhaseId(access.phase_id ? String(access.phase_id) : "");
  //   if (access.phase_id) {
  //     await fetchStagesByPhase(access.phase_id);
  //   }
  //   setSelectedStageId(access.stage_id ? String(access.stage_id) : "");

  //   setRolesDraft(
  //     Array.from(
  //       new Set((access.roles || []).map((r) => r?.role).filter(Boolean)),
  //     ),
  //   );
  //   setAccessActiveDraft(Boolean(access.active));
  //   setAccessErr("");
  // };
const populateFromAccess = async (access) => {
  if (!access) return;

  const projectId = access.project_id ? String(access.project_id) : "";
  const purposeId = access.purpose_id ? String(access.purpose_id) : "";
  const phaseId = access.phase_id ? String(access.phase_id) : "";
  const stageId = access.stage_id ? String(access.stage_id) : "";
  const categoryId = access.category ? String(access.category) : "";

  setSelectedAccessId(String(access.id));
  setSelectedProjectId(projectId);

  if (projectId) {
    await fetchPurposePhaseStageByProject(projectId, true);
  }

  setSelectedPurposeId(purposeId);

  if (purposeId) {
    await fetchPhasesByPurpose(purposeId, true);
  }

  setSelectedPhaseId(phaseId);
  setSelectedStageId(stageId);
  setSelectedCategoryId(categoryId);

  setRolesDraft(
    Array.from(
      new Set((access.roles || []).map((r) => r?.role).filter(Boolean)),
    ),
  );
  setAccessActiveDraft(Boolean(access.active));
  setAccessErr("");
};

  const findMatchingAccess = (
    projectId,
    purposeId,
    phaseId,
    stageId,
    categoryId,
  ) => {
    return accessOptions.find(
      (a) =>
        String(a.project_id || "") === String(projectId || "") &&
        String(a.purpose_id || "") === String(purposeId || "") &&
        String(a.phase_id || "") === String(phaseId || "") &&
        String(a.stage_id || "") === String(stageId || "") &&
        String(a.category || "") === String(categoryId || ""),
    );
  };

  const applyMatchingAccessState = (matchedAccess) => {
    if (matchedAccess) {
      setSelectedAccessId(String(matchedAccess.id));
      setRolesDraft(
        Array.from(
          new Set(
            (matchedAccess.roles || []).map((r) => r?.role).filter(Boolean),
          ),
        ),
      );
      setAccessActiveDraft(Boolean(matchedAccess.active));
    } else {
      setSelectedAccessId(null);
      setRolesDraft([]);
      setAccessActiveDraft(true);
    }
  };

  // const handleProjectChange = (projectId) => {
  //   setSelectedProjectId(projectId);
  //   setSelectedPhaseId("");
  //   setSelectedStageId("");

  //   const matched = findMatchingAccess(projectId, "", "");
  //   applyMatchingAccessState(matched);
  // };

  const handleProjectChange = async (projectId) => {
  setSelectedProjectId(projectId);
  setSelectedPurposeId("");
  setSelectedPhaseId("");
  setSelectedStageId("");
  setSelectedCategoryId("");

  if (projectId) {
    await fetchPurposePhaseStageByProject(projectId, true);
  }

  const matched = findMatchingAccess(projectId, "", "","");
  applyMatchingAccessState(matched);
};

  // const handlePhaseChange = async (phaseId) => {
  //   setSelectedPhaseId(phaseId);
  //   setSelectedStageId("");

  //   if (phaseId) {
  //     await fetchStagesByPhase(phaseId);
  //   }

  //   const matched = findMatchingAccess(selectedProjectId, phaseId, "");
  //   applyMatchingAccessState(matched);
  // };
const handlePurposeChange = async (purposeId) => {
  setSelectedPurposeId(purposeId);
  setSelectedPhaseId("");
  setSelectedStageId("");

  if (purposeId) {
    await fetchPhasesByPurpose(purposeId, true);
  }

  const matched = findMatchingAccess(
    selectedProjectId,
    purposeId,
    "",
    "",
    selectedCategoryId,
  );
  applyMatchingAccessState(matched);
};

const handleCategoryChange = (categoryId) => {
  setSelectedCategoryId(categoryId);
};

const handlePhaseChange = (phaseId) => {
  setSelectedPhaseId(phaseId);
  setSelectedStageId("");

  const matched = findMatchingAccess(selectedProjectId, selectedPurposeId, phaseId, "");
  applyMatchingAccessState(matched);
};

  const handleStageChange = (stageId) => {
    setSelectedStageId(stageId);
    const matched = findMatchingAccess(
      selectedProjectId,
      selectedPurposeId,
      selectedPhaseId,
      stageId,
    );
    applyMatchingAccessState(matched);
  };

  const handleEditUser = (userId) => {
    const u = users.find((x) => x.id === userId);
    if (!u) return;

    setEditErr("");
    setEditUser(u);
    setEditForm({
      username: u.username || "",
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      email: u.email || "",
      phone_number: u.phone_number || "",
      new_password: "",
      confirm_password: "",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditUser(null);
    setEditErr("");
    setEditSaving(false);
    setEditForm({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      new_password: "",
      confirm_password: "",
    });
  };

  const saveEdit = async () => {
    if (!editUser?.id) return;

    setEditErr("");

    const uname = (editForm.username || "").trim();
    if (!uname) {
      setEditErr("Username is required.");
      return;
    }

    const np = (editForm.new_password || "").trim();
    const cp = (editForm.confirm_password || "").trim();

    if (np || cp) {
      if (np.length < 6) {
        setEditErr("New password must be at least 6 characters.");
        return;
      }
      if (np !== cp) {
        setEditErr("New password and confirm password do not match.");
        return;
      }
    }

    const userPayload = {
      username: uname,
      first_name: (editForm.first_name || "").trim(),
      last_name: (editForm.last_name || "").trim(),
      email: (editForm.email || "").trim(),
      phone_number: (editForm.phone_number || "").trim(),
      ...(np ? { password: np } : {}),
    };

    setEditSaving(true);
    try {
      await axiosInstance.patch(`/users/access-full-patch/${editUser.id}/`, {
        user: userPayload,
      });

      await fetchUsers();
      closeEdit();
      window.alert("User updated successfully.");
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : "") ||
        "Failed to update user.";
      setEditErr(msg);
    } finally {
      setEditSaving(false);
    }
  };

  const toggleUserHasAccess = async (user) => {
    if (!user?.id) return;
    const next = !Boolean(user.has_access);

    const ok = window.confirm(
      next
        ? `Activate user "${user.username}"?`
        : `Deactivate (soft delete) user "${user.username}"?\n\nThis will set has_access=false (user becomes inactive).`,
    );
    if (!ok) return;

    setUserToggleSaving(true);

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, has_access: next } : u)),
    );

    try {
      await axiosInstance.patch(`/users/${user.id}/`, { has_access: next });
      const latestUsers = await fetchUsers();

      if (accessUser?.id === user.id) {
        const refreshed = latestUsers.find((u) => u.id === user.id);
        if (refreshed) setAccessUser(refreshed);
      }
    } catch (e) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, has_access: !next } : u)),
      );
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : "") ||
        "Failed to update user status.";
      window.alert(msg);
    } finally {
      setUserToggleSaving(false);
    }
  };

  const openAccessModal = (userId) => {
    const u = users.find((x) => x.id === userId);
    if (!u) return;

    setAccessErr("");
    setAccessSaving(false);
    setAccessUser(u);
   setSelectedAccessId(null);
   setSelectedProjectId("");
   setSelectedPurposeId("");
   setSelectedPhaseId("");
   setSelectedStageId("");
   setSelectedCategoryId("");
   setRolesDraft([]);
    setAccessActiveDraft(true);
    setAccessOpen(true);
  };

  const closeAccessModal = () => {
    setAccessOpen(false);
    setAccessUser(null);
    setSelectedAccessId(null);
    setSelectedProjectId("");
    setSelectedPurposeId("");
    setSelectedPhaseId("");
    setSelectedStageId("");
    setSelectedCategoryId("");
    setRolesDraft([]);
    setAccessActiveDraft(true);
    setAccessSaving(false);
    setAccessErr("");
  };

  useEffect(() => {
    if (!selectedAccess) {
      return;
    }

    const roles = (selectedAccess.roles || [])
      .map((r) => r?.role)
      .filter(Boolean);

    setRolesDraft(Array.from(new Set(roles)));
    setAccessActiveDraft(Boolean(selectedAccess.active));
  }, [selectedAccess]);

  const toggleRoleDraft = (role) => {
    setRolesDraft((prev) => {
      const s = new Set(prev);
      if (s.has(role)) s.delete(role);
      else s.add(role);
      return Array.from(s);
    });
  };

  const canSaveAccess = Boolean(selectedProjectId);

  const saveAccessAndRoles = async () => {
    if (!accessUser?.id) return;

    if (!selectedProjectId) {
      setAccessErr("Select project first.");
      return;
    }

    if (rolesDraft.length === 0) {
      const ok = window.confirm(
        "No roles selected for this access.\n\nThis will remove all roles for this project access. Continue?",
      );
      if (!ok) return;
    }

    setAccessErr("");
    setAccessSaving(true);

    try {
      const payload = selectedAccessId
        ? {
            access: {
              project_id: Number(selectedProjectId),
              purpose_id: selectedPurposeId ? Number(selectedPurposeId) : null,
              phase_id: selectedPhaseId ? Number(selectedPhaseId) : null,
              stage_id: selectedStageId ? Number(selectedStageId) : null,
              category: selectedCategoryId ? Number(selectedCategoryId) : null,
              active: accessActiveDraft,
            },
            roles: rolesDraft.map((r) => ({ role: r })),
          }
        : {
            access: {
              project_id: Number(selectedProjectId),
              purpose_id: selectedPurposeId ? Number(selectedPurposeId) : null,
              phase_id: selectedPhaseId ? Number(selectedPhaseId) : null,
              stage_id: selectedStageId ? Number(selectedStageId) : null,
              active: accessActiveDraft,
            },
            roles: rolesDraft.map((r) => ({ role: r })),
          };

      const saveRes = await axiosInstance.patch(
        `/users/access-full-patch/${accessUser.id}/`,
        payload,
      );

      const savedAccessId = saveRes?.data?.access?.id
        ? String(saveRes.data.access.id)
        : null;

      const latestUsers = await fetchUsers();
      const refreshed = latestUsers.find((u) => u.id === accessUser.id);

      if (refreshed) {
        setAccessUser(refreshed);

        let refreshedAccess = null;

        if (savedAccessId) {
          refreshedAccess =
            refreshed.accesses?.find(
              (a) => String(a.id) === String(savedAccessId),
            ) || null;
        }

        if (!refreshedAccess) {
          refreshedAccess =
            refreshed.accesses?.find(
              (a) =>
                String(a.project_id || "") ===
                String(selectedProjectId || "") &&
                String(a.purpose_id || "") === String(selectedPurposeId || "") &&
                String(a.phase_id || "") === String(selectedPhaseId || "") &&
                String(a.stage_id || "") === String(selectedStageId || "") &&
                String(a.category || "") === String(selectedCategoryId || ""),
            ) || null;
        }

        if (refreshedAccess) {
          await populateFromAccess(refreshedAccess);
        } else {
          setSelectedAccessId(savedAccessId);
        }
      }

      window.alert("Access & roles updated successfully.");
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : "") ||
        "Failed to update access/roles.";
      setAccessErr(msg);
    } finally {
      setAccessSaving(false);
    }
  };

  const handleDeleteUser = (userId) => {
    const u = users.find((x) => x.id === userId);
    if (!u) return;
    toggleUserHasAccess(u);
  };

  const handleManageAccess = (userId) => {
    openAccessModal(userId);
  };

  return (
    <>
      <main className="w-full min-h-[calc(100vh-64px)] p-6 bg-transparent">
        <h2 className={`text-2xl font-bold mb-6 ${palette.text}`}>
          Users Management
        </h2>

        <div
          className={`rounded-lg ${palette.card} ${palette.shadow} p-4 mb-6 ${palette.border} border`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`text-center p-3 rounded-lg ${
                theme === "dark" ? "bg-blue-900" : "bg-blue-50"
              }`}
            >
              <div className="text-2xl font-bold text-blue-600">
                {users.length}
              </div>
              <div className={`text-sm ${palette.subtext}`}>
                Total Users Created
              </div>
            </div>

            <div
              className={`text-center p-3 rounded-lg ${
                theme === "dark" ? "bg-green-900" : "bg-green-50"
              }`}
            >
              <div className="text-2xl font-bold text-green-600">
                {users.filter((u) => u.accesses?.length > 0).length}
              </div>
              <div className={`text-sm ${palette.subtext}`}>
                Users with Access
              </div>
            </div>

            <div
              className={`text-center p-3 rounded-lg ${
                theme === "dark" ? "bg-purple-900" : "bg-purple-50"
              }`}
            >
              <div className="text-2xl font-bold text-purple-600">
                {allowedProjects.length}
              </div>
              <div className={`text-sm ${palette.subtext}`}>
                Projects Assigned
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg ${palette.card} ${palette.shadow} p-6 mb-6 ${palette.border} border`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${palette.text}`}
              >
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by username, email, or ID..."
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${palette.text}`}
              >
                Filter by Role
              </label>
              <select
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {getUniqueRoles().map((role) => (
                  <option key={role} value={role}>
                    {String(role)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${palette.text}`}
              >
                Filter by Project
              </label>
              <select
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${palette.input} ${palette.border} border`}
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                {allowedProjects.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || roleFilter !== "all" || projectFilter !== "all") && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`text-sm ${palette.subtext}`}>
                Active filters:
              </span>

              {searchTerm && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                  Search: "{searchTerm}"
                </span>
              )}

              {roleFilter !== "all" && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                  Role: {roleFilter}
                </span>
              )}

              {projectFilter !== "all" && (
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
                  Project:{" "}
                  {allowedProjects.find(
                    (p) => String(p.id) === String(projectFilter),
                  )?.name ||
                    projectNameCache[projectFilter] ||
                    `Project ${projectFilter}`}
                </span>
              )}

              <button
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                  setProjectFilter("all");
                }}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        <div
          className={`rounded-lg ${palette.card} ${palette.shadow} overflow-hidden ${palette.border} border`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className={palette.subtext}>Loading users...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchUsers}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className={palette.subtext}>
                {users.length === 0
                  ? "No users created yet."
                  : "No users match the current filters."}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table
                  className={`min-w-full divide-y ${palette.border} border`}
                >
                  <thead
                    className={theme === "dark" ? "bg-slate-900" : "bg-gray-50"}
                  >
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        User Details
                      </th>

                      {showAccessRoles && (
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Access & Projects
                        </th>
                      )}

                      {showAccessRoles && (
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Roles
                        </th>
                      )}

                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody
                    className={theme === "dark" ? "bg-slate-800" : "bg-white"}
                  >
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={
                          theme === "dark"
                            ? "hover:bg-slate-700"
                            : "hover:bg-gray-50"
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                {(user.username || "?").charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div
                                className={`text-sm font-medium ${palette.text}`}
                              >
                                {user.username}
                              </div>
                              {user.email && (
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              )}
                              {user.phone_number && (
                                <div className="text-xs text-gray-500">
                                  {user.phone_number}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {showAccessRoles && (
                          <td className="px-6 py-4">
                            {user.accesses && user.accesses.length > 0 ? (
                              <div className="space-y-1">
                                {user.accesses
                                  .slice(0, 2)
                                  .map((access, index) => (
                                    <div key={index} className="text-sm">
                                      <div className="font-medium text-gray-900">
                                        {access.project_name ||
                                          getProjectNameById(access.project_id)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Purpose: {getPurposeLabel(access)}
                                        <span className="ml-2">
                                          | {fmtStage(access)}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {getScopeLabel(access)}
                                        {typeof access.active === "boolean" && (
                                          <span className="ml-2">
                                            |{" "}
                                            <span
                                              className={
                                                access.active
                                                  ? "text-green-600"
                                                  : "text-red-600"
                                              }
                                            >
                                              {access.active
                                                ? "Access Active"
                                                : "Access Inactive"}
                                            </span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                {user.accesses.length > 2 && (
                                  <div className="text-xs text-blue-600">
                                    +{user.accesses.length - 2} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">
                                No access assigned
                              </span>
                            )}
                          </td>
                        )}

                        {showAccessRoles && (
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {user.accesses && user.accesses.length > 0 ? (
                                (() => {
                                  const allRoles = new Set();
                                  user.accesses.forEach((access) => {
                                    access.roles?.forEach((role) => {
                                      if (role?.role) allRoles.add(role.role);
                                    });
                                  });
                                  return Array.from(allRoles)
                                    .slice(0, 3)
                                    .map((role) => (
                                      <span
                                        key={role}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                                      >
                                        {role}
                                      </span>
                                    ));
                                })()
                              ) : (
                                <span className="text-sm text-gray-500">
                                  No roles
                                </span>
                              )}
                            </div>
                          </td>
                        )}

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.has_access
                                ? theme === "dark"
                                  ? "bg-green-900 text-green-300"
                                  : "bg-green-100 text-green-800"
                                : theme === "dark"
                                  ? "bg-red-900 text-red-300"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.has_access ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditUser(user.id)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleManageAccess(user.id)}
                              className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
                            >
                              Access & Roles
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={userToggleSaving}
                              className={`${
                                user.has_access
                                  ? "text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100"
                                  : "text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100"
                              } px-2 py-1 rounded text-xs disabled:opacity-60`}
                            >
                              {user.has_access ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`border-b ${palette.border} p-4`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
                          {(user.username || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-medium ${palette.text}`}>
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleRowExpansion(user.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {expandedRows[user.id] ? "▲" : "▼"}
                      </button>
                    </div>

                    {!isSuperAdmin && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {user.accesses && user.accesses.length > 0 ? (
                          (() => {
                            const allRoles = new Set();
                            user.accesses.forEach((access) => {
                              access.roles?.forEach((role) => {
                                if (role?.role) allRoles.add(role.role);
                              });
                            });
                            return Array.from(allRoles)
                              .slice(0, 2)
                              .map((role) => (
                                <span
                                  key={role}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                                >
                                  {role}
                                </span>
                              ));
                          })()
                        ) : (
                          <span className="text-sm text-gray-500">
                            No roles
                          </span>
                        )}
                      </div>
                    )}

                    {expandedRows[user.id] && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {user.email && (
                          <div className="mb-2">
                            <span className="text-sm font-medium">Email: </span>
                            <span className="text-sm text-gray-600">
                              {user.email}
                            </span>
                          </div>
                        )}

                        {user.phone_number && (
                          <div className="mb-2">
                            <span className="text-sm font-medium">Phone: </span>
                            <span className="text-sm text-gray-600">
                              {user.phone_number}
                            </span>
                          </div>
                        )}

                        <div className="mb-2">
                          <span className="text-sm font-medium">Status: </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.has_access
                                ? theme === "dark"
                                  ? "bg-green-900 text-green-300"
                                  : "bg-green-100 text-green-800"
                                : theme === "dark"
                                  ? "bg-red-900 text-red-300"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.has_access ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {!isSuperAdmin && user.accesses?.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-1">
                              Project Access:
                            </div>
                            {user.accesses.map((access, index) => (
                              <div
                                key={index}
                                className="text-sm text-gray-600 ml-2 mb-1"
                              >
                                •{" "}
                                {access.project_name ||
                                  getProjectNameById(access.project_id)}
                                {` | ${getPurposeLabel(access)}`}
                                {` | ${fmtStage(access)}`}
                                {` | ${getScopeLabel(access)}`}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleManageAccess(user.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                          >
                            Access & Roles
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={userToggleSaving}
                            className={`flex-1 ${
                              user.has_access
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            } text-white px-3 py-2 rounded text-sm disabled:opacity-60`}
                          >
                            {user.has_access ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {!loading && !error && (
          <div className={`mt-4 text-sm ${palette.subtext} text-center`}>
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </main>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeEdit} />
          <div
            className={`relative w-full max-w-xl rounded-xl ${palette.card} ${palette.border} border ${palette.shadow} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${palette.text}`}>
                Edit User (ID: {editUser?.id})
              </h3>
              <button
                onClick={closeEdit}
                className={`px-3 py-1 rounded ${
                  theme === "dark" ? "bg-slate-700" : "bg-gray-100"
                }`}
              >
                ✕
              </button>
            </div>

            {editErr ? (
              <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-3 py-2 text-sm">
                {editErr}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${palette.text}`}
                >
                  Username *
                </label>
                <input
                  className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, username: e.target.value }))
                  }
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${palette.text}`}
                >
                  Phone Number
                </label>
                <input
                  className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
                  value={editForm.phone_number}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, phone_number: e.target.value }))
                  }
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${palette.text}`}
                >
                  First Name
                </label>
                <input
                  className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
                  value={editForm.first_name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, first_name: e.target.value }))
                  }
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${palette.text}`}
                >
                  Last Name
                </label>
                <input
                  className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
                  value={editForm.last_name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, last_name: e.target.value }))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium mb-1 ${palette.text}`}
                >
                  Email
                </label>
                <input
                  type="email"
                  className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>

              <div className="md:col-span-2 mt-2">
                <div className={`text-sm font-semibold ${palette.text}`}>
                  Change Password (optional)
                </div>
                <div className={`text-xs ${palette.subtext}`}>
                  Agar password blank chhoda to password change nahi hoga.
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${palette.text}`}
                >
                  New Password
                </label>
                <input
                  type="password"
                  className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
                  value={editForm.new_password}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, new_password: e.target.value }))
                  }
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${palette.text}`}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
                  value={editForm.confirm_password}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      confirm_password: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closeEdit}
                disabled={editSaving}
                className={`px-4 py-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-gray-100 hover:bg-gray-200"
                } ${palette.text}`}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={editSaving}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {accessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeAccessModal}
          />
          <div
            className={`relative w-full max-w-6xl rounded-xl ${palette.card} ${palette.border} border ${palette.shadow} p-6 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-semibold ${palette.text}`}>
                  Access & Roles
                </h3>
                <div className={`text-sm ${palette.subtext}`}>
                  User:{" "}
                  <span className="font-semibold">{accessUser?.username}</span>{" "}
                  (ID: {accessUser?.id})
                </div>
              </div>

              <button
                onClick={closeAccessModal}
                className={`px-3 py-1 rounded ${
                  theme === "dark" ? "bg-slate-700" : "bg-gray-100"
                }`}
              >
                ✕
              </button>
            </div>

            {accessErr ? (
              <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-3 py-2 text-sm">
                {accessErr}
              </div>
            ) : null}

            <div
              className={`mb-4 p-3 rounded-lg ${
                theme === "dark" ? "bg-slate-900" : "bg-gray-50"
              } ${palette.border} border`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm font-semibold ${palette.text}`}>
                    User Status
                  </div>
                  <div className={`text-xs ${palette.subtext}`}>
                    Soft delete = has_access=false
                  </div>
                </div>

                <button
                  disabled={userToggleSaving}
                  onClick={() => toggleUserHasAccess(accessUser)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-60 ${
                    accessUser?.has_access
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {accessUser?.has_access ? "Deactivate User" : "Activate User"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className={`rounded-xl p-4 ${
                  theme === "dark" ? "bg-slate-900" : "bg-gray-50"
                } ${palette.border} border`}
              >
                <div className={`text-base font-semibold mb-4 ${palette.text}`}>
                  Select / Create Access
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${palette.text}`}
                    >
                      Project
                    </label>
                    <select
                      className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
                      value={selectedProjectId}
                      onChange={(e) => handleProjectChange(e.target.value)}
                    >
                      <option value="">Select Project</option>
                      {allowedProjects.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {!selectedProjectId && (
                      <div className={`mt-2 text-xs ${palette.subtext}`}>
                        Only projects from logged-in user's ACCESS are shown
                        here.
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${palette.text}`}
                    >
                      Purpose
                    </label>
                    <select
                      className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
                      value={selectedPurposeId}
                      onChange={(e) => handlePurposeChange(e.target.value)}
                      disabled={!selectedProjectId}
                    >
                      <option value="">Select Purpose</option>
                      {purposeOptions.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {selectedProjectId && purposeOptions.length === 0 && (
                      <div className={`mt-2 text-xs ${palette.subtext}`}>
                        No phase options found for this project.
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${palette.text}`}
                    >
                      Phase
                    </label>
                    <select
                      className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
                      value={selectedPhaseId}
                      onChange={(e) => handlePhaseChange(e.target.value)}
                      disabled={!selectedProjectId}
                    >
                      <option value="">Select Phase</option>
                      {phaseOptions.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {selectedProjectId && phaseOptions.length === 0 && (
                      <div className={`mt-2 text-xs ${palette.subtext}`}>
                        No phase options found for this project.
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${palette.text}`}
                    >
                      Stage
                    </label>
                    <select
                      className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
                      value={selectedStageId}
                      onChange={(e) => handleStageChange(e.target.value)}
                      // disabled={!selectedPhaseId}
                      disabled={!selectedProjectId}
                    >
                      <option value="">Select Stage</option>
                      {stageOptions.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {selectedPhaseId && stageOptions.length === 0 && (
                      <div className={`mt-2 text-xs ${palette.subtext}`}>
                        No stage options found for this phase.
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${palette.text}`}
                    >
                      Category
                    </label>
                    <select
                      className={`w-full px-3 py-2 rounded-lg ${palette.input} ${palette.border} border`}
                      value={selectedCategoryId}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      // disabled={!selectedPhaseId}
                      disabled={!selectedProjectId}
                    >
                      <option value="">Select Category</option>
                      {categoryOptions.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {selectedPhaseId && categories.length === 0 && (
                      <div className={`mt-2 text-xs ${palette.subtext}`}>
                        No categories found.
                      </div>
                    )}
                  </div>

                  <div
                    className={`rounded-lg p-3 ${
                      theme === "dark" ? "bg-slate-800" : "bg-white"
                    } ${palette.border} border`}
                  >
                    <div
                      className={`text-sm font-semibold mb-2 ${palette.text}`}
                    >
                      Selected Access Summary
                    </div>
                    <div className={`text-xs ${palette.subtext} space-y-1`}>
                      <div>
                        <span className="font-semibold">Project:</span>{" "}
                        {selectedProjectId
                          ? allowedProjects.find(
                              (p) => String(p.id) === String(selectedProjectId),
                            )?.name || getProjectNameById(selectedProjectId)
                          : "-"}
                      </div>
                      <div>
                        <span className="font-semibold">Phase:</span>{" "}
                        {selectedPhaseId
                          ? phaseOptions.find(
                              (p) => String(p.id) === String(selectedPhaseId),
                            )?.name || `Phase ${selectedPhaseId}`
                          : "-"}
                      </div>
                      <div>
                        <span className="font-semibold">Stage:</span>{" "}
                        {selectedStageId
                          ? getStageLabelById(selectedStageId)
                          : "-"}
                      </div>
                      <div>
                        <span className="font-semibold">
                          Current matched row:
                        </span>{" "}
                        {selectedAccessId
                          ? `Access #${selectedAccessId}`
                          : "New / no exact match"}
                      </div>
                      {selectedAccess && (
                        <>
                          <div>
                            <span className="font-semibold">Purpose:</span>{" "}
                            {getPurposeLabel(selectedAccess)}
                          </div>
                          <div>
                            <span className="font-semibold">Scope:</span>{" "}
                            {getScopeLabel(selectedAccess)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`text-sm font-semibold ${palette.text}`}>
                      Roles
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={accessActiveDraft}
                        onChange={(e) => setAccessActiveDraft(e.target.checked)}
                        disabled={!canSaveAccess}
                      />
                      <span className={palette.text}>Access Active</span>
                    </label>
                  </div>

                  <div
                    className={`rounded-lg p-3 ${
                      theme === "dark" ? "bg-slate-800" : "bg-white"
                    } ${palette.border} border`}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ROLE_OPTIONS.map((r) => (
                        <label
                          key={r}
                          className={`flex items-center gap-2 text-sm rounded-md px-2 py-1 ${
                            theme === "dark"
                              ? "hover:bg-slate-700"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={rolesDraft.includes(r)}
                            onChange={() => toggleRoleDraft(r)}
                            disabled={!canSaveAccess}
                          />
                          <span className={palette.text}>{r}</span>
                        </label>
                      ))}
                    </div>

                    <div className={`mt-3 text-xs ${palette.subtext}`}>
                      Selected roles:{" "}
                      <span className="font-semibold">
                        {rolesDraft.length ? rolesDraft.join(", ") : "None"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={closeAccessModal}
                      disabled={accessSaving}
                      className={`px-4 py-2 rounded-lg ${
                        theme === "dark"
                          ? "bg-slate-700 hover:bg-slate-600"
                          : "bg-gray-100 hover:bg-gray-200"
                      } ${palette.text}`}
                    >
                      Close
                    </button>

                    <button
                      onClick={saveAccessAndRoles}
                      disabled={accessSaving || !canSaveAccess}
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
                    >
                      {accessSaving
                        ? "Saving..."
                        : selectedAccessId
                          ? "Update Access & Roles"
                          : "Create / Save Access"}
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-xl p-4 ${
                  theme === "dark" ? "bg-slate-900" : "bg-gray-50"
                } ${palette.border} border`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-base font-semibold ${palette.text}`}>
                    Current Accesses
                  </div>
                  <div className={`text-xs ${palette.subtext}`}>
                    Click any access to auto-fill project, phase, stage, roles
                  </div>
                </div>

                {accessOptions.length === 0 ? (
                  <div className={`text-sm ${palette.subtext}`}>
                    No access rows found for this user under the logged-in
                    user's allowed projects.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                    {accessOptions.map((access) => {
                      const isSelected =
                        String(selectedAccessId || "") === String(access.id);

                      return (
                        <button
                          key={access.id}
                          type="button"
                          onClick={() => populateFromAccess(access)}
                          className={`w-full text-left rounded-xl border p-3 transition ${
                            isSelected
                              ? theme === "dark"
                                ? "border-blue-500 bg-slate-800"
                                : "border-blue-500 bg-blue-50"
                              : theme === "dark"
                                ? "border-slate-700 bg-slate-800 hover:bg-slate-700"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className={`font-semibold ${palette.text}`}>
                                {access.project_name ||
                                  getProjectNameById(access.project_id)}
                              </div>
                              <div
                                className={`text-xs mt-1 ${palette.subtext}`}
                              >
                                Purpose: {getPurposeLabel(access)}
                              </div>
                              <div
                                className={`text-xs mt-1 ${palette.subtext}`}
                              >
                                {fmtStage(access)}
                              </div>
                              <div
                                className={`text-xs mt-1 ${palette.subtext}`}
                              >
                                Scope: {getScopeLabel(access)}
                              </div>
                              <div
                                className={`text-xs mt-1 ${palette.subtext}`}
                              >
                                Active: {access.active ? "Yes" : "No"}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 justify-end max-w-[45%]">
                              {(access.roles || []).length > 0 ? (
                                access.roles.map((roleObj, idx) => (
                                  <span
                                    key={`${access.id}-${roleObj?.role || idx}`}
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getRoleColor(roleObj?.role)}`}
                                  >
                                    {roleObj?.role}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">
                                  No roles
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UsersManagement;