// Eventra-New/frontend/eventra-frontend/src/components/Events/EventCard.js (Change this file)

import React from "react";
import Link from "next/link";

const EventCard = ({ event }) => {
  // Use event.event_type from Django for the internal logic, and event.category for display
  const eventType = event.event_type || event.category; 

  return (
    <Link
      // 🚨 IMPORTANT: Use the unique event ID for the URL, matching [id].js
      href={`/events/${event.id}`} 
      className="block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition duration-200"
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full
            ${eventType === 'movie' ? 'bg-purple-100 text-purple-600' :
              eventType === 'workshop' ? 'bg-blue-100 text-blue-600' :
              eventType === 'conference' ? 'bg-green-100 text-green-600' : // e.g. Conference as Screening
              'bg-orange-100 text-orange-600'}`}>
            {event.category}
          </span>
          {/* Rating is null in Django model, so it won't render */}
          {event.rating && ( 
            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
              ⭐ {event.rating}
            </span>
          )}
        </div>

        {/* Image placeholder */}
        <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
          <p>Image</p>
        </div>

        {/* Event info */}
        <h3 className="text-lg font-semibold text-gray-800 mt-2">{event.title}</h3>
        {event.subtitle && (
          <p className="text-sm text-gray-500">{event.subtitle}</p>
        )}
        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span>📍 {event.location || event.venue}</span>
          <span>⏱ {event.duration || event.event_time}</span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;