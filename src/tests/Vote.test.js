import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'
import Vote from "../components/Vote";
import userEvent from "@testing-library/user-event";
import useRedirect from "../hooks/useRedirect";
import AuthContext from "../context/AuthContext";
import * as Firebase from "../firebase.js";

jest.mock("../firebase.js");

jest.mock("../hooks/useRedirect", () => {
    const redirect = jest.fn();
    const useRedirect = jest.fn(() => redirect);
    return useRedirect;
});

jest.mock("../utils/isUpvoted", () => {
    return () => {
        return false;
    }
});

Firebase.upvote = jest.fn();
Firebase.removeUpvote = jest.fn();
Firebase.downvote = jest.fn();
Firebase.removeDownvote = jest.fn();

const post = {
    "upvotes": [],
    "createdOn": {
        "seconds": 1678863772,
        "nanoseconds": 472000000
    },
    "author": "test",
    "id": "8d2011d2-c502-4dbc-9d66-c46470b5fg2l",
    "title": "Null Post",
    "votes": 10,
    "media": [],
    "content": "This is a post before the apocalypse started.",
    "downvotes": [],
    "link": "",
    "communityName": "the_odin_project"
};

const comment = {
    "id": "b449aa94-c660-45ba-8746-14d795b47f3c",
    "authorId": "234afsdkfjalsdkfj",
    "author": "test",
    "createdOn": {
        "seconds": 1678863772,
        "nanoseconds": 472000000
    },
    comment: "Hi",
    "votes": -5,
    "upvotes": [],
    "downvotes": [],
    "communityName": "jesters"
};

describe("Vote", () => {
    describe("Works with post", () => {
        test("Render", () => {
            render(<Vote data={post} type="post" />);

            expect(screen.getByTestId("upvote-btn")).toBeInTheDocument();
            expect(screen.getByTestId("downvote-btn")).toBeInTheDocument();
            expect(+screen.getByTestId("votes").textContent).toBe(post.votes);
            expect(useRedirect).toBeCalled();
            expect(useRedirect).toBeCalledWith("/login", "You need to login first");
        });

        test("Upvote and downvote btns redirect to login if the user is not authenticated", async () => {
            render(<Vote data={post} type="post" />);

            const user = userEvent.setup();

            await user.click(screen.getByTestId("upvote-btn"));
            expect(useRedirect()).toHaveBeenCalled();

            await user.click(screen.getByTestId("downvote-btn"));
            expect(useRedirect()).toHaveBeenCalled();
        });

        test("Upvote works when user is authenticated", async () => {
            render(<AuthContext.Provider value={{ uid: 2403403 }}>
                <Vote data={post} type="post" />
            </AuthContext.Provider>);

            const user = userEvent.setup();

            // Add upvote
            await user.click(screen.getByTestId("upvote-btn"));
            expect(Firebase.upvote).toHaveBeenCalled();
            expect(Firebase.upvote).toHaveBeenCalledWith(post.id, 2403403, false, "post");
            expect(screen.getByTestId("upvote-btn")).toHaveClass("upvote-btn__clicked");

            // Remove upvote
            await user.click(screen.getByTestId("upvote-btn"));
            expect(Firebase.removeUpvote).toHaveBeenCalled();
            expect(Firebase.removeUpvote).toHaveBeenCalledWith(post.id, 2403403, "post");
            expect(screen.getByTestId("upvote-btn")).not.toHaveClass("upvote-btn__clicked");
        });

        test("Downvote works when user is authenticated", async () => {
            render(<AuthContext.Provider value={{ uid: 2403403 }}>
                <Vote data={post} type="post" />
            </AuthContext.Provider>);

            const user = userEvent.setup();

            // Add downvote
            await user.click(screen.getByTestId("downvote-btn"));
            expect(Firebase.downvote).toHaveBeenCalled();
            expect(Firebase.downvote).toHaveBeenCalledWith(post.id, 2403403, false, "post");
            expect(screen.getByTestId("downvote-btn")).toHaveClass("downvote-btn__clicked");

            // Remove downvote
            await user.click(screen.getByTestId("downvote-btn"));
            expect(Firebase.removeDownvote).toHaveBeenCalled();
            expect(Firebase.removeDownvote).toHaveBeenCalledWith(post.id, 2403403, "post");
            expect(screen.getByTestId("downvote-btn")).not.toHaveClass("downvote-btn__clicked");
        });
    })

    describe("Works with comment", () => {
        test("Render", () => {
            render(<Vote data={comment} type="comment" />);

            expect(screen.getByTestId("upvote-btn")).toBeInTheDocument();
            expect(screen.getByTestId("downvote-btn")).toBeInTheDocument();
            expect(+screen.getByTestId("votes").textContent).toBe(comment.votes);
            expect(useRedirect).toBeCalled();
            expect(useRedirect).toBeCalledWith("/login", "You need to login first");
        });

        test("Upvote and downvote btns redirect to login if the user is not authenticated", async () => {
            render(<Vote data={comment} type="comment" />);

            const user = userEvent.setup();

            await user.click(screen.getByTestId("upvote-btn"));
            expect(useRedirect()).toHaveBeenCalled();

            await user.click(screen.getByTestId("downvote-btn"));
            expect(useRedirect()).toHaveBeenCalled();
        });

        test("Upvote works when user is authenticated", async () => {
            render(<AuthContext.Provider value={{ uid: 2403403 }}>
                <Vote data={comment} type="comment" />
            </AuthContext.Provider>);

            const user = userEvent.setup();

            // Add upvote
            await user.click(screen.getByTestId("upvote-btn"));
            expect(Firebase.upvote).toHaveBeenCalled();
            expect(Firebase.upvote).toHaveBeenCalledWith(comment.id, 2403403, false, "comment");
            expect(screen.getByTestId("upvote-btn")).toHaveClass("upvote-btn__clicked");

            // Remove upvote
            await user.click(screen.getByTestId("upvote-btn"));
            expect(Firebase.removeUpvote).toHaveBeenCalled();
            expect(Firebase.removeUpvote).toHaveBeenCalledWith(comment.id, 2403403, "comment");
            expect(screen.getByTestId("upvote-btn")).not.toHaveClass("upvote-btn__clicked");
        });

        test("Downvote works when user is authenticated", async () => {
            render(<AuthContext.Provider value={{ uid: 2403403 }}>
                <Vote data={comment} type="comment" />
            </AuthContext.Provider>);

            const user = userEvent.setup();

            // Add downvote
            await user.click(screen.getByTestId("downvote-btn"));
            expect(Firebase.downvote).toHaveBeenCalled();
            expect(Firebase.downvote).toHaveBeenCalledWith(comment.id, 2403403, false, "comment");
            expect(screen.getByTestId("downvote-btn")).toHaveClass("downvote-btn__clicked");

            // Remove downvote
            await user.click(screen.getByTestId("downvote-btn"));
            expect(Firebase.removeDownvote).toHaveBeenCalled();
            expect(Firebase.removeDownvote).toHaveBeenCalledWith(comment.id, 2403403, "comment");
            expect(screen.getByTestId("downvote-btn")).not.toHaveClass("downvote-btn__clicked");
        });
    })
})