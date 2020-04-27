import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { LineLayout, LinePaint, Map, SymbolLayout } from 'mapbox-gl';
import * as turf from '@turf/turf';
import { ActivityService } from '../services/activity.service';
import { CapTechOfficeCoord } from '../models/capTechOfficeCoord';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  readonly frameRate = 500;

  /** CapTech Offices */
  captechOffices: CapTechOfficeCoord = new CapTechOfficeCoord();

  map: Map; // mapbox-gl reference
  line;
  point;

  // styling for progress line drawn, used in html
  linePaint: LinePaint = {
    'line-color': '#888',
    'line-width': 4
  };
  lineLayout: LineLayout = {
    'line-cap': 'round',
    'line-join': 'bevel'
  };
  pointLayout: SymbolLayout = {
    'icon-image': 'fire-station-15',
    'icon-rotate': ['get', 'bearing'],
    'icon-rotation-alignment': 'map',
    'icon-allow-overlap': true,
    'icon-ignore-placement': true
  };

  /**
   * Number of steps to use in the arc and animation, more steps means
   * a smoother arc and animation, but too many steps will result in a
   * low frame rate
   */
  private steps = 0;
  /** Used to track the current frame when drawing the route on map. */
  private counter = 0;

  /** coordinates calculated from total distance along the selected route line */
  private lineData;
  private calculatedCoords = [];

  constructor(private activityService: ActivityService) {
  }

  ngOnInit(): void {
  }

  setMap(event): void {
    this.map = event;

    this.map.fitBounds(new mapboxgl.LngLatBounds(this.captechOffices.den, this.captechOffices.phi), {padding: 50});

    this.drawOfficeMarkers();
    this.findDistance();
  }

  private drawOfficeMarkers(): void {
    Object.keys(this.captechOffices).forEach(key => {
      const marker = document.createElement('div');
      marker.className = 'marker';
      marker.id = key;
      new mapboxgl.Marker(marker).setLngLat(this.captechOffices[key]).addTo(this.map);
    });
  }

  private findDistance(type = 'totalMiles') {
    // provides the ability to change the starting point of the route to the selected office
    // todo add logic to allow for a selected 'starting' office
    const selectedRoute = this.captechOffices.getDefaultRoute();
    const startOfRoute: [number, number] = selectedRoute.geometry.coordinates[0] as [number, number];
    const totalOfficePerimeter = Math.ceil(turf.length(selectedRoute, {units: 'miles'}));

    this.activityService.getTotalMiles().subscribe(miles => {
      let milesTraveled = miles[type];
      const derivedCoords = []; // coordinates derived from milesTraveled along selectedRoute
      let loopsMade = 0; // tracks how many loops around selectedRoute
      let partialLoopSteps = 0; // tracks number of steps scaled down to remainder distance

      while (milesTraveled >= 0) {
        if (milesTraveled > totalOfficePerimeter) {
          for (let i = 0; i < totalOfficePerimeter; i += totalOfficePerimeter / this.frameRate) {
            derivedCoords.push(turf.along(selectedRoute, i, {units: 'miles'}).geometry.coordinates);
          }
          loopsMade++;
        } else {
          partialLoopSteps = Math.ceil(milesTraveled / Math.ceil(totalOfficePerimeter / this.frameRate));
          for (let i = 0; i < milesTraveled; i += milesTraveled / partialLoopSteps) {
            derivedCoords.push(turf.along(selectedRoute, i, {units: 'miles'}).geometry.coordinates);
          }
        }

        milesTraveled -= totalOfficePerimeter;
      }

      this.lineData = derivedCoords;
      this.steps = partialLoopSteps + (this.frameRate * loopsMade);
      this.drawCompletedRoute(startOfRoute);
    });
  }

  private drawCompletedRoute(startOfRoute): void {
    // setup initial states for the point and line
    this.point = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: startOfRoute
          }
        }
      ]
    };
    this.line = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [startOfRoute]
          }
        }]
    };

    this.myAnimator();
  }

  /**
   * Animates the drawing of both the line and point onto the map
   * by iterating through the coordinates stored in {@link calculatedCoords}.
   */
  private myAnimator() {
    // append new coordinates to the lineString
    this.calculatedCoords.push(this.lineData[this.counter]);

    // then update the map
    this.line = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: this.calculatedCoords
          }
        }]
    };

    // Update the source with new point coordinates.
    this.point = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: this.calculatedCoords[this.counter]
          }
        }
      ]
    };

    this.counter += 1;

    // Request the next frame of animation so long the end has not been reached.
    if (this.counter < this.steps) {
      requestAnimationFrame(this.myAnimator.bind(this));
    }
  }
}
