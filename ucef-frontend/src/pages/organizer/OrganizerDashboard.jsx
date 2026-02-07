// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Calendar,
//   PlusCircle,
//   LayoutDashboard,
//   LogOut,
//   Menu,
//   X,
//   RefreshCw,
//   Rocket,
//   FileText,
//   Clock,
//   MapPin,
//   Users,
//   Image as ImageIcon,
// } from "lucide-react";

// import {
//   fetchMyOrganizerProfile,
//   fetchMyClubEvents,
//   createMyClubEvent,
// } from "../../services/apiOrganizer";

// const TABS = [
//   { key: "overview", label: "Overview", icon: LayoutDashboard },
//   { key: "create", label: "Create Event", icon: PlusCircle },
//   { key: "events", label: "My Events", icon: Calendar },
// ];

// export default function OrganizerDashboard() {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [profile, setProfile] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [loadingEvents, setLoadingEvents] = useState(true);
//   const [loadingPage, setLoadingPage] = useState(true);
  

//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     event_type: "Workshop",
//     start_time: "",
//     end_time: "",
//     venue: "",
//     capacity: "",
//     image_url: "",
//   });

//   const navigate = useNavigate();

//   const load = async () => {
//     try {
//       setLoadingEvents(true);

//       const p = await fetchMyOrganizerProfile();
//       setProfile(p);

//       const e = await fetchMyClubEvents(); // backend auto-updates status
//       setEvents(Array.isArray(e) ? e : []);
//     } catch (err) {
//       console.error(err);
//       localStorage.removeItem("organizerToken");
//       navigate("/organizer/login");
//     } finally {
//       setLoadingEvents(false);
//       setLoadingPage(false);
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("organizerToken");
//     if (!token) return navigate("/organizer/login");
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const logout = () => {
//     localStorage.removeItem("organizerToken");
//     localStorage.removeItem("organizerMember");
//     navigate("/organizer/login");
//   };

//   const createEvent = async (e) => {
//     e.preventDefault();

//     if (new Date(form.end_time) <= new Date(form.start_time)) {
//       return alert("End time must be after Start time");
//     }

//     const payload = {
//       ...form,
//       capacity: form.capacity ? Number(form.capacity) : null,
//     };

//     const res = await createMyClubEvent(payload);
//     if (res?.error) return alert(res.error);

//     alert("Event created successfully!");
//     setForm({
//       title: "",
//       description: "",
//       event_type: "Workshop",
//       start_time: "",
//       end_time: "",
//       venue: "",
//       capacity: "",
//       image_url: "",
//     });

//     setActiveTab("events");
//     load();
//   };

//   const stats = useMemo(() => {
//     const total = events.length;
//     const created = events.filter((e) => e.status === "Created").length;
//     const live = events.filter((e) => e.status === "Live").length;
//     const completed = events.filter((e) => e.status === "Completed").length;
//     const archived = events.filter((e) => e.status === "Archived").length;

//     return { total, created, live, completed, archived };
//   }, [events]);


//   const badge = (status) => {
//     const base =
//       "text-xs px-3 py-1 rounded-full border inline-flex items-center gap-1";

//     if (status === "Live")
//       return `${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-200`;
//     if (status === "Created")
//       return `${base} border-yellow-500/40 bg-yellow-500/10 text-yellow-200`;
//     if (status === "Completed")
//       return `${base} border-blue-500/40 bg-blue-500/10 text-blue-200`;
//     return `${base} border-gray-500/40 bg-gray-500/10 text-gray-200`;
//   };


//   if (loadingPage) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white grid place-items-center">
//         <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
//           Loading organizer console...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white">
//       {/* ================= MOBILE TOP BAR ================= */}
//       <header className="md:hidden sticky top-0 z-40 bg-black/60 backdrop-blur border-b border-white/10">
//         <div className="px-4 py-3 flex items-center justify-between">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="p-2 rounded-xl bg-white/5 border border-white/10"
//           >
//             <Menu className="w-5 h-5" />
//           </button>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
//         {/* ================= SIDEBAR ================= */}
//         <Sidebar
//           open={sidebarOpen}
//           onClose={() => setSidebarOpen(false)}
//           profile={profile}
//           activeTab={activeTab}
//           setActiveTab={(k) => {
//             setActiveTab(k);
//             setSidebarOpen(false);
//           }}
//           logout={logout}
//         />

//         {/* ================= MAIN ================= */}
//         <main className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6">
//           {/* Top header (desktop) */}
//           <div className="hidden md:flex items-center justify-center gap-4 mb-6">
//               <h1 className="text-3xl font-bold ">Organizer Dashboard</h1>
//           </div>
//           {/* ================= OVERVIEW ================= */}
//           {activeTab === "overview" && (
//             <div className="space-y-6">
//               {/* Stats */}
//               <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//                 <StatMini label="Total" value={stats.total} icon={Rocket} />
//                 <StatMini label="Created" value={stats.created} icon={FileText} />
//                 <StatMini label="Live" value={stats.live} icon={Calendar} />
//                 <StatMini label="Completed" value={stats.completed} icon={Clock} />
//                 <StatMini label="Archived" value={stats.archived} icon={LayoutDashboard} />

//               </div>

//               {/* Quick recent events */}
//               <div className="bg-black/25 border border-white/10 rounded-2xl p-5">
//                 <div className="flex items-center justify-between gap-3">
//                   <div>
//                     <h2 className="text-lg font-semibold">Recent Events</h2>
//                   </div>

//                   <button
//                     onClick={() => setActiveTab("events")}
//                     className="text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 rounded-xl"
//                   >
//                     View all
//                   </button>
//                 </div>

//                 <div className="mt-4 grid md:grid-cols-2 gap-4">
//                   {(events || []).slice(0, 4).map((ev) => (
//                     <button
//                       key={ev.id}
//                       onClick={() => navigate(`/organizer/event/${ev.id}`)}
//                       className="text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition"
//                     >
//                       <div className="flex items-center justify-between gap-3">
//                         <p className="font-semibold line-clamp-1">{ev.title}</p>
//                         <span className={badge(ev.status)}>{ev.status}</span>
//                       </div>
//                       <p className="text-xs text-gray-400 mt-2">
//                         {new Date(ev.start_time).toLocaleString()}
//                       </p>
//                       <p className="text-sm text-gray-300 mt-2 line-clamp-2">
//                         {ev.description}
//                       </p>
//                     </button>
//                   ))}

//                   {events.length === 0 && (
//                     <p className="text-gray-400">No events yet. Create your first event!</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ================= CREATE ================= */}
//           {activeTab === "create" && (
//             <div className="bg-black/25 border border-white/10 rounded-2xl p-5 md:p-6">
//               <div className="flex items-start justify-between gap-4 mb-5">
//                 <div>
//                   <h2 className="text-xl font-semibold">Create New Event</h2>
//                 </div>
//                 <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
//                   <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
//                     Club: {profile?.club_name || "-"}
//                   </span>
//                 </div>
//               </div>

//               <form onSubmit={createEvent} className="grid md:grid-cols-2 gap-4">
//                 <Input
//                   label="Title"
//                   value={form.title}
//                   onChange={(e) => setForm({ ...form, title: e.target.value })}
//                   placeholder="Event title"
//                   required
//                 />

//                 <Select
//                   label="Event Type"
//                   value={form.event_type}
//                   onChange={(e) => setForm({ ...form, event_type: e.target.value })}
//                   options={["Workshop", "Hackathon", "Seminar", "Cultural"]}
//                 />

//                 <Input
//                   label="Start Time"
//                   type="datetime-local"
//                   value={form.start_time}
//                   onChange={(e) => setForm({ ...form, start_time: e.target.value })}
//                   required
//                 />

//                 <Input
//                   label="End Time"
//                   type="datetime-local"
//                   value={form.end_time}
//                   onChange={(e) => setForm({ ...form, end_time: e.target.value })}
//                   required
//                 />

//                 <Input
//                   label="Venue"
//                   value={form.venue}
//                   onChange={(e) => setForm({ ...form, venue: e.target.value })}
//                   placeholder="e.g., Auditorium / Lab 301"
//                   icon={<MapPin className="w-4 h-4" />}
//                 />

//                 <Input
//                   label="Capacity"
//                   type="number"
//                   value={form.capacity}
//                   onChange={(e) => setForm({ ...form, capacity: e.target.value })}
//                   placeholder="e.g., 120"
//                   icon={<Users className="w-4 h-4" />}
//                 />

//                 <Input
//                   label="Image URL (optional)"
//                   value={form.image_url}
//                   onChange={(e) => setForm({ ...form, image_url: e.target.value })}
//                   placeholder="https://..."
//                   icon={<ImageIcon className="w-4 h-4" />}
//                 />

//                 <div className="md:col-span-2">
//                   <label className="text-xs text-gray-400">Description</label>
//                   <textarea
//                     className="mt-1 w-full min-h-[120px] bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500"
//                     placeholder="Describe your event..."
//                     value={form.description}
//                     onChange={(e) => setForm({ ...form, description: e.target.value })}
//                     required
//                   />
//                 </div>

//                 <button className="md:col-span-2 bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 font-semibold">
//                   Create Event
//                 </button>
//               </form>
//             </div>
//           )}

//           {/* ================= EVENTS ================= */}
//           {activeTab === "events" && (
//             <div className="bg-black/25 border border-white/10 rounded-2xl overflow-hidden">
//               <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between gap-4">
//                 <div>
//                   <h2 className="text-xl font-semibold">Club Events</h2>
//                 </div>

//                 <button
//                   onClick={load}
//                   className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold"
//                 >
//                   <RefreshCw className="w-4 h-4" />
//                   Refresh
//                 </button>
//               </div>

//               {loadingEvents ? (
//                 <div className="p-6 grid md:grid-cols-2 gap-4">
//                   <EventSkeleton />
//                   <EventSkeleton />
//                   <EventSkeleton />
//                   <EventSkeleton />
//                 </div>
//               ) : (
//                 <div className="p-6 grid md:grid-cols-2 gap-5">
//                   {events.map((ev) => (
//                     <EventCardEnhanced
//                       key={ev.id}
//                       ev={ev}
//                       badge={badge}
//                       onManage={() => navigate(`/organizer/event/${ev.id}`)}
//                     />
//                   ))}

//                   {events.length === 0 && (
//                     <p className="text-gray-400">No events created yet.</p>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

// /* ================= Sidebar ================= */
// function Sidebar({ open, onClose, profile, activeTab, setActiveTab, logout }) {
//   return (
//     <>
//       {open && (
//         <div
//           className="fixed inset-0 bg-black/60 z-40 md:hidden"
//           onClick={onClose}
//         />
//       )}

//       <aside
//         className={`fixed md:static z-50 md:z-auto top-0 left-0 h-full w-[280px]
//         bg-black md:bg-white/5 border-r border-white/10 p-4 transition-transform
//         ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
//       >
//         {/* Mobile close */}
//         <div className="flex items-center justify-between md:hidden mb-4">
//           <p className="font-semibold">Organizer Menu</p>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-xl bg-white/5 border border-white/10"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Profile */}
//         <div className="flex items-center gap-3 pb-4 border-b border-white/10">
//           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center font-bold text-lg">
//             {profile?.name?.charAt(0) || "O"}
//           </div>
//           <div>
//             <p className="font-semibold">{profile?.name || "Organizer"}</p>
//             <p className="text-xs text-gray-400">
//               {profile?.role || "Member"} • {profile?.club_name || "Club"}
//             </p>
//           </div>
//         </div>

//         {/* Tabs */}
//         <nav className="mt-4 flex flex-col gap-2">
//           {TABS.map(({ key, label, icon: Icon }) => (
//             <button
//               key={key}
//               onClick={() => setActiveTab(key)}
//               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
//                 activeTab === key
//                   ? "bg-blue-600 border-blue-500"
//                   : "bg-white/5 border-white/10 hover:bg-white/10"
//               }`}
//             >
//               <Icon className="w-5 h-5" />
//               <span className="font-semibold">{label}</span>
//             </button>
//           ))}
//         </nav>

//         {/* Logout */}
//         <button
//           onClick={logout}
//           className="mt-6 w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold"
//         >
//           <LogOut className="w-5 h-5" />
//           Logout
//         </button>
//       </aside>
//     </>
//   );
// }

// /* ================= Small stat cards ================= */
// function StatMini({ label, value, icon: Icon }) {
//   return (
//     <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
//       <div className="flex items-center justify-between">
//         <p className="text-gray-400 text-sm">{label}</p>
//         <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
//           <Icon className="w-4 h-4 text-gray-200" />
//         </div>
//       </div>
//       <p className="text-3xl font-bold mt-2">{value}</p>
//     </div>
//   );
// }

// /* ================= Form inputs ================= */
// function Input({ label, icon, ...props }) {
//   return (
//     <div>
//       <label className="text-xs text-gray-400">{label}</label>
//       <div className="mt-1 flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500">
//         {icon ? <span className="text-gray-400">{icon}</span> : null}
//         <input
//           {...props}
//           className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
//         />
//       </div>
//     </div>
//   );
// }

// function Select({ label, options, ...props }) {
//   return (
//     <div>
//       <label className="text-xs text-gray-400">{label}</label>
//       <select
//         {...props}
//         className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
//       >
//         {options.map((o) => (
//           <option key={o} value={o} className="text-black">
//             {o}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

// /* ================= Enhanced event card ================= */
// function EventCardEnhanced({ ev, badge, onManage }) {
//   const start = new Date(ev.start_time);
//   const end = new Date(ev.end_time);

//   const image =
//     ev.image_url && ev.image_url.startsWith("http")
//       ? ev.image_url
//       : null;

//   return (
//     <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition">
//       {/* Image / Header */}
//       <div className="h-40 bg-black/40 relative">
//         {image ? (
//           <img src={image} alt={ev.title} className="w-full h-full object-cover" />
//         ) : (
//           <div className="w-full h-full grid place-items-center text-gray-400">
//             <Calendar className="w-10 h-10" />
//           </div>
//         )}

//         <div className="absolute top-3 left-3">{badge(ev.status)}</div>
//       </div>

//       <div className="p-4">
//         <div className="flex items-start justify-between gap-3">
//           <div>
//             <h3 className="font-semibold text-lg leading-tight line-clamp-1">{ev.title}</h3>
//             <p className="text-xs text-gray-400 mt-1">{ev.event_type}</p>
//           </div>
//           <button
//             onClick={onManage}
//             className="shrink-0 bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 rounded-xl text-sm font-semibold"
//           >
//             Manage
//           </button>
//         </div>

//         <p className="text-sm text-gray-300 mt-3 line-clamp-2">{ev.description}</p>

//         <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-400">
//           <p className="inline-flex items-center gap-2">
//             <Clock className="w-4 h-4" />
//             {start.toLocaleString()} → {end.toLocaleString()}
//           </p>
//           <p className="inline-flex items-center gap-2">
//             <MapPin className="w-4 h-4" />
//             {ev.venue || "PCCOE Campus"}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// function EventSkeleton() {
//   return (
//     <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
//       <div className="h-40 bg-white/10" />
//       <div className="p-4 space-y-3">
//         <div className="h-4 w-2/3 bg-white/10 rounded" />
//         <div className="h-3 w-1/3 bg-white/10 rounded" />
//         <div className="h-3 w-full bg-white/10 rounded" />
//         <div className="h-3 w-5/6 bg-white/10 rounded" />
//         <div className="h-8 w-28 bg-white/10 rounded-xl" />
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Rocket,
  FileText,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  BarChart3,
  PieChart as PieIcon,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  fetchMyOrganizerProfile,
  fetchMyClubEvents,
  createMyClubEvent,
} from "../../services/apiOrganizer";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "create", label: "Create Event", icon: PlusCircle },
  { key: "events", label: "Club Events", icon: Calendar },
];

export default function OrganizerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingPage, setLoadingPage] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "Workshop",
    start_time: "",
    end_time: "",
    venue: "",
    capacity: "",
    image_url: "",
  });

  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoadingEvents(true);

      const p = await fetchMyOrganizerProfile();
      setProfile(p);

      // ✅ IMPORTANT:
      // For charts, backend should return these per event:
      // registered_count (int), present_total (int)
      // If not present, we fallback to 0.
      const e = await fetchMyClubEvents();
      setEvents(Array.isArray(e) ? e : []);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("organizerToken");
      navigate("/organizer/login");
    } finally {
      setLoadingEvents(false);
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("organizerToken");
    if (!token) return navigate("/organizer/login");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    localStorage.removeItem("organizerToken");
    localStorage.removeItem("organizerMember");
    navigate("/organizer/login");
  };

  const createEvent = async (e) => {
    e.preventDefault();

    if (new Date(form.end_time) <= new Date(form.start_time)) {
      return alert("End time must be after Start time");
    }

    const payload = {
      ...form,
      capacity: form.capacity ? Number(form.capacity) : null,
    };

    const res = await createMyClubEvent(payload);
    if (res?.error) return alert(res.error);

    alert("Event created successfully!");
    setForm({
      title: "",
      description: "",
      event_type: "Workshop",
      start_time: "",
      end_time: "",
      venue: "",
      capacity: "",
      image_url: "",
    });

    setActiveTab("events");
    load();
  };

  const stats = useMemo(() => {
    const total = events.length;
    const created = events.filter((e) => e.status === "Created").length;
    const live = events.filter((e) => e.status === "Live").length;
    const completed = events.filter((e) => e.status === "Completed").length;
    const archived = events.filter((e) => e.status === "Archived").length;

    const totalRegistered = events.reduce(
      (sum, e) => sum + Number(e.registered_count ?? 0),
      0
    );
    const totalPresent = events.reduce(
      (sum, e) => sum + Number(e.present_total ?? 0),
      0
    );

    return {
      total,
      created,
      live,
      completed,
      archived,
      totalRegistered,
      totalPresent,
    };
  }, [events]);

  const badge = (status) => {
    const base = "text-xs px-3 py-1 rounded-full border font-semibold";
    if (status === "Live")
      return `${base} border-emerald-300 bg-emerald-50 text-emerald-700`;
    if (status === "Created")
      return `${base} border-yellow-300 bg-yellow-50 text-yellow-700`;
    if (status === "Completed")
      return `${base} border-blue-300 bg-blue-50 text-blue-700`;
    return `${base} border-gray-300 bg-gray-100 text-gray-700`;
  };

  /* ===================== CHART DATA ===================== */

  // 1) Bar chart: recent events -> registered vs present
  const barData = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );

    return sorted.slice(0, 8).reverse().map((ev) => ({
      name: (ev.title || "Event").slice(0, 12) + (ev.title?.length > 12 ? "…" : ""),
      registered: Number(ev.registered_count ?? 0),
      present: Number(ev.present_total ?? 0),
      fullTitle: ev.title,
    }));
  }, [events]);

  // 2) Pie chart: status distribution
  const pieData = useMemo(() => {
    return [
      { name: "Created", value: stats.created },
      { name: "Live", value: stats.live },
      { name: "Completed", value: stats.completed },
      { name: "Archived", value: stats.archived },
    ].filter((x) => x.value > 0);
  }, [stats]);

  // Colors for pie (do not rely on themes)
  const PIE_COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#6b7280"];

  // Custom tooltip for bar
  const BarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const p0 = payload.find((p) => p.dataKey === "registered");
    const p1 = payload.find((p) => p.dataKey === "present");
    const fullTitle = payload?.[0]?.payload?.fullTitle;
    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-sm">
        <p className="font-semibold text-gray-900">{fullTitle || label}</p>
        <p className="text-gray-700 mt-1">Registered: {p0?.value ?? 0}</p>
        <p className="text-gray-700">Present: {p1?.value ?? 0}</p>
      </div>
    );
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 grid place-items-center">
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
          Loading organizer console...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900">
      {/* ================= MOBILE TOP BAR ================= */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-gray-100 border border-gray-200"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="text-center">
            <p className="font-semibold leading-tight">Organizer Dashboard</p>
            <p className="text-[11px] text-gray-500 leading-tight">
              {profile?.club_name}
            </p>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* ================= SIDEBAR ================= */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          profile={profile}
          activeTab={activeTab}
          setActiveTab={(k) => {
            setActiveTab(k);
            setSidebarOpen(false);
          }}
          logout={logout}
        />

        {/* ================= MAIN ================= */}
        <main className="bg-gray-50 border border-gray-400 rounded-2xl p-5 md:p-6 shadow-sm">
          {/* Top header (desktop) */}
          <div className="hidden md:flex items-center justify-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
          </div>
          {/* ================= OVERVIEW ================= */}
          {activeTab === "overview" && (
            <div className="space-y-6 border-t border-gray-200 pt-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatMini label="Total" value={stats.total} icon={Rocket} />
                <StatMini label="Created" value={stats.created} icon={FileText} />
                <StatMini label="Live" value={stats.live} icon={Calendar} />
                <StatMini label="Completed" value={stats.completed} icon={Clock} />
                <StatMini label="Archived" value={stats.archived} icon={LayoutDashboard} />
              </div>

              {/* ✅ NEW: Registration/Attendance summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KpiCard
                  title="Total Registrations"
                  value={stats.totalRegistered}
                  icon={Users}
                  hint="Sum across all events"
                />
                <KpiCard
                  title="Total Attendance (Present)"
                  value={stats.totalPresent}
                  icon={CheckIcon}
                  hint="Sum across all events"
                />
              </div>

              {/* ✅ NEW: Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Bar: Registered vs Present */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Registrations vs Attendance (Recent)
                    </h2>
                  </div>

                  {barData.length === 0 ? (
                    <p className="text-gray-500">No events yet.</p>
                  ) : (
                    <div className="w-full h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} />
                          <Tooltip content={<BarTooltip />} />
                          <Legend />
                          <Bar dataKey="registered" name="Registered" />
                          <Bar dataKey="present" name="Present" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-3">
                    Note: “Present” depends on QR scans or manual attendance.
                  </p>
                </div>

                {/* Pie: Status distribution */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <PieIcon className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Event Status Distribution
                    </h2>
                  </div>

                  {pieData.length === 0 ? (
                    <p className="text-gray-500">No events yet.</p>
                  ) : (
                    <div className="w-full h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label
                          >
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick recent events */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
                  </div>

                  <button
                    onClick={() => setActiveTab("events")}
                    className="text-sm font-semibold bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-2 rounded-xl"
                  >
                    View all
                  </button>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  {(events || []).slice(0, 4).map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => navigate(`/organizer/event/${ev.id}`)}
                      className="text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl p-4 transition"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold line-clamp-1 text-gray-900">{ev.title}</p>
                        <span className={badge(ev.status)}>{ev.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(ev.start_time).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {ev.description}
                      </p>

                      {/* Small metrics row */}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="px-2 py-1 rounded-lg bg-white border border-gray-200">
                          Registered: <b>{Number(ev.registered_count ?? 0)}</b>
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-white border border-gray-200">
                          Present: <b>{Number(ev.present_total ?? 0)}</b>
                        </span>
                      </div>
                    </button>
                  ))}

                  {events.length === 0 && (
                    <p className="text-gray-500">No events yet. Create your first event!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= CREATE ================= */}
          {activeTab === "create" && (
            <div className="bg-white border border-gray-400 rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Create New Event</h2>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs text-gray-600">
                  <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                    Club: {profile?.club_name || "-"}
                  </span>
                </div>
              </div>

              <form onSubmit={createEvent} className="grid md:grid-cols-2 gap-4">
                <InputLight
                  label="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Event title"
                  required
                />

                <SelectLight
                  label="Event Type"
                  value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  options={["Workshop", "Hackathon", "Seminar", "Cultural"]}
                />

                <InputLight
                  label="Start Time"
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  required
                />

                <InputLight
                  label="End Time"
                  type="datetime-local"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  required
                />

                <InputLight
                  label="Venue"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="e.g., Auditorium / Lab 301"
                  icon={<MapPin className="w-4 h-4" />}
                />

                <InputLight
                  label="Capacity"
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  placeholder="e.g., 120"
                  icon={<Users className="w-4 h-4" />}
                />

                <InputLight
                  label="Image URL (optional)"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  icon={<ImageIcon className="w-4 h-4" />}
                />

                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600">Description</label>
                  <textarea
                    className="mt-1 w-full min-h-[120px] bg-white border border-gray-300 rounded-xl p-3 outline-none focus:border-blue-500"
                    placeholder="Describe your event..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>

                <button className="md:col-span-2 bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 font-semibold text-white">
                  Create Event
                </button>
              </form>
            </div>
          )}

          {/* ================= EVENTS ================= */}
          {activeTab === "events" && (
            <div className="bg-white border border-gray-400 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 md:p-6 border-b border-gray-400 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Club Events</h2>
                </div>

                <button
                  onClick={load}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 border border-gray-400 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {loadingEvents ? (
                <div className="p-6 grid md:grid-cols-2 gap-4">
                  <EventSkeletonLight />
                  <EventSkeletonLight />
                  <EventSkeletonLight />
                  <EventSkeletonLight />
                </div>
              ) : (
                <div className="p-6 grid md:grid-cols-2 gap-5">
                  {events.map((ev) => (
                    <EventCardEnhancedLight
                      key={ev.id}
                      ev={ev}
                      badge={badge}
                      onManage={() => navigate(`/organizer/event/${ev.id}`)}
                    />
                  ))}

                  {events.length === 0 && (
                    <p className="text-gray-500">No events created yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ================= Sidebar ================= */
function Sidebar({ open, onClose, profile, activeTab, setActiveTab, logout }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:static z-50 md:z-auto top-0 left-0 h-full w-[280px]
        bg-white border-r border-gray-200 p-4 transition-transform
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <p className="font-semibold text-gray-900">Organizer Menu</p>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 border border-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center font-bold text-lg text-white">
            {profile?.name?.charAt(0) || "O"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile?.name || "Organizer"}</p>
            <p className="text-xs text-gray-600">
              {profile?.role || "Member"} • {profile?.club_name || "Club"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mt-4 flex flex-col gap-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                activeTab === key
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold">{label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>
    </>
  );
}

/* ================= Mini stat cards ================= */
function StatMini({ label, value, icon: Icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-gray-600 text-sm">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 grid place-items-center">
          <Icon className="w-4 h-4 text-gray-700" />
        </div>
      </div>
      <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
    </div>
  );
}

/* ================= KPI cards ================= */
function KpiCard({ title, value, icon: Icon, hint }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {hint ? <p className="text-xs text-gray-500 mt-2">{hint}</p> : null}
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 grid place-items-center">
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
      </div>
    </div>
  );
}

// small icon component for KPI
function CheckIcon({ className = "w-6 h-6 text-gray-700" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ================= Form inputs (light) ================= */
function InputLight({ label, icon, ...props }) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      <div className="mt-1 flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-2 focus-within:border-blue-500">
        {icon ? <span className="text-gray-500">{icon}</span> : null}
        <input
          {...props}
          className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

function SelectLight({ label, options, ...props }) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      <select
        {...props}
        className="mt-1 w-full bg-white border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500 text-gray-900"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ================= Enhanced event card (light) ================= */
function EventCardEnhancedLight({ ev, badge, onManage }) {
  const start = new Date(ev.start_time);
  const end = new Date(ev.end_time);

  const image = ev.image_url && String(ev.image_url).startsWith("http") ? ev.image_url : null;

  const registered = Number(ev.registered_count ?? 0);
  const present = Number(ev.present_total ?? 0);

  return (
    <div className="bg-white border border-gray-500 rounded-2xl overflow-hidden hover:shadow-md transition text-black">
      {/* Image / Header */}
      <div className="h-40 bg-gray-100 relative">
        {image ? (
          <img src={image}  className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400">
            <Calendar className="w-10 h-10" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg leading-tight line-clamp-1 text-gray-900">
              {ev.title}
            </h3>
            <p className="text-xs text-gray-600 mt-1">{ev.event_type}</p>
          </div>
          <button
            onClick={onManage}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-sm font-semibold"
          >
            Manage
          </button>
        </div>

        <p className="text-sm text-gray-700 mt-3 line-clamp-2">{ev.description}</p>

        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-600">
          <p className="inline-flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {start.toLocaleString()} → {end.toLocaleString()}
          </p>
          <p className="inline-flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {ev.venue || "PCCOE Campus"}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-2 py-1 rounded-lg bg-red-600 border border-gray-500 text-gray-50">
              Registered: <b>{registered}</b>
            </span>
            <span className="px-2 py-1 rounded-lg bg-green-600 border border-gray-500 text-gray-50">
              Present: <b>{present}</b>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventSkeletonLight() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse shadow-sm">
      <div className="h-40 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-3 w-1/3 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
        <div className="h-8 w-28 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}