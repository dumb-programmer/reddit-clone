import { screen, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Comment from "../components/Comment";
import '@testing-library/jest-dom';
import AuthContext from "../context/AuthContext";
import * as Firebase from "../firebase";
import userEvent from "@testing-library/user-event";
import useRedirect from "../hooks/useRedirect";

jest.mock("../firebase.js");

const comment = {
    "authorId": "fajsdklfjaskd3234",
    "author": "test",
    "createdOn": {
        "seconds": 1678818280,
        "nanoseconds": 434000000
    },
    "comment": "Hello",
    "downvotes": [],
    "upvotes": [
        "fajsdklfjaskd3234"
    ],
    "votes": 1,
    "id": "4808d956-e00d-4093-ba4c-f20d03828a9b",
    "contentId": "ff2dcce8-8f1c-4b1f-b103-515a09fdf665"
};

comment.ref = comment.id;
comment.data = () => comment;

Firebase.getComments = jest.fn(async () => null);
Firebase.getProfileByUserId = jest.fn(async () => null);
const unsubComments = jest.fn();
Firebase.subscribeToComments = jest.fn(() => unsubComments);

jest.mock("../hooks/useRedirect", () => {
    const redirect = jest.fn();
    const useRedirect = jest.fn(() => redirect);
    return useRedirect;
});

describe("Comment", () => {
    const user = userEvent.setup();
    test("Renders", async () => {
        await waitFor(() => {
            render(<MemoryRouter>
                <Comment comment={comment} />
            </MemoryRouter>);
        });
        expect(screen.getByText(comment.author)).toBeInTheDocument();
        expect(screen.getByText(comment.comment)).toBeInTheDocument();
        expect(screen.getByText(comment.votes)).toBeInTheDocument();
        expect(screen.getByText(/reply/i)).toBeInTheDocument();
        expect(screen.getByTestId("show-more")).toBeInTheDocument();
        expect(useRedirect).toHaveBeenCalled();
        expect(useRedirect).toHaveBeenCalledWith("/login", "You need to login first");
    });

    test("Comment can be minimized and maximized", async () => {
        await waitFor(() => {
            render(<MemoryRouter>
                <Comment comment={comment} />
            </MemoryRouter>);
        });

        // Minimize
        await user.click(screen.getByTestId("thread-line"));
        expect(screen.getByText(comment.author)).toBeInTheDocument();
        expect(screen.queryByText(comment.comment)).toBeNull();
        expect(screen.queryByText(comment.votes)).toBeNull();
        expect(screen.queryByText(/reply/i)).toBeNull();
        expect(screen.queryByTestId("show-more")).toBeNull();
        expect(screen.getByTestId("maximize-btn")).toBeInTheDocument();

        // Maximize
        await user.click(screen.getByTestId("maximize-btn"));
        expect(screen.getByText(comment.author)).toBeInTheDocument();
        expect(screen.getByText(comment.comment)).toBeInTheDocument();
        expect(screen.getByText(comment.votes)).toBeInTheDocument();
        expect(screen.getByText(/reply/i)).toBeInTheDocument();
        expect(screen.getByTestId("show-more")).toBeInTheDocument();
        expect(screen.queryByTestId("maximize-btn")).toBeNull();
    });

    test("Reply redirects unauthenticated users to /login", async () => {
        await waitFor(() => {
            render(<MemoryRouter>
                <Comment comment={comment} />
            </MemoryRouter>);
        });
        await user.click(screen.getByText(/reply/i));
        expect(useRedirect()).toHaveBeenCalled();
    });

    describe("Authenticated users can reply to a comment", () => {
        let replyBox;
        let cancelBtn;
        let commentBtn;
        const auth = { uid: "wrkjdffad2342sfa" };
        beforeEach(async () => {
            localStorage.setItem("username", "jester");
            await waitFor(() => {
                render(<MemoryRouter>
                    <AuthContext.Provider value={auth}>
                        <Comment comment={comment} />
                    </AuthContext.Provider>
                </MemoryRouter>);
            });
            await user.click(screen.getByText(/reply/i));
            replyBox = screen.getByRole("textbox");
            cancelBtn = screen.getByText(/cancel/i);
            commentBtn = screen.getByTestId("comment-btn");
        });

        test("Reply comment box renders", async () => {
            expect(replyBox).toBeInTheDocument();
            expect(cancelBtn).toBeInTheDocument();
            expect(commentBtn).toBeInTheDocument();
            expect(commentBtn).toBeDisabled();
        });

        test("Comment box works", async () => {
            await user.type(replyBox, "Hello");
            expect(replyBox).toHaveValue("Hello");
        });

        test("Cancel btn works", async () => {
            await user.click(cancelBtn);
            expect(replyBox).not.toBeInTheDocument();
            expect(cancelBtn).not.toBeInTheDocument();
            expect(commentBtn).not.toBeInTheDocument();
        });

        test("Comment is created on reply button", async () => {
            await user.type(replyBox, "Hello");
            await user.click(commentBtn);
            expect(Firebase.createComment).toBeCalled();
            expect(Firebase.createComment).toBeCalledWith("Hello", "jester", auth.uid, comment.id);
        });
    });

    describe("ShowMore works with comment", () => {
        let saveComment;
        let editComment;
        let deleteComment;
        let unmountComponent;
        const setToastText = jest.fn();
        const showToast = jest.fn();
        describe("Authenticated users", () => {
            localStorage.setItem("username", "jester");
            const auth = { uid: "wrkjdffad2342sfa" };
            beforeEach(async () => {
                await waitFor(() => {
                    const { unmount } = render(<MemoryRouter>
                        <AuthContext.Provider value={auth}>
                            <Comment comment={comment} setToastText={setToastText} showToast={showToast} />
                        </AuthContext.Provider>
                    </MemoryRouter>);
                    unmountComponent = unmount;
                });
                await user.click(screen.getByTestId("show-more"));
                saveComment = screen.getByText(/save/i);
                editComment = screen.queryByText(/edit/i);
                deleteComment = screen.queryByText(/delete/i);
            });

            test("Renders", () => {
                expect(saveComment).toBeInTheDocument();
                expect(deleteComment).toBeNull();
                expect(editComment).toBeNull();
            });

            test("Can save the comment", async () => {
                await user.click(saveComment);
                expect(Firebase.saveContent).toBeCalled();
                expect(Firebase.saveContent).toBeCalledWith(auth.uid, comment.id);
                expect(setToastText).toBeCalled();
                expect(setToastText).toBeCalledWith("Comment saved successfully");
            });

            test("Can unsave comment", async () => {
                unmountComponent();
                await waitFor(() => {
                    render(<MemoryRouter>
                        <AuthContext.Provider value={auth}>
                            <Comment saved={[comment.id]} comment={comment} setToastText={setToastText} showToast={showToast} />
                        </AuthContext.Provider>
                    </MemoryRouter>);
                });
                await user.click(screen.getByTestId("show-more"));
                expect(screen.getByText(/unsave/i)).toBeInTheDocument();
                await user.click(screen.getByText(/unsave/i));
                expect(Firebase.unsaveContent).toBeCalled();
                expect(Firebase.unsaveContent).toBeCalledWith(auth.uid, comment.id);
            });
        });

        describe("Comment author", () => {
            localStorage.setItem("username", comment.author);
            const auth = { uid: comment.authorId };
            beforeEach(async () => {
                await waitFor(() => {
                    render(<MemoryRouter>
                        <AuthContext.Provider value={auth}>
                            <Comment comment={comment} setToastText={setToastText} showToast={showToast} />
                        </AuthContext.Provider>
                    </MemoryRouter>);
                });
                await user.click(screen.getByTestId("show-more"));
                saveComment = screen.getByText(/save/i);
                editComment = screen.queryByText(/edit/i);
                deleteComment = screen.queryByText(/delete/i);
            });

            test("Renders", async () => {
                expect(saveComment).toBeInTheDocument();
                expect(editComment).toBeInTheDocument();
                expect(deleteComment).toBeInTheDocument();
            });

            describe("Can edit comment", () => {
                let textBox;
                let cancelBtn;
                let saveEditsBtn;

                beforeEach(async () => {
                    await user.click(editComment);
                    textBox = screen.getByRole("textbox");
                    cancelBtn = screen.getByText(/cancel/i);
                    saveEditsBtn = screen.getByText(/save edits/i);
                });

                test("Edit comment form renders", async () => {
                    expect(textBox).toBeInTheDocument();
                    expect(textBox).toHaveValue(comment.comment);
                    expect(cancelBtn).toBeInTheDocument();
                    expect(saveEditsBtn).toBeInTheDocument();
                });

                test("Cancel button works", async () => {
                    await user.click(cancelBtn);
                    expect(textBox).not.toBeInTheDocument();
                    expect(cancelBtn).not.toBeInTheDocument();
                    expect(saveEditsBtn).not.toBeInTheDocument();
                });

                test("Textbox works", async () => {
                    await user.clear(textBox)
                    await user.type(textBox, "LOL");
                    expect(textBox).toHaveValue("LOL");
                });

                test("Save edits button works", async () => {
                    const newComment = "This is a comment";
                    await user.clear(textBox);
                    await user.type(textBox, newComment);
                    await user.click(saveEditsBtn);
                    expect(Firebase.editComment).toBeCalled();
                    expect(Firebase.editComment).toBeCalledWith(comment.ref, newComment);
                })
            });

            describe("Can delete comment", () => {
                let deleteBtn;
                let keepBtn;
                beforeEach(async () => {
                    await user.click(deleteComment);
                    deleteBtn = screen.getByText(/^delete$/i);
                    keepBtn = screen.getByText(/keep/i);
                });

                test("Deletion confirmation modal is shown", () => {
                    expect(screen.getByText(/delete comment/i)).toBeInTheDocument();
                    expect(keepBtn).toBeInTheDocument();
                    expect(deleteBtn).toBeInTheDocument();
                });

                test("Keep button removes the modal", async () => {
                    await user.click(keepBtn);
                    expect(screen.queryByText(/delete comment/i)).toBeNull();
                    expect(keepBtn).not.toBeInTheDocument();
                    expect(deleteBtn).not.toBeInTheDocument();
                });

                test("Delete button removes the comment", async () => {
                    await user.click(deleteBtn);
                    expect(Firebase.deleteComment).toBeCalled();
                    expect(Firebase.deleteComment).toBeCalledWith(comment.id);
                });
            });
        });
    });
});