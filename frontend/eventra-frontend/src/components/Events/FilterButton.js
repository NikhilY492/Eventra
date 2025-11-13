import React from 'react';

const FilterButton = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
        active
          ? 'bg-gray-900 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export default FilterButton;