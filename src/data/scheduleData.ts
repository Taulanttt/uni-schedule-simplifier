// @/data/scheduleData.ts

import { ScheduleEvent } from '@/types';

export const scheduleData: ScheduleEvent[] = [
  {
    id: '1',
    title: 'CS 101: Intro to Programming',
    time: '09:00',
    location: 'Science Building, Room 301',
    type: 'lecture',
    day: 1, // Monday
    instructor: 'Dr. Smith',
  },
  {
    id: '2',
    title: 'CS 201: Data Structures',
    time: '10:00',
    location: 'Science Building, Room 302',
    type: 'lecture',
    day: 1, // Monday
    instructor: 'Dr. Johnson',
  },
  {
    id: '3',
    title: 'MATH 201: Calculus II',
    time: '11:00',
    location: 'Math Building, Room 205',
    type: 'lecture',
    day: 1, // Monday
    instructor: 'Prof. Allen',
  },
  {
    id: '4',
    title: 'MATH 301: Linear Algebra',
    time: '13:00',
    location: 'Math Building, Room 206',
    type: 'lecture',
    day: 1, // Monday
    instructor: 'Prof. Allen',
  },
  {
    id: '5',
    title: 'PHYS 150: Physics I',
    time: '13:00',
    location: 'Science Building, Room 201',
    type: 'lecture',
    day: 2, // Tuesday
    instructor: 'Dr. Carter',
  },
  {
    id: '6',
    title: 'Office Hours - Dr. Smith',
    time: '15:00',
    location: 'Faculty Building, Room 405',
    type: 'office',
    day: 2, // Tuesday
    instructor: 'Dr. Smith',
  },
  {
    id: '7',
    title: 'CS 101: Intro to Programming',
    time: '09:00',
    location: 'Science Building, Room 301',
    type: 'lecture',
    day: 3, // Wednesday
    instructor: 'Dr. Smith',
  },
  {
    id: '8',
    title: 'CS 201: Data Structures',
    time: '10:00',
    location: 'Science Building, Room 302',
    type: 'lecture',
    day: 3, // Wednesday
    instructor: 'Dr. Johnson',
  },
  {
    id: '9',
    title: 'MATH 201: Calculus II',
    time: '11:00',
    location: 'Math Building, Room 205',
    type: 'lecture',
    day: 3, // Wednesday
    instructor: 'Prof. Allen',
  },
  {
    id: '10',
    title: 'MATH 301: Linear Algebra',
    time: '13:00',
    location: 'Math Building, Room 206',
    type: 'lecture',
    day: 3, // Wednesday
    instructor: 'Prof. Allen',
  },
  {
    id: '11',
    title: 'PHYS 150: Physics I',
    time: '13:00',
    location: 'Science Building, Room 201',
    type: 'lecture',
    day: 4, // Thursday
    instructor: 'Dr. Carter',
  },
  {
    id: '12',
    title: 'CS 101: Programming Lab',
    time: '14:00',
    location: 'Computer Lab, Room 105',
    type: 'lab',
    day: 4, // Thursday
    instructor: 'Dr. Smith',
  },
  {
    id: '13',
    title: 'CS 201: Data Structures Lab',
    time: '14:00',
    location: 'Computer Lab, Room 106',
    type: 'lab',
    day: 4, // Thursday
    instructor: 'Dr. Johnson',
  },
  {
    id: '14',
    title: 'PHYS 150: Physics Lab',
    time: '10:00',
    location: 'Physics Lab, Room 110',
    type: 'lab',
    day: 5, // Friday
    instructor: 'Dr. Carter',
  },
  {
    id: '15',
    title: 'MATH 201: Calculus II',
    time: '11:00',
    location: 'Math Building, Room 205',
    type: 'lecture',
    day: 5, // Friday
    instructor: 'Prof. Allen',
  },
  {
    id: '16',
    title: 'MATH 301: Linear Algebra',
    time: '13:00',
    location: 'Math Building, Room 206',
    type: 'lecture',
    day: 5, // Friday
    instructor: 'Prof. Allen',
  },
];

export const academicYears = ["2023/24", "2024/25", "2025/26"];
export const semesters = ["All Semesters", "Fall", "Spring", "Summer"];
export const yearsOfStudy = ["All Years", "Year 1", "Year 2", "Year 3", "Year 4"];

/**
 * For now, getFilteredSchedule just returns the full dataset.
 * In a real app, you would filter based on academicYear, semester, yearOfStudy, etc.
 */
export function getFilteredSchedule(
  data: ScheduleEvent[],
  academicYear: string,
  semester: string,
  yearOfStudy: string
): ScheduleEvent[] {
  // Return all data for this example
  return data;
}
