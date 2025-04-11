import { LoginUserRequest } from '@/model/request';
import { Profile, User } from '@/model/user';
import ky from 'ky';
import { devtools, persist } from 'zustand/middleware';
import { create } from 'zustand';

interface Auth {
    user: User | null;
    login: (req: LoginUserRequest) => Promise<void>;
    signup: (user: User) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (profile: Partial<Profile>) => Promise<void>;
}

export const userStore = create<Auth>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                login: async (req) => {
                    const user = await ky.post('/api/login', { json: req }).json<User>();
                    set({
                        user: new User(
                            user.id,
                            user.firstName,
                            user.lastName,
                            user.username,
                            user.email,
                            user.password,
                            user.confirmPassword,
                            user.createdAt,
                            user.jobs,
                            user.applications,
                            user.role,
                            user.tnC,
                            user.workflows
                        ),
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

                        const updatedUser = new User(
                            state.user.id,
                            profile.firstName ?? state.user.firstName,
                            profile.lastName ?? state.user.lastName,
                            state.user.username,
                            state.user.email,
                            profile.password ?? state.user.password,
                            state.user.confirmPassword,
                            state.user.createdAt,
                            state.user.jobs,
                            state.user.applications,
                            profile.role ?? state.user.role,
                            state.user.tnC,
                            state.user.workflows
                        );

                        return { user: updatedUser };
                    });
                },
            }),
            {
                name: 'user-storage',
            }
        )
    )
);
