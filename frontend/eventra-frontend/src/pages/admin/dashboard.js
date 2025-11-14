import { useEffect, useState } from "react";
import AdminSidebar from "./layout/AdminSidebar";
import AdminTopbar from "./layout/AdminTopbar";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [recentActivity, setRecentActivity] = useState([]);

  const [totalEvents, setTotalEvents] = useState(0);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [eventsThisWeek, setEventsThisWeek] = useState(0);
  const [eventTypes, setEventTypes] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log("FETCHING EVENTS...");

      const res = await fetch(`${API_BASE_URL}/events/`);
      const data = await res.json();
      console.log("EVENT API RESPONSE:", data);
      setEvents(data);
      setTotalEvents(data.length);

      // Count total registrations
      const registrations = data.reduce((sum, ev) => {
        return sum + (ev.total_seats - ev.available_seats);
      }, 0);
      setTotalRegistrations(registrations);

      // Calculate revenue (tickets sold × ticket_price)
      const revenue = data.reduce((sum, ev) => {
        const sold = ev.total_seats - ev.available_seats;
        return sum + sold * Number(ev.ticket_price);
      }, 0);
      setTotalRevenue(revenue);

      // Event types distribution
      const typeCounts = {};
      data.forEach(ev => {
        typeCounts[ev.event_type] = (typeCounts[ev.event_type] || 0) + 1;
      });
      setEventTypes(typeCounts);


      // Events happening this week
       // Events happening this week
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset to start of day
      const weekFromNow = new Date();
      weekFromNow.setDate(now.getDate() + 7);
      weekFromNow.setHours(23, 59, 59, 999); // End of day

      const weeklyEvents = data.filter(ev => {
        if (!ev.event_date) return false;
        const eventDate = new Date(ev.event_date);
        if (isNaN(eventDate.getTime())) return false; // Invalid date check
        eventDate.setHours(0, 0, 0, 0); // Normalize to start of day
        return eventDate >= now && eventDate <= weekFromNow;
      }).length;
      setEventsThisWeek(weeklyEvents);

      // Recent activity
      setRecentActivity(generateRecentActivity(data));

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };
  
const generateRecentActivity = (events) => {
  let activity = [];

  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  events.forEach(ev => {

    // SAFER DATE PARSING
    const createdAt = ev.created_at ? new Date(ev.created_at) : null;
    const eventDate = ev.event_date ? new Date(ev.event_date) : null;

    // IGNORE invalid dates
    const isValid = (d) => d instanceof Date && !isNaN(d.getTime());

    // 1. New event created (last 48 hours)
    if (isValid(createdAt)) {
      const hoursAgo = (now - createdAt) / (1000 * 60 * 60);
      if (hoursAgo <= 48) {
        activity.push({
          message: `🔵 New event created: ${ev.title}`,
          time: createdAt
        });
      }
    }

    // 2. Event is tomorrow
    if (isValid(eventDate) && eventDate.toDateString() === tomorrow.toDateString()) {
      activity.push({
        message: `🟣 ${ev.title} starts tomorrow`,
        time: now
      });
    }

    // 3. Event this week
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);

    if (isValid(eventDate) && eventDate >= now && eventDate <= weekFromNow) {
      activity.push({
        message: `🟠 ${ev.title} is happening this week`,
        time: eventDate
      });
    }

    // 4. Event reached 80% capacity
    const sold = ev.total_seats - ev.available_seats;
    const capacityUsed = sold / ev.total_seats;

    if (capacityUsed >= 0.8 && ev.available_seats > 0) {
      activity.push({
        message: `🟢 ${ev.title} reached 80% capacity`,
        time: now
      });
    }

    // 5. Event is sold out
    if (ev.available_seats === 0) {
      activity.push({
        message: `🔴 ${ev.title} is SOLD OUT`,
        time: now
      });
    }
  });

  activity.sort((a, b) => b.time - a.time);
  return activity.slice(0, 5);
};



  if (loading) {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 flex-1 bg-gray-50 min-h-screen">
        <AdminTopbar />
        <main className="p-8">
          <h1 className="text-lg text-gray-600">Loading dashboard...</h1>
        </main>
      </div>
    </div>
  );
}
    return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1 bg-gray-50 min-h-screen">
        <AdminTopbar />

        <main className="p-8 space-y-6">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="bg-blue-100 p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium text-gray-600">Total Events</p>
      <Calendar className="text-blue-600" />
    </div>
    <h2 className="text-3xl font-bold mt-2 text-blue-900">{totalEvents}</h2>
  </div>

  <div className="bg-green-100 p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium text-gray-600">Total Registrations</p>
      <Users className="text-green-600" />
    </div>
    <h2 className="text-3xl font-bold mt-2 text-green-900">{totalRegistrations}</h2>
  </div>

  <div className="bg-purple-100 p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
      <DollarSign className="text-purple-600" />
    </div>
    <h2 className="text-3xl font-bold mt-2 text-purple-900">₹{totalRevenue}</h2>
  </div>

  <div className="bg-orange-100 p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium text-gray-600">This Week</p>
      <Clock className="text-orange-600" />
    </div>
    <h2 className="text-3xl font-bold mt-2 text-orange-900">{eventsThisWeek}</h2>
  </div>
</div>
          {/* Distribution & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
  <h3 className="text-lg font-semibold mb-4">Event Types Distribution</h3>
  <ul className="space-y-2 text-sm text-gray-700">
    {Object.entries(eventTypes).map(([key, count]) => (
      <li key={key}>
        {key.toUpperCase()} — <span className="text-gray-500">{count}</span>
      </li>
    ))}
  </ul>
</div>


           <div className="bg-white p-6 rounded-xl shadow-sm">
  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

  <ul className="space-y-3 text-sm">
    {recentActivity.length === 0 && (
      <li className="text-gray-500">No recent activity</li>
    )}

    {recentActivity.map((act, idx) => (
      <li key={idx} className="bg-gray-50 p-3 rounded-md">
        {act.message}
        <span className="text-gray-500 text-xs ml-2">
          · · {(act.time && !isNaN(act.time)) ? act.time.toLocaleString() : "—"}

        </span>
      </li>
    ))}
  </ul>
</div>

          </div>
        </main>
      </div>
    </div>
  );
}
