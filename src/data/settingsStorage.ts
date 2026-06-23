import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './ordersStorage';

export interface GlobalSettings {
  infoCCEnabled: boolean;
  boletoEnabled: boolean;
}

const SETTINGS_COLLECTION = 'settings';
const GLOBAL_DOC = 'global';

export async function getGlobalSettings(): Promise<GlobalSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        infoCCEnabled: data.infoCCEnabled !== false,
        boletoEnabled: data.boletoEnabled !== false,
      };
    }

    return { infoCCEnabled: true, boletoEnabled: false };
  } catch {
    return { infoCCEnabled: true, boletoEnabled: false };
  }
}

export async function setInfoCCEnabled(enabled: boolean): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC);
    await setDoc(docRef, { infoCCEnabled: enabled }, { merge: true });
  } catch {
    throw new Error('Não foi possível atualizar a configuração INFO CC.');
  }
}

export async function setBoletoEnabled(enabled: boolean): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC);
    await setDoc(docRef, { boletoEnabled: enabled }, { merge: true });
  } catch {
    throw new Error('Não foi possível atualizar a configuração Boleto Bancário.');
  }
}

export function subscribeToGlobalSettings(callback: (settings: GlobalSettings) => void): Unsubscribe {
  const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({
        infoCCEnabled: data.infoCCEnabled !== false,
        boletoEnabled: data.boletoEnabled !== false,
      });
    } else {
      callback({ infoCCEnabled: true, boletoEnabled: false });
    }
  });
}

export function subscribeToBoletoSettings(callback: (boletoEnabled: boolean) => void): Unsubscribe {
  const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.boletoEnabled !== false);
    } else {
      callback(false);
    }
  });
}

