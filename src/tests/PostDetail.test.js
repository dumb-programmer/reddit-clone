import { screen, render, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PostDetails from "../components/PostDetails";
import '@testing-library/jest-dom';
import AuthContext from "../context/AuthContext";
import * as Firebase from "../firebase";

jest.mock("../firebase.js");

const posts = [
    {
        "upvotes": [],
        "createdOn": {
            "seconds": 1678863772,
            "nanoseconds": 472000000
        },
        "author": "test",
        "id": "8d2011d2-c502-4dbc-9d66-c46470b5fg2l",
        "title": "Null Post",
        "votes": 0,
        "media": [],
        "content": "This is a post before the apocalypse started.",
        "downvotes": [],
        "link": "",
        "communityName": "the_odin_project"
    },
    {
        "upvotes": [],
        "createdOn": {
            "seconds": 1678863772,
            "nanoseconds": 472000000
        },
        "author": "test",
        "id": "1i5089b5-d349-4zxf-9h35-c46478t3fg2l",
        "title": "Odin Project Link",
        "votes": 0,
        "media": [],
        "downvotes": [],
        "link": "https://theodinproject.com",
        "communityName": "the_odin_project"
    },
    {
        "upvotes": [],
        "createdOn": {
            "seconds": 1678863772,
            "nanoseconds": 472000000
        },
        "author": "test",
        "id": "a89b352l-m0q5-k9x0-4g3z-y3t9k350o9t3",
        "title": "Odin Project Media",
        "votes": 0,
        "media": [
            "https://www.theodinproject.com/assets/img-build-4e9c3482971d09bc1e15535d71deb68e12462dacc4442d6a6a997df01330287a.svg"
        ],
        "downvotes": [],
        "communityName": "the_odin_project"
    }
];

posts.forEach(post => {
    post.data = () => post;
    post.createdOn.toMillis = () => new Date(post.createdOn.seconds);

});


const unsubComments = jest.fn();
Firebase.subscribeToComments = jest.fn(() => unsubComments);
Firebase.getMedia = jest.fn((path) => new Promise((resolve, reject) => resolve(path)));
window.URL.createObjectURL = jest.fn((blob) => blob);
const json = jest.fn(async () => true);
window.fetch = jest.fn(async () => ({ json }));

describe("PostDetails", () => {
    test("Skeleton is shown while data is loading", async () => {
        Firebase.getPostById = jest.fn(async () => null);
        Firebase.getComments = jest.fn(async () => null);
        Firebase.getCommunityInfo = jest.fn(async () => null);
        render(<MemoryRouter>
            <PostDetails />
        </MemoryRouter>);

        expect(screen.getAllByText("Loading...")).not.toBeNull();
    });

    describe("Data renders", () => {
        test("Content", async () => {
            const contentPost = posts[0];
            Firebase.getPostById = jest.fn(async () => contentPost);
            await waitFor(() => {
                render(<MemoryRouter>
                    <PostDetails />
                </MemoryRouter>);
            });
            expect(screen.getByText(contentPost.title)).toBeInTheDocument();
            expect(screen.getByText(contentPost.content)).toBeInTheDocument();
            expect(screen.getByText(`u/${contentPost.author}`)).toBeInTheDocument();
            expect(screen.getByText(`${contentPost.votes}`)).toBeInTheDocument();
        })

        test("Link", async () => {
            const linkPost = posts[1];
            Firebase.getPostById = jest.fn(async () => linkPost);
            await waitFor(() => {
                render(<MemoryRouter>
                    <PostDetails />
                </MemoryRouter>);
            });
            expect(screen.getByText(linkPost.title)).toBeInTheDocument();
            expect(screen.getByText(linkPost.link)).toBeInTheDocument();
            expect(screen.getByText(linkPost.link)).toHaveAttribute("href", `${linkPost.link}`)
            expect(screen.getByText(`u/${linkPost.author}`)).toBeInTheDocument();
            expect(screen.getByText(`${linkPost.votes}`)).toBeInTheDocument();

            // Link preview
            expect(await screen.findByTestId("link-preview")).toBeInTheDocument();
            expect(window.fetch).toHaveBeenCalled();
            expect(window.fetch).toHaveBeenCalledWith(`https://api.linkpreview.net/?key=${process.env.REACT_APP_LINK_PREVIEW_API_KEY}&q=${linkPost.link}`);
            expect(json).toHaveBeenCalled();
        });

        test("Media", async () => {
            const mediaPost = posts[2];
            Firebase.getPostById = jest.fn(async () => mediaPost);
            await waitFor(() => {
                render(<MemoryRouter>
                    <PostDetails />
                </MemoryRouter>);
            });

            expect(screen.getByText(mediaPost.title)).toBeInTheDocument();
            expect(await screen.findByTestId("carousal-img")).toBeInTheDocument();
            expect(await screen.findByTestId("carousal-img")).toHaveAttribute("src", mediaPost.media[0]);
            expect(Firebase.getMedia).toHaveBeenCalled();
            expect(Firebase.getMedia).toHaveBeenCalledWith(mediaPost.media[0]);
            expect(window.URL.createObjectURL).toHaveBeenCalled();
            expect(window.URL.createObjectURL).toHaveBeenCalledWith(mediaPost.media[0]);
            expect(screen.getByText(`u/${mediaPost.author}`)).toBeInTheDocument();
            expect(screen.getByText(`${mediaPost.votes}`)).toBeInTheDocument();
        });
    });
})