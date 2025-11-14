import { useState, useEffect } from "react";
import Link from "next/link"; 
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import AdminSidebar from "./layout/AdminSidebar";
import AdminTopbar from "./layout/AdminTopbar";

const API_BASE_URL = "http://localhost:8000/api";

// Helper function to get the authentication token and header
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  }
  return { "Content-Type": "application/json" };
};


export default function EventManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tab, setTab] = useState("basic");
  const [events, setEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [eventForm, setEventForm] = useState({
    title: "",
    event_type: "other",
    organizer: "",
    venue: "",
    ticket_price: 0,
    total_seats: 0,
    available_seats: 0,
    event_date: new Date().toISOString().split('T')[0],
    event_time: "18:00:00",
    location: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    // GET request is public, no token required
    try {
      const response = await fetch(`${API_BASE_URL}/events/`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm(`Are you sure you want to delete event ID: ${eventId}?`)) {
      return;
    }
    
    // 🚨 Using AUTH HEADERS for protected DELETE request
    const headers = getAuthHeaders();

    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/`, {
        method: "DELETE",
        headers: headers,
      });

      if (response.ok || response.status === 204) { 
        alert(`Event ${eventId} deleted successfully!`);
        fetchEvents();
      } else {
        const errorData = await response.json();
        console.error("Failed to delete event:", errorData);
        alert(`Failed to delete event. Details: ${errorData.detail || JSON.stringify(errorData)}. Did you log in?`);
      }
    } catch (error) {
      console.error("Deletion error:", error);
      alert("A server error occurred during deletion.");
    }
  };


  // Handles controlled inputs 
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;
    if (type === 'number') {
        newValue = Number(value);
    } else if (name === 'event_time') {
        newValue = value + ':00'; 
    }
    
    setEventForm({
      ...eventForm,
      [name]: newValue,
    });
  };

  const handleCreateEvent = async () => {
    
    if (!eventForm.title || !eventForm.venue || !eventForm.event_date || eventForm.total_seats <= 0) {
        alert("Please fill out Title, Venue, Date, and Capacity correctly.");
        return;
    }

    const payload = {
      ...eventForm,
      available_seats: eventForm.total_seats,
      ticket_price: parseFloat(eventForm.ticket_price).toFixed(2),
    };
    
    // 🚨 Using AUTH HEADERS for protected POST request
    const headers = getAuthHeaders();

    try {
      const response = await fetch(`${API_BASE_URL}/events/`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Event created successfully!");
        setIsModalOpen(false);
        fetchEvents();
      } else {
        const errorData = await response.json();
        console.error("Failed to create event:", errorData);
        alert(`Failed to create event. Details: ${errorData.detail || JSON.stringify(errorData)}. Did you log in?`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error while creating event. Check console for details.");
    }
  };
  //add the handlechange int here
  const handleChangeInt = (e) => {
  const { name, value } = e.target;

  // Allow empty input or digits only
  if (/^\d*$/.test(value)) {
    setEventForm({
      ...eventForm,
      [name]: value === "" ? "" : parseInt(value),
    });
  }
};

  // Helper to map Django type to CSS class (rest of function remains the same)
  const getEventClass = (type) => {
    switch (type) {
      case 'movie': return 'bg-purple-100 text-purple-600';
      case 'workshop': return 'bg-blue-100 text-blue-600';
      case 'seminar': return 'bg-orange-100 text-orange-600';
      case 'conference': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  
  if (loading) {
      return <div className="ml-64 p-8">Loading admin data...</div>;
  }

  return (
    <div className="flex">
      <AdminSidebar />

      <div className="ml-64 flex-1 bg-gray-50 min-h-screen">
        <AdminTopbar />

        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-semibold">Event Management</h1>
              <p className="text-gray-500 text-sm">Manage all your events in one place</p>
            </div>

            <button
              onClick={() => {
                setIsModalOpen(true);
                setTab("basic");
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-md shadow-sm hover:opacity-90"
            >
              <Plus size={16} /> Create Event
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search events..."
              className="border rounded-md px-3 py-2 flex-1 text-sm"
            />
            <select className="border rounded-md px-3 py-2 text-sm">
              <option>All Types</option>
              <option>Movie</option>
              <option>Workshop</option>
              <option>Screening</option>
            </select>
            <button className="border rounded-md px-3 py-2 text-sm">Filter</button>
            <button className="border rounded-md px-3 py-2 text-sm">Export</button>
          </div>

          {/* Event Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="text-left p-3">Event</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Venue</th>
                  <th className="text-left p-3">Capacity</th>
                  <th className="text-left p-3">Fee</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{ev.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getEventClass(ev.event_type)}`}>
                        {ev.event_type.charAt(0).toUpperCase() + ev.event_type.slice(1)}
                      </span>
                    </td>
                    <td className="p-3">{ev.venue}</td>
                    <td className="p-3">{ev.total_seats - ev.available_seats}/{ev.total_seats}</td>
                    <td className="p-3">₹{ev.ticket_price}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${ev.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ev.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2 text-gray-600">
                      {/* View event detail link */}
                      <Link href={`/events/${ev.id}`}>
                        <Eye size={16} className="cursor-pointer hover:text-blue-600" />
                      </Link>
                      <Edit size={16} className="cursor-pointer hover:text-yellow-600" />
                      
                      {/* 🚨 DELETE BUTTON WITH HANDLER */}
                      <Trash2 
                        size={16} 
                        className="cursor-pointer hover:text-red-600" 
                        onClick={() => handleDeleteEvent(ev.id)} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Create Event Modal (remains the same) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create New Event</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500">
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Add a new event to the system. Fill in all required details below.
            </p>

            {/* Tabs */}
            <div className="flex border-b mb-4">
              {["basic", "logistics"].map((tabName) => ( 
                <button
                  key={tabName}
                  onClick={() => setTab(tabName)}
                  className={`flex-1 py-2 text-sm font-medium border-b-2 ${
                    tab === tabName ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
                  }`}
                >
                  {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-3">
              {tab === "basic" && (
                <>
                  <input name="title" onChange={handleChange} value={eventForm.title} placeholder="Event Title" className="w-full border p-2 rounded-md text-sm" />
                  
                  <select name="event_type" onChange={handleChange} value={eventForm.event_type} className="w-full border p-2 rounded-md text-sm">
                    <option value="other">Select Event Type</option>
                    <option value="movie">Movie Screening</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="events">Conference</option>
                    <option value="other">Other</option>
                  </select>
                  
                  <input name="organizer" onChange={handleChange} value={eventForm.organizer} placeholder="Organizer Name (Required)" className="w-full border p-2 rounded-md text-sm" />
                  <input name="location" onChange={handleChange} value={eventForm.location} placeholder="Location (e.g., Block A, City Name)" className="w-full border p-2 rounded-md text-sm" />
                  <textarea name="description" onChange={handleChange} value={eventForm.description} placeholder="Description" className="w-full border p-2 rounded-md text-sm" />
                </>
              )}

              {tab === "logistics" && (
                <>
                  <input name="venue" onChange={handleChange} value={eventForm.venue} placeholder="Venue (e.g., Main Auditorium)" className="w-full border p-2 rounded-md text-sm" />
                  
                  <div className="flex gap-3">
                      <label className="flex-1">
                          Date:
                          <input name="event_date" type="date" min={new Date().toISOString().split("T")[0]} value={eventForm.event_date} onChange={handleChange} className="w-full border p-2 rounded-md text-sm mt-1" />
                      </label>
                      <label className="flex-1">
                          Time:
                          <input name="event_time" type="time" min={new Date().toISOString().split("T")[0]} value={eventForm.event_time.slice(0, 5)} onChange={handleChange} className="w-full border p-2 rounded-md text-sm mt-1" />
                      </label>
                  </div>
                  
                  <input
  name="ticket_price"
  type="text"
  onChange={handleChangeInt}
  value={eventForm.ticket_price}
  placeholder="Registration Fee (₹) - e.g., 50"
  className="w-full border p-2 rounded-md text-sm"
/>

<input
  name="total_seats"
  type="text"
  onChange={handleChangeInt}
  value={eventForm.total_seats}
  placeholder="Total Capacity (Required)"
  className="w-full border p-2 rounded-md text-sm"
/>

                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setIsModalOpen(false)} className="border px-4 py-2 rounded-md text-sm">
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}