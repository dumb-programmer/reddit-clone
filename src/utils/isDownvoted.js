const isDownvoted = (downvotes, uid) => {
    return downvotes.includes(uid);
};

export default isDownvoted;