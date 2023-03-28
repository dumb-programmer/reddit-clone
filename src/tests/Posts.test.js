import Posts from "../components/post/Posts"
import { render, screen } from "@testing-library/react";

const data = [];
const setData = jest.fn();
const fetchPosts = jest.fn();
const observe = jest.fn(() => {
    fetchPosts();
    setData();

});
const unobserve = jest.fn();
const disconnect = jest.fn();
window.IntersectionObserver = jest.fn(() => ({
    observe,
    unobserve,
    disconnect
}));

describe("Posts", () => {
    test("Skeleton is shown while data is loading", () => {
        render(<Posts />);
        expect(screen.getAllByText(/loading/i).length).toEqual(5);
    });

    test("IntersectionObserver is called on scroll and more posts are fetch", () => {
        render(<Posts data={data} setData={setData} fetchPosts={fetchPosts} />);
        expect(window.IntersectionObserver).toHaveBeenCalled();
        expect(observe).toHaveBeenCalled();
        expect(fetchPosts).toHaveBeenCalled();
        expect(setData).toHaveBeenCalled();
    });

    test("Disconnect is called on unmount", () => {
        const { unmount } = render(<Posts data={data} setData={setData} fetchPosts={fetchPosts} />);
        unmount();
        expect(disconnect).toHaveBeenCalled();
    });
});