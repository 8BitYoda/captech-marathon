import * as turf from '@turf/turf';

export class CapTechOfficeCoord {
  atl: [number, number];
  clt: [number, number];
  rva: [number, number];
  dc: [number, number];
  phi: [number, number];
  cmh: [number, number]; // columbus, oh
  chi: [number, number];
  den: [number, number];

  constructor() {
    this.atl = [-84.386015, 33.771060];
    this.clt = [-80.845750, 35.225759];
    this.rva = [-77.527264, 37.605657];
    this.dc = [-77.350846, 38.952584];
    this.phi = [-75.413489, 40.079056];
    this.cmh = [-82.997026, 39.959019];
    this.chi = [-87.636008, 41.879860];
    this.den = [-104.990875, 39.749686];
  }

  getDefaultRoute() {
    return turf.lineString([
      this.rva,
      this.dc,
      this.phi,
      this.cmh,
      this.chi,
      this.den,
      this.atl,
      this.clt,
      this.rva,
    ]);
  }
}
