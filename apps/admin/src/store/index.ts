import { LoginUserRequest } from '@jobify/domain/request';
import { Profile, User } from '@jobify/domain/user';
import ky from 'ky';
import { devtools, persist } from 'zustand/middleware';
import { create } from 'zustand';

export type SessionUser = Omit<User, 'password' | 'confirmPassword'> & {
    avatarUrl?: string | null;
};

interface Auth {
    user: SessionUser | null;
    login: (req: LoginUserRequest) => Promise<void>;
    signup: (user: User & { recaptchaToken: string }) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (profile: Partial<Profile>) => Promise<void>;
    setAvatarUrl: (avatarUrl: string | null) => void;
}

export const userStore = create<Auth>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                login: async (req) => {
                    const user = await ky.post('/api/login', { json: req }).json<SessionUser>();
                    set({
                        user: {
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            username: user.username,
                            email: user.email,
                            createdAt: user.createdAt ?? '',
                            avatarUrl: user.avatarUrl ?? null,
                        },
                    });
                },
                signup: async (user) => {
                    await ky.post('/api/signup', { json: user });
                },
                logout: async () => {
                    await ky.get('/api/logout');
                    set({ user: null });
                },
                updateUser: async (profile) => {
                    await ky.put('/api/me', { json: profile });
                    set((state) => {
                        if (!state.user) return { user: null };
                        return {
                            user: {
                                ...state.user,
                                ...profile,
                            },
                        };
                    });
                },
                setAvatarUrl: (avatarUrl) => {
                    set((state) => {
                        if (!state.user) return state;
                        return { user: { ...state.user, avatarUrl } };
                    });
                },
            }),
            {
                name: 'user-storage',
            }
        )
    )
);
