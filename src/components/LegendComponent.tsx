
import React from 'react';

const LegendComponent: React.FC = () => {
  return (
    <div className="mt-6 mb-4">
      <h3 className="text-lg font-semibold mb-2">Legend</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-purple-50 border border-purple-200 rounded mr-2"></div>
          <span className="text-purple-700">Lecture</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded mr-2"></div>
          <span className="text-green-700">Lab</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-2"></div>
          <span className="text-blue-700">Office Hours</span>
        </div>
      </div>
    </div>
  );
};

export default LegendComponent;
