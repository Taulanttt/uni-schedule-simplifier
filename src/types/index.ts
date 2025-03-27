// types.ts

//
// 1) The possible event types
//
export type ScheduleEventType = 'lecture' | 'lab' | 'office' | 'exam';

//
// 2) The schedule event interface your DayView & WeekView expect
//
export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  type: ScheduleEventType;
  instructor?: string;        // e.g. "Dr. Thompson"
  daysOfWeek?: string[];      // e.g. ['Monday','Wednesday']

  // optional fields if needed
  academicYear?: string;      // e.g. "2024/25"
  semester?: string;          // e.g. "Fall"
  yearOfStudy?: string;       // or number 
}

//
// 3) Filter options for your filter panel
//
export interface FilterOptions {
  academicYear: string;
  semester: string;
  yearOfStudy: string;
}

// The shape returned by /schedules
export interface ScheduleItem {
  id: string;
  eventType: string;       // e.g. "exam group1"
  academicYear: string;
  studyYear: number;
  semesterName?: string;
  daysOfWeek?: string[];
  startTime?: string;      // e.g. "09:00:00"
  endTime?: string;        // e.g. "10:30:00"
  locationName?: string;   // e.g. "Room 205"
  instructorName?: string; // e.g. "Prof. John"
  subjectName?: string; 
  // Add anything else from your backend
}