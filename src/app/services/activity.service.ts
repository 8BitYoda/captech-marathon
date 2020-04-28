import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { ExistingUserLog, NewUserLog } from '../activity-form/activity';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(private angularFirestore: AngularFirestore) {
  }

  addActivity(payload: NewUserLog) {
    const db = this.angularFirestore.firestore;
    const userRef = db.collection('users').doc(payload.firstName + payload.lastName);
    return db.runTransaction(transaction => {
      return transaction.get(userRef).then(userDoc => {
        if (!userDoc.exists) {
          transaction.set(userRef, payload);
        } else {
          const addPayload: ExistingUserLog = {
            activities: firebase.firestore.FieldValue.arrayUnion(...payload.activities)
          };

          if (payload.totalBikeMiles) {
            addPayload.totalBikeMiles = firebase.firestore.FieldValue.increment(payload.totalBikeMiles);
          }
          if (payload.totalRunMiles) {
            addPayload.totalRunMiles = firebase.firestore.FieldValue.increment(payload.totalRunMiles);
          }
          if (payload.totalWalkMiles) {
            addPayload.totalWalkMiles = firebase.firestore.FieldValue.increment(payload.totalWalkMiles);
          }

          transaction.set(userRef, addPayload, {merge: true});
        }
      });
    }).then(mes => console.log(mes)).catch(err => console.error(err));
  }
}
