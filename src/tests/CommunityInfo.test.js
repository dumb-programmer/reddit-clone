import { screen, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CommunityInfo from "../components/CommunityInfo";
import '@testing-library/jest-dom';
import userEvent from "@testing-library/user-event";
import useRedirect from "../hooks/useRedirect";
import AuthContext from "../context/AuthContext";
import * as Firebase from "../firebase.js";

const community = {
    name: "The Odin Project",
    description: "lorem epsum",
    createdOn: {
        seconds: 34005350,
    },
    members: "1000000",
    moderator: "john34",
    moderatorId: "4afsdkj234",
    type: "public"
}

community.createdOn.toMillis = () => new Date();

jest.mock("../firebase.js");

jest.mock("../hooks/useRedirect", () => {
    const redirect = jest.fn();
    const useRedirect = jest.fn(() => redirect);
    return useRedirect;
});

Firebase.hasJoinedCommunity = jest.fn(async () => false);

describe("CommunityInfo", () => {
    test("Skeleton is show while data is loading", () => {
        render(<MemoryRouter>
            <CommunityInfo />
        </MemoryRouter>);

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test("Data renders", () => {
        render(<MemoryRouter>
            <CommunityInfo data={community} showAvatar />
        </MemoryRouter>);

        expect(screen.getByText(/about community/i)).toBeInTheDocument();
        expect(screen.getByText(`r/${community.name}`)).toBeInTheDocument();
        expect(screen.getByText(`${community.description}`)).toBeInTheDocument();
        expect(screen.getByText(`Created ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(community.createdOn.toMillis()))}`)).toBeInTheDocument();
        expect(screen.getByText(`${new Intl.NumberFormat("en-US", { notation: "compact" }).format(community.members)} Members`)).toBeInTheDocument();
        expect(useRedirect).toBeCalled();
        expect(useRedirect).toBeCalledWith("/login", "You need to login first");
    });

    test("showCreatePost and showJoined prop flags work", () => {
        render(<MemoryRouter>
            <CommunityInfo data={community} showAvatar showCreatePost />
        </MemoryRouter>);

        expect(screen.getByText(/create post/i)).toBeInTheDocument();

        render(<MemoryRouter>
            <CommunityInfo data={community} showAvatar showJoined />
        </MemoryRouter>);

        expect(screen.getByText(/join/i)).toBeInTheDocument();
    });

    describe("Join Button", () => {
        test("Unauthenticated user is redirected to /login", async () => {
            render(<MemoryRouter>
                <CommunityInfo data={community} showAvatar showJoined />
            </MemoryRouter>);

            const user = userEvent.setup();

            await user.click(screen.getByText(/join/i));
            expect(useRedirect()).toBeCalled();
        });

        test("Authenticated user can join and leave a community", async () => {
            const auth = { uid: "aksdfj3423" };
            await waitFor(() => {
                render(<MemoryRouter>
                    <AuthContext.Provider value={auth}>
                        <CommunityInfo data={community} showAvatar showJoined />
                    </AuthContext.Provider>
                </MemoryRouter>);
            });

            const user = userEvent.setup();

            await user.click(screen.getByText(/join/i));

            // Join Community
            expect(Firebase.hasJoinedCommunity).toBeCalled();
            expect(Firebase.hasJoinedCommunity).toBeCalledWith(auth.uid, community.name);
            expect(Firebase.joinCommunity).toBeCalled();
            expect(Firebase.joinCommunity).toBeCalledWith(auth.uid, community.name, community.type);
            expect(screen.getByText(/joined/i)).toBeInTheDocument();

            // Leave Community
            await user.click(screen.getByText(/joined/i));
            expect(Firebase.leaveCommunity).toBeCalled();
            expect(Firebase.leaveCommunity).toBeCalledWith(auth.uid, community.name, community.type);

        });
    });

    describe("Moderator controls", () => {
        test("Controls aren't displayed to a normal user", async () => {
            const auth = { uid: "fkjasl3r243r" };
            await waitFor(() => {
                render(<MemoryRouter>
                    <AuthContext.Provider value={auth}>
                        <CommunityInfo data={community} showAvatar showJoined />
                    </AuthContext.Provider>
                </MemoryRouter>);
            });

            const user = userEvent.setup();

            expect(screen.getByText(`${community.description}`)).not.toHaveClass("community-description");
            await user.click(screen.getByText(`${community.description}`));
            expect(screen.queryByRole("textbox")).toBeNull();
        });

        test("Moderator can edit description by clicking on it", async () => {
            const auth = { uid: community.moderatorId };
            await waitFor(() => {
                render(<MemoryRouter>
                    <AuthContext.Provider value={auth}>
                        <CommunityInfo data={community} showAvatar showJoined />
                    </AuthContext.Provider>
                </MemoryRouter>);
            });

            const user = userEvent.setup();

            expect(screen.getByText(`${community.description}`)).toHaveClass("community-description");
            await user.click(screen.getByText(`${community.description}`));
            expect(screen.getByRole("textbox")).toBeInTheDocument();
            expect(screen.getByRole("textbox")).toHaveValue(community.description);
            expect(screen.getByTestId("remaining-characters").textContent).toEqual(`${500 - community.description.length} characters remaining`);
            expect(screen.getByText(/save/i)).toBeInTheDocument();
            expect(screen.getByText(/cancel/i)).toBeInTheDocument();
        });

        test("Community description edit form's textarea works", async () => {
            const auth = { uid: community.moderatorId };
            await waitFor(() => {
                render(<MemoryRouter>
                    <AuthContext.Provider value={auth}>
                        <CommunityInfo data={community} showAvatar showJoined />
                    </AuthContext.Provider>
                </MemoryRouter>);
            });

            const user = userEvent.setup();

            await user.click(screen.getByText(`${community.description}`));

            await user.clear(screen.getByRole("textbox"));
            expect(screen.getByTestId("remaining-characters").textContent).toEqual(`500 characters remaining`);

            const newDescription = "this is the new description";
            await user.type(screen.getByRole("textbox"), newDescription);
            expect(screen.getByRole("textbox")).toHaveValue(newDescription);
            expect(screen.getByTestId("remaining-characters").textContent).toEqual(`${500 - newDescription.length} characters remaining`);

            // TODO: test overflow
        });

        test("Save button works", async () => {
            const auth = { uid: community.moderatorId };
            await waitFor(() => {
                render(<MemoryRouter>
                    <AuthContext.Provider value={auth}>
                        <CommunityInfo data={community} showAvatar showJoined />
                    </AuthContext.Provider>
                </MemoryRouter>);
            });

            const user = userEvent.setup();

            // Don't call the update function if the description hasn't changed
            await user.click(screen.getByText(`${community.description}`));
            await user.click(screen.getByText(/save/i));
            expect(Firebase.updateCommunityDescription).not.toHaveBeenCalled();
            // The form is closed
            expect(screen.queryByRole("textbox")).toBeNull();

            await user.click(screen.getByText(`${community.description}`));
            await user.clear(screen.getByRole("textbox"));
            const newDescription = "Hello there";
            await user.type(screen.getByRole("textbox"), newDescription);
            await user.click(screen.getByText(/save/i));
            expect(Firebase.updateCommunityDescription).toBeCalled();
            expect(Firebase.updateCommunityDescription).toBeCalledWith(community.name, community.type, newDescription)
            // The form is closed
            expect(screen.queryByRole("textbox")).toBeNull();
        });

        test("Cancel button works", async () => {
            const auth = { uid: community.moderatorId };
            await waitFor(() => {
                render(<MemoryRouter>
                    <AuthContext.Provider value={auth}>
                        <CommunityInfo data={community} showAvatar showJoined />
                    </AuthContext.Provider>
                </MemoryRouter>);
            });

            const user = userEvent.setup();

            await user.click(screen.getByText(`${community.description}`));
            await user.click(screen.getByText(/cancel/i));
            // The form is closed
            expect(screen.queryByRole("textbox")).toBeNull();
        });
    })
});