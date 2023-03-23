import { screen, render } from "@testing-library/react";
import Settings from "../components/Settings";
import '@testing-library/jest-dom';
import AuthContext from "../context/AuthContext";
import * as Firebase from "../firebase";
import useRedirect from "../hooks/useRedirect";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

jest.mock("../firebase.js");
jest.mock("../hooks/useRedirect", () => {
    const redirect = jest.fn();
    const useRedirect = jest.fn(() => redirect);
    return useRedirect;
});


const userData = {
    "displayName": "Jester",
    "joined_communities": [
        "test",
        "NewCommunity",
        "odin project",
        "The Last of Us"
    ],
    "saved": [
    ],
    "id": "asdfkjklr23432adfs",
    "joined_on": {
        "seconds": 1669797903,
        "nanoseconds": 758000000
    },
    "about": "This is a test to see if I can change about, and sure enough I can do it.",
    "profilePicture": "https://firebasestorage.googleapis.com/v0/b/reddit-clone-555f5.appspot.com/o/Users%2F07086149-c69b-46b1-8eee-0a28a70431c9?alt=media&token=32c207f4-ba89-4701-9d45-dadbf407d3e0",
    "banner": "https://firebasestorage.googleapis.com/v0/b/reddit-clone-555f5.appspot.com/o/Users%2Fd56aaf66-1575-4fa3-ae8e-731af19b4aee?alt=media&token=397793d6-d5cd-4e78-b988-f361404041da",
    "username": "test",
    "email": "test@test.com"
};

describe("Settings", () => {
    beforeEach(() => {
        Firebase.reauthenticate = jest.fn((password) => {
            if (password === "1234") {
                return { error: 1, message: "Incorrect password" };
            }
            else if (password === "12345") {
                return { error: 1, message: "Too many requests, take a breath" };
            }
            return { error: 0, message: "" };
        });
        Firebase.isEmailAvailable = jest.fn((email) => {
            if (email === "jest@test.org") {
                return false;
            }
            return true;
        });
        Firebase.isUsernameCorrect = jest.fn((username) => username === userData.username);
    });

    test("Unauthorized users are redirect to /login", () => {
        render(<MemoryRouter>
            <Settings />
        </MemoryRouter>);
        expect(useRedirect).toHaveBeenCalled();
        expect(useRedirect).toHaveBeenCalledWith("/login", "You need to login first");
        expect(useRedirect()).toHaveBeenCalled();
    });

    test("Data renders correctly for authorized users", () => {
        const auth = { uid: userData.id, email: userData.email };
        localStorage.setItem("about", userData.about);
        localStorage.setItem("displayName", userData.displayName);
        render(<MemoryRouter>
            <AuthContext.Provider value={auth}>
                <Settings />
            </AuthContext.Provider>
        </MemoryRouter>);

        expect(screen.getByText(/user settings/i)).toBeInTheDocument();
        expect(screen.getByText(/profile information/i)).toBeInTheDocument();
        expect(screen.getAllByText(/delete account/i)).not.toBeNull();
        expect(screen.getByText(userData.email)).toBeInTheDocument();
        expect(screen.getByText(userData.about)).toBeInTheDocument();
    });

    describe("Authenticated user can change their email", () => {
        let user;
        let passwordInput;
        let newEmailInput;
        let saveEmailBtn;
        beforeEach(async () => {
            const auth = { uid: userData.id, email: userData.email };
            localStorage.setItem("about", userData.about);
            localStorage.setItem("displayName", userData.displayName);
            render(<MemoryRouter>
                <AuthContext.Provider value={auth}>
                    <Settings />
                </AuthContext.Provider></MemoryRouter>);

            user = userEvent.setup();
            await user.click(screen.getByTestId("change-email-btn"));
            passwordInput = screen.queryByPlaceholderText(/current password$/i);
            newEmailInput = screen.queryByPlaceholderText(/new email$/i);
            saveEmailBtn = screen.queryByText(/save email$/i);
        });

        test("ChangeEmailForm renders on change email", async () => {
            expect(screen.getByText(/update your email$/i)).toBeInTheDocument();
            expect(passwordInput).toBeInTheDocument();
            expect(passwordInput).toHaveAttribute("type", "password");
            expect(newEmailInput).toBeInTheDocument();
            expect(newEmailInput).toHaveAttribute("type", "email");
            expect(saveEmailBtn).toBeInTheDocument();
            expect(saveEmailBtn).toBeDisabled();
        });

        test("Current password input", async () => {
            await user.type(passwordInput, "123");
            expect(passwordInput).toHaveValue("123");
            expect(saveEmailBtn).toBeDisabled();
        });

        test("New email input works", async () => {
            await user.type(newEmailInput, "123");
            expect(newEmailInput).toHaveValue("123");
        });

        test("Save email button is disabled until both the inputs are filled", async () => {
            await user.type(passwordInput, "123");
            expect(saveEmailBtn).toBeDisabled();
            await user.type(newEmailInput, "123");
            expect(saveEmailBtn).not.toBeDisabled();
        });

        test("Password is validated", async () => {
            await user.type(passwordInput, "1234");
            await user.type(newEmailInput, "test@test.org");
            await user.click(saveEmailBtn);

            // Incorrect password
            expect(Firebase.reauthenticate).toBeCalled();
            expect(Firebase.reauthenticate).toBeCalledWith("1234");
            expect(passwordInput).toHaveClass("form-input__error");
            expect(screen.getByText(/incorrect password$/i)).toHaveClass("error-message");
            expect(saveEmailBtn).toBeDisabled();

            // Too many requests
            await user.clear(passwordInput);
            await user.type(passwordInput, "12345");
            await user.click(saveEmailBtn);
            expect(passwordInput).toHaveClass("form-input__error");
            expect(screen.getByText(/too many requests, take a breath$/i)).toHaveClass("error-message");
            expect(saveEmailBtn).toBeDisabled();
        });

        test("Email is validated", async () => {
            // Email already taken
            await user.type(passwordInput, "123");
            await user.type(newEmailInput, "jest@test.org");
            await user.click(saveEmailBtn);
            expect(Firebase.isEmailAvailable).toBeCalled();
            expect(Firebase.isEmailAvailable).toBeCalledWith("jest@test.org");
            expect(newEmailInput).toHaveClass("form-input__error");
            expect(screen.getByText(/this email is already taken$/i)).toHaveClass("error-message");

            await user.clear(newEmailInput);
            await user.type(newEmailInput, "2134");
            await user.click(saveEmailBtn);

            // Incorrect email format
            expect(newEmailInput).toBeInvalid();
        });

        test("If both email and password are valid the email is changed", async () => {
            await user.type(passwordInput, "3242343");
            await user.type(newEmailInput, "test@test.org");
            await user.click(saveEmailBtn);

            expect(Firebase.reauthenticate).toHaveBeenCalled();
            expect(Firebase.isEmailAvailable).toHaveBeenCalled();
            expect(Firebase.updateUserEmail).toHaveBeenCalled();
            expect(Firebase.updateUserEmail).toHaveBeenCalledWith("test@test.org");
            expect(screen.getByText(/email updated successfully/i)).toBeInTheDocument();
        })
    });

    describe("Authenticated users can change their password", () => {
        let user;
        let currentPasswordInput;
        let newPasswordInput;
        let saveBtn;
        beforeEach(async () => {
            const auth = { uid: userData.id, email: userData.email };
            localStorage.setItem("about", userData.about);
            localStorage.setItem("displayName", userData.displayName);
            render(<MemoryRouter>
                <AuthContext.Provider value={auth}>
                    <Settings />
                </AuthContext.Provider></MemoryRouter>);

            user = userEvent.setup();
            await user.click(screen.getByTestId("change-password-btn"));
            currentPasswordInput = screen.queryByPlaceholderText(/current password$/i);
            newPasswordInput = screen.queryByPlaceholderText(/new password$/i);
            saveBtn = screen.queryByText(/save$/i);
        });

        test("ChangePasswordForm renders", () => {
            expect(screen.getByText(/update your password$/i)).toBeInTheDocument();
            expect(currentPasswordInput).toBeInTheDocument();
            expect(currentPasswordInput).toHaveAttribute("type", "password");
            expect(newPasswordInput).toBeInTheDocument();
            expect(newPasswordInput).toHaveAttribute("type", "password");
            expect(saveBtn).toBeInTheDocument();
            expect(saveBtn).toBeDisabled();
        });

        test("Current password input works", async () => {
            await user.type(currentPasswordInput, "hello");
            expect(currentPasswordInput).toHaveValue("hello");
        });

        test("New password input works", async () => {
            await user.type(newPasswordInput, "hello");
            expect(newPasswordInput).toHaveValue("hello");
        });

        test("Save button is disabled until both the password inputs have been filled", async () => {
            await user.type(currentPasswordInput, "hello");
            expect(saveBtn).toBeDisabled();
            await user.type(newPasswordInput, "hello");
            expect(saveBtn).not.toBeDisabled();
        });

        test("Current password is validated", async () => {
            await user.type(currentPasswordInput, "1234");
            await user.type(newPasswordInput, "1234");
            await user.click(saveBtn);
            expect(Firebase.reauthenticate).toHaveBeenCalled();
            expect(Firebase.reauthenticate).toHaveBeenCalledWith("1234");
            expect(currentPasswordInput).toHaveClass("form-input__error");
            expect(screen.getByText(/incorrect password$/i)).toBeInTheDocument();
            expect(screen.getByText(/incorrect password$/i)).toHaveClass("error-message");

            await user.type(currentPasswordInput, "5");
            await user.click(saveBtn);
            expect(Firebase.reauthenticate).toHaveBeenCalled();
            expect(Firebase.reauthenticate).toHaveBeenCalledWith("12345");
            expect(currentPasswordInput).toHaveClass("form-input__error");
            expect(screen.getByText(/too many requests, take a breath$/i)).toBeInTheDocument();
            expect(screen.getByText(/too many requests, take a breath$/i)).toHaveClass("error-message");
        });

        test("New password is validated", async () => {
            await user.type(currentPasswordInput, "324234");
            await user.type(newPasswordInput, "1234");
            await user.click(saveBtn);

            expect(newPasswordInput).toHaveClass("form-input__error");
            expect(screen.getByText(/password should be atleast 8 characters$/i)).toBeInTheDocument();
            expect(screen.getByText(/password should be atleast 8 characters$/i)).toHaveClass("error-message");
        });

        test("Password can be changed", async () => {
            await user.type(currentPasswordInput, "324234");
            await user.type(newPasswordInput, "12345678");
            await user.click(saveBtn);

            expect(Firebase.updateUserPassword).toHaveBeenCalled();
            expect(Firebase.updateUserPassword).toHaveBeenCalledWith("12345678");

            expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
        })
    });

    describe("Authenticated users can change their display name", () => {
        let user;
        let displayNameInput;
        let remainingCharacters;
        const totalCharacters = 30;
        beforeEach(async () => {
            const auth = { uid: userData.id, email: userData.email };
            localStorage.setItem("about", userData.about);
            localStorage.setItem("displayName", userData.displayName);
            render(<MemoryRouter>
                <AuthContext.Provider value={auth}>
                    <Settings />
                </AuthContext.Provider></MemoryRouter>);

            user = userEvent.setup();

            user = userEvent.setup();
            displayNameInput = screen.queryByTestId("displayName-input");
            remainingCharacters = screen.queryByTestId("displayName-remaining-characters");
        });

        test("ChangeDisplayNameForm renders", () => {
            expect(displayNameInput).toBeInTheDocument();
            expect(displayNameInput).toHaveValue(userData.displayName);
            expect(remainingCharacters).toHaveTextContent(`${totalCharacters - userData.displayName.length} characters remaining`)
        });

        test("Display name input works", async () => {
            await user.clear(displayNameInput);
            await user.type(displayNameInput, "Test");
            expect(displayNameInput).toHaveValue("Test");
            expect(remainingCharacters).toHaveTextContent(`${totalCharacters - "Test".length} characters remaining`);
        });

        test("Display name is not changed on input blur if the input remains the same", async () => {
            await user.click(displayNameInput);
            await user.click(document.body);
            expect(Firebase.updateDisplayName).not.toBeCalled();
        })

        test("Display name is updated on input blur", async () => {
            await user.clear(displayNameInput);
            await user.type(displayNameInput, "Test");
            expect(displayNameInput).toHaveValue("Test");
            await user.click(document.body);
            expect(Firebase.updateDisplayName).toHaveBeenCalled();
            expect(Firebase.updateDisplayName).toHaveBeenCalledWith("Test");
            expect(screen.getByText(/display name updated/i)).toBeInTheDocument();
        });
    });
    describe("Authenticated users can change their about", () => {
        let user;
        let aboutInput;
        let remainingCharacters;
        const totalCharacters = 200;
        beforeEach(async () => {
            const auth = { uid: userData.id, email: userData.email };
            localStorage.setItem("about", userData.about);
            localStorage.setItem("displayName", userData.displayName);
            render(<MemoryRouter>
                <AuthContext.Provider value={auth}>
                    <Settings />
                </AuthContext.Provider></MemoryRouter>);

            user = userEvent.setup();

            user = userEvent.setup();
            aboutInput = screen.queryByTestId("about-input");
            remainingCharacters = screen.queryByTestId("about-remaining-characters");
        });

        test("ChangeDisplayAboutForm renders", () => {
            expect(aboutInput).toBeInTheDocument();
            expect(aboutInput).toHaveValue(userData.about);
            expect(remainingCharacters).toHaveTextContent(`${totalCharacters - userData.about.length} characters remaining`)
        });

        test("Display name input works", async () => {
            await user.clear(aboutInput);
            await user.type(aboutInput, "Test");
            expect(aboutInput).toHaveValue("Test");
            expect(remainingCharacters).toHaveTextContent(`${totalCharacters - "Test".length} characters remaining`);
        });

        test("About is not changed on input blur if the input remains the same", async () => {
            await user.click(aboutInput);
            await user.click(document.body);
            expect(Firebase.updateAbout).not.toBeCalled();
        });

        test("About is updated on input blur", async () => {
            await user.clear(aboutInput);
            await user.type(aboutInput, "Test");
            expect(aboutInput).toHaveValue("Test");
            await user.click(document.body);
            expect(Firebase.updateAbout).toHaveBeenCalled();
            expect(Firebase.updateAbout).toHaveBeenCalledWith("Test");
            expect(screen.getByText(/about updated/i)).toBeInTheDocument();
        });
    });

    describe("Authenticated users can delete their account", () => {
        let user;
        let usernameInput;
        let passwordInput;
        let checkbox;
        let cancelBtn;
        let deleteBtn;
        beforeEach(async () => {
            const auth = { uid: userData.id, email: userData.email };
            localStorage.setItem("about", userData.about);
            localStorage.setItem("displayName", userData.displayName);
            render(<MemoryRouter>
                <AuthContext.Provider value={auth}>
                    <Settings />
                </AuthContext.Provider></MemoryRouter>);

            user = userEvent.setup();

            await user.click(screen.getByTestId("delete-account-btn"));

            usernameInput = screen.queryByPlaceholderText(/^username$/i);
            passwordInput = screen.queryByPlaceholderText(/password/i);
            checkbox = screen.queryByRole("checkbox");
            cancelBtn = screen.queryByTestId("cancel-btn");
            deleteBtn = screen.queryByTestId("delete-btn");
        });

        test("DeleteAccountForm renders", () => {
            expect(screen.getByText(/verify your identity$/i)).toBeInTheDocument();
            expect(usernameInput).toBeInTheDocument();
            expect(passwordInput).toBeInTheDocument();
            expect(passwordInput).toHaveAttribute("type", "password");
            expect(checkbox).toBeInTheDocument();
            expect(cancelBtn).toBeInTheDocument();
            expect(deleteBtn).toBeInTheDocument();
        });

        test("Cancel button closes the form modal", async () => {
            await user.click(cancelBtn);
            expect(screen.queryByText(/verify your identity$/i)).toBeNull();
            expect(usernameInput).not.toBeInTheDocument();
            expect(passwordInput).not.toBeInTheDocument();
            expect(checkbox).not.toBeInTheDocument();
            expect(cancelBtn).not.toBeInTheDocument();
            expect(deleteBtn).not.toBeInTheDocument();
        });

        test("Username input works", async () => {
            await user.type(usernameInput, "hello");
            expect(usernameInput).toHaveValue("hello");
        });

        test("Password input works", async () => {
            await user.type(passwordInput, "hello");
            expect(passwordInput).toHaveValue("hello");
        });

        test("Delete button is disabled until username, password have values and checkbox is checked", async () => {
            expect(deleteBtn).toBeDisabled();
            await user.type(usernameInput, "test");
            expect(deleteBtn).toBeDisabled();
            await user.type(passwordInput, "24345");
            expect(deleteBtn).toBeDisabled();
            await user.click(checkbox);
            expect(deleteBtn).not.toBeDisabled();
        });

        test("Username is validated", async () => {
            await user.type(usernameInput, "jester");
            await user.type(passwordInput, "24345");
            await user.click(checkbox);
            await user.click(deleteBtn);
            expect(Firebase.isUsernameCorrect).toBeCalled();
            expect(Firebase.isUsernameCorrect).toBeCalledWith("jester");
            expect(usernameInput).toHaveClass("form-input__error");
            expect(screen.getByText(/that's not your username/i)).toBeInTheDocument();
            expect(screen.getByText(/that's not your username/i)).toHaveClass("error-message");
            expect(deleteBtn).toBeDisabled();
        });

        test("Password is validated", async () => {
            await user.type(usernameInput, "test");
            await user.type(passwordInput, "1234");
            await user.click(checkbox);
            await user.click(deleteBtn);
            expect(Firebase.isUsernameCorrect).toBeCalled();
            expect(Firebase.isUsernameCorrect).toBeCalledWith("test");
            expect(Firebase.reauthenticate).toBeCalled();
            expect(Firebase.reauthenticate).toBeCalledWith("1234");
            expect(passwordInput).toHaveClass("form-input__error");
            expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
            expect(screen.getByText(/incorrect password/i)).toHaveClass("error-message");
        });

        test("Checkbox works", async () => {
            await user.type(usernameInput, "test");
            await user.type(passwordInput, "1234");
            await user.click(checkbox);
            expect(deleteBtn).not.toBeDisabled();
            await user.click(checkbox);
            expect(deleteBtn).toBeDisabled();
        });

        test("If username, password are correct and checkbox is ticked then the account is deleted", async () => {
            await user.type(usernameInput, "test");
            await user.type(passwordInput, "1234556");
            await user.click(checkbox);
            await user.click(deleteBtn);
            expect(Firebase.deleteAccount).toBeCalled();
            expect(Firebase.deleteAccount).toBeCalledWith();
        });
    });
});