import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection } from 'firebase/firestore';

// Firebase SDK Config para o Projeto FisisCAD (fisiscad-e8afc)
const firebaseConfig = {
  apiKey: "AIzaSyA7xH63NOUlnaXL_BSE3RQalOI774wSROE",
  authDomain: "fisiscad-e8afc.firebaseapp.com",
  projectId: "fisiscad-e8afc",
  storageBucket: "fisiscad-e8afc.firebasestorage.app",
  messagingSenderId: "754528267054",
  appId: "1:754528267054:web:8b3a8881d9d3b22c5968bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Helper function to Sync User Profile in Firestore collection 'usuarios'
export const syncUserProfileInFirestore = async (user, extraData = {}) => {
  if (!user) return null;
  const userRef = doc(db, 'usuarios', user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const newUserProfile = {
      uid: user.uid,
      nome: user.displayName || 'Usuário FisisCAD',
      email: user.email || '',
      escola_universidade: extraData.escola_universidade || 'Universidade / Instituição de Ensino',
      projetos_pessoais: extraData.projetos_pessoais || [],
      projetos_compartilhados: extraData.projetos_compartilhados || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(userRef, newUserProfile);
    return newUserProfile;
  } else {
    return snap.data();
  }
};

// Google Auth Popup Login
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = await syncUserProfileInFirestore(result.user);
    return { user: result.user, profile };
  } catch (error) {
    console.error("Erro no login com Google:", error);
    throw error;
  }
};

export const logoutFirebase = () => signOut(auth);
