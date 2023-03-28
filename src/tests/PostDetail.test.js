import { screen, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PostDetails from "../components/post/PostDetails";
import '@testing-library/jest-dom';
import AuthContext from "../context/AuthContext";
import * as Firebase from "../firebase";
import userEvent from "@testing-library/user-event";
import useRedirect from "../hooks/useRedirect";

jest.mock("../firebase.js");

const posts = [
    {
        "upvotes": [],
        "createdOn": {
            "seconds": 1678863772,
            "nanoseconds": 472000000
        },
        "author": "test",
        "authorId": "awekrj43jfsd",
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
        "authorId": "awekrj43jfsd",
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
        "authorId": "awekrj43jfsd",
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
    post.ref = post.id;
    post.createdOn.toMillis = () => new Date(post.createdOn.seconds);

});


const unsubComments = jest.fn();
Firebase.subscribeToComments = jest.fn(() => unsubComments);
Firebase.getMedia = jest.fn((path) => new Promise((resolve, reject) => resolve(path)));
window.URL.createObjectURL = jest.fn((blob) => blob);
const json = jest.fn(async () => true);
window.fetch = jest.fn(async () => ({ json }));
jest.mock("../hooks/useRedirect", () => {
    const redirect = jest.fn();
    const useRedirect = jest.fn(() => redirect);
    return useRedirect;
});

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
            expect(window.fetch).toBeCalled();
            expect(window.fetch).toBeCalledWith(`https://api.linkpreview.net/?key=${process.env.REACT_APP_LINK_PREVIEW_API_KEY}&q=${linkPost.link}`);
            expect(json).toBeCalled();
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
            expect(Firebase.getMedia).toBeCalled();
            expect(Firebase.getMedia).toBeCalledWith(mediaPost.media[0]);
            expect(window.URL.createObjectURL).toBeCalled();
            expect(window.URL.createObjectURL).toBeCalledWith(mediaPost.media[0]);
            expect(screen.getByText(`u/${mediaPost.author}`)).toBeInTheDocument();
            expect(screen.getByText(`${mediaPost.votes}`)).toBeInTheDocument();
        });
    });

    describe("ShowMore works in the context of a post", () => {
        test("Dropdown opens on click", async () => {
            const post = posts[0];
            Firebase.getPostById = jest.fn(async () => post);
            await waitFor(() => {
                render(<MemoryRouter>
                    <PostDetails />
                </MemoryRouter>);
            });
            expect(screen.getByTestId("show-more")).toBeInTheDocument();

            const user = userEvent.setup();

            await user.click(screen.getByTestId("show-more"));
            expect(screen.getByTestId("content-dropdown")).toBeInTheDocument();
            expect(screen.getByTestId("save")).toBeInTheDocument();
        });

        test("Unauthenticated users are redirect to /login when save is clicked", async () => {
            const post = posts[0];
            Firebase.getPostById = jest.fn(async () => post);
            await waitFor(() => {
                render(<MemoryRouter>
                    <PostDetails />
                </MemoryRouter>);
            });
            const user = userEvent.setup();

            await user.click(screen.getByTestId("show-more"));
            await user.click(screen.getByTestId("save"));

            expect(useRedirect).toBeCalled();
            expect(useRedirect).toBeCalledWith("/login", "You need to login first");
            expect(useRedirect()).toBeCalled();

        });

        test("Authenticated user can save/unsave the post", async () => {
            const post = posts[0];
            Firebase.getPostById = jest.fn(async () => post);
            const auth = { uid: "fjaksldfj34fasd" };
            await waitFor(() => {
                render(<MemoryRouter>
                    <AuthContext.Provider value={auth}>
                        <PostDetails />
                    </AuthContext.Provider>
                </MemoryRouter>);
            });
            const user = userEvent.setup();

            // TODO: Mock subscribeToUser

            // Save
            await user.click(screen.getByTestId("show-more"));
            await user.click(screen.getByTestId("save"));
            expect(Firebase.saveContent).toBeCalled();
            expect(Firebase.saveContent).toBeCalledWith(auth.uid, post.id);
            expect(screen.getByText(/post saved successfully/i)).toBeInTheDocument();

            // Unsave
            // await user.click(screen.getByTestId("show-more"));
            // await user.click(screen.getByTestId("save"));
            // expect(Firebase.unsaveContent).toBeCalled();
            // expect(Firebase.unsaveContent).toBeCalledWith(auth.uid, post.id);
            // expect(screen.getByText(/post unsaved successfully/i)).toBeInTheDocument();
        });

        describe("Post can be edited by the owner", () => {
            test("Content", async () => {
                const post = posts[0];
                Firebase.getPostById = jest.fn(async () => post);
                const auth = { uid: post.authorId };
                await waitFor(() => {
                    render(<MemoryRouter>
                        <AuthContext.Provider value={auth}>
                            <PostDetails />
                        </AuthContext.Provider>
                    </MemoryRouter>);
                });
                const user = userEvent.setup();

                await user.click(screen.getByTestId("show-more"));
                expect(screen.getByTestId("edit")).toBeInTheDocument();
                await user.click(screen.getByTestId("edit"));
                expect(screen.getByTestId("edit-post-textbox")).toBeInTheDocument();
                expect(screen.getByTestId("edit-post-textbox")).toHaveValue(post.content);

                await user.clear(screen.getByTestId("edit-post-textbox"));
                await user.type(screen.getByTestId("edit-post-textbox"), "This is new text");
                expect(screen.getByTestId("edit-post-textbox")).toHaveValue("This is new text");

                // Cancel button closes the edit form
                await user.click(screen.getByTestId("cancel-edit-btn"));
                expect(screen.getByText(post.content)).toBeInTheDocument();
                expect(screen.queryByTestId("edit-post-textbox")).toBeNull();

                // Reopen the edit form
                await user.click(screen.getByTestId("show-more"));
                await user.click(screen.getByTestId("edit"));
                await user.clear(screen.getByTestId("edit-post-textbox"));
                await user.type(screen.getByTestId("edit-post-textbox"), "This is new text");

                await user.click(screen.getByTestId("save-edits-btn"));
                expect(Firebase.editPostContent).toBeCalled();
                expect(Firebase.editPostContent).toBeCalledWith(post.id, "This is new text");
            });

            test("Link", async () => {
                const post = posts[1];
                Firebase.getPostById = jest.fn(async () => post);
                const auth = { uid: post.authorId };
                await waitFor(() => {
                    render(<MemoryRouter>
                        <AuthContext.Provider value={auth}>
                            <PostDetails />
                        </AuthContext.Provider>
                    </MemoryRouter>);
                });
                const user = userEvent.setup();

                await user.click(screen.getByTestId("show-more"));
                expect(screen.getByTestId("edit")).toBeInTheDocument();
                await user.click(screen.getByTestId("edit"));
                expect(screen.getByTestId("edit-post-textbox")).toBeInTheDocument();
                expect(screen.getByTestId("edit-post-textbox")).toHaveValue(post.link);

                await user.clear(screen.getByTestId("edit-post-textbox"));
                await user.type(screen.getByTestId("edit-post-textbox"), "This is new text");
                expect(screen.getByTestId("edit-post-textbox")).toHaveValue("This is new text");

                // Cancel button closes the edit form
                await user.click(screen.getByTestId("cancel-edit-btn"));
                expect(screen.getByText(post.link)).toBeInTheDocument();
                expect(screen.queryByTestId("edit-post-textbox")).toBeNull();

                // Reopen the edit form
                await user.click(screen.getByTestId("show-more"));
                await user.click(screen.getByTestId("edit"));
                await user.clear(screen.getByTestId("edit-post-textbox"));
                await user.type(screen.getByTestId("edit-post-textbox"), "This is new text");

                await user.click(screen.getByTestId("save-edits-btn"));
                expect(Firebase.editPostLink).toBeCalled();
                expect(Firebase.editPostLink).toBeCalledWith(post.id, "This is new text");
            })
        });
    });

    test("Owner can delete a post", async () => {
        const post = posts[0];
        Firebase.getPostById = jest.fn(async () => post);
        const auth = { uid: post.authorId };
        await waitFor(() => {
            render(<MemoryRouter>
                <AuthContext.Provider value={auth}>
                    <PostDetails />
                </AuthContext.Provider>
            </MemoryRouter>);
        });
        const user = userEvent.setup();

        await user.click(screen.getByTestId("show-more"));
        expect(screen.getByTestId("delete")).toBeInTheDocument();
        await user.click(screen.getByTestId("delete"));

        // Delete modal opens
        expect(screen.getByText("Delete post?")).toBeInTheDocument();
        expect(screen.getByText("Delete")).toBeInTheDocument();
        expect(screen.getByText("Keep")).toBeInTheDocument();

        // Modal closes
        await user.click(screen.getByText("Keep"));
        expect(screen.queryByText("Delete post?")).toBeNull();

        await user.click(screen.getByTestId("show-more"));
        await user.click(screen.getByTestId("delete"));
        await user.click(screen.getByText("Delete"));
        expect(Firebase.deletePost).toBeCalled();
        expect(Firebase.deletePost).toBeCalledWith(post);
    });

    test("Authenticated users can comment under the post", async () => {
        const post = posts[0];
        Firebase.getPostById = jest.fn(async () => post);
        const auth = { uid: post.authorId, username: "test" };
        localStorage.setItem('username', auth.username);
        await waitFor(() => {
            render(<MemoryRouter>
                <AuthContext.Provider value={auth}>
                    <PostDetails />
                </AuthContext.Provider>
            </MemoryRouter>);
        });

        const user = userEvent.setup();

        expect(screen.getByTestId("comment-box")).toBeInTheDocument();
        await user.type(screen.getByTestId("comment-box"), "Hello");
        expect(screen.getByTestId("comment-box")).toHaveValue("Hello");

        await user.click(screen.getByTestId("comment-btn"));
        expect(Firebase.createComment).toBeCalled();
        expect(Firebase.createComment).toBeCalledWith("Hello", auth.username, auth.uid, post.id);
    });

    test("Unauthenticated users are redirect to /login on comment", async () => {
        const post = posts[0];
        Firebase.getPostById = jest.fn(async () => post);

        await waitFor(() => {
            render(<MemoryRouter>
                <PostDetails />
            </MemoryRouter>);
        });

        const user = userEvent.setup();

        expect(screen.getByTestId("comment-box")).toBeInTheDocument();
        await user.type(screen.getByTestId("comment-box"), "Hello");
        await user.click(screen.getByTestId("comment-btn"));
        expect(useRedirect()).toHaveBeenCalledTimes(2);
    });
})