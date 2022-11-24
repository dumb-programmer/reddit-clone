import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { addDoc, collection, getDocs, getFirestore, query, where } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const createAccountUsingEmail = async ({ email, password, username }) => {
    try {
        const userCreds = await createUserWithEmailAndPassword(auth, email, password);
        await addDoc(collection(db, "Users"), { username: username, email: userCreds.user.email })
    }
    catch (error) {
        console.log(error);
    }
};

const usernameAvailable = async (username) => {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("username", "==", username));
    const snapshot = await getDocs(q);
    return snapshot.empty || false;
};

const emailNotRegistered = async (email) => {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    return snapshot.empty || false;
}

export { createAccountUsingEmail, usernameAvailable, emailNotRegistered };