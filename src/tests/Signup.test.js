import { MemoryRouter } from "react-router-dom"
import Signup from "../components/Signup"
import { render, screen } from "@testing-library/react"
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import * as Firebase from "../firebase.js";

jest.mock("../firebase.js");

Firebase.isEmailAvailable = jest.fn(async (email) => {
    if (email === "test@test.org") {
        return false;
    }
    return true;
});

Firebase.usernameAvailable = jest.fn(async (username) => {
    if (username === "test") {
        return false;
    }
    return true;
});

Firebase.createAccountUsingEmail = jest.fn();

describe("Signup works", () => {
    test("Render", () => {
        const { container } = render(<MemoryRouter>
            <Signup />
        </MemoryRouter>)

        expect(container).toMatchSnapshot();
    });

    test("Email input works", async () => {
        render(<MemoryRouter>
            <Signup />
        </MemoryRouter>);

        const user = userEvent.setup();

        await user.type(screen.getByPlaceholderText("Email"), "testing");
        expect(screen.getByPlaceholderText("Email")).toHaveValue("testing");
    });

    test("Email is required", async () => {
        render(<MemoryRouter>
            <Signup />
        </MemoryRouter>);

        const user = userEvent.setup();

        await user.click(screen.getByTestId("continue-btn"));
        expect(screen.getByPlaceholderText("Email")).toBeInvalid();
        expect(Firebase.isEmailAvailable).not.toHaveBeenCalled();
    });


    test("Continue button works", async () => {
        render(<MemoryRouter>
            <Signup />
        </MemoryRouter>);

        const user = userEvent.setup();

        const email = "elliot@ecorp.org";
        await user.type(screen.getByPlaceholderText("Email"), email);
        await user.click(screen.getByTestId("continue-btn"));

        expect(Firebase.isEmailAvailable).toHaveBeenCalled();
        expect(Firebase.isEmailAvailable).toHaveBeenCalledWith(email);
    });

    test("Email is validated", async () => {
        render(<MemoryRouter>
            <Signup />
        </MemoryRouter>);

        const user = userEvent.setup();

        expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email");

        await user.type(screen.getByPlaceholderText("Email"), "test@test.org")
        await user.click(screen.getByTestId("continue-btn"));

        expect(await Firebase.isEmailAvailable("test@test.org")).toBeFalsy();
        expect(screen.getByText(/this email is already taken/i)).toBeInTheDocument();
        expect(screen.getByText(/this email is already taken/i)).toHaveClass("error-message");
        expect(screen.getByPlaceholderText("Email")).toHaveClass("form-input__error");
        expect(screen.getByTestId("continue-btn")).toBeDisabled();
    });

    describe("Form moves to next step if the email is valid", () => {
        let user;
        beforeEach(async () => {
            render(<MemoryRouter>
                <Signup />
            </MemoryRouter>);

            user = userEvent.setup();

            expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email");

            const email = "elliot@ecorp.org";
            await user.type(screen.getByPlaceholderText("Email"), email)
            await user.click(screen.getByTestId("continue-btn"));

            expect(await Firebase.isEmailAvailable(email)).toBeTruthy();
            expect(screen.getByText(/choose your username/i)).toBeInTheDocument();
        });

        test("Back button works", async () => {
            await user.click(screen.getByRole("link"));
            expect(screen.getByText(/sign up/i)).toBeInTheDocument();
        });

        test("Username input works", async () => {
            await user.type(screen.getByPlaceholderText(/choose a username/i), "test");
            expect(screen.getByPlaceholderText(/choose a username/i)).toHaveValue("test");
        });

        test("Username is required", async () => {
            await user.click(screen.getByText(/sign up/i));
            expect(screen.getByPlaceholderText(/choose a username/i)).toBeInvalid();
        });

        test("Username suggestions are generated", async () => {
            expect(screen.getBy)
        });

        test("Error is displayed if username is already taken", async () => {
            await user.type(screen.getByPlaceholderText(/choose a username/i), "test");
            await user.type(screen.getByPlaceholderText(/password/i), "test");

            expect(Firebase.usernameAvailable).toBeCalled();
            expect(Firebase.usernameAvailable).toBeCalledWith("test");
            expect(await Firebase.usernameAvailable("test")).toBeFalsy();

            expect(screen.getByPlaceholderText(/choose a username/i)).toHaveClass("form-input__error");
            expect(screen.getByText(/that username is already taken/i)).toBeInTheDocument();
            expect(screen.getByText(/that username is already taken/i)).toHaveClass("error-message");
        });

        test("Username suggestions are displayed", () => {
            expect(screen.getByTestId("username-suggestions")).toBeInTheDocument();
            expect(screen.getByTestId("username-suggestions").childElementCount).toEqual(6);
        });

        test("Username input is filled with value on username suggestion click", async () => {
            await user.click(screen.getByTestId("username-suggestions").children[1]);
            expect(screen.getByPlaceholderText(/choose a username/i)).toHaveValue(screen.getByTestId("username-suggestions").children[1].textContent);
        });

        test("Password is required", async () => {
            await user.type(screen.getByPlaceholderText(/choose a username/i), "test");
            await user.click(screen.getByText(/sign up/i));
            expect(screen.getByPlaceholderText(/password/i)).toBeInvalid();
        });

        test("Error is displayed if password is shorter than 8 characters", async () => {
            await user.type(screen.getByPlaceholderText(/choose a username/i), "elliot");
            await user.type(screen.getByPlaceholderText(/password/i), "123");
            await user.click(screen.getByText(/sign up/i));
            expect(screen.getByPlaceholderText(/password/i)).toHaveClass("form-input__error");
            expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
            expect(screen.getByText(/password must be at least 8 characters long/i)).toHaveClass("error-message");
        });

        test("Account is created if both username and password are validated and are correct", async () => {
            await user.type(screen.getByPlaceholderText(/choose a username/i), "elliot");
            await user.type(screen.getByPlaceholderText(/password/i), "12345678");
            await user.click(screen.getByText(/sign up/i));

            expect(Firebase.createAccountUsingEmail).toBeCalled();
            expect(Firebase.createAccountUsingEmail).toBeCalledWith({ email: "elliot@ecorp.org", password: "12345678", username: "elliot", })
        });
    });
})