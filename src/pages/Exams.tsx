
import React from 'react';

const Exams: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Exams Schedule</h1>
      <p className="text-lg">Your upcoming exams will be displayed here.</p>
      
      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-xl font-semibold text-yellow-800 mb-4">No Upcoming Exams</h2>
        <p className="text-yellow-700">
          You don't have any exams scheduled at the moment. When exams are scheduled, they will appear here.
        </p>
      </div>
    </div>
  );
};

export default Exams;
