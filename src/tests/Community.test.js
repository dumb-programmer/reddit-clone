import { screen, render, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Community from "../components/community/Community";
import '@testing-library/jest-dom';
import AuthContext from "../context/AuthContext";
import * as Firebase from "../firebase";

const community = {
    "createdOn": {
        "seconds": 1678818023,
        "nanoseconds": 672000000
    },
    "type": "public",
    "description": "Odin project discussion",
    "name": "odin project",
    "members": "1000000",
    "moderator": "test",
    "moderatorId": "dafkjsdlfjkasljwerkfd"
};
let posts = [
    {
        "createdOn": {
            "seconds": 1678817794,
            "nanoseconds": 491000000
        },
        "id": "ff2dcce8-8f1c-4b1f-b103-515a09fdf665",
        "communityName": "odin project",
        "link": "",
        "votes": 0,
        "author": "test",
        "content": "This is an announcement.",
        "title": "Announcement",
        "upvotes": [],
        "media": [],
        "downvotes": []
    },
    {
        "title": "First Post",
        "communityName": "odin project",
        "votes": 0,
        "createdOn": {
            "seconds": 1678815590,
            "nanoseconds": 402000000
        },
        "author": "test",
        "media": [],
        "id": "a9eacebb-52a8-4b88-b21e-04da10b3ec77",
        "link": "",
        "upvotes": [],
        "downvotes": [],
        "content": "This is my first post"
    }
];

posts.forEach(post => post.data = () => post);
posts.forEach(post => post.createdOn.toMillis = () => new Date(post.createdOn.seconds));
community.data = () => community;
community.exists = () => true;
community.createdOn.toMillis = () => new Date(community.createdOn.seconds);

jest.mock("../firebase.js");

const unsubFromCommunity = jest.fn();
const unsubFromPost = jest.fn();
Firebase.subscribeToPost = jest.fn(() => unsubFromPost);
Firebase.subscribeToCommunity = jest.fn(() => unsubFromCommunity);
Firebase.hasJoinedCommunity = jest.fn(async () => true);

const setData = jest.fn();
const fetchPosts = jest.fn();
const observe = jest.fn(() => {
    fetchPosts();
    setData();
});
const unobserve = jest.fn();
const disconnect = jest.fn();
window.IntersectionObserver = jest.fn(() => ({
    observe,
    unobserve,
    disconnect
}));

describe("Community", () => {
    test("Skeleton is show while data is loading", async () => {
        Firebase.getCommunityDoc = jest.fn(async () => null);
        Firebase.getPostsByCommunity = jest.fn(async () => null);
        await waitFor(() => {
            render(<MemoryRouter>
                <Community />
            </MemoryRouter>);
        });

        expect(screen.getByTestId("community-name").textContent).toEqual("Loading...");
        expect(screen.getByTestId("community-handle").textContent).toEqual("Loading...");
    });

    test("Data renders", async () => {
        Firebase.getCommunityDoc = jest.fn(async () => community);
        Firebase.getPostsByCommunity = jest.fn(async () => posts);
        await waitFor(() => {
            render(<MemoryRouter>
                <Community />
            </MemoryRouter>);
        });

        expect(screen.getByTestId("community-name").textContent).toEqual(community.name);
        expect(screen.getByTestId("community-handle").textContent).toEqual(`r/${community.name}`);
    });

    test("Community not found message is shown, if community doesn't exist", async () => {
        community.exists = () => false;
        Firebase.getCommunityDoc = jest.fn(async () => community);
        Firebase.getPostsByCommunity = jest.fn(async () => posts);
        await waitFor(() => {
            render(<MemoryRouter>
                <Community />
            </MemoryRouter>);
        });
        expect(screen.getByText(/sorry, there aren't any communities with that name/i)).toBeInTheDocument();
    })

    describe("Moderator Controls", () => {
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        beforeAll(() => {
            community.exists = () => true;
        });
        test("Normal user isn't allowed to edit community icon and banner", async () => {

            const auth = { uid: 'fkajksdfjlasdf' };

            await waitFor(() => {
                render(<MemoryRouter>
                    <AuthContext.Provider value={auth}>
                        <Community />
                    </AuthContext.Provider>
                </MemoryRouter>);
            });

            fireEvent.change(screen.getByTestId("community-icon"), {
                target: { files: [file] }
            })
            expect(Firebase.updateCommunityIcon).not.toHaveBeenCalled();


            fireEvent.change(screen.getByTestId("community-banner"), {
                target: { files: [file] }
            })
            expect(Firebase.updateCommunityBanner).not.toHaveBeenCalled();
        });

        test("Moderator is allowed to upload icon and banner", async () => {
            const auth = { uid: community.moderatorId };
            await waitFor(() => {
                render(<MemoryRouter>
                    <AuthContext.Provider value={auth}>
                        <Community />
                    </AuthContext.Provider>
                </MemoryRouter>);
            });

            fireEvent.change(screen.getByTestId("community-icon"), {
                target: {
                    files: [file],
                },
            })

            expect(Firebase.updateCommunityIcon).toHaveBeenCalled();

            fireEvent.change(screen.getByTestId("community-banner"), {
                target: { files: [file] }
            })
            expect(Firebase.updateCommunityBanner).toHaveBeenCalled();
        });
    })
})