// Mock Firebase Auth
export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
};

export const googleProvider = {};

// Mock Firestore
export const db = {};

// Mock Firestore functions
export const collection = jest.fn();
export const doc = jest.fn();
export const addDoc = jest.fn();
export const updateDoc = jest.fn();
export const deleteDoc = jest.fn();
export const getDocs = jest.fn();
export const onSnapshot = jest.fn();
export const query = jest.fn();
export const orderBy = jest.fn();
export const writeBatch = jest.fn(() => ({
  update: jest.fn(),
  commit: jest.fn(),
}));

// Mock Auth functions
export const signInWithPopup = jest.fn();
export const signOut = jest.fn();
export const onAuthStateChanged = jest.fn();
