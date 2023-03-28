import { screen, render, fireEvent } from "@testing-library/react";
import CreatePost from "../components/post/CreatePost";
import '@testing-library/jest-dom';
import * as Firebase from "../firebase";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

jest.mock("../firebase.js");
jest.mock("react-router-dom", () => {
    const navigate = jest.fn();
    return {
        ...(jest.requireActual("react-router-dom")),
        useNavigate: () => navigate
    }
});

const newPostId = "fas234-ajk34";
Firebase.getCommunityInfo = jest.fn(async () => null);
Firebase.createPost = jest.fn(async () => newPostId);

describe("CreatePost", () => {
    const communityName = "test";
    const user = userEvent.setup();

    test("Renders", () => {
        render(<MemoryRouter initialEntries={[`/r/${communityName}/submit`]}>
            <Routes>
                <Route path="/r/:communityName/submit" element={<CreatePost />} />
            </Routes>
        </MemoryRouter>);
        expect(screen.getByText(/create a post/i)).toBeInTheDocument();
        expect(screen.getAllByText(/^post$/i)).not.toBeNull();
        expect(screen.getByText(/images/i)).toBeInTheDocument();
        expect(screen.getByText(/link/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/text/i)).toBeInTheDocument();
        expect(screen.getByText(/cancel/i)).toBeInTheDocument();
        expect(Firebase.getCommunityInfo).toBeCalled();
        expect(Firebase.getCommunityInfo).toBeCalledWith(communityName);
    });

    describe("Tabs work", () => {
        let postTab;
        let imagesTab;
        let linkTab;
        beforeEach(() => {
            render(<MemoryRouter initialEntries={[`/r/${communityName}/submit`]}>
                <Routes>
                    <Route path="/r/:communityName/submit" element={<CreatePost />} />
                </Routes>
            </MemoryRouter>);
            postTab = screen.getByTestId("post-tab");
            imagesTab = screen.getByTestId("images-tab");
            linkTab = screen.getByTestId("link-tab");
        });

        test("Post", async () => {
            await user.click(postTab);
            expect(postTab).toHaveClass("post-creator-tab__active");
        });

        test("Images", async () => {
            await user.click(imagesTab);
            expect(imagesTab).toHaveClass("post-creator-tab__active");
            expect(screen.getByText(/drag and drop images/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
            expect(screen.getByText(/upload/i)).toBeInTheDocument();
        });

        test("Link", async () => {
            await user.click(linkTab);
            expect(linkTab).toHaveClass("post-creator-tab__active");
            expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/url/i)).toBeInTheDocument();
        });
    });

    test("Title input works", async () => {
        render(<MemoryRouter initialEntries={[`/r/${communityName}/submit`]}>
            <Routes>
                <Route path="/r/:communityName/submit" element={<CreatePost />} />
            </Routes>
        </MemoryRouter>);
        const titleInput = screen.getByPlaceholderText(/title/i);
        const value = "Hello";
        await user.type(titleInput, value);
        expect(titleInput).toHaveValue(value);
        expect(screen.getByTestId("title-remaining-characters")).toHaveTextContent(`${value.length}/300`)
    });

    describe("Users can create a post", () => {
        let titleInput;
        let textInput;
        beforeEach(() => {
            localStorage.setItem("username", "test");
            render(<MemoryRouter initialEntries={[`/r/${communityName}/submit`]}>
                <Routes>
                    <Route path="/r/:communityName/submit" element={<CreatePost />} />
                </Routes>
            </MemoryRouter>);
            titleInput = screen.getByPlaceholderText(/title/i);
            textInput = screen.getByPlaceholderText(/text/i);
        });

        test("Text input works", async () => {
            const value = "Hello";
            await user.type(textInput, value);
            expect(textInput).toHaveValue(value);
        });

        test("Post is created on submit", async () => {
            const title = "Hello";
            const text = "This is a post";
            await user.type(titleInput, title);
            await user.type(textInput, text);
            await user.click(screen.getByTestId("post-btn"));
            expect(Firebase.createPost).toBeCalled();
            expect(Firebase.createPost).toBeCalledWith({ communityName, title, content: text, link: "", media: [], username: "test" });
            expect(useNavigate()).toBeCalled();
            expect(useNavigate()).toBeCalledWith(`/r/${communityName}/${newPostId}`);
        });
    });

    describe("Users can create a images post", () => {
        let titleInput;
        let fileInput;
        beforeEach(async () => {
            localStorage.setItem("username", "test");
            render(<MemoryRouter initialEntries={[`/r/${communityName}/submit`]}>
                <Routes>
                    <Route path="/r/:communityName/submit" element={<CreatePost />} />
                </Routes>
            </MemoryRouter>);
            await user.click(screen.getByTestId("images-tab"));
            titleInput = screen.getByPlaceholderText(/title/i);
            fileInput = screen.getByTestId("file-input");
        });

        const files = [
            new File(["test"], "test.jpg", { type: "application/jpg" }),
            new File(["test"], "test.jpeg", { type: "application/jpeg" }),
            new File(["test"], "test.png", { type: "application/png" }),
            new File(["test"], "test.gif", { type: "application/gif" }),
            new File(["test"], "test.webp", { type: "application/webp" }),
        ];

        describe("ImagesUpload", () => {
            beforeEach(() => {
                fireEvent.change(fileInput, {
                    target: { files }
                });
            });

            test("File upload works", async () => {
                expect(fileInput.files).toEqual(files);
            });
        });

        test("Post is created on submit", async () => {
            const title = "Hello"
            await user.type(titleInput, title);
            fireEvent.change(fileInput, {
                target: { files }
            });
            await user.click(screen.getByTestId("post-btn"));
            expect(Firebase.createPost).toBeCalled();
            expect(Firebase.createPost).toBeCalledWith({ communityName, title, content: "", link: "", media: files, username: "test" });
        });
    })

    describe("Users can create a link post", () => {
        let titleInput;
        let urlInput;
        beforeEach(async () => {
            localStorage.setItem("username", "test");
            render(<MemoryRouter initialEntries={[`/r/${communityName}/submit`]}>
                <Routes>
                    <Route path="/r/:communityName/submit" element={<CreatePost />} />
                </Routes>
            </MemoryRouter>);
            await user.click(screen.getByTestId("link-tab"));
            titleInput = screen.getByPlaceholderText(/title/i);
            urlInput = screen.getByPlaceholderText(/url/i);
        });

        test("Url input works", async () => {
            const value = "Hello";
            await user.type(urlInput, value);
            expect(urlInput).toHaveValue(value);
        });

        test("Post is created on submit", async () => {
            const title = "Hello";
            const url = "http://google.com";
            await user.type(titleInput, title);
            await user.type(urlInput, url);
            await user.click(screen.getByTestId("post-btn"));
            expect(Firebase.createPost).toBeCalled();
            expect(Firebase.createPost).toBeCalledWith({ communityName, title, content: "", link: url, media: [], username: "test" });
        });
    });
});