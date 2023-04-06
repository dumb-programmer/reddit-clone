import { screen, render, waitFor } from "@testing-library/react";
import App from "../App";
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router-dom";
import * as Firebase from "../firebase";

jest.mock("../firebase.js");

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
Firebase.registerAuthObserver = jest.fn((cb) => {
    return jest.fn();
});
Firebase.getAllPosts = jest.fn(async () => null);
Firebase.getUserHome = jest.fn(async () => null);
Firebase.getCommunityDoc = jest.fn(async () => null);
Firebase.getCommunityInfo = jest.fn(async () => null);
Firebase.getPostsByCommunity = jest.fn(async () => null);
Firebase.hasJoinedCommunity = jest.fn(async () => null);
Firebase.subscribeToComments = jest.fn(() => jest.fn());
Firebase.searchPosts = jest.fn(async () => null);
Firebase.getUserPosts = jest.fn(async () => null);
Firebase.getProfileByUsername = jest.fn(async () => null);


describe("App", () => {
    describe("/", () => {
        test("Unauthenticated users are shown latest posts from all communities", async () => {
            await waitFor(() => {
                render(<MemoryRouter><App /></MemoryRouter>);
            });
            expect(Firebase.getAllPosts).toBeCalled();
        });
        test("Authenticated users are shown customized feed", async () => {
            const auth = { uid: "jfafasdj32kl432asdf" };
            Firebase.registerAuthObserver = jest.fn((cb) => {
                cb(auth)
                return jest.fn();
            });
            await waitFor(() => {
                render(<MemoryRouter>
                    <App />
                </MemoryRouter>);
            })
            expect(Firebase.getUserHome).toBeCalled();
        });
    })
    test("/r/:communityName", async () => {
        await waitFor(() => {
            render(<MemoryRouter initialEntries={["/r/test"]}>
                <App />
            </MemoryRouter>);
        });
        expect(Firebase.getCommunityDoc).toBeCalled();
        expect(Firebase.getCommunityDoc).toBeCalledWith("test");
        expect(Firebase.getPostsByCommunity).toBeCalled();
    });
    test("/r/:communityName/:postId", async () => {
        await waitFor(() => {
            render(<MemoryRouter initialEntries={["/r/test/324-asdkjf-32fasd"]}>
                <App />
            </MemoryRouter>);
        });
        expect(Firebase.subscribeToPost).toBeCalled();
        expect(Firebase.subscribeToComments).toBeCalled();
        expect(Firebase.getCommunityInfo).toBeCalled();
    });
    test("/search", async () => {
        await waitFor(() => {
            render(<MemoryRouter initialEntries={["/search?q=test&type=posts"]}>
                <App />
            </MemoryRouter>);
        });
        expect(Firebase.searchPosts).toBeCalled();
        expect(Firebase.searchPosts).toBeCalledWith("test");
    });
    test("/r/:communityName/submit", async () => {
        await waitFor(() => {
            render(<MemoryRouter initialEntries={["/r/test/submit"]}>
                <App />
            </MemoryRouter>);
        });
        expect(screen.getByText(/create a post/i)).toBeInTheDocument();
    })
    test("/user/:userId", async () => {
        await waitFor(() => {
            render(<MemoryRouter initialEntries={["/user/test"]}>
                <App />
            </MemoryRouter>);
        });
        expect(Firebase.getProfileByUsername).toBeCalled();
        expect(Firebase.getUserPosts).toBeCalled();
    });
    test("/settings", async () => {
        await waitFor(() => {
            render(<MemoryRouter initialEntries={["/settings"]}>
                <App />
            </MemoryRouter>);
        });
        expect(screen.getByText(/user settings/i)).toBeInTheDocument();
    })
})