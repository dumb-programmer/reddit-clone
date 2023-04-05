import randomWords from "random-words";

const generateUsernames = (length = 5) => {
    return Array.from({ length }).map(
        () => randomWords() + "_" + randomWords() + Math.ceil(Math.random() * 1000)
    );
};

export default generateUsernames;