'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEvent } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Profile } from '@/model/user';
import { CheckSquare } from 'lucide-react';

interface ProfileSecurityTabProps {
    profile: Profile;
    setProfile: (profile: Profile) => void;
    submitting: boolean;
    updateUser: (field: Partial<Profile>) => Promise<void>;
}

export default function ProfileSecurityTab({ profile, setProfile, submitting, updateUser }: ProfileSecurityTabProps) {
    const validateField = (fieldValue: string, fieldName: string) => {
        if (!fieldValue) {
            throw new Error(`${fieldName} cannot be empty`);
        }
    };

    const handleUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (profile.password !== profile.confirmPassword) {
                throw new Error('Passwords do not match');
            }
            validateField(profile.password, 'Password');
            await updateUser({ password: profile.password });

            setProfile({
                ...profile,
                password: '',
                confirmPassword: '',
            });

            toast({
                title: 'Password Updated',
                description: 'Your password has been updated successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message ?? 'Error while updating password',
                variant: 'destructive',
            });
        }
    };

    return (
        <form onSubmit={handleUpdatePassword} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <Label htmlFor='password'>New Password</Label>
                    <Input
                        id='password'
                        name='password'
                        type='password'
                        value={profile.password || ''}
                        onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor='confirmPassword'>Confirm Password</Label>
                    <Input
                        id='confirmPassword'
                        name='confirmPassword'
                        type='password'
                        value={profile.confirmPassword || ''}
                        onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                    />
                </div>
            </div>

            <div className='bg-muted/50 p-4 rounded-md mt-4'>
                <p className='text-sm font-medium'>Password Requirements:</p>
                <ul className='text-xs text-muted-foreground mt-2 space-y-1'>
                    <li className='flex items-center gap-1'>
                        <CheckSquare className='h-3 w-3' /> Minimum 8 characters long
                    </li>
                    <li className='flex items-center gap-1'>
                        <CheckSquare className='h-3 w-3' /> Include at least one uppercase letter
                    </li>
                    <li className='flex items-center gap-1'>
                        <CheckSquare className='h-3 w-3' /> Include at least one number
                    </li>
                    <li className='flex items-center gap-1'>
                        <CheckSquare className='h-3 w-3' /> Include at least one special character
                    </li>
                </ul>
            </div>

            <Button type='submit' disabled={submitting} className='w-full sm:w-auto mt-2'>
                {submitting ? 'Updating...' : 'Update Password'}
            </Button>
        </form>
    );
}
