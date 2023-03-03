import { uuidv4 } from "@firebase/util";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { getStorage, uploadBytes, ref, getDownloadURL, deleteObject, getBlob } from "firebase/storage";

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
const storage = getStorage(app);

const createAccountUsingEmail = async ({ email, password, username }) => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        const profilePicture = await getDownloadURL(ref(storage, "default_avatar.png"));
        localStorage.setItem("username", username);
        localStorage.setItem("profilePicture", profilePicture);
        await setDoc(doc(db, "Users", auth.currentUser.uid), { username: username, email: email, profilePicture })
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
    return docSnap.joined_communities?.includes(communityName) || false;
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

const getCommunityInfo = async (communityName) => {
    const communityRef = collection(db, "Communities", "public", "communities");
    const q = query(communityRef, where("name", "==", communityName));
    const snapshot = await getDocs(q);
    let community;
    snapshot.forEach((doc) => {
        community = doc.data();
    })
    return community;
};

const uploadMedia = async (mediaList) => {
    const paths = [];
    for (const media of mediaList) {
        const snap = await uploadBytes(ref(storage, uuidv4()), media);
        paths.push(snap.ref.fullPath);
    }
    return paths;
};

const deleteMedia = async (mediaList) => {
    for (const media of mediaList) {
        await deleteObject(ref(storage, media));
    }
}

const getMedia = async (path) => {
    return await getBlob(ref(storage, path));
};

const createPost = async ({ username, communityName, ...data }) => {
    const postsRef = collection(db, "Posts");
    let paths = null;
    if (data.media) {
        paths = await uploadMedia(data.media);
    }
    const id = uuidv4();
    await addDoc(postsRef, { id, title: data.title, content: data.content, link: data.link, media: paths || "", votes: 0, createdOn: serverTimestamp(), author: username, communityName: communityName, upvotes: [], downvotes: [] });
    return id;
};

const editPost = async (postRef, content) => {
    await updateDoc(postRef, { content, editedOn: serverTimestamp() });
};

const deletePost = async (post) => {
    const media = post.data()?.media;
    if (media?.length > 0) {
        deleteMedia(media);
    }
    await deleteDoc(post.ref);
};

const getPostsByCommunity = async (communityName) => {
    const postsRef = collection(db, "Posts");
    const q = query(postsRef, where("communityName", "==", communityName), orderBy("createdOn"));
    const snapshot = await getDocs(q);
    const data = [];
    snapshot.forEach(doc => data.push(doc));
    return data.reverse();
}

const getAllPosts = async () => {
    const postsRef = collection(db, "Posts");
    const q = query(postsRef, orderBy("createdOn"));
    const snapshot = await getDocs(q);
    const docs = [];
    snapshot.forEach(doc => docs.push(doc));
    return docs.reverse();
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

const subscribeToPost = (postId, cb) => {
    return onSnapshot(doc(db, "Posts", postId), cb);
};

const upvote = async (id, userId, isDownvoted, type) => {
    let doc;
    if (type === "post") {
        doc = await getPostById(id);
    }
    else if (type === "comment") {
        doc = await getCommentById(id);
    }
    const data = doc.data();
    const upvotes = data?.upvotes;
    const downvotes = data?.downvotes;

    await updateDoc(doc.ref, { votes: isDownvoted ? data.votes + 2 : ++data.votes, upvotes: [...upvotes, userId], downvotes: downvotes.filter(uid => uid !== userId) });
};

const removeUpvote = async (id, userId, type) => {
    let doc;
    if (type === "post") {
        doc = await getPostById(id);
    }
    else if (type === "comment") {
        doc = await getCommentById(id);
    }
    const data = doc.data();
    const upvotes = data?.upvotes;

    await updateDoc(doc.ref, { votes: --data.votes, upvotes: upvotes.filter(uid => uid !== userId) });
};

const downvote = async (id, userId, isUpvoted, type) => {
    let doc;
    if (type === "post") {
        doc = await getPostById(id);
    }
    else if (type === "comment") {
        doc = await getCommentById(id);
    }
    const data = doc.data();
    const downvotes = data?.downvotes;
    const upvotes = data?.upvotes;

    await updateDoc(doc.ref, { votes: isUpvoted ? data.votes - 2 : --data.votes, downvotes: [...downvotes, userId], upvotes: upvotes.filter(uid => uid !== userId) });
};


const removeDownvote = async (id, userId, type) => {
    let doc;
    if (type === "post") {
        doc = await getPostById(id);
    }
    else if (type === "comment") {
        doc = await getCommentById(id);
    }
    const data = doc.data();
    const downvotes = data?.downvotes;

    await updateDoc(doc.ref, { votes: ++data.votes, downvotes: downvotes.filter(uid => uid !== userId) });
};

const getUserPosts = async (username) => {
    const postsRef = collection(db, "Posts");
    const q = query(postsRef, where("author", "==", username));
    const snapshot = await getDocs(q);
    let docs = [];
    snapshot.forEach((doc) => {
        docs.push(doc);
    });
    return docs;
};

const getProfile = async (username) => {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("username", "==", username));
    let user = null;
    await getDocs(q).then((snap) => {
        snap.forEach((doc) => {
            user = doc.data()
        });
    });
    const posts = await getUserPosts(username);
    user.posts = posts;
    return user;
};

const createComment = async (comment, username, contentId) => {
    const commentsRef = collection(db, "Comments");
    await addDoc(commentsRef, { id: uuidv4(), comment: comment, votes: 0, createdOn: serverTimestamp(), author: username, upvotes: [], downvotes: [], contentId });
};

const getComments = async (contentId) => {
    const commentsRef = collection(db, "Comments");
    const q = query(commentsRef, where("contentId", "==", contentId), orderBy("createdOn", "desc"));
    const snap = await getDocs(q);
    const data = [];
    snap.forEach((snap) => {
        data.push(snap);
    })
    return data;
};

const subscribeToComments = (contentId, cb) => {
    const commentsRef = collection(db, "Comments");
    const q = query(commentsRef, where("contentId", "==", contentId), orderBy("createdOn", "desc"));
    return onSnapshot(q, cb);
};

const getCommentById = async (commentId) => {
    const commentsRef = collection(db, "Comments");
    const q = query(commentsRef, where("id", "==", commentId));
    const snapshot = await getDocs(q);
    let doc = null;
    snapshot.forEach((document) => {
        doc = document;
    });
    return doc;
};

const deleteComment = async (commentRef) => {
    await deleteDoc(commentRef);
};

const editComment = async (commentRef, comment) => {
    console.log(commentRef);
    await updateDoc(commentRef, { comment, editedOn: serverTimestamp() });
};

const subscribeToUserDoc = (userId, cb) => {
    return onSnapshot(doc(db, "Users", userId), cb);
};

const saveContent = async (userId, contentId) => {
    const userRef = doc(db, "Users", userId);
    const user = await getDoc(userRef);
    return updateDoc(userRef, { saved: [...user.data().saved, contentId] });
};

const unsaveContent = async (userId, contentId) => {
    const userRef = doc(db, "Users", userId);
    const user = await getDoc(userRef);
    return updateDoc(userRef, { saved: user.data().saved.filter(id => id !== contentId) });
}

export { createAccountUsingEmail, usernameAvailable, emailNotRegistered, loginUsingUsernameAndPassword, isLoggedIn, logout, registerAuthObserver, createCommunity, communityNameAvailable, getUsername, getCommunityInfo, createPost, getPostsByCommunity, getAllPosts, upvote, removeUpvote, downvote, removeDownvote, joinCommunity, hasJoinedCommunity, leaveCommunity, getProfile, getPostById, createComment, getComments, subscribeToComments, subscribeToPost, deleteComment, editComment, subscribeToUserDoc, saveContent, unsaveContent, deletePost, editPost, getMedia };