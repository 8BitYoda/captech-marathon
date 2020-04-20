import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Map } from 'mapbox-gl';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  /** CapTech Offices */
  readonly captechOffices: CapTechOfficeCord = {
    atl: [-84.386015, 33.771060],
    clt: [-80.845750, 35.225759],
    rva: [-77.527264, 37.605657],
    dc: [-77.350846, 38.952584],
    phi: [-75.413489, 40.079056],
    cmh: [-82.997026, 39.959019], // columbus, oh
    chi: [-87.636008, 41.879860],
    den: [-104.990875, 39.749686]
  };

  map: Map;

  drawLine;

  data = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            this.captechOffices.den,
            this.captechOffices.atl,
            this.captechOffices.clt,
            this.captechOffices.rva,
            this.captechOffices.dc,
            this.captechOffices.phi,
            this.captechOffices.cmh,
            this.captechOffices.chi,
            this.captechOffices.den
          ]
        }
      }
    ]
  };

  paint = {
    'line-color': '#888',
    'line-width': 4
  };

  private timer: number;

  constructor() {
  }

  ngOnInit(): void {
  }

  setMap(event): void {
    this.map = event;

    this.map.fitBounds(new mapboxgl.LngLatBounds(this.captechOffices.den, this.captechOffices.phi), {padding: 50});

    Object.keys(this.captechOffices).forEach(key => {
      const marker = document.createElement('div');
      marker.className = 'marker';
      marker.id = key;
      new mapboxgl.Marker(marker).setLngLat(this.captechOffices[key]).addTo(this.map);
    });

    const temp = this.data;
    const coordinates = temp.features[0].geometry.coordinates;
    temp.features[0].geometry.coordinates = [coordinates[0]];
    this.drawLine = temp;
    let i = 0;
    this.timer = window.setInterval(() => {
      if (i < coordinates.length) {
        temp.features[0].geometry.coordinates.push(coordinates[i]);
        this.drawLine = {...temp};
        i++;
      } else {
        window.clearInterval(this.timer);
      }
    }, 300);
  }
}

export interface CapTechOfficeCord {
  clt: [number, number];
  atl: [number, number];
  rva: [number, number];
  dc: [number, number];
  chi: [number, number];
  phi: [number, number];
  cmh: [number, number];
  den: [number, number];
}
