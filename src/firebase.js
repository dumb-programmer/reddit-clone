import { uuidv4 } from "@firebase/util";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, deleteUser, EmailAuthProvider, getAuth, onAuthStateChanged, reauthenticateWithCredential, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, GoogleAuthProvider, signInWithPopup, reauthenticateWithPopup, OAuthProvider } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, startAfter, updateDoc, where } from "firebase/firestore";
import { getStorage, uploadBytes, ref, getDownloadURL, deleteObject, getBlob, uploadBytesResumable, } from "firebase/storage";
import generateUsernames from "./utils/generateUsernames";

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
        const profilePicture = await getDownloadURL(ref(storage, "Users/default_avatar.png"));
        localStorage.setItem("username", username);
        await setDoc(doc(db, "Users", userCreds.user.uid), { id: userCreds.user.uid, username: username, email: email, profilePicture })
    }
    catch (error) {
        console.log(error);
    }
};

const continueWithGoogle = async (redirect) => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        redirect();
        const profilePicture = await getDownloadURL(ref(storage, "Users/default_avatar.png"));
        const username = generateUsernames()[0];
        const user = await getDoc(doc(db, "Users", result.user.uid));
        if (user.exists()) {
            localStorage.setItem("username", user.data().username);
        }
        else {
            await setDoc(doc(db, "Users", result.user.uid), { id: result.user.uid, username: username, profilePicture, displayName: "", about: "", usernameConfirmed: false })
            localStorage.setItem("username", username);
        }
    }
    catch (error) {
        console.log(error);
    }
}

const keepUsername = async (uid) => {
    const user = await getDoc(doc(db, "Users", uid));
    await updateDoc(user.ref, { usernameConfirmed: true });
};

const changeUsername = async (uid, username) => {
    const user = await getDoc(doc(db, "Users", uid));
    await updateDoc(user.ref, { username, usernameConfirmed: true });
}

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

const getProvider = (provider) => {
    switch (provider) {
        case "google.com":
            return new GoogleAuthProvider();
        case "apple.com":
            return new OAuthProvider("apple");
        default:
            throw new Error("Unknown provider");
    }
}

const reauthenticatedWithAuthProvider = async (providerName, cb) => {
    const provider = getProvider(providerName);
    await reauthenticateWithPopup(auth.currentUser, provider);
    cb();
}

const isUsernameCorrect = async (username) => {
    const user = await getDoc(doc(db, "Users", auth.currentUser.uid));
    return user.data().username === username;
}

const deleteAccount = async () => {
    await deleteDoc(doc(db, "Users", auth.currentUser.uid));
    await deleteUser(auth.currentUser);
    localStorage.clear();
};

const setProfilePicture = async (userRef, existingProfilePicture, newProfilePictureUrl, setProgress, onSuccess, onError) => {
    const timeId = setInterval(() => setProgress((p) => p + 0.25), 100);
    try {
        if (existingProfilePicture && !(/default_avatar/i.test(existingProfilePicture))) {
            await deleteObject(ref(storage, existingProfilePicture));
        }
        await updateDoc(userRef, { profilePicture: newProfilePictureUrl });
        onSuccess();
    }
    catch (error) {
        onError(error);
    }
    clearInterval(timeId);
    setProgress(100);
};

const updateUserProfilePicture = (uid, userRef, existingProfilePicture, setProgress, file, onSuccess, onError) => {
    const storageRef = ref(storage, "Users/" + uuidv4());
    uploadFileWithProgess(uid, storageRef, file, setProgress, (url) =>
        setProfilePicture(userRef, existingProfilePicture, url, setProgress, onSuccess, onError),
        (error) => onError(error));
}

const setUserBanner = async (userRef, existingBannerUrl, newBannerUrl, setProgress, onSuccess, onError) => {
    const timeId = setInterval(() => setProgress((p) => p + 0.25), 100);
    try {
        if (existingBannerUrl) {
            await deleteObject(ref(storage, existingBannerUrl));
        }
        await updateDoc(userRef, { banner: newBannerUrl });
        onSuccess();
    }
    catch (error) {
        clearInterval(timeId);
        onError(error);
    }
    clearInterval(timeId);
    setProgress(100);
};

const updateUserBanner = async (uid, userRef, existingBannerUrl, setProgress, file, onSuccess, onError) => {
    const storageRef = ref(storage, "Users/" + uuidv4());
    uploadFileWithProgess(uid, storageRef, file, setProgress, (url) =>
        setUserBanner(userRef, existingBannerUrl, url, setProgress, onSuccess, onError),
        (error) => onError(error));
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
        if (error.message.match(/wrong-password/i)) {
            return -2;
        }
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

const createCommunity = async (communityName, communityType, moderator, moderatorId) => {
    const communityRef = doc(db, "Communities", communityType, "communities", communityName);
    await setDoc(communityRef, { name: communityName, type: communityType, members: 0, moderator, moderatorId, createdOn: serverTimestamp() });
};

const uploadFileWithProgess = (uid, storageRef, file, setProgress, onSuccess, onError) => {
    const metadata = {
        customMetadata: {
            owner: uid
        }
    };
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    uploadTask.on("state_changed", (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress > 30 ? progress - 30 : progress);
    }, (error) => {
        console.log("Error occurred");
        onError(error);
    }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => onSuccess(url)).catch(error => onError(error));
    });
};

const updateCommunityIcon = async (uid, communityRef, existingIcon, file, setProgress, onSuccess, onError) => {
    const storageRef = ref(storage, "Communities/" + uuidv4());
    uploadFileWithProgess(uid, storageRef, file, setProgress, (url) =>
        setCommunityIcon(communityRef, existingIcon, url, setProgress, onSuccess, onError),
        (error) => onError(error));
}

const setCommunityIcon = async (communityRef, existingIcon, iconUrl, setProgress, onSuccess, onError) => {
    const timeId = setInterval(() => setProgress((p) => p + 0.25), 100);
    try {
        if (existingIcon) {
            await deleteObject(ref(storage, existingIcon));
        }
        await updateDoc(communityRef, { icon: iconUrl });
        onSuccess();
    }
    catch (error) {
        onError(error);
    }
    clearInterval(timeId);
    setProgress(100);
};

const updateCommunityBanner = async (uid, communityRef, existingBanner, file, setProgress, onSuccess, onError) => {
    const storageRef = ref(storage, "Communities/" + uuidv4());
    uploadFileWithProgess(uid, storageRef, file, setProgress, (url) =>
        setCommunityBanner(communityRef, existingBanner, url, setProgress, onSuccess, onError),
        (error) => onError(error));
}

const setCommunityBanner = async (communityRef, existingBanner, bannerUrl, setProgress, onSuccess, onError) => {
    const timeId = setInterval(() => setProgress((p) => p + 0.25), 100);
    try {
        if (existingBanner) {
            await deleteObject(ref(storage, existingBanner));
        }
        await updateDoc(communityRef, { banner: bannerUrl });
        clearInterval(timeId);
        onSuccess();
        setProgress(100);
    }
    catch (error) {
        onError(error);
    }
    clearInterval(timeId);
};

const updateCommunityDescription = async (communityName, communityType, description) => {
    await updateDoc(doc(db, "Communities", communityType, "communities", communityName), { description })
}

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
    if (docSnap.joined_communities) {
        await updateDoc(docRef, { joined_communities: Array.from(new Set([...docSnap.joined_communities, communityName])) });
    }
    else {
        await updateDoc(docRef, { joined_communities: Array.from(new Set([communityName])) });
    }
    const communityRef = doc(db, "Communities", communityType, "communities", communityName);
    const community = (await getDoc(communityRef)).data();
    await updateDoc(communityRef, { members: ++community.members });
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

const getCommunityDoc = async (communityName) => {
    const communityRef = doc(db, "Communities", "public", "communities", communityName);
    const community = await getDoc(communityRef);
    return community;
};

const uploadMedia = async (uid, mediaList) => {
    const paths = [];
    const metadata = {
        customMetadata: {
            owner: uid
        }
    };
    for (const media of mediaList) {
        const snap = await uploadBytes(ref(storage, uuidv4()), media, metadata);
        paths.push(snap.ref.fullPath);
    }
    return paths;
};

const deleteMedia = async (mediaList) => {
    for (const media of mediaList) {
        await deleteObject(ref(storage, media));
    }
}

const getMedia = async (paths) => {
    const blobs = [];
    for (const path of paths) {
        blobs.push(await getBlob(ref(storage, path)));
    }
    return blobs;
};

const createPost = async ({ authorId, username, communityName, ...data }) => {
    let paths = null;
    if (data.media) {
        paths = await uploadMedia(authorId, data.media);
    }
    const id = uuidv4();
    await setDoc(doc(db, "Posts", id), { id, title: data.title, content: data.content, link: data.link, media: paths || "", votes: 0, createdOn: serverTimestamp(), author: username, authorId, communityName: communityName, upvotes: [], downvotes: [] });
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

const getUserHome = async (uid, cursorDoc = null) => {
    try {
        const user = (await getDoc(doc(db, "Users", uid))).data();
        const joined_communities = user.joined_communities;
        const postsRef = collection(db, "Posts");
        const docs = [];
        let q = null;
        if (cursorDoc === null) {
            q = query(postsRef, where("communityName", "in", joined_communities), orderBy("createdOn", "desc"), limit(5));
        }
        else {
            q = query(postsRef, where("communityName", "in", joined_communities), orderBy("createdOn", "desc"), startAfter(cursorDoc), limit(5));
        }
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => docs.push(doc));
        return docs;
    } catch (error) {
        return [];
    }
}

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
            user = doc
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
    const id = uuidv4();
    await setDoc(doc(db, "Comments", id), { id, comment: comment, votes: 0, createdOn: serverTimestamp(), author: username, authorId: uid, upvotes: [], downvotes: [], contentId });
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
    const snapshot = await getDoc(doc(db, "Comments", commentId));
    return snapshot;
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

export { createAccountUsingEmail, usernameAvailable, isEmailAvailable, loginUsingUsernameAndPassword, isLoggedIn, logout, registerAuthObserver, createCommunity, communityNameAvailable, getUsername, getCommunityInfo, createPost, getPostsByCommunity, getAllPosts, upvote, removeUpvote, downvote, removeDownvote, joinCommunity, hasJoinedCommunity, leaveCommunity, getProfileByUsername, getPostById, createComment, getComments, subscribeToComments, subscribeToPost, deleteComment, editComment, subscribeToUserDoc, saveContent, unsaveContent, deletePost, editPostContent, getMedia, getUserPosts, updateUserBanner, getProfileByUserId, setCommunityIcon, setCommunityBanner, subscribeToCommunity, deleteAccount, reauthenticate, isUsernameCorrect, updateUserEmail, updateUserPassword, updateDisplayName, updateAbout, searchPosts, searchCommunities, searchUsers, searchComments, editPostLink, getUserHome, updateCommunityDescription, uploadFileWithProgess, getCommunityDoc, updateCommunityIcon, updateCommunityBanner, updateUserProfilePicture, continueWithGoogle, keepUsername, changeUsername, reauthenticatedWithAuthProvider };