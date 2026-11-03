export const auth = {
  currentUser: null,
  authStateReady: jest.fn().mockResolvedValue(true),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
};

export const db = {};
export const storage = {};
export const googleProvider = {};
export const signInWithPopup = jest.fn();
export const signInWithEmailAndPassword = jest.fn();
export const createUserWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();

