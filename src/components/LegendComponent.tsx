
import React from 'react';

const LegendComponent: React.FC = () => {
  return (
    <div className="mt-6 mb-4">
      <h3 className="text-lg font-semibold mb-2">Legend</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-lecture rounded mr-2 border border-purple-200"></div>
          <span>Lecture</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-lab rounded mr-2 border border-green-200"></div>
          <span>Lab</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-office rounded mr-2 border border-orange-200"></div>
          <span>Office Hours</span>
        </div>
      </div>
    </div>
  );
};

export default LegendComponent;
