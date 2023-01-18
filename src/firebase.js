import { uuidv4 } from "@firebase/util";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { addDoc, collection, doc, getDocs, getFirestore, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";

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
};

const loginUsingUsernameAndPassword = async ({ username, password }) => {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("username", "==", username));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return -1;
    }

    let email;
    snapshot.forEach(snap => {
        email = snap.data().email;
    });
    try {
        await signInWithEmailAndPassword(auth, email, password);
    }
    catch (error) {
        throw error;
    }
};

const isLoggedIn = () => {
    return auth.currentUser || false;
};

const logout = async () => {
    await signOut(auth);
};

const registerAuthObserver = (cb) => {
    return onAuthStateChanged(auth, cb);
};

const createCommunity = async ({ communityName, communityType, username }) => {
    const communityRef = collection(db, "Communities", communityType, "communities");
    await addDoc(communityRef, { name: communityName, members: 0, moderator: username, createdOn: serverTimestamp() });
};

const communityNameAvailable = async ({ communityName, communityType }) => {
    const communityRef = collection(db, "Communities", communityType, "communities");
    const q = query(communityRef, where("name", "==", communityName));
    const snapshot = await getDocs(q);
    return snapshot.empty;
};

const getUsername = async (email) => {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    let username;
    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            username = doc.data().username;
        })
    };
    return username;
};

const getCommunity = async (communityName) => {
    const communityRef = collection(db, "Communities", "public", "communities");
    const q = query(communityRef, where("name", "==", communityName));
    const snapshot = await getDocs(q);
    let community;
    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            community = doc.data();
        })
    }
    else {
        return false;
    }
    const posts = await getPostsByCommunity(communityName);
    community.posts = posts;
    return community;
};

const createPost = async ({ username, communityName, title, content }) => {
    const postsRef = collection(db, "Posts");
    await addDoc(postsRef, { id: uuidv4(), title: title, content: content, votes: 0, createdOn: serverTimestamp(), author: username, communityName: communityName });
};

const getPostsByCommunity = async (communityName) => {
    const postsRef = collection(db, "Posts");
    const q = query(postsRef, where("communityName", "==", communityName));
    const snapshot = await getDocs(q);
    const data = [];
    snapshot.forEach(doc => data.push(doc.data()));
    return data;
}

const getAllPosts = async () => {
    const postsRef = collection(db, "Posts");
    const q = query(postsRef, orderBy("createdOn"));
    const snapshot = await getDocs(q);
    const data = [];
    snapshot.forEach(doc => data.push(doc.data()));
    return data.reverse();
};

const upvote = async (postId) => {
    const postsRef = collection(db, "Posts");
    const q = query(postsRef, where("id", "==", postId));
    const snapshot = await getDocs(q);
    const data = [];
    snapshot.forEach(doc => data.push(doc.data()));
    console.log(data);

    await updateDoc(snapshot, { votes: ++data.votes });
};

const downvote = async (postId) => {
    const postsRef = collection(db, "Posts");
    const q = query(postsRef, where("id", "==", postId));
    const snapshot = await getDocs(q);
    const data = [];
    let docRef;
    snapshot.forEach(doc => {
        docRef = doc;
        data.push(doc.data())
    });
    console.log(docRef.data());
    --data[0].votes
    console.log(await updateDoc(docRef, data[0]));
};

export { createAccountUsingEmail, usernameAvailable, emailNotRegistered, loginUsingUsernameAndPassword, isLoggedIn, logout, registerAuthObserver, createCommunity, communityNameAvailable, getUsername, getCommunity, createPost, getPostsByCommunity, getAllPosts, upvote, downvote };