import { screen, render, waitFor } from "@testing-library/react";
import Search from "../components/Search";
import '@testing-library/jest-dom';
import * as Firebase from "../firebase";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("../firebase.js");
const posts = [
    {
        "votes": 1,
        "id": "25238096-2779-4ec2-82d3-5c72a03d947f",
        "createdOn": {
            "seconds": 1669976645,
            "nanoseconds": 275000000
        },
        "title": "Test3",
        "author": "test",
        "downvotes": [],
        "communityName": "NewCommunity",
        "upvotes": [
            "jfafjaskdlfjwr23423sdkfj"
        ],
        "authorId": "jfafjaskdlfjwr23423sdkfj",
        "content": "asdfasdfasdweerwertertadfsd"
    },
    {
        "authorId": "jfafjaskdlfjwr23423sdkfj",
        "author": "crow359",
        "title": "Link Test",
        "downvotes": [],
        "id": "3ca24703-42dd-48ab-b30c-3e2dc645ae90",
        "communityName": "random34",
        "votes": 0,
        "content": "",
        "upvotes": [],
        "createdOn": {
            "seconds": 1677432692,
            "nanoseconds": 829000000
        },
        "link": "https://youtube.com"
    },
    {
        "id": "a30f550f-72e2-4c61-9618-582a65a86fac",
        "downvotes": [],
        "authorId": "jfafjaskdlfjwr23423sdkfj",
        "link": "",
        "media": [
            "31895856-371b-4912-98dc-7d3df64ac4a5"
        ],
        "votes": 50,
        "content": "",
        "title": "Test",
        "communityName": "the odin project",
        "createdOn": {
            "seconds": 1677780652,
            "nanoseconds": 190000000
        },
        "upvotes": [],
        "author": "lamb34"
    },
];

posts.forEach(post => {
    post.data = () => post;
    post.createdOn.toMillis = () => new Date();
});

const users = [
    {
        "joined_communities": [
            "test",
            "NewCommunity",
            "odin project",
            "The Last of Us"
        ],
        "banner": "https://firebasestorage.googleapis.com/v0/b/reddit-clone-555f5.appspot.com/o/Users%2Fd56aaf66-1575-4fa3-ae8e-731af19b4aee?alt=media&token=397793d6-d5cd-4e78-b988-f361404041da",
        "displayName": "Sloth",
        "profilePicture": "https://firebasestorage.googleapis.com/v0/b/reddit-clone-555f5.appspot.com/o/Users%2F07086149-c69b-46b1-8eee-0a28a70431c9?alt=media&token=32c207f4-ba89-4701-9d45-dadbf407d3e0",
        "saved": [
        ],
        "joined_on": {
            "seconds": 1669797903,
            "nanoseconds": 758000000
        },
        "about": "Hi there, I am a sloth.",
        "id": "fasdfwr23423fasdfsad",
        "username": "test",
        "email": "test@gmail.com"
    }
];

const communities = [
    {
        "moderatorId": "faksjwrljasdfasdfa234sdf",
        "type": "public",
        "name": "test",
        "members": "1",
        "description": "This is a test community",
        "createdOn": {
            "seconds": 1668103930,
            "nanoseconds": 664000000
        },
        "moderator": "jester"
    }
];

const comments = [
    {
        "createdOn": {
            "seconds": 1676619615,
            "nanoseconds": 673000000
        },
        "comment": "Test2",
        "author": "test",
        "downvotes": [],
        "votes": 0,
        "id": "cfa22768-6048-4c0e-95d0-bf543f4d310f",
        "upvotes": [],
        "contentId": "9b7ccd57-80e1-48a7-aa6f-28c20ccba1d7",
        "authorId": "fasdjfklasjwer2394fajsdf"
    }
];

Firebase.searchPosts = jest.fn(async () => posts).mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)));
Firebase.searchComments = jest.fn(async () => comments).mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)));
Firebase.searchCommunities = jest.fn(async () => communities).mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)));
Firebase.searchUsers = jest.fn(async () => users).mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)));
Firebase.getProfileByUserId = jest.fn(async () => null);

describe("Search", () => {
    test("Renders", () => {
        const query = "test";
        render(<MemoryRouter initialEntries={[`?q=${query}&type=posts`]}>
            <Search />
        </MemoryRouter>);
        expect(screen.getByText(/posts/i)).toBeInTheDocument();
        expect(screen.getByText(/posts/i)).toHaveAttribute("href", `/search?q=${query}&type=posts`);
        expect(screen.getByText(/posts/i)).toHaveClass("search-tab__active");
        expect(screen.getByText(/comments/i)).toBeInTheDocument();
        expect(screen.getByText(/comments/i)).toHaveAttribute("href", `/search?q=${query}&type=comments`);
        expect(screen.getByText(/people/i)).toBeInTheDocument();
        expect(screen.getByText(/people/i)).toHaveAttribute("href", `/search?q=${query}&type=people`);
        expect(screen.getByText(/communities/i)).toBeInTheDocument();
        expect(screen.getByText(/communities/i)).toHaveAttribute("href", `/search?q=${query}&type=communities`);
        expect(Firebase.searchPosts).toBeCalled();
        expect(Firebase.searchPosts).toBeCalledWith(query);
    });

    describe("Tabs work", () => {
        const user = userEvent.setup();
        const query = "test";
        let postsTab;
        let commentsTab;
        let communitiesTab;
        let peopleTab;
        beforeEach(async () => {
            await waitFor(() => {
                render(<MemoryRouter initialEntries={[`/search?q=${query}&type=posts`]}>
                    <Routes>
                        <Route path="/search" element={<Search />} />
                    </Routes>
                </MemoryRouter>);
            });
            postsTab = screen.getByText(/posts/i);
            commentsTab = screen.getByText(/comments/i);
            communitiesTab = screen.getByText(/communities/i);
            peopleTab = screen.getByText(/people/i);
        });

        describe("Posts", () => {
            beforeEach(async () => {
                const query = "test";
                await waitFor(() => {
                    render(<MemoryRouter initialEntries={[`?q=${query}&type=posts`]}>
                        <Search />
                    </MemoryRouter>);
                });

                await user.click(postsTab);

            });

            test("Tab is switched to posts and skeleton is shown while data is loading", () => {
                expect(postsTab).toHaveClass("search-tab__active");
                expect(Firebase.searchPosts).toBeCalled();
                expect(Firebase.searchPosts).toBeCalledWith(query);
                expect(screen.queryAllByText(/loading.../i)).not.toBeNull();
            });

            test("Data renders", () => {
                posts.forEach(post => {
                    expect(screen.getByText(post.title)).toBeInTheDocument();
                    expect(screen.getByText(`r/${post.communityName}`)).toBeInTheDocument();
                    expect(screen.getByText(`u/${post.author}`)).toBeInTheDocument();
                    expect(screen.getByText(`${post.votes} upvotes`)).toBeInTheDocument();
                })
            });
        });

        describe("Comments", () => {
            beforeEach(async () => {
                await user.click(commentsTab);
            });

            test("Tab is switched to comments and skeleton is shown while data is loading", async () => {
                expect(commentsTab).toHaveClass("search-tab__active");
                expect(screen.queryAllByText(/loading.../i)).not.toBeNull();
                expect(Firebase.searchComments).toBeCalled();
                expect(Firebase.searchComments).toBeCalledWith(query);
            });

            test("Data is rendered", async () => {
                comments.forEach(comment => {
                    expect(screen.getByText(comment.author)).toBeInTheDocument();
                    expect(screen.getByText(comment.comment)).toBeInTheDocument();
                    expect(screen.getByText(`${comment.votes} upvotes`)).toBeInTheDocument();
                });
            });
        });

        describe("Communities", () => {
            beforeEach(async () => {
                await user.click(communitiesTab);
            });

            test("Tab is switched to communities and skeleton is shown while data is loading", async () => {
                expect(communitiesTab).toHaveClass("search-tab__active");
                expect(screen.queryAllByText(/loading.../i)).not.toBeNull();
                expect(Firebase.searchCommunities).toBeCalled();
                expect(Firebase.searchCommunities).toBeCalledWith(query);
            });

            test("Data is rendered", async () => {
                communities.forEach(community => {
                    expect(screen.getByText(`r/${community.name}`)).toBeInTheDocument();
                    if (community.icon) {
                        expect(screen.getByRole("img")).toHaveAttribute("src", community.icon);
                    }
                    expect(screen.getByText(`${community.members} Members`)).toBeInTheDocument();
                    expect(screen.getByText(community.description)).toBeInTheDocument();
                });
            });
        });

        describe("People", () => {
            beforeEach(async () => {
                await user.click(peopleTab);
            });

            test("Tab is switched to people and skeleton is shown while data is loading", async () => {
                expect(peopleTab).toHaveClass("search-tab__active");
                expect(screen.queryAllByText(/loading.../i)).not.toBeNull();
                expect(Firebase.searchUsers).toBeCalled();
                expect(Firebase.searchUsers).toBeCalledWith(query);
            });

            test("Data is rendered", async () => {
                users.forEach(user => {
                    expect(screen.getByText(`u/${user.username}`)).toBeInTheDocument();
                    expect(screen.getByText(user.about)).toBeInTheDocument();
                    expect(screen.getByRole("img")).toBeInTheDocument();
                    expect(screen.getByRole("img")).toHaveAttribute("src", user.profilePicture);
                })
            })
        });

    })
})