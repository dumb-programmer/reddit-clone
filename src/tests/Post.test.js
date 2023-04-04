import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Post from "../components/post/Post";
import * as Firebase from "../firebase.js";
import '@testing-library/jest-dom'

jest.mock("../utils/getRelativeDateTime.js");
jest.mock("../firebase.js");

const dataContent = {
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
};

const dataLink = {
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
};

const dataMedia = {
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
};

const unsub = jest.fn();
Firebase.subscribeToPost = jest.fn(() => unsub);
Firebase.getMedia = jest.fn((path) => new Promise((resolve, reject) => resolve(path)));
window.URL.createObjectURL = jest.fn((blob) => blob);
dataContent.createdOn.toMillis = jest.fn(() => new Date());
dataLink.createdOn.toMillis = jest.fn(() => new Date());
dataMedia.createdOn.toMillis = jest.fn(() => new Date());

describe("Post", () => {
    test("Render and unmount", () => {
        const { unmount } = render(<MemoryRouter>
            <Post data={dataContent} id={1} />
        </MemoryRouter>);

        expect(Firebase.subscribeToPost).toHaveBeenCalled();
        unmount();
        expect(unsub).toHaveBeenCalled();
    });

    test("Data is rendered", () => {
        render(<MemoryRouter>
            <Post data={dataContent} id={1} />
        </MemoryRouter>);
        expect(screen.getByRole("heading")).toBeInTheDocument();
        expect(screen.getByRole("heading").textContent).toEqual(dataContent.title);
        expect(screen.getByText(`u/${dataContent.author}`)).toBeInTheDocument();
        expect(screen.getByText(`r/${dataContent.communityName}`)).toBeInTheDocument();
        expect(screen.getByText(`${dataContent.content}`)).toBeInTheDocument();
    });

    test("Link is displayed for posts containing link", () => {
        render(<MemoryRouter>
            <Post data={dataLink} id={1} />
        </MemoryRouter>);
        expect(screen.getByRole("heading")).toBeInTheDocument();
        expect(screen.getByRole("heading").textContent).toEqual(dataLink.title);
        expect(screen.getByText(`u/${dataLink.author}`)).toBeInTheDocument();
        expect(screen.getByText(`r/${dataLink.communityName}`)).toBeInTheDocument();
        expect(screen.getByText(`${dataLink.link}`)).toBeInTheDocument();
    });

    test("Media is displayed for posts containing media", async () => {
        await waitFor(() => {
            render(<MemoryRouter>
                <Post data={dataMedia} id={1} />
            </MemoryRouter>)
        });
        expect(screen.getByRole("heading")).toBeInTheDocument();
        expect(screen.getByRole("heading").textContent).toEqual(dataMedia.title);
        expect(screen.getByText(`u/${dataMedia.author}`)).toBeInTheDocument();
        expect(screen.getByText(`r/${dataMedia.communityName}`)).toBeInTheDocument();
        expect(Firebase.getMedia).toBeCalled();
        expect(Firebase.getMedia).toBeCalledWith(dataMedia.media);
        expect(await Firebase.getMedia(dataMedia.media[0])).toEqual(dataMedia.media[0])
        expect(window.URL.createObjectURL(dataMedia.media[0])).toEqual(dataMedia.media[0])
        expect(screen.getByRole("img")).toBeInTheDocument();
        expect(screen.getByRole("img")).toHaveAttribute("src", dataMedia.media[0]);
    });
})