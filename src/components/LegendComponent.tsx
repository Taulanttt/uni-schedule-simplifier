import React from "react";

const LegendComponent: React.FC = () => {
  return (
    <div className="mb-6 flex items-center gap-6">
      <h3 className="text-lg font-semibold">Legend</h3>

      {/* Ligjerata */}
      <div className="flex items-center">
        <div className="w-4 h-4 bg-purple-50 border border-purple-200 rounded mr-2"></div>
        <span className="text-purple-700">Ligjerata</span>
      </div>

      {/* Ushtrime */}
      <div className="flex items-center">
        <div className="w-4 h-4 bg-green-50 border border-green-200 rounded mr-2"></div>
        <span className="text-green-700">Ushtrime</span>
      </div>

      {/* Provime */}
      <div className="flex items-center">
        <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-2"></div>
        <span className="text-blue-700">Provime</span>
      </div>
    </div>
  );
};

export default LegendComponent;
