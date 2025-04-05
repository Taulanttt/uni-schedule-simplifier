// src/types/index.ts

//
// 1) The possible event types
//
export type ScheduleEventType = 'lecture' | 'lab' | 'office' | 'exam';

//
// 2) The schedule event interface your DayView & WeekView might expect
//
export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  type: ScheduleEventType;
  instructor?: string;
  daysOfWeek?: string[];
  academicYear?: string;
  semester?: string;
  yearOfStudy?: string;
}

//
// 3) The shape returned by /schedules
//    (for reference; your code might differ)
export interface ScheduleItem {
  id: string;
  eventType: string;
  academicYear: string;
  studyYear: number;
  semesterName?: string;
  daysOfWeek?: string[];
  startTime?: string;
  endTime?: string;
  locationName?: string;
  instructorName?: string;
  subjectName?: string;
}

//
// 4) FilterOptions (for schedules?):
//
export interface FilterOptions {
  academicYear: string;
  semester: string;
  yearOfStudy: string;
}

//
// 5) FilterOptionsexam (for exam filtering):
//
export interface FilterOptionsexam {
  academicYear: string; // "2024/25" or "All Years"
  afati: string;        // e.g. "February" or "All Afati"
  yearOfStudy: string;  // e.g. "Year 1" or "All Years"
}
