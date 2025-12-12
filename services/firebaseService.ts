
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  increment 
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { storage as appwriteStorage, ID, BUCKET_ID } from "../appwriteConfig";
import { SavedProject, RenovationConfig, RenovationAnalysis, UserProfile, AdminStats } from "../types";

const COLLECTION_NAME = "renovations";
const USERS_COLLECTION = "users";

const sanitizeData = (data: any): any => {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    return value === undefined ? null : value;
  }));
};

const dataURLtoFile = (dataurl: string, filename: string): File => {
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (e) {
    console.error("Error converting to file", e);
    throw new Error("Failed to process image data");
  }
};

// --- User Management ---

export const syncUserProfile = async (user: any) => {
  if (!user) return;
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // New User: 5 Free Tokens
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: 'user', 
      plan: 'free',
      tokens: 5, // FREE TOKENS
      createdAt: Date.now()
    });
  } else {
    // Existing user: ensure token field exists (migration support)
    const data = snap.data();
    if (data.tokens === undefined) {
      await updateDoc(userRef, { tokens: 5 });
    }
    
    await updateDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      lastLogin: Date.now()
    });
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
};

// --- Token Management ---

export const deductToken = async (uid: string): Promise<boolean> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  
  if (snap.exists()) {
    const data = snap.data();
    if (data.tokens > 0) {
      await updateDoc(userRef, { tokens: increment(-1) });
      return true;
    }
  }
  return false;
};

export const addTokens = async (uid: string, amount: number): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, { tokens: increment(amount) });
};

// --- Project Management ---

export const saveProjectToFirebase = async (
  originalImage: string, 
  generatedImage: string, 
  config: RenovationConfig,
  analysis?: RenovationAnalysis
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to save");

  try {
    const timestamp = Date.now();
    
    // Normalize Room Type name for filename (e.g., "Living Room" -> "LivingRoom")
    const roomPrefix = config.roomType.replace(/\s+/g, '');
    
    // Convert Base64 strings to Files for Appwrite with Room specific names
    const originalFile = dataURLtoFile(originalImage, `${roomPrefix}_original_${timestamp}.png`);
    const generatedFile = dataURLtoFile(generatedImage, `${roomPrefix}_generated_${timestamp}.png`);

    // Upload Original to Appwrite
    const originalUpload = await appwriteStorage.createFile(
      BUCKET_ID, 
      ID.unique(), 
      originalFile
    );
    const originalUrl = appwriteStorage.getFileView(BUCKET_ID, originalUpload.$id);

    // Upload Generated to Appwrite
    const generatedUpload = await appwriteStorage.createFile(
      BUCKET_ID, 
      ID.unique(), 
      generatedFile
    );
    const generatedUrl = appwriteStorage.getFileView(BUCKET_ID, generatedUpload.$id);

    const docData = {
      userId: user.uid,
      userEmail: user.email,
      originalImage: originalUrl, // Using Appwrite View URL
      generatedImage: generatedUrl,
      originalImageId: originalUpload.$id, 
      generatedImageId: generatedUpload.$id,
      config: sanitizeData(config),
      analysis: analysis ? sanitizeData(analysis) : null,
      timestamp: timestamp,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving project:", error);
    throw error;
  }
};

export const getUserHistoryFromFirebase = async (): Promise<SavedProject[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    // Note: Do not use orderBy here without creating a Composite Index in Firestore Console.
    // For simplicity/reliability without index creation, sort client-side.
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    
    const projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SavedProject));

    // Client-side sort
    return projects.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};

export const deleteProjectFromFirebase = async (projectId: string) => {
  try {
    const projectRef = doc(db, COLLECTION_NAME, projectId);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
      const data = projectSnap.data();
      
      if (data.originalImageId) {
        try {
          await appwriteStorage.deleteFile(BUCKET_ID, data.originalImageId);
        } catch (e) {
          console.warn("Could not delete original image from storage", e);
        }
      }

      if (data.generatedImageId) {
        try {
          await appwriteStorage.deleteFile(BUCKET_ID, data.generatedImageId);
        } catch (e) {
           console.warn("Could not delete generated image from storage", e);
        }
      }
    }
    await deleteDoc(projectRef);
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

// --- ADMIN FUNCTIONS ---

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    return snap.docs.map(doc => doc.data() as UserProfile);
  } catch (e) {
    console.error("Admin: fetch users failed", e);
    return [];
  }
};

export const updateUserField = async (uid: string, field: string, value: any) => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), { [field]: value });
  } catch (e) {
    console.error("Admin: update user failed", e);
  }
};

export const getAllProjects = async (): Promise<SavedProject[]> => {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const projects = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedProject));
    return projects.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error("Admin: fetch all projects failed", e);
    return [];
  }
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const users = await getAllUsers();
  const projects = await getAllProjects();
  
  const proUsers = users.filter(u => u.plan === 'pro' || u.plan === 'enterprise').length;
  const revenue = users.reduce((acc, user) => {
    if (user.plan === 'pro') return acc + 29;
    if (user.plan === 'enterprise') return acc + 99;
    return acc;
  }, 0);

  return {
    totalUsers: users.length,
    proUsers: proUsers,
    totalGenerations: projects.length,
    totalRevenue: revenue
  };
};

export const setSystemConfig = async (key: string, value: string) => {
  await setDoc(doc(db, "system", "config"), { [key]: value }, { merge: true });
};
