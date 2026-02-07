

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FaUsers, FaClipboardList, FaCertificate, FaChessKing, FaBars,
// } from "react-icons/fa";

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   const stats = [
//     { label: "Total Clubs", value: 12, icon: <FaChessKing size={30} className="text-blue-500" /> },
//     { label: "Total Events", value: 68, icon: <FaClipboardList size={30} className="text-green-500" /> },
//     { label: "Active Events", value: 9, icon: <FaClipboardList size={30} className="text-yellow-500" /> },
//     { label: "Total Participants", value: 1830, icon: <FaUsers size={30} className="text-purple-500" /> },
//     { label: "Certificates Issued", value: 920, icon: <FaCertificate size={30} className="text-red-500" /> },
//   ];

//   const menuItems = [
//     { label: "Dashboard", path: "/admin/dashboard" },
//     { label: "Manage Clubs", path: "/admin/clubs" },
//     { label: "Audit Logs", path: "/admin/audit-logs" },
//     { label: "Participation Reports", path: "/admin/reports" },
//   ];

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <aside
//         className={`bg-white shadow-lg transition-all duration-300 ${
//           sidebarOpen ? "w-64" : "w-16"
//         }`}
//       >
//         <div className="flex items-center justify-between p-6 border-b">
//           {sidebarOpen && <h2 className="text-xl font-bold">Admin Panel</h2>}
//           <button
//             className="text-gray-500 hover:text-gray-700"
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//           >
//             <FaBars size={20} />
//           </button>
//         </div>
//         <nav className="mt-6">
//           {menuItems.map((item) => (
//             <button
//               key={item.label}
//               onClick={() => navigate(item.path)}
//               className={`flex items-center gap-3 w-full px-6 py-3 text-left hover:bg-indigo-600 hover:text-white transition-colors ${
//                 item.path === window.location.pathname
//                   ? "bg-indigo-600 text-white"
//                   : "text-gray-700"
//               }`}
//             >
//               {sidebarOpen ? item.label : item.label.charAt(0)}
//             </button>
//           ))}
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-8">
//         <h1 className="text-3xl font-bold mb-2">Institutional Administration Panel</h1>
//         <p className="text-gray-600 mb-8">Unified Campus Events Fabric (UCEF)</p>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
//           {stats.map((stat) => (
//             <div
//               key={stat.label}
//               className="bg-white p-6 rounded-xl shadow flex items-center gap-4"
//             >
//               <div className="p-4 bg-gray-100 rounded-full">{stat.icon}</div>
//               <div>
//                 <p className="text-gray-500 text-sm">{stat.label}</p>
//                 <p className="text-2xl font-bold">{stat.value}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Quick Actions */}
//         <div className="bg-white p-6 rounded-xl shadow mb-8">
//           <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
//           <div className="flex flex-wrap gap-4">
//             <ActionButton
//               label="Manage Clubs"
//               onClick={() => navigate("/admin/clubs")}
//             />
//             <ActionButton
//               label="View Audit Logs"
//               onClick={() => navigate("/admin/audit-logs")}
//             />
//             <ActionButton
//               label="Participation Reports"
//               disabled
//             />
//           </div>
//           <p className="text-xs text-gray-500 mt-4 italic">
//             All governance actions are logged and auditable.
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// };

// const ActionButton = ({ label, onClick, disabled }) => (
//   <button
//     disabled={disabled}
//     onClick={onClick}
//     className={`px-6 py-2 rounded font-semibold ${
//       disabled
//         ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//         : "bg-indigo-600 text-white hover:bg-indigo-700"
//     }`}
//   >
//     {label}
//   </button>
// );

// export default AdminDashboard;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  Bars3Icon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Sidebar menu with nested items
const menuItems = [
  {
    name: "Dashboard",
    icon: HomeIcon,
    path: "/admin/dashboard",
  },
  {
    name: "Manage Clubs",
    icon: UsersIcon,
    children: [
      { name: "Add Clubs", path: "/admin/clubs" },
    ],
  },
  {
    name: "Event Management",
    icon: ClipboardDocumentListIcon,
    path: "/organizer/event",
  },
  {
    name: "Student Reports",
    icon: ClipboardDocumentListIcon,
    path: "/admin/reports",
  },
  {
    name: "Audit Logs",
    icon: BellAlertIcon,
    path: "/admin/audit-logs",
  },
  {
    name: "Settings",
    icon: Cog6ToothIcon,
    path: "/admin/settings",
  },
];

// Sample stats and chart data
const stats = [
  { label: "Total Clubs", value: 12 },
  { label: "Total Events", value: 68 },
  { label: "Active Events", value: 9 },
  { label: "Total Participants", value: 1830 },
  { label: "Certificates Issued", value: 920 },
];

const chartData = [
  { month: "Jan", events: 10 },
  { month: "Feb", events: 15 },
  { month: "Mar", events: 20 },
  { month: "Apr", events: 25 },
  { month: "May", events: 30 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSubmenu = (name) =>
    setOpenSubmenu(openSubmenu === name ? null : name);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-800 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className={`text-lg font-bold ${!sidebarOpen && "hidden"}`}>
            UCEF Admin
          </h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Bars3Icon className="w-6 h-6 text-white" />
          </button>
        </div>

        <nav className="flex-1 mt-4 overflow-auto">
          {menuItems.map((item) => (
            <div key={item.name}>
              <button
                onClick={() =>
                  item.children ? toggleSubmenu(item.name) : navigate(item.path)
                }
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-700 transition"
              >
                <item.icon className="w-6 h-6" />
                {sidebarOpen && <span>{item.name}</span>}
              </button>

              {item.children && openSubmenu === item.name && sidebarOpen && (
                <div className="ml-8 mt-1 flex flex-col gap-1">
                  {item.children.map((child) => (
                    <button
                      key={child.name}
                      onClick={() => navigate(child.path)}
                      className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="flex justify-between items-center bg-white shadow px-6 py-4 border-b">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <BellAlertIcon className="w-6 h-6 text-gray-600 cursor-pointer" />
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gray-400 rounded-full" />
              <span className="text-gray-700 font-semibold">Admin</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-auto flex-1">
          <p className="text-gray-600 mb-8">
            Unified Campus Events Fabric (UCEF)
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-start"
              >
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Monthly Events Overview</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="events" stroke="#4f46e5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Welcome Section */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome, Admin!</h2>
            <p className="text-gray-600">
              Use the sidebar to navigate between governance sections, manage clubs, organizers, events, and view student reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
