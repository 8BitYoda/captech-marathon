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
  readonly captechOffices = {
    clt: [-80.845750, 35.225759],
    atl: [-84.386015, 33.771060],
    rva: [-77.527264, 37.605657],
    dc: [-77.350846, 38.952584],
    chi: [-87.636008, 41.879860],
    phi: [-75.413489, 40.079056],
    cmh: [-82.997026, 39.959019], // columbus, oh
    den: [-104.990875, 39.749686]
  };

  map: Map;

  constructor() {
  }

  ngOnInit(): void {
  }

  setMap(event): void {
    this.map = event;

    this.map.fitBounds(new mapboxgl.LngLatBounds([this.captechOffices.den[0], this.captechOffices.den[1]], [this.captechOffices.phi[0], this.captechOffices.phi[1]]), {padding: 50});

    Object.keys(this.captechOffices).forEach(key => {
      const marker = document.createElement('div');
      marker.className = 'marker';
      marker.id = key;
      new mapboxgl.Marker(marker).setLngLat([this.captechOffices[key][0], this.captechOffices[key][1]]).addTo(this.map);
    });
  }

}
