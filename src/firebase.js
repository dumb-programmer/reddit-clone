import { uuidv4 } from "@firebase/util";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, deleteUser, EmailAuthProvider, getAuth, onAuthStateChanged, reauthenticateWithCredential, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, startAfter, updateDoc, where } from "firebase/firestore";
import { getStorage, uploadBytes, ref, getDownloadURL, deleteObject, getBlob, } from "firebase/storage";

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
        const userCreds = await createUserWithEmailAndPassword(auth, email, password);
        const profilePicture = await getDownloadURL(ref(storage, "default_avatar.png"));
        localStorage.setItem("username", username);
        localStorage.setItem("profilePicture", profilePicture);
        await setDoc(doc(db, "Users", userCreds.user.uid), { id: userCreds.user.uid, username: username, email: email, profilePicture })
    }
    catch (error) {
        console.log(error);
    }
};

const updateUserEmail = async (newEmail) => {
    try {
        await updateEmail(auth.currentUser, newEmail);
        const user = await getDoc(doc(db, "Users", auth.currentUser.uid));
        await updateDoc(user.ref, { email: newEmail });
    }
    catch (error) {
        console.log(error);
    }
};

const updateUserPassword = async (newPassword) => {
    try {
        await updatePassword(auth.currentUser, newPassword);
    }
    catch (error) {
        console.log(error);
    }
};

const updateDisplayName = async (displayName) => {
    await updateDoc(doc(db, "Users", auth.currentUser.uid), { displayName });
};

const updateAbout = async (about) => {
    await updateDoc(doc(db, "Users", auth.currentUser.uid), { about });
}

const reauthenticate = async (password) => {
    try {
        await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(auth.currentUser.email, password));
    }
    catch (error) {
        if (error.message.match("wrong-password")?.length > 0) {
            return { error: 1, message: "Incorrect password" }
        }
        else if (error.message.match("too-many-requests")?.length > 0) {
            return { error: 1, message: "Too many requests, take a breath" }
        }
    }
    return { error: 0, message: "" }
};

const isUsernameCorrect = async (username) => {
    const user = await getDoc(doc(db, "Users", auth.currentUser.uid));
    return user.data().username === username;
}

const deleteAccount = async () => {
    await deleteDoc(doc(db, "Users", auth.currentUser.uid));
    await deleteUser(auth.currentUser);
    localStorage.clear();
};

const changeProfilePicture = async (uid, file) => {
    const uploadTask = await uploadBytes(ref(storage, "Users/" + uuidv4()), file);
    const userRef = doc(db, "Users", uid);
    const user = await getDoc(userRef);
    await deleteObject(ref(storage, user.data().profilePicture));
    await updateDoc(userRef, { profilePicture: await getDownloadURL(uploadTask.ref) });
};

const uploadUserBanner = async (uid, file) => {
    const uploadTask = await uploadBytes(ref(storage, "Users/" + uuidv4()), file);
    const userRef = doc(db, "Users", uid);
    const user = await getDoc(userRef);
    const existingBanner = user.data().banner;
    if (existingBanner) {
        await deleteObject(ref(storage, user.data().banner));
    }
    await updateDoc(userRef, { banner: await getDownloadURL(uploadTask.ref) });
};

const usernameAvailable = async (username) => {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("username", "==", username));
    const snapshot = await getDocs(q);
    return snapshot.empty || false;
};

const isEmailAvailable = async (email) => {
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
    let profilePicture;
    snapshot.forEach(snap => {
        email = snap.data().email;
        profilePicture = snap.data().profilePicture;
    });
    try {
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem("username", username);
        localStorage.setItem("profilePicture", profilePicture);
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
    const communityRef = doc(db, "Communities", communityType, "communities", communityName);
    await setDoc(communityRef, { name: communityName, members: 0, moderator: username, createdOn: serverTimestamp() });
};

const setCommunityIcon = async (communityName, communityType, file) => {
    const uploadTask = await uploadBytes(ref(storage, "Communities/" + uuidv4()), file);
    const communityRef = doc(db, "Communities", communityType, "communities", communityName);
    const community = await getDoc(communityRef);
    const existingIcon = community.data().icon;
    if (existingIcon) {
        await deleteObject(ref(storage, existingIcon));
    }
    await updateDoc(communityRef, { icon: await getDownloadURL(uploadTask.ref) });
};

const setCommunityBanner = async (communityName, communityType, file) => {
    const uploadTask = await uploadBytes(ref(storage, "Communities/" + uuidv4()), file);
    const communityRef = doc(db, "Communities", communityType, "communities", communityName);
    const community = await getDoc(communityRef);
    const existingBanner = community.data().banner;
    if (existingBanner) {
        await deleteObject(ref(storage, existingBanner));
    }
    await updateDoc(communityRef, { banner: await getDownloadURL(uploadTask.ref) });
};

const subscribeToCommunity = (communityName, communityType, cb) => {
    return onSnapshot(doc(db, "Communities", communityType, "communities", communityName), cb);
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
    const communityRef = doc(db, "Communities", "public", "communities", communityName);
    const community = await getDoc(communityRef);
    return community.data();
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
    let paths = null;
    if (data.media) {
        paths = await uploadMedia(data.media);
    }
    const id = uuidv4();
    await setDoc(doc(db, "Posts", id), { id, title: data.title, content: data.content, link: data.link, media: paths || "", votes: 0, createdOn: serverTimestamp(), author: username, communityName: communityName, upvotes: [], downvotes: [] });
    return id;
};

const editPostContent = async (postRef, content) => {
    await updateDoc(postRef, { content, editedOn: serverTimestamp() });
};

const editPostLink = async (postRef, link) => {
    await updateDoc(postRef, { link, editedOn: serverTimestamp() });
};

const deletePost = async (post) => {
    const media = post.data()?.media;
    if (media?.length > 0) {
        deleteMedia(media);
    }
    const id = post.data().id;
    await deleteComments(id);
    await deleteDoc(doc(db, "Posts", id));
};

const getPostsByCommunity = async (communityName, cursorDoc = null) => {
    const postsRef = collection(db, "Posts");
    let q = null;
    if (!cursorDoc) {
        q = query(postsRef, where("communityName", "==", communityName), orderBy("createdOn", "desc"), limit(5));
    }
    else {
        q = query(postsRef, where("communityName", "==", communityName), orderBy("createdOn", "desc"), startAfter(cursorDoc), limit(5));
    }
    const snapshot = await getDocs(q);
    const data = [];
    snapshot.forEach(doc => data.push(doc));
    return data;
}

const getAllPosts = async (cursorDoc = null) => {
    const postsRef = collection(db, "Posts");
    let q = null;
    if (cursorDoc === null) {
        q = query(postsRef, orderBy("createdOn", "desc"), limit(5));
    }
    else {
        q = query(postsRef, orderBy("createdOn", "desc"), startAfter(cursorDoc), limit(5));
    }
    const snapshot = await getDocs(q);
    const docs = [];
    snapshot.forEach(doc => docs.push(doc));
    return docs;
};

function escapeRegExp(value) {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

const searchPosts = async (text) => {
    const postsRef = collection(db, "Posts");
    const q = query(postsRef, orderBy("createdOn"));
    const posts = await getDocs(q);
    const data = [];
    posts.forEach(post => data.push(post.data()));
    const searchRegex = new RegExp(escapeRegExp(text), "i");
    const filteredRows = data.filter((post) => {
        return searchRegex.test(post.title);
    });
    return filteredRows;
}

const searchCommunities = async (communityName) => {
    const communitiesRef = collection(db, "Communities", "public", "communities");
    const q = query(communitiesRef, orderBy("createdOn"));
    const communities = await getDocs(q);
    const data = [];
    communities.forEach(community => data.push(community.data()));
    const searchRegex = new RegExp(escapeRegExp(communityName), "i");
    const filteredRows = data.filter((community) => {
        return searchRegex.test(community.name);
    });
    return filteredRows;
};

const searchUsers = async (username) => {
    const usersRef = collection(db, "Users");
    const q = query(usersRef);
    const users = await getDocs(q);
    const data = [];
    users.forEach(user => data.push(user.data()));
    const searchRegex = new RegExp(escapeRegExp(username), "i");
    const filteredRows = data.filter((user) => {
        return searchRegex.test(user.username);
    });
    return filteredRows;
};

const searchComments = async (text) => {
    const commentsRef = collection(db, "Comments");
    const q = query(commentsRef, orderBy("createdOn", "desc"));
    const comments = await getDocs(q);
    const data = [];
    comments.forEach(comment => data.push(comment.data()));
    const searchRegex = new RegExp(escapeRegExp(text), "i");
    const filteredRows = data.filter((comment) => {
        return searchRegex.test(comment.comment);
    });
    return filteredRows;
};

const getPostById = async (postId) => {
    const postRef = doc(db, "Posts", postId);
    const snapshot = await getDoc(postRef);
    return snapshot;
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

const getUserPosts = async (username, cursorDoc = null) => {
    const postsRef = collection(db, "Posts");
    let q = null;
    if (cursorDoc) {
        q = query(postsRef, where("author", "==", username), orderBy("createdOn", "desc"), startAfter(cursorDoc), limit(5));
    }
    else {
        q = query(postsRef, where("author", "==", username), orderBy("createdOn", "desc"), limit(5));
    }
    const snapshot = await getDocs(q);
    let docs = [];
    snapshot.forEach((doc) => {
        docs.push(doc);
    });
    return docs;
};

const getProfileByUsername = async (username) => {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("username", "==", username));
    let user = null;
    await getDocs(q).then((snap) => {
        snap.forEach((doc) => {
            user = doc.data()
        });
    });
    return user;
};

const getProfileByUserId = async (uid) => {
    const userRef = doc(db, "Users", uid);
    let user = await getDoc(userRef);
    return user;
}

const createComment = async (comment, username, uid, contentId) => {
    const commentsRef = collection(db, "Comments");
    await addDoc(commentsRef, { id: uuidv4(), comment: comment, votes: 0, createdOn: serverTimestamp(), author: username, authorId: uid, upvotes: [], downvotes: [], contentId });
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

const deleteComments = async (contentId) => {
    const commentsRef = collection(db, "Comments");
    const q = query(commentsRef, where("contentId", "==", contentId));
    const commentsSnap = await getDocs(q);
    if (!commentsSnap.empty) {
        const ids = [];
        commentsSnap.forEach(async comment => {
            ids.push(comment.data().id);
            await deleteDoc(comment.ref);
        });
        for (const id of ids) {
            await deleteComments(id);
        }
    }
}

const editComment = async (commentRef, comment) => {
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

export { createAccountUsingEmail, usernameAvailable, isEmailAvailable, loginUsingUsernameAndPassword, isLoggedIn, logout, registerAuthObserver, createCommunity, communityNameAvailable, getUsername, getCommunityInfo, createPost, getPostsByCommunity, getAllPosts, upvote, removeUpvote, downvote, removeDownvote, joinCommunity, hasJoinedCommunity, leaveCommunity, getProfileByUsername, getPostById, createComment, getComments, subscribeToComments, subscribeToPost, deleteComment, editComment, subscribeToUserDoc, saveContent, unsaveContent, deletePost, editPostContent, getMedia, changeProfilePicture, getUserPosts, uploadUserBanner, getProfileByUserId, setCommunityIcon, setCommunityBanner, subscribeToCommunity, deleteAccount, reauthenticate, isUsernameCorrect, updateUserEmail, updateUserPassword, updateDisplayName, updateAbout, searchPosts, searchCommunities, searchUsers, searchComments, editPostLink };