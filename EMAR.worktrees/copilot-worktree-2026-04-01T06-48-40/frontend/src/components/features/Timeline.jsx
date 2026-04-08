import React from 'react';

const Timeline = ({ events = [] }) => {
  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-8">
        {events.map((event, index) => (
          <div key={index} className="relative">
            <div className="flex items-center">
              <div className="z-10 w-8 h-8 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{event.icon || '●'}</span>
              </div>
            </div>
            <div className="ml-12">
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                  <span className="text-sm text-gray-500">{event.date}</span>
                </div>
                <p className="text-gray-700 mb-3">{event.description}</p>
                {event.doctor && (
                  <div className="text-xs text-gray-500">
                    👨‍⚕️ Dr. {event.doctor} • 🏥 {event.hospital}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
