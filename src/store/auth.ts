import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { User } from '@/model/user';

interface AuthStore {
    token: string | null;
    user: User | null;
    login: () => Promise<void>;
    signup: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        immer((set) => ({
            token: null,
            user: null,
            login: async () => {
                // perform login
                // Example login logic:
                const fakeToken = 'some-token'; // Replace with real token logic
                const fakeUser: User = { id: 1, name: 'John Doe' }; // Replace with real user data

                set((state) => {
                    state.token = fakeToken;
                    state.user = fakeUser;
                });
            },
            signup: async () => {
                // perform signup
                // Example signup logic:
                const fakeToken = 'some-token'; // Replace with real token logic
                const fakeUser: User = { id: 1, name: 'John Doe' }; // Replace with real user data

                set((state) => {
                    state.token = fakeToken;
                    state.user = fakeUser;
                });
            },
            logout: async () => {
                // perform logout
                set((state) => {
                    state.token = null;
                    state.user = null;
                });
            },
        })),
        {
            name: 'auth',
            onRehydrateStorage: (state) => {
                if (state?.token) {
                    state.login();
                }
            },
        }
    )
);
