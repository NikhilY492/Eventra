// Eventra-New/frontend/eventra-frontend/src/pages/index.js (Change this file)

import React, { useState, useEffect } from 'react'; // Import useEffect
import Layout from '../components/Layout/Layout';
import SearchBar from '../components/Common/SearchBar';
import FilterButton from '../components/Events/FilterButton';
import EventCard from '../components/Events/EventCard';
import { Film, Wrench, Tv, Palette, BookOpen, Briefcase, Trophy } from 'lucide-react';

// Base URL for the Django API
const API_BASE_URL = "http://localhost:8000/api";

const HomePage = () => {
  const [activeFilter, setActiveFilter] = useState('All Events');
  const [events, setEvents] = useState([]); // Use state for events
  const [loading, setLoading] = useState(true);

  // Map Django backend event_type to frontend labels/filters
  const DJANGO_EVENT_TYPES = {
    'movie': 'Movies',
    'workshop': 'Workshops',
    'seminar': 'Seminars',
    'conference': 'Screenings', // Mapping 'conference' to 'Screenings'
    'other': 'Culturals', // Mapping 'other' to 'Culturals' (assuming)
    // You'll need to decide on mappings for 'Academics' and 'Competitions'
  };

  const filters = [
    { icon: null, label: 'All Events' },
    { icon: <Film size={18} />, label: 'Movies' },
    { icon: <Wrench size={18} />, label: 'Workshops' },
    { icon: <Tv size={18} />, label: 'Screenings' },
    { icon: <Palette size={18} />, label: 'Culturals' },
    { icon: <BookOpen size={18} />, label: 'Academics' },
    { icon: <Briefcase size={18} />, label: 'Seminars' },
    { icon: <Trophy size={18} />, label: 'Competitions' }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/events/`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        // Map Django data fields to frontend expected fields (title -> title, event_type -> category)
        const formattedEvents = data.map(event => ({
            ...event,
            category: DJANGO_EVENT_TYPES[event.event_type] || event.event_type, // Use mapped value or raw type
            location: event.venue, // Map venue to location
            duration: 'N/A', // Duration is missing in Django model, using placeholder
            description: event.description,
            // Rating is missing, so it will be undefined in the card
        }));
        setEvents(formattedEvents);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
        // Fallback to mock data or display error
        setEvents([]); 
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => 
    activeFilter === 'All Events' || event.category === activeFilter
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ... (Search Bar and Filter Buttons remain the same) */}
        
        {/* Event Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <p className="text-gray-500">Loading events...</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-gray-500">No events found in this category.</p>
          ) : (
            filteredEvents.map((event) => (
              // Pass the full event object which now includes the Django ID
              <EventCard key={event.id} event={event} /> 
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;