import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NavbarLayout from '@/layouts/navbar';

export default function Component() {
    return (
        <NavbarLayout>
            <div className='container mx-auto px-4'>
                <div className='grid gap-8 md:grid-cols-3'>
                    <Card className='col-span-1'>
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col items-center'>
                            <Avatar className='w-32 h-32 mb-4'>
                                <AvatarImage src={'/hero.jpeg'} />
                            </Avatar>
                            <Label htmlFor='picture' className='cursor-pointer'>
                                <Input id='picture' type='file' accept='image/*' className='hidden' />
                                <Button variant='outline' className='mt-2'>
                                    Upload New Picture
                                </Button>
                            </Label>
                        </CardContent>
                    </Card>
                    <Card className='col-span-2'>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='firstName'>First Name</Label>
                                        <Input id='firstName' name='firstName' />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='lastName'>Last Name</Label>
                                        <Input id='lastName' name='lastName' />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='username'>Username</Label>
                                    <Input id='username' name='username' />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='email'>Email</Label>
                                    <Input id='email' name='email' type='email' />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='password'>New Password</Label>
                                    <Input id='password' name='password' type='password' />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                                    <Input id='confirmPassword' name='confirmPassword' type='password' />
                                </div>
                                <Button type='submit'>Update Profile</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <Tabs defaultValue='jobs' className='mt-8'>
                    <TabsList>
                        <TabsTrigger value='jobs'>Posted Jobs</TabsTrigger>
                        <TabsTrigger value='applications'>Applications</TabsTrigger>
                    </TabsList>
                    <TabsContent value='jobs'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Posted Jobs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className='list-disc pl-5'></ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value='applications'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Job Applications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className='list-disc pl-5'></ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </NavbarLayout>
    );
}
