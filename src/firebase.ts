import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyCz8Gq5jyOhNOqjMTs3VTrJQOhjN408Zio',
  authDomain: 'tela-americanas.firebaseapp.com',
  projectId: 'tela-americanas',
  storageBucket: 'tela-americanas.firebasestorage.app',
  messagingSenderId: '695342206689',
  appId: '1:695342206689:web:bd679e554271ade195b1a0',
  measurementId: 'G-1WPGRHCJPN',
};

const app = initializeApp(firebaseConfig);

const analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;

export { app, analytics };
