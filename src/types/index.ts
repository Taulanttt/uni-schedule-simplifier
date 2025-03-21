export type ScheduleEventType = 'lecture' | 'lab' | 'office' | 'exam'; // added exam

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  type: ScheduleEventType;
  day?: number; // 0-6 for Sunday-Saturday

  // Optional fields for filtering
  date?:string;
  academicYear?: string;
  semester?: string;
  yearOfStudy?: string;
}
export interface FilterOptions {
  academicYear: string;
  semester: string;
  yearOfStudy: string;
}