import { LoginUserRequest } from '@/model/request';
import { Profile, User } from '@/model/user';
import ky from 'ky';
import { devtools, persist } from 'zustand/middleware';
import { create } from 'zustand';

export type SignupPayload = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type LoginResponseUser = Pick<User, 'id' | 'firstName' | 'lastName' | 'username' | 'email'>;

interface Auth {
    user: User | null;
    login: (req: LoginUserRequest) => Promise<void>;
    signup: (data: SignupPayload) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (profile: Partial<Profile>) => Promise<void>;
}

export const userStore = create<Auth>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                login: async (req) => {
                    const u = await ky.post('/api/login', { json: req }).json<LoginResponseUser>();
                    set({
                        user: new User(
                            u.id,
                            u.firstName,
                            u.lastName,
                            u.username,
                            u.email,
                            '',
                            '',
                            ''
                        ),
                    });
                },
                signup: async (data) => {
                    await ky.post('/api/signup', { json: data });
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
                            } as User,
                        };
                    });
                },
            }),
            {
                name: 'user-storage',
            }
        )
    )
);
