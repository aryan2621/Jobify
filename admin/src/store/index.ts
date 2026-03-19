import { LoginUserRequest } from '@/model/request';
import { Profile, User } from '@/model/user';
import ky from 'ky';
import { devtools, persist } from 'zustand/middleware';
import { create } from 'zustand';

interface Auth {
    user: (User & { avatarUrl?: string | null }) | null;
    login: (req: LoginUserRequest) => Promise<void>;
    signup: (user: User) => Promise<void>;
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
                    const user = await ky.post('/api/login', { json: req }).json<User & { avatarUrl?: string | null }>();
                    set({
                        user: {
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            username: user.username,
                            email: user.email,
                            applications: user.applications,
                            jobs: user.jobs ?? [],
                            workflows: user.workflows ?? [],
                            createdAt: user.createdAt ?? '',
                            tnC: user.tnC ?? false,
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
