import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { CTOffices, ExistingUserLog, NewUserLog } from '../models/activity';
import { from, Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';
import { Totals } from '../models/totals';

export interface ActivityServiceInterface {
  addActivity(payload: NewUserLog);

  getTotalMiles(office?: CTOffices);
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService implements ActivityServiceInterface {
  db = this.angularFirestore.firestore;
  private cachedOffice: CTOffices;
  private cache: Observable<Totals>;

  constructor(private angularFirestore: AngularFirestore) {
  }

  addActivity(payload: NewUserLog) {
    const userRef = this.db.collection('users').doc(payload.firstName + payload.lastName);

    return this.db.runTransaction(transaction => {
      return transaction.get(userRef).then(userDoc => {
        if (!userDoc.exists) {
          transaction.set(userRef, payload);
        } else {
          const addPayload: ExistingUserLog = {
            activities: firebase.firestore.FieldValue.arrayUnion(...payload.activities),
            totalBikeMiles: firebase.firestore.FieldValue.increment(payload.totalBikeMiles),
            totalRunMiles: firebase.firestore.FieldValue.increment(payload.totalRunMiles),
            totalWalkMiles: firebase.firestore.FieldValue.increment(payload.totalWalkMiles)
          };
          transaction.set(userRef, addPayload, {merge: true});
        }
      });
    }).then(mes => console.log(mes)).catch(err => console.error(err));
  }

  getTotalMiles(office?: CTOffices, cacheBuster?: boolean) {
    const usersRef = this.db.collection('users');
    const query = office ? usersRef.where('office', '==', office) : usersRef;

    if (!this.cache || this.cachedOffice !== office || cacheBuster) {
      const totals: Totals = {
        totalMiles: 0,
        totalBike: 0,
        totalRun: 0,
        totalWalk: 0,
      };

      this.cache = from(query.get()).pipe(
        map(response => {
          response.forEach(doc => {
            totals.totalBike += doc.data().totalBikeMiles;
            totals.totalRun += doc.data().totalRunMiles;
            totals.totalWalk += doc.data().totalWalkMiles;
          });
          totals.totalMiles = totals.totalBike + totals.totalRun + totals.totalWalk;
          return totals;
        }),
        publishReplay(1),
        refCount()
      );
    }

    return this.cache;
  }
}
