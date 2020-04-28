import * as mapboxgl from 'mapbox-gl';
import { CapTechOfficeCoord } from '../models/capTechOfficeCoord';

export class RecenterControl {
  private map;
  private container;
  private captechOffices: CapTechOfficeCoord = new CapTechOfficeCoord();

  onAdd(map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    const button = document.createElement('button');
    button.className = 'mapboxgl-ctrl-geolocate';
    button.type = 'button';
    button.onclick = () => this.map.fitBounds(new mapboxgl.LngLatBounds(this.captechOffices.den, this.captechOffices.phi), {padding: 50});

    const control = document.createElement('span');
    control.className = 'mapboxgl-ctrl-icon';
    button.appendChild(control);

    this.container.appendChild(button);
    return this.container;
  }

  onRemove() {
  }
}
