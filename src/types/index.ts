
export type ScheduleEventType = 'lecture' | 'lab' | 'office';

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  type: ScheduleEventType;
  day: number; // 0-6 for Sunday-Saturday
}

export interface FilterOptions {
  academicYear: string;
  semester: string;
  yearOfStudy: string;
}
