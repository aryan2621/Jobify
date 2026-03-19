'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FormEvent } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Profile } from '@/model/user';

interface ProfilePersonalTabProps {
    profile: Profile;
    setProfile: (profile: Profile) => void;
    submitting: boolean;
    updateUser: (field: Partial<Profile>) => Promise<void>;
}

export default function ProfilePersonalTab({ profile, setProfile, submitting, updateUser }: ProfilePersonalTabProps) {
    const validateField = (fieldValue: string, fieldName: string) => {
        if (!fieldValue) {
            throw new Error(`${fieldName} cannot be empty`);
        }
    };

    const handleUpdateName = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            validateField(profile.firstName, 'First name');
            validateField(profile.lastName, 'Last name');
            await updateUser({ firstName: profile.firstName, lastName: profile.lastName });

            toast({
                title: 'Profile Updated',
                description: 'Your profile has been updated successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message ?? 'Error while updating name',
                variant: 'destructive',
            });
        }
    };

    return (
        <form onSubmit={handleUpdateName} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <Label htmlFor='email'>Email</Label>
                    <Input id='email' name='email' value={profile.email} disabled className='bg-muted/50' />
                    <p className='text-xs text-muted-foreground mt-1'>Your email cannot be changed</p>
                </div>
                <div>
                    <Label htmlFor='username'>Username</Label>
                    <Input id='username' name='username' value={profile.username} disabled className='bg-muted/50' />
                    <p className='text-xs text-muted-foreground mt-1'>Your username cannot be changed</p>
                </div>
            </div>

            <Separator className='my-4' />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <Label htmlFor='firstName'>First Name</Label>
                    <Input
                        id='firstName'
                        name='firstName'
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor='lastName'>Last Name</Label>
                    <Input
                        id='lastName'
                        name='lastName'
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                </div>
            </div>

            <Button type='submit' disabled={submitting} className='w-full sm:w-auto mt-2'>
                {submitting ? 'Updating...' : 'Update Personal Information'}
            </Button>
        </form>
    );
}
