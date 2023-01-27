import { uuidv4 } from "@firebase/util";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";

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
        await setDoc(doc(db, "Users", userCreds.uid), { username: username, email: userCreds.user.email })
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

const joinCommunity = async (userId, communityName, communityType) => {
    const docRef = doc(db, "Users", userId);
    const docSnap = (await getDoc(docRef)).data();
    await updateDoc(docRef, { joined_communities: Array.from(new Set([...docSnap.joined_communities, communityName])) });
    const communityRef = collection(db, "Communities", communityType, "communities");
    const q = query(communityRef, where("name", "==", communityName));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { members: ++doc.data().members });
    });
};

const leaveCommunity = async (userId, communityName, communityType) => {
    const docRef = doc(db, "Users", userId);
    const data = (await getDoc(docRef)).data();
    await updateDoc(docRef, { joined_communities: Array.from(new Set(data.joined_communities.filter(name => name !== communityName))) });
    const communityRef = collection(db, "Communities", communityType, "communities");
    const q = query(communityRef, where("name", "==", communityName));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { members: --doc.data().members });
    });
};

const hasJoinedCommunity = async (userId, communityName) => {
    const docRef = doc(db, "Users", userId);
    const docSnap = (await getDoc(docRef)).data();
    return docSnap.joined_communities.includes(communityName);
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

const getCommunity = async (userId, communityName) => {
    const communityRef = collection(db, "Communities", "public", "communities");
    const q = query(communityRef, where("name", "==", communityName));
    const snapshot = await getDocs(q);
    let community;
    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            community = doc.data();
        });
    }
    else {
        return false;
    }
    const posts = await getPostsByCommunity(communityName);
    community.posts = posts;

    if (userId) {
        community.joined = await hasJoinedCommunity(userId, communityName);
    }

    return community;
};

const createPost = async ({ username, communityName, title, content }) => {
    const postsRef = collection(db, "Posts");
    await addDoc(postsRef, { id: uuidv4(), title: title, content: content, votes: 0, createdOn: serverTimestamp(), author: username, communityName: communityName, upvotes: [], downvotes: [] });
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

const getPostById = async (postId) => {
    const postsRef = collection(db, "Posts");
    const q = query(postsRef, where("id", "==", postId));
    const snapshot = await getDocs(q);
    let doc = null;
    snapshot.forEach((document) => {
        doc = document;
    });
    return doc;
};

const upvote = async (postId, userId, isDownvoted) => {
    const doc = await getPostById(postId);
    const data = doc.data();
    const upvotes = data?.upvotes;
    const downvotes = data?.downvotes;

    await updateDoc(doc.ref, { votes: isDownvoted ? data.votes + 2 : ++data.votes });
    await updateDoc(doc.ref, { upvotes: [...upvotes, userId] });
    await updateDoc(doc.ref, { downvotes: downvotes.filter(uid => uid !== userId) });
};

const removeUpvote = async (postId, userId) => {
    const doc = await getPostById(postId);
    const data = doc.data();
    const upvotes = data?.upvotes;

    await updateDoc(doc.ref, { votes: --data.votes });
    await updateDoc(doc.ref, { upvotes: upvotes.filter(uid => uid !== userId) });
};

const downvote = async (postId, userId, isUpvoted) => {
    const doc = await getPostById(postId);
    const data = doc.data();
    const downvotes = data?.downvotes;
    const upvotes = data?.upvotes;

    await updateDoc(doc.ref, { votes: isUpvoted ? data.votes - 2 : --data.votes });
    await updateDoc(doc.ref, { downvotes: [...downvotes, userId] });
    await updateDoc(doc.ref, { upvotes: upvotes.filter(uid => uid !== userId) });
};


const removeDownvote = async (postId, userId) => {
    const doc = await getPostById(postId);
    const data = doc.data();
    const downvotes = data?.downvotes;

    await updateDoc(doc.ref, { votes: ++data.votes });
    await updateDoc(doc.ref, { downvotes: downvotes.filter(uid => uid !== userId) });
};

const getUserPosts = async (username) => {
    const postsRef = collection(db, "Posts");
    const q = query(postsRef, where("author", "==", username));
    const snapshot = await getDocs(q);
    let docs = [];
    snapshot.forEach((doc) => {
        docs.push(doc);
    });
    return docs.map(doc => doc.data());
};

const getProfile = async (userId, username) => {
    const docRef = doc(db, "Users", userId);
    const profile = (await getDoc(docRef)).data();
    const posts = await getUserPosts(username);
    profile.posts = posts;
    return profile;
};

const createComment = async (comment, username, postId) => {
    const commentsRef = collection(db, "Comments");
    await addDoc(commentsRef, { id: uuidv4(), comment: comment, votes: 0, createdOn: serverTimestamp(), author: username, upvotes: [], downvotes: [], postId });
};

const getCommentsForPost = async (postId) => {
    const commentsRef = collection(db, "Comments");
    const q = query(commentsRef, where("postId", "==", postId), orderBy("createdOn", "desc"));
    const snap = await getDocs(q);
    const data = [];
    snap.forEach((snap) => {
        data.push(snap.data());
    })
    return data;
};

const subscribeToComments = (postId, cb) => {
    const commentsRef = collection(db, "Comments");
    const q = query(commentsRef, where("postId", "==", postId), orderBy("createdOn", "desc"));
    return onSnapshot(q, cb);
}

export { createAccountUsingEmail, usernameAvailable, emailNotRegistered, loginUsingUsernameAndPassword, isLoggedIn, logout, registerAuthObserver, createCommunity, communityNameAvailable, getUsername, getCommunity, createPost, getPostsByCommunity, getAllPosts, upvote, removeUpvote, downvote, removeDownvote, joinCommunity, leaveCommunity, getProfile, getPostById, createComment, getCommentsForPost, subscribeToComments };