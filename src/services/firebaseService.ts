import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

type SaveTripData = {
  destination: string;
  plan: any;
};

export async function saveTripToFirebase({
  destination,
  plan,
}: SaveTripData) {
  const docRef = await addDoc(collection(db, 'trips'), {
    destination,
    plan,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getTripsFromFirebase() {
  const tripsQuery = query(
    collection(db, 'trips'),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(tripsQuery);

  return querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function getTripById(tripId: string) {
  const docRef = doc(db, 'trips', tripId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Matkaa ei löytynyt');
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
}

export async function deleteTripFromFirebase(tripId: string) {
  const docRef = doc(db, 'trips', tripId);
  await deleteDoc(docRef);
}

export async function updateTripInFirebase(
  tripId: string,
  { destination, plan }: SaveTripData
) {
  const docRef = doc(db, 'trips', tripId);

  await updateDoc(docRef, {
    destination,
    plan,
    updatedAt: serverTimestamp(),
  });
}
