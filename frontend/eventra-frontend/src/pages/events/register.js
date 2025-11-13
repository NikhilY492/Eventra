// Eventra-New/frontend/eventra-frontend/src/pages/events/register.js (Change this file)

import Link from "next/link";
import { Calendar, MapPin, Mail, Phone, User } from "lucide-react";
import { useState, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/router";

const API_BASE_URL = "http://localhost:8000/api";

export default function EventRegistration() {
  const router = useRouter();
  const { event_id } = router.query; 

  const [eventDetails, setEventDetails] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Fetch event details to show summary and price
  useEffect(() => {
    if (event_id) {
      const fetchEvent = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/events/${event_id}/`);
          const data = await response.json();
          setEventDetails(data);
          setLoadingEvent(false);
        } catch (e) {
          console.error("Error fetching event details:", e);
          setLoadingEvent(false);
        }
      };
      fetchEvent();
    }
  }, [event_id]);

  const [formData, setFormData] = useState({
    name: "",
    roll_number: "", // Changed 'roll' to 'roll_number' to match Django model
    section: "",
    email: "",
    phone: "",
    timing: eventDetails?.event_time || "6:00 PM", // Use fetched time or default
    tickets: "1 ticket",
  });

  // Update form data on change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const [errors, setErrors] = useState({});

  const validate = () => {
    // ... (Your existing validation logic remains here)
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required.";

    if (!/^[a-z]{2,5}\d{4,6}$/i.test(formData.roll_number)) // Relaxed regex for roll no
    newErrors.roll_number = "Enter a valid roll number (e.g., 21CS001).";

    if (!/^[A-Za-z]{1,2}$/.test(formData.section))
      newErrors.section = "Section must be 1–2 letters (e.g., A, B, C).";

    if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    )
      newErrors.email = "Enter a valid college email address.";

    if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Phone number must be 10 digits.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate() || loadingEvent || loadingSubmit || !eventDetails) {
      return;
    }
    
    setLoadingSubmit(true);

    const numTickets = parseInt(formData.tickets.split(" ")[0]);
    
    const registrationPayload = {
        event: eventDetails.id,
        customer_name: formData.name,
        roll_number: formData.roll_number,
        section: formData.section,
        email: formData.email,
        phone: formData.phone,
        number_of_tickets: numTickets,
        
    };

    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventDetails.id}/book/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationPayload)
        });

        const data = await response.json();

        if (response.ok) {
            // Store successful booking data for the next step
            localStorage.setItem("currentBookingData", JSON.stringify(data));
            
            // Redirect to payment page
            router.push(`/events/payment?booking_id=${data.id}`);
        } else {
            // Handle API errors (e.g., insufficient seats)
            alert(`Registration failed: ${data.error || JSON.stringify(data)}`);
            setErrors(data.errors || {}); // Set errors from API response if available
        }
    } catch (error) {
        console.error("Submission error:", error);
        alert("An error occurred during registration. Please try again.");
    } finally {
        setLoadingSubmit(false);
    }
  };

  if (loadingEvent) {
    return <div className="min-h-screen flex items-center justify-center">Loading registration form...</div>;
  }
  
  if (!eventDetails) {
    return <div className="min-h-screen flex items-center justify-center">Event details missing or invalid.</div>;
  }
  
  const totalAmount = eventDetails.ticket_price * parseInt(formData.tickets.split(" ")[0]);
  
  return (
    <div className="min-h-screen bg-gray-50 px-8 py-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <Link href={`/events/${eventDetails.id}`} className="text-sm text-gray-600 hover:text-blue-600">
          ← Back to Event
        </Link>
        <h1 className="font-semibold text-lg text-indigo-600">Eventra</h1>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Event Summary</h2>
          <div className="flex gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex justify-center items-center">🎬</div>
            <div>
              <p className="font-medium">{eventDetails.title}</p>
              <p className="text-xs text-gray-500">{eventDetails.organizer}</p>
            </div>
          </div>
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} /> {eventDetails.event_time} on {eventDetails.event_date}
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin size={14} /> {eventDetails.venue}
          </p>
          <p className="mt-3 font-semibold">Total Amount: ₹{totalAmount}</p>

          <div className="mt-6 bg-gray-50 p-3 rounded-md text-sm text-gray-600">
            <p>• Please arrive 15 minutes early.</p>
            <p>• Bring your student ID card.</p>
            <p>• Confirmation will be sent via email.</p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Registration Details</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium">Full Name *</label>
              <div className="flex items-center gap-2 border rounded-md px-3 py-2 mt-1">
                <User size={14} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full outline-none text-sm"
                  required
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Roll & Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Roll Number *</label>
                <input
                  type="text"
                  placeholder="e.g., 21CS001"
                  name="roll_number" // Changed to match Django model
                  value={formData.roll_number}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full text-sm"
                  required
                />
                {errors.roll_number && (
                  <p className="text-xs text-red-500 mt-1">{errors.roll_number}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Section *</label>
                <input
                  type="text"
                  placeholder="e.g., A"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full text-sm"
                  required
                />
                {errors.section && (
                  <p className="text-xs text-red-500 mt-1">{errors.section}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium">Email Address *</label>
              <div className="flex items-center gap-2 border rounded-md px-3 py-2 mt-1">
                <Mail size={14} className="text-gray-500" />
                <input
                  type="email"
                  placeholder="your.email@college.edu"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full outline-none text-sm"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium">Phone Number *</label>
              <div className="flex items-center gap-2 border rounded-md px-3 py-2 mt-1">
                <Phone size={14} className="text-gray-500" />
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full outline-none text-sm"
                  required
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Timing & Tickets */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Select Timing *</label>
                <select
                  name="timing"
                  value={formData.timing}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full text-sm"
                  required
                >
                  {/* Dynamically populate based on event details if available */}
                  <option value={eventDetails.event_time}>
                    {eventDetails.event_time.slice(0, 5)}
                  </option>
                  {/* Hardcoded second option for demonstration, remove if not needed */}
                  {eventDetails.event_type === 'movie' && <option>9:30 PM</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Tickets *</label>
                <select
                  name="tickets"
                  value={formData.tickets}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full text-sm"
                  required
                >
                  <option>1 ticket</option>
                  <option>2 tickets</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 mt-2 disabled:bg-gray-500"
              disabled={loadingSubmit}
            >
              {loadingSubmit ? "Initiating Booking..." : "Proceed to Payment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}