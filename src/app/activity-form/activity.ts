export interface Activity {
  distance: number;
  activityType: ActivityType;
  firstName: string;
  lastName: string;
  office: CTOffices;
  date: string;
}

export enum ActivityType {
  Bike = 'BIKE',
  Run = 'RUN',
  Walk = 'Walk'
}

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
