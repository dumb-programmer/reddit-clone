import { screen, render } from "@testing-library/react";
import Header from "../components/Header";
import '@testing-library/jest-dom';
import AuthContext from "../context/AuthContext";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import * as Firebase from "../firebase";
import useRedirect from "../hooks/useRedirect";
import generateUsernames from "../utils/generateUsernames";

jest.mock("../firebase.js");
jest.mock("../hooks/useRedirect", () => {
    const redirect = jest.fn();
    const useRedirect = jest.fn(() => redirect);
    return useRedirect;
});

jest.mock("../utils/generateUsernames", () => {
    return jest.fn(() => ["average_up902", "board_himself128", "contrast_exact736"]);
})

const userDoc = { username: "test", usernameConfirmed: false };
userDoc.data = () => userDoc;

const unsub = jest.fn();
Firebase.subscribeToUserDoc = jest.fn((id, cb) => {
    cb(userDoc);
    return unsub;
})

describe("Header", () => {
    const auth = { uid: "fjadkslfd23423kjsd" };
    const user = userEvent.setup();
    test("Unauthenticated users", () => {
        const { container } = render(<MemoryRouter>
            <Header />
        </MemoryRouter>);
        expect(container).toMatchSnapshot();
    });
    describe("Authenticated users", () => {
        test("Renders", () => {
            const { container, unmount } = render(<MemoryRouter>
                <AuthContext.Provider value={auth}>
                    <Header />
                </AuthContext.Provider>
            </MemoryRouter>);
            expect(container).toMatchSnapshot();
            expect(Firebase.subscribeToUserDoc).toBeCalled();
            unmount();
            expect(unsub).toBeCalled();
        });
        describe("Dropdown works", () => {
            beforeEach(async () => {
                render(<MemoryRouter>
                    <AuthContext.Provider value={auth}>
                        <Header />
                    </AuthContext.Provider>
                </MemoryRouter>);
                await user.click(screen.getByTestId("user-controls"));
            });
            test("Renders", () => {
                expect(screen.getByText(/profile/i)).toBeInTheDocument();
                expect(screen.getByText(/profile/i)).toHaveAttribute("href", `/user/${userDoc.username}`)
                expect(screen.getByText(/settings/i)).toBeInTheDocument();
                expect(screen.getByText(/settings/i)).toHaveAttribute("href", "/settings");
                expect(screen.getByText(/logout/i)).toBeInTheDocument();
            });
            test("Logout button works", async () => {
                await user.click(screen.getByText(/logout/i));
                expect(Firebase.logout).toBeCalled();
            });
        });
        describe("User's that've sign in using auth providers can change their username", () => {

            describe("UsernameConfirmation", () => {
                let keepUsernameBtn;
                let changeUsernameBtn;
                beforeEach(() => {
                    render(<MemoryRouter>
                        <AuthContext.Provider value={auth}>
                            <Header />
                        </AuthContext.Provider>
                    </MemoryRouter>);
                    keepUsernameBtn = screen.getByText(/keep username/i);
                    changeUsernameBtn = screen.getByText(/change username/i);
                });
                test("Renders", () => {
                    expect(screen.getByText(/Do you want to change or keep this user name?/i)).toBeInTheDocument();
                    expect(screen.getByText(`u/${userDoc.username}`)).toBeInTheDocument();
                    expect(keepUsernameBtn).toBeInTheDocument();
                    expect(keepUsernameBtn).toHaveClass("tertiary-btn");
                    expect(changeUsernameBtn).toBeInTheDocument();
                    expect(changeUsernameBtn).toHaveClass("primary-btn");
                });
                describe("Keep username button works", () => {
                    beforeEach(async () => {
                        await user.click(keepUsernameBtn);
                    });
                    test("KeepUsernameModal is shown", async () => {
                        expect(screen.getByText("Are you sure this will be your username forever")).toBeInTheDocument();
                        expect(screen.getByTestId("keep-username-btn-final")).toBeInTheDocument();
                    });
                    test("Modal's keep username button works", async () => {
                        await user.click(screen.getByTestId("keep-username-btn-final"));
                        expect(Firebase.keepUsername).toBeCalled();
                        expect(Firebase.keepUsername).toBeCalledWith(auth.uid);
                    });
                    test("Change username buttons shows the ChangeUsernameModal", async () => {
                        await user.click(screen.getByTestId("change-username-btn-final"));
                        expect(screen.getByText("Can't think of one use one of these")).toBeInTheDocument();
                        expect(screen.getByText(/continue/i)).toBeInTheDocument();
                    });
                });
                describe("Change username button works", () => {
                    let usernameInput;
                    let continueBtn;
                    beforeEach(async () => {
                        await user.click(changeUsernameBtn);
                        usernameInput = screen.getByTestId("username-input");
                        continueBtn = screen.getByText(/continue/i);
                    });
                    test("ChangeUsernameModal is shown", () => {
                        expect(screen.getByText("Can't think of one use one of these")).toBeInTheDocument();
                        expect(usernameInput).toBeInTheDocument();
                        expect(continueBtn).toBeInTheDocument();
                        expect(continueBtn).toBeDisabled();
                    });
                    test("Username input works", async () => {
                        await user.type(usernameInput, "test");
                        expect(usernameInput).toHaveValue("test");
                        expect(continueBtn).not.toBeDisabled();
                    });
                    test("Username suggestions work", async () => {
                        expect(generateUsernames).toBeCalled();
                        const usernames = generateUsernames();
                        usernames.forEach(async (username) => {
                            expect(screen.getByText(username)).toBeInTheDocument();
                        });
                        await user.click(screen.getByText(usernames[0]));
                        expect(usernameInput).toHaveValue(usernames[0]);
                    })
                    test("Continue buttons works", async () => {
                        await user.type(usernameInput, "test");
                        await user.click(continueBtn);
                        expect(Firebase.usernameAvailable).toBeCalled();
                        expect(Firebase.usernameAvailable).toBeCalledWith("test");
                    });
                    test("Username input is validated", async () => {
                        Firebase.usernameAvailable = jest.fn((username) => {
                            if (username === "test") return false;
                            return true;
                        })
                        await user.type(usernameInput, "test");
                        await user.click(continueBtn);
                        expect(Firebase.usernameAvailable).toHaveReturnedWith(false);
                        expect(usernameInput).toHaveClass("form-input__error");
                        expect(screen.getByText(/that username is already taken/i)).toBeInTheDocument();
                        expect(screen.getByText(/that username is already taken/i)).toHaveClass("error-message");
                        expect(continueBtn).toBeDisabled();
                    });
                    test("Form progresses on continue if the username is available", async () => {
                        await user.type(usernameInput, "jester");
                        await user.click(continueBtn);
                        expect(screen.getByText(/are you sure\? this will be your username forever/i)).toBeInTheDocument();
                        expect(screen.getByText("u/jester")).toBeInTheDocument();
                        expect(screen.getByText(/save username/i)).toBeInTheDocument();
                        expect(screen.getByText(/save username/i)).toHaveClass("primary-btn");
                        expect(screen.getByText(/go back/i)).toHaveClass("tertiary-btn");
                    });
                    test("Save username button works", async () => {
                        await user.type(usernameInput, "jester");
                        await user.click(continueBtn);
                        await user.click(screen.getByText(/save username/i));
                        expect(Firebase.changeUsername).toBeCalled();
                        expect(Firebase.changeUsername).toBeCalledWith(auth.uid, "jester");
                    });
                    test("Go back button works", async () => {
                        await user.type(usernameInput, "jester");
                        await user.click(continueBtn);
                        await user.click(screen.getByText(/go back/i));
                        expect(screen.getByTestId("username-input")).toBeInTheDocument();
                        expect(screen.getByText(/continue/i)).toBeInTheDocument();
                    });
                });
            });
        })
    });
    test("Search works", async () => {
        render(<MemoryRouter>
            <AuthContext.Provider value={auth}>
                <Header />
            </AuthContext.Provider>
        </MemoryRouter>);
        const searchBox = screen.getByRole("textbox");
        await user.type(searchBox, "Hello");
        expect(searchBox).toHaveValue("Hello");
        await user.click(searchBox);
        await user.keyboard("[Enter]");
        expect(useRedirect()).toBeCalled();
    });
});