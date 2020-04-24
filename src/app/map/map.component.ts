import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { LineLayout, LinePaint, Map } from 'mapbox-gl';
import * as turf from '@turf/turf';
import { ActivityService } from '../services/activity.service';
import { CapTechOfficeCoord } from '../models/capTechOfficeCoord';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  /** CapTech Offices */
  captechOffices: CapTechOfficeCoord = new CapTechOfficeCoord();

  map: Map; // mapbox-gl reference
  line;

  // styling for progress line drawn, used in html
  paint: LinePaint = {
    'line-color': '#888',
    'line-width': 4
  };
  layout: LineLayout = {
    'line-cap': 'round',
    'line-join': 'bevel'
  };

  // private timer: number;

  constructor(private activityService: ActivityService) {
  }

  ngOnInit(): void {
  }

  setMap(event): void {
    this.map = event;

    this.map.fitBounds(new mapboxgl.LngLatBounds(this.captechOffices.den, this.captechOffices.phi), {padding: 50});

    this.drawMarkers();
    this.findDistance();
  }

  drawMarkers(): void {
    Object.keys(this.captechOffices).forEach(key => {
      const marker = document.createElement('div');
      marker.className = 'marker';
      marker.id = key;
      new mapboxgl.Marker(marker).setLngLat(this.captechOffices[key]).addTo(this.map);
    });
  }

  findDistance(type = 'totalMiles') {
    // provides the ability to change the starting point of the route to the selected office
    // todo add logic to allow for a selected 'starting' office
    const selectedRoute = this.captechOffices.getDefaultRoute();

    const totalOfficePerimeter = turf.length(selectedRoute, {units: 'miles'});
    this.activityService.getTotalMiles().subscribe(miles => {
      let milesTraveled = miles[type];

      const startOfRoute: [number, number] = selectedRoute.geometry.coordinates[0] as [number, number];
      const coord: [number, number][] = [startOfRoute];

      while (milesTraveled >= 0) {
        const traveledCoordinates = turf.lineSliceAlong(
          selectedRoute,
          0,
          milesTraveled > totalOfficePerimeter ? totalOfficePerimeter : milesTraveled,
          {units: 'miles'});

        traveledCoordinates.geometry.coordinates.forEach(coordinate => coord.push([coordinate[0], coordinate[1]]));
        milesTraveled = milesTraveled - totalOfficePerimeter;
      }

      const temp = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coord
            }
          }]
      };

      this.drawLine(temp);
    });
  }

  /**
   * todo animate the line when drawn
   * Takes a GeoJson feature object and draws it onto the map.
   * @param geoJson feature consisting of one LineString
   */
  private drawLine(geoJson): void {
    this.line = geoJson;

    // todo "animation" but very choppy needs to be fixed
    // const temp = geoJson;
    // const coordinates = temp.features[0].geometry.coordinates;
    // temp.features[0].geometry.coordinates = [coordinates[0]];
    // this.line = temp;
    // let i = 0;
    // this.timer = window.setInterval(() => {
    //   if (i < coordinates.length) {
    //     temp.features[0].geometry.coordinates.push(coordinates[i]);
    //     this.line = {...temp};
    //     i++;
    //   } else {
    //     window.clearInterval(this.timer);
    //   }
    // }, 300);
  }
}
