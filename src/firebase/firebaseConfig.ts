import { initializeApp } from 'firebase/app';

import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBIvjfFZNym5kkC1-uWgIEa_61KQhvGc98",
  authDomain: "matkaplanner.firebaseapp.com",
  projectId: "matkaplanner",
  storageBucket: "matkaplanner.firebasestorage.app",
  messagingSenderId: "820105334519",
  appId: "1:820105334519:web:fdc0890d7c22c10c44cdf2",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);