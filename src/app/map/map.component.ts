import { Component } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { LineLayout, LinePaint, Map, SymbolLayout } from 'mapbox-gl';
import * as turf from '@turf/turf';
import { ActivityService } from '../services/activity.service';
import { CapTechOfficeCoord } from '../models/capTechOfficeCoord';
import { RecenterControl } from './recenter-control';
import { SelectedOfficeActivityService } from '../services/selected-office-activity.service';
import { ActivityType, CTOffices } from '../models/activity';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  /**
   * Number of steps to use in the arc and animation, more steps means
   * a smoother arc and animation, but too many steps will result in a
   * low frame rate
   */
  readonly frameRate = 500;

  /** Bounds of the map to prevent being able to pan away from the lower 49 states. */
  readonly usaNE: [number, number] = [-64.677098, 50.606017];
  readonly usaSW: [number, number] = [-126.70728, 23.745919];
  readonly mapBounds = new mapboxgl.LngLatBounds(this.usaSW, this.usaNE);

  map: Map; // mapbox-gl reference
  line;
  point;

  // styling for completed route line, used in html
  linePaint: LinePaint = {
    'line-color': '#888',
    'line-width': 4
  };
  lineLayout: LineLayout = {
    'line-cap': 'round',
    'line-join': 'bevel'
  };

  // styling for the completed route lead point, used in html
  pointLayout: SymbolLayout = {
    'icon-image': 'fire-station-15',
    'icon-rotate': ['get', 'bearing'],
    'icon-rotation-alignment': 'map',
    'icon-allow-overlap': true,
    'icon-ignore-placement': true
  };

  /** calculated steps needed to complete the drawing of the route. */
  private steps = 0;
  /** Used to track the current frame when drawing the route on map. */
  private counter = 0;
  /** coordinates to be drawn during animation of line/point on map. */
  private drawnRouteCoords = [];
  /** holds reference to the animation so it can be stopped */
  private animation;

  /** CapTech Offices */
  private captechOffices: CapTechOfficeCoord = new CapTechOfficeCoord();
  /** coordinates calculated from total distance along the selected route line */
  private derivedRouteCoords = [];

  constructor(private activityService: ActivityService,
              private selectedOfficeActivityService: SelectedOfficeActivityService) {
  }

  /**
   * Sets up MapBox after it loads
   * @param mapRef reference to the MapBox element
   */
  setMap(mapRef): void {
    this.map = mapRef;
    this.map.setMaxBounds(this.mapBounds);
    this.map.fitBounds(this.findRouteBounds(), {padding: 50});

    // sets available map controls
    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disable();
    this.map.addControl(new mapboxgl.NavigationControl({showCompass: false}));
    this.map.addControl(new RecenterControl(), 'top-right');


    this.drawOfficeMarkers();
    this.findTraveledCoordinates();

    this.selectedOfficeActivityService.getCurrentSelections().subscribe(selections => {
      let selectedRoute;
      let selectedActivity;

      // clear existing line/point data and stop animation if running
      this.line = null;
      this.point = null;
      this.drawnRouteCoords = [];
      this.derivedRouteCoords = [];
      this.counter = 0;
      cancelAnimationFrame(this.animation);

      switch (selections.office) {
        case CTOffices.ATLANTA:
          selectedRoute = this.captechOffices.getAtlRoute();
          break;
        case CTOffices.CHARLOTTE:
          selectedRoute = this.captechOffices.getCltRoute();
          break;
        case CTOffices.DC:
          selectedRoute = this.captechOffices.getDcRoute();
          break;
        case CTOffices.PHILADELPHIA:
          selectedRoute = this.captechOffices.getPhiRoute();
          break;
        case CTOffices.COLUMBUS:
          selectedRoute = this.captechOffices.getCmhRoute();
          break;
        case CTOffices.CHICAGO:
          selectedRoute = this.captechOffices.getChiRoute();
          break;
        case CTOffices.DENVER:
          selectedRoute = this.captechOffices.getDenRoute();
          break;
        default:
          selectedRoute = this.captechOffices.getDefaultRoute();
      }

      switch (selections.activityType) {
        case ActivityType.BIKE:
          selectedActivity = 'totalBike';
          break;
        case ActivityType.RUN:
          selectedActivity = 'totalRun';
          break;
        case ActivityType.WALK:
          selectedActivity = 'totalWalk';
          break;
        default:
          selectedActivity = 'totalMiles';
      }

      setTimeout(() =>
        this.findTraveledCoordinates(selectedActivity, selectedRoute), 100);
    });
  }

  private drawOfficeMarkers(): void {
    Object.keys(this.captechOffices).forEach(key => {
      const marker = document.createElement('div');
      marker.className = 'marker';
      marker.id = key;
      new mapboxgl.Marker(marker).setLngLat(this.captechOffices[key]).addTo(this.map);
    });
  }

  /**
   * Calculates coordinates for number of completed miles then calls drawCompletedRoute to draw on map.
   * @param type what type of miles to build completed route off of
   * @param selectedRoute the route with the currently selected office as the starting point
   */
  private findTraveledCoordinates(type = 'totalMiles', selectedRoute = this.captechOffices.getDefaultRoute()) {
    const startOfRoute: [number, number] = selectedRoute.geometry.coordinates[0] as [number, number];
    const totalOfficePerimeter = Math.ceil(turf.length(selectedRoute, {units: 'miles'}));

    this.activityService.getTotalMiles().subscribe(miles => {
      let milesTraveled = miles[type];
      const derivedCoords = []; // coordinates derived from milesTraveled along selectedRoute
      let loopsMade = 0; // tracks how many loops around selectedRoute
      let partialLoopSteps = 0; // tracks number of steps scaled down to remainder distance

      // Loop through the route to account for a total milesTraveled
      // being longer then the selectedRoute's total distance.
      while (milesTraveled >= 0) {
        // if milesTraveled is longer then the selectedRoute's perimeter add all coordinates along the selected route
        if (milesTraveled > totalOfficePerimeter) {
          for (let i = 0; i < totalOfficePerimeter; i += totalOfficePerimeter / this.frameRate) {
            derivedCoords.push(turf.along(selectedRoute, i, {units: 'miles'}).geometry.coordinates);
          }
          loopsMade++;

          // if milesTraveled is less then the selectedRoute's perimeter add only the coordinates for the traveled part
        } else {
          partialLoopSteps = Math.ceil(milesTraveled / Math.ceil(totalOfficePerimeter / this.frameRate));
          for (let i = 0; i < milesTraveled; i += milesTraveled / partialLoopSteps) {
            derivedCoords.push(turf.along(selectedRoute, i, {units: 'miles'}).geometry.coordinates);
          }
        }

        milesTraveled -= totalOfficePerimeter;
      }

      this.derivedRouteCoords = derivedCoords;
      this.steps = partialLoopSteps + (this.frameRate * loopsMade);

      this.drawCompletedRoute(startOfRoute);
    });
  }

  /**
   * Sets inital states of the line and point features on map then calls {@link myAnimator}
   * @param startOfRoute the starting place for the line and point
   */
  private drawCompletedRoute(startOfRoute: [number, number]): void {
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
   * by iterating through the coordinates stored in {@link derivedRouteCoords}.
   */
  private myAnimator() {
    // append new coordinates to the lineString
    this.drawnRouteCoords.push(this.derivedRouteCoords[this.counter]);

    // then update the map
    this.line = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: this.drawnRouteCoords
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
            coordinates: this.drawnRouteCoords[this.counter]
          }
        }
      ]
    };

    this.counter += 1;

    // Request the next frame of animation so long the end has not been reached.
    if (this.counter < this.steps) {
      this.animation = requestAnimationFrame(this.myAnimator.bind(this));
    }
  }

  /**
   * Takes in all route points and creates a bounds box that encompasses all points
   * @Returns bounds: {@link mapboxgl.LngLatBounds} object with the bounding coordinates to be
   * used to center the map within the view area
   */
  private findRouteBounds(): mapboxgl.LngLatBounds {
    const temp = [];
    for (const key in this.captechOffices) {
      if (this.captechOffices.hasOwnProperty(key)) {
        temp.push([this.captechOffices[key][0], this.captechOffices[key][1]]);
      }
    }
    const bounds = turf.bbox(turf.lineString(temp));
    return new mapboxgl.LngLatBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]]);
  }
}
