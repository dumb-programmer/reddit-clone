import { MemoryRouter } from "react-router-dom";
import Login from "../components/Login";
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as Firebase from "../firebase";

jest.mock("../firebase.js");

Firebase.loginUsingUsernameAndPassword = jest.fn(async ({ username, password }) => {
    if (username === "elliot") {
        if (password === "123") {
            return 0;
        }
        return -2;
    }
    return -1;
});

describe("Login works", () => {
    test("Render", async () => {
        // TODO: custom render function
        const { container } = render(<MemoryRouter>
            <Login />
        </MemoryRouter>)

        expect(container).toMatchSnapshot();
    })

    test("Username input works", async () => {
        render(<MemoryRouter>
            <Login />
        </MemoryRouter>);
        const user = userEvent.setup();

        await user.type(screen.getByPlaceholderText("Username"), "testing");
        expect(screen.getByPlaceholderText("Username")).toHaveValue("testing");
    });

    test("Password input works", async () => {
        render(<MemoryRouter>
            <Login />
        </MemoryRouter>);
        const user = userEvent.setup();

        await user.type(screen.getByPlaceholderText("Password"), "testing");
        expect(screen.getByPlaceholderText("Password")).toHaveValue("testing");
    });

    test("Username and password are required", async () => {
        render(<MemoryRouter>
            <Login />
        </MemoryRouter>);
        const user = userEvent.setup();

        await user.click(screen.getByTestId("login-btn"));
        expect(screen.getByPlaceholderText("Username")).toBeInvalid();
        expect(screen.getByPlaceholderText("Password")).toBeInvalid();
    });

    test("Login button works", async () => {
        render(<MemoryRouter>
            <Login />
        </MemoryRouter>);
        const user = userEvent.setup();

        await user.type(screen.getByPlaceholderText("Username"), "test");
        await user.type(screen.getByPlaceholderText("Password"), "1234");
        await user.click(screen.getByTestId("login-btn"));

        expect(Firebase.loginUsingUsernameAndPassword).toHaveBeenCalled();
        expect(Firebase.loginUsingUsernameAndPassword).toHaveBeenCalledWith({ username: "test", password: "1234" });
    });

    test("Error is displayed for incorrect username", async () => {
        render(<MemoryRouter>
            <Login />
        </MemoryRouter>);
        const user = userEvent.setup();

        const username = "test";
        const password = "123";
        await user.type(screen.getByPlaceholderText("Username"), username);
        await user.type(screen.getByPlaceholderText("Password"), password);
        await user.click(screen.getByTestId("login-btn"));

        expect(await Firebase.loginUsingUsernameAndPassword(username, password)).toBe(-1);
        expect(screen.getByPlaceholderText(/username/i)).toHaveClass("form-input__error");
        expect(screen.getByText(/incorrect username/i)).toBeInTheDocument();
        expect(screen.getByText(/incorrect username/i)).toHaveClass("error-message");
    });

    test("Error is displayed for incorrect password", async () => {
        render(<MemoryRouter>
            <Login />
        </MemoryRouter>);
        const user = userEvent.setup();

        const username = "elliot";
        const password = "34";
        await user.type(screen.getByPlaceholderText("Username"), username);
        await user.type(screen.getByPlaceholderText("Password"), password);
        await user.click(screen.getByTestId("login-btn"));

        expect(await Firebase.loginUsingUsernameAndPassword({ username, password })).toBe(-2);
        expect(screen.getByPlaceholderText(/password/i)).toHaveClass("form-input__error");
        expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
        expect(screen.getByText(/incorrect password/i)).toHaveClass("error-message");
    });

    test("User is logged in on correct username and password", async () => {
        render(<MemoryRouter>
            <Login />
        </MemoryRouter>);
        const user = userEvent.setup();

        const username = "elliot";
        const password = "123";
        await user.type(screen.getByPlaceholderText("Username"), username);
        await user.type(screen.getByPlaceholderText("Password"), password);
        await user.click(screen.getByTestId("login-btn"));

        expect(await Firebase.loginUsingUsernameAndPassword({ username, password })).toBe(0);
    });
})