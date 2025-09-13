// Mock Firebase configuration for development without API keys
// This allows the app to work without requiring Firebase setup

export const auth = {
  currentUser: null as any,
  signInWithEmailAndPassword: async (email: string, password: string) => {
    // Mock authentication - always succeeds for demo
    const user = {
      uid: 'demo-user-' + Date.now(),
      email: email,
      displayName: email.split('@')[0],
      emailVerified: true
    };
    auth.currentUser = user;
    return { user };
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    // Mock user creation - always succeeds for demo
    const user = {
      uid: 'demo-user-' + Date.now(),
      email: email,
      displayName: email.split('@')[0],
      emailVerified: true
    };
    auth.currentUser = user;
    return { user };
  },
  signInWithPopup: async (provider: any) => {
    // Mock Google sign-in - always succeeds for demo
    const user = {
      uid: 'google-user-' + Date.now(),
      email: 'demo@gmail.com',
      displayName: 'Demo User',
      emailVerified: true
    };
    auth.currentUser = user;
    return { user };
  },
  signOut: async () => {
    auth.currentUser = null;
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Mock auth state listener
    callback(auth.currentUser);
    return () => {}; // unsubscribe function
  }
};

export const db = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async (data: any) => console.log('Mock Firestore set:', name, id, data),
      update: async (data: any) => console.log('Mock Firestore update:', name, id, data),
      delete: async () => console.log('Mock Firestore delete:', name, id),
      onSnapshot: (callback: (doc: any) => void) => {
        // Mock real-time listener
        callback({ exists: false, data: () => null });
        return () => {}; // unsubscribe function
      }
    }),
    add: async (data: any) => {
      const id = 'mock-doc-' + Date.now();
      console.log('Mock Firestore add:', name, data);
      return { id };
    },
    where: (field: string, op: string, value: any) => ({
      get: async () => ({ docs: [] }),
      onSnapshot: (callback: (snapshot: any) => void) => {
        callback({ docs: [] });
        return () => {}; // unsubscribe function
      }
    })
  })
};

export const storage = {
  ref: (path: string) => ({
    put: async (file: File) => {
      console.log('Mock Storage upload:', path, file.name);
      return {
        ref: {
          getDownloadURL: async () => 'https://via.placeholder.com/300x200?text=Mock+Image'
        }
      };
    }
  })
};

// Mock Google provider
export const googleProvider = {
  providerId: 'google.com'
};