import { screen, render } from "@testing-library/react";
import Home from "../components/Home";
import '@testing-library/jest-dom';
import AuthContext from "../context/AuthContext";
import * as Firebase from "../firebase";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

jest.mock("../firebase.js");
Firebase.getUserHome = jest.fn(async () => null);
Firebase.getAllPosts = jest.fn(async () => null);

const observe = jest.fn();
const unobserve = jest.fn();
const disconnect = jest.fn();
window.IntersectionObserver = jest.fn(() => ({
    observe,
    unobserve,
    disconnect
}));

describe("Home", () => {
    test("Sidebar is not visible to unauthenticated users", () => {
        render(<MemoryRouter>
            <Home />
        </MemoryRouter>);
        expect(screen.queryByTestId("home-sidebar")).toBeNull();
    });

    test("Sidebar is visible to authenticated users", () => {
        const auth = { uid: 'adjsfkalsdlf324sdaf' }
        render(<MemoryRouter>
            <AuthContext.Provider value={auth}>
                <Home />
            </AuthContext.Provider>
        </MemoryRouter>);
        expect(screen.getByTestId("home-sidebar")).toBeInTheDocument();
        expect(screen.getByText(/home/i)).toBeInTheDocument();
        expect(screen.getByText(/create post/i)).toBeInTheDocument();
        expect(screen.getByText(/create community/i)).toBeInTheDocument();
    });

    describe("Authenticated users can create a community", () => {
        let user;
        let communityNameInput;
        let remainingCharacters;
        let publicCheckbox;
        let restrictedCheckbox;
        let privateCheckbox;
        let createCommunityBtn;
        let cancelBtn;
        const auth = { uid: 'adjsfkalsdlf324sdaf' }
        beforeEach(async () => {
            Firebase.communityNameAvailable = jest.fn(({ communityName, communityType }) => {
                if (communityName === "Hello") {
                    return false;
                }
                return true;
            });

            localStorage.setItem("username", "test");
            render(<MemoryRouter>
                <AuthContext.Provider value={auth}>
                    <Home />
                </AuthContext.Provider>
            </MemoryRouter>);

            user = userEvent.setup();

            await user.click(screen.getByText(/create community/i));

            communityNameInput = screen.getByTestId("community-name-input");
            remainingCharacters = screen.getByTestId("remaining-characters");
            publicCheckbox = screen.getAllByRole("radio")[0];
            restrictedCheckbox = screen.getAllByRole("radio")[1];
            privateCheckbox = screen.getAllByRole("radio")[2];
            createCommunityBtn = screen.getByTestId("create-community-btn");
            cancelBtn = screen.getByText(/cancel/i);
        });

        test("CreateCommunityModal renders", async () => {
            expect(screen.getByText(/create a community/i)).toBeInTheDocument();
            expect(screen.getByText(/^name$/i)).toBeInTheDocument();
            expect(screen.getByText(/community type/i)).toBeInTheDocument();
            expect(communityNameInput).toBeInTheDocument();
            expect(remainingCharacters).toBeInTheDocument();
            expect(remainingCharacters).toHaveTextContent("21 characters remaining");
            expect(publicCheckbox).toBeInTheDocument();
            expect(restrictedCheckbox).toBeInTheDocument();
            expect(privateCheckbox).toBeInTheDocument();
            expect(createCommunityBtn).toBeInTheDocument();
            expect(cancelBtn).toBeInTheDocument();
        });

        test("Cancel button closes the modal", async () => {
            await user.click(cancelBtn);
            expect(screen.queryByText(/create a community/i)).toBeNull();
            expect(screen.queryByText(/^name$/i)).toBeNull();
            expect(screen.queryByText(/community type/i)).toBeNull();
            expect(communityNameInput).not.toBeInTheDocument();
            expect(publicCheckbox).not.toBeInTheDocument();
            expect(restrictedCheckbox).not.toBeInTheDocument();
            expect(privateCheckbox).not.toBeInTheDocument();
            expect(createCommunityBtn).not.toBeInTheDocument();
            expect(cancelBtn).not.toBeInTheDocument();
        });

        test("Community name input works", async () => {
            const communityName = "Hello";
            await user.type(communityNameInput, communityName);
            expect(communityNameInput).toHaveValue(communityName);
            expect(remainingCharacters).toHaveTextContent(`${21 - communityName.length} characters remaining`)
        });

        test("Community type radios work", async () => {
            expect(publicCheckbox).toBeChecked();
            await user.click(restrictedCheckbox);
            expect(restrictedCheckbox).toBeChecked();
            expect(publicCheckbox).not.toBeChecked();
            await user.click(privateCheckbox);
            expect(privateCheckbox).toBeChecked();
            expect(restrictedCheckbox).not.toBeChecked();
        });

        test("Community name input is validated for uniqueness", async () => {
            await user.type(communityNameInput, "Hello");
            await user.click(createCommunityBtn);
            expect(Firebase.communityNameAvailable).toBeCalled();
            expect(Firebase.communityNameAvailable).toBeCalledWith({ communityName: "Hello", communityType: "public" });
            expect(Firebase.communityNameAvailable).toHaveReturnedWith(false);
            expect(screen.getByTestId("error-message")).toBeInTheDocument();
            expect(screen.getByTestId("error-message")).toHaveTextContent("Sorry, r/Hello is taken. Try another");
            expect(screen.getByTestId("error-message")).toHaveClass("error-message");
        });

        test("A new community is created if inputs are valid and the name is available", async () => {
            await user.type(communityNameInput, "Jesters");
            await user.click(createCommunityBtn);
            expect(Firebase.communityNameAvailable).toBeCalled();
            expect(Firebase.communityNameAvailable).toBeCalledWith({ communityName: "Jesters", communityType: "public" });
            expect(Firebase.communityNameAvailable).toHaveReturnedWith(true);
            expect(Firebase.createCommunity).toBeCalled();
            expect(Firebase.createCommunity).toBeCalledWith("Jesters", "public", "test", auth.uid);
        });
    })
})