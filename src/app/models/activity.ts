import { firestore } from 'firebase/app';
import FieldValue = firestore.FieldValue;

/** Object that contains user's information as well as the activities being entered */
export interface NewUserLog {
  /** User first name */
  firstName: string;
  /** User last name */
  lastName: string;
  /** User's home office */
  office: CTOffices;
  /** Running total of users miles biked */
  totalBikeMiles?: number;
  /** Running total of users miles ran */
  totalRunMiles?: number;
  /** Running total of users miles walked */
  totalWalkMiles?: number;
  /** List of {@link Activity}s being entered by the user */
  activities: Activity[];
}

export interface ExistingUserLog {
  /** Running total of users miles biked */
  totalBikeMiles?: FieldValue;
  /** Running total of users miles ran */
  totalRunMiles?: FieldValue;
  /** Running total of users miles walked */
  totalWalkMiles?: FieldValue;
  /** List of {@link Activity}s being entered by the user */
  activities: FieldValue;
}

/** Object representing activity information entered by user */
export interface Activity {
  /** Distance of activity */
  distance: number;
  /** Indicates what kind of activity is being entered */
  type: ActivityType;
  /** Date of activity */
  date: string;
}

/** Supported activity types */
export enum ActivityType {
  BIKE = 'Bike',
  RUN = 'Run',
  WALK = 'Walk',
  ALL = 'All'
}

/** Valid CapTech offices */
export enum CTOffices {
  ATLANTA = 'Atlanta',
  CHARLOTTE = 'Charlotte',
  CHICAGO = 'Chicago',
  COLUMBUS = 'Columbus',
  DC = 'DC',
  DENVER = 'Denver',
  PHILADELPHIA = 'Philadelphia',
  RICHMOND = 'Richmond'
}
