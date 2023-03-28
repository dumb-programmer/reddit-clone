import { screen, render, waitFor, fireEvent } from "@testing-library/react";
import Profile from "../components/Profile";
import '@testing-library/jest-dom';
import AuthContext from "../context/AuthContext";
import * as Firebase from "../firebase";

const user = {
    "displayName": "Jester",
    "joined_communities": [
        "test",
        "NewCommunity",
        "odin project",
        "The Last of Us"
    ],
    "saved": [
    ],
    "id": "asdfkjklr23432adfs",
    "joined_on": {
        "seconds": 1669797903,
        "nanoseconds": 758000000
    },
    "about": "This is a test to see if I can change about, and sure enough I can do it.",
    "profilePicture": "https://firebasestorage.googleapis.com/v0/b/reddit-clone-555f5.appspot.com/o/Users%2F07086149-c69b-46b1-8eee-0a28a70431c9?alt=media&token=32c207f4-ba89-4701-9d45-dadbf407d3e0",
    "banner": "https://firebasestorage.googleapis.com/v0/b/reddit-clone-555f5.appspot.com/o/Users%2Fd56aaf66-1575-4fa3-ae8e-731af19b4aee?alt=media&token=397793d6-d5cd-4e78-b988-f361404041da",
    "username": "test",
    "email": "test@test.com"
};

user.data = () => user;
user.joined_on.toMillis = () => new Date();

jest.mock("../firebase.js");
const observe = jest.fn(() => {

});
const unobserve = jest.fn();
const disconnect = jest.fn();
window.IntersectionObserver = jest.fn(() => ({
    observe,
    unobserve,
    disconnect
}));

Firebase.getProfileByUsername = jest.fn(async () => user).mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)));
Firebase.getUserPosts = jest.fn(async () => null);

describe("Profile", () => {
    test("Skeleton is shown while data is loading", () => {
        render(<Profile />);
        expect(screen.getAllByText("Loading...")).not.toBeNull();
    });
    test("Data renders", async () => {
        await waitFor(() => {
            render(<Profile />);
        });
        expect(screen.getByText(user.displayName)).toBeInTheDocument();
        expect(screen.getByText(`u/${user.username}`)).toBeInTheDocument();
        expect(screen.getByText(user.about)).toBeInTheDocument();
        expect(screen.getByTestId("profile-picture")).toBeInTheDocument();
        expect(screen.getByTestId("profile-picture").src).toEqual(user.profilePicture);
        expect(screen.getByTestId("user-banner")).toBeInTheDocument();
        if (user.banner) {
            expect(screen.getByTestId("user-banner")).toHaveStyle(`background-image: url(${user.banner})`);
        }
    });
    test("User can change their own profile picture and banner", async () => {
        const auth = { uid: user.id };
        await waitFor(() => {
            render(<AuthContext.Provider value={auth}>
                <Profile />
            </AuthContext.Provider>);
        });

        const file = new File([";)"], "test.jpg", { type: "application/jpg" });
        expect(screen.getByTestId("profile-picture-input")).toBeInTheDocument();
        fireEvent.change(screen.getByTestId("profile-picture-input"), {
            target: { files: [file] }
        });
        expect(Firebase.updateUserProfilePicture).toBeCalled();

        expect(screen.getByTestId("banner-input")).toBeInTheDocument();
        expect(screen.getByTestId("add-banner-btn")).toBeInTheDocument();
        fireEvent.change(screen.getByTestId("banner-input"), {
            target: { files: [file] }
        });
        expect(Firebase.updateUserBanner).toBeCalled();

    });
    test("Users can't change someone else's profile or banner", async () => {
        const auth = { uid: "fjaslkdfjasdklfw42" };
        await waitFor(() => {
            render(<AuthContext.Provider value={auth}>
                <Profile />
            </AuthContext.Provider>);
        });
        expect(screen.queryByTestId("profile-picture-input")).toBeNull();
        expect(screen.queryByTestId("banner-input")).toBeNull();
    })
})