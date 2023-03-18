import randomWords from "random-words";

const generateUsernames = () => {
    return Array.from({ length: 5 }).map(
        () => randomWords() + "_" + randomWords() + Math.ceil(Math.random() * 1000)
    );
};

export default generateUsernames;