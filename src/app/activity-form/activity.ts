/** Object that contains user's information as well as the activities being entered */
export interface ActivityLog {
  /** User first name */
  firstName: string;
  /** User last name */
  lastName: string;
  /** User's home office */
  office: CTOffices;
  /** List of {@link Activity}s being entered by the user */
  activities: Activity[];
}

/** Object representing activity information */
export interface Activity {
  /** Distance of activity */
  distance: number;
  /** Indicates what kind of activity is being entered */
  activityType: ActivityType;
  /** Date of activity */
  date: string;
}

/** Supported activity types */
export enum ActivityType {
  Bike = 'BIKE',
  Run = 'RUN',
  Walk = 'Walk'
}

/** Valid CapTech offices */
export enum CTOffices {
  Atlanta = 'ATLANTA',
  Charlotte = 'Charlotte',
  Chicago = 'CHICAGO',
  Columbus = 'COLUMBUS',
  DC = 'DC',
  Denver = 'DENVER',
  Philadelphia = 'PHILADELPHIA',
  Richmond = 'RICHMOND'
}
