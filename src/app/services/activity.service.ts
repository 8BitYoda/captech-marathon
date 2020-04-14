import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { CTOffices, ExistingUserLog, NewUserLog } from '../models/activity';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Totals } from '../models/totals';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  db = this.angularFirestore.firestore;

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

  getTotalMiles(office?: CTOffices) {
    const totals: Totals = {
      totalMiles: 0,
      totalBike: 0,
      totalRun: 0,
      totalWalk: 0,
    };

    const usersRef = this.db.collection('users');
    const query = office ? usersRef.where('office', '==', office) : usersRef;

    return from(query.get()).pipe(
      map(response => {
        response.forEach(doc => {
          totals.totalBike += doc.data().totalBikeMiles;
          totals.totalRun += doc.data().totalRunMiles;
          totals.totalWalk += doc.data().totalWalkMiles;
        });
        totals.totalMiles = totals.totalBike + totals.totalRun + totals.totalWalk;
        return totals;
      })
    );
  }
}
