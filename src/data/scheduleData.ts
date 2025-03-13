
import { ScheduleEvent } from '@/types';

export const scheduleData: ScheduleEvent[] = [
  {
    id: '1',
    title: 'CS 101: Intro to Programming',
    time: '09:00',
    location: 'Science Building, Room 301',
    type: 'lecture',
    day: 1, // Monday
  },
  {
    id: '2',
    title: 'CS 201: Data Structures',
    time: '10:00',
    location: 'Science Building, Room 302',
    type: 'lecture',
    day: 1, // Monday
  },
  {
    id: '3',
    title: 'MATH 201: Calculus II',
    time: '11:00',
    location: 'Math Building, Room 205',
    type: 'lecture',
    day: 1, // Monday
  },
  {
    id: '4',
    title: 'MATH 301: Linear Algebra',
    time: '13:00',
    location: 'Math Building, Room 206',
    type: 'lecture',
    day: 1, // Monday
  },
  {
    id: '5',
    title: 'PHYS 150: Physics I',
    time: '13:00',
    location: 'Science Building, Room 201',
    type: 'lecture',
    day: 2, // Tuesday
  },
  {
    id: '6',
    title: 'Office Hours - Dr. Smith',
    time: '15:00',
    location: 'Faculty Building, Room 405',
    type: 'office',
    day: 2, // Tuesday
  },
  {
    id: '7',
    title: 'CS 101: Intro to Programming',
    time: '09:00',
    location: 'Science Building, Room 301',
    type: 'lecture',
    day: 3, // Wednesday
  },
  {
    id: '8',
    title: 'CS 201: Data Structures',
    time: '10:00',
    location: 'Science Building, Room 302',
    type: 'lecture',
    day: 3, // Wednesday
  },
  {
    id: '9',
    title: 'MATH 201: Calculus II',
    time: '11:00',
    location: 'Math Building, Room 205',
    type: 'lecture',
    day: 3, // Wednesday
  },
  {
    id: '10',
    title: 'MATH 301: Linear Algebra',
    time: '13:00',
    location: 'Math Building, Room 206',
    type: 'lecture',
    day: 3, // Wednesday
  },
  {
    id: '11',
    title: 'PHYS 150: Physics I',
    time: '13:00',
    location: 'Science Building, Room 201',
    type: 'lecture',
    day: 4, // Thursday
  },
  {
    id: '12',
    title: 'CS 101: Programming Lab',
    time: '14:00',
    location: 'Computer Lab, Room 105',
    type: 'lab',
    day: 4, // Thursday
  },
  {
    id: '13',
    title: 'CS 201: Data Structures Lab',
    time: '14:00',
    location: 'Computer Lab, Room 106',
    type: 'lab',
    day: 4, // Thursday
  },
  {
    id: '14',
    title: 'PHYS 150: Physics Lab',
    time: '10:00',
    location: 'Physics Lab, Room 110',
    type: 'lab',
    day: 5, // Friday
  },
  {
    id: '15',
    title: 'MATH 201: Calculus II',
    time: '11:00',
    location: 'Math Building, Room 205',
    type: 'lecture',
    day: 5, // Friday
  },
  {
    id: '16',
    title: 'MATH 301: Linear Algebra',
    time: '13:00',
    location: 'Math Building, Room 206',
    type: 'lecture',
    day: 5, // Friday
  },
];

export const academicYears = ["2023/24", "2024/25", "2025/26"];
export const semesters = ["All Semesters", "Fall", "Spring", "Summer"];
export const yearsOfStudy = ["All Years", "Year 1", "Year 2", "Year 3", "Year 4"];

export function getFilteredSchedule(
  data: ScheduleEvent[],
  academicYear: string,
  semester: string,
  yearOfStudy: string
): ScheduleEvent[] {
  // In a real app, this would filter based on the criteria
  // For demo purposes, we'll return all data
  return data;
}
