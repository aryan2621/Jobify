'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { v4 as uuidv4 } from 'uuid';
import { FormEvent, useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, UserRole } from '@/model/user';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Check, X, Eye, EyeOff, CheckCircle, User as UserIcon, Briefcase, AlertCircle, Loader2, Lock, Mail } from 'lucide-react';
import { userStore } from '@/store';

// Password strength component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    const [strength, setStrength] = useState(0);
    const [feedback, setFeedback] = useState<{ [key: string]: boolean }>({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
    });

    useEffect(() => {
        const updateStrength = () => {
            const checks = {
                minLength: password.length >= 10,
                hasUppercase: /[A-Z]/.test(password),
                hasLowercase: /[a-z]/.test(password),
                hasNumber: /[0-9]/.test(password),
                hasSpecial: /[^A-Za-z0-9]/.test(password),
            };

            setFeedback(checks);

            const passedChecks = Object.values(checks).filter(Boolean).length;
            setStrength(passedChecks * 20); // 20% for each passed check
        };

        updateStrength();
    }, [password]);

    const getStrengthLabel = () => {
        if (strength === 0) return 'Very Weak';
        if (strength <= 40) return 'Weak';
        if (strength <= 60) return 'Medium';
        if (strength <= 80) return 'Strong';
        return 'Very Strong';
    };

    const getStrengthColor = () => {
        if (strength === 0) return 'bg-red-500';
        if (strength <= 40) return 'bg-orange-500';
        if (strength <= 60) return 'bg-yellow-500';
        if (strength <= 80) return 'bg-green-400';
        return 'bg-green-600';
    };

    return (
        <div className='space-y-2'>
            <div className='flex justify-between items-center'>
                <span className='text-xs text-muted-foreground'>Password Strength</span>
                <span className='text-xs font-medium'>{getStrengthLabel()}</span>
            </div>
            <Progress value={strength} className={`h-1.5 ${getStrengthColor()}`} />
            <div className='grid grid-cols-2 gap-x-4 gap-y-1 mt-2'>
                <div className='flex items-center gap-1.5'>
                    {feedback.minLength ? <Check className='h-3.5 w-3.5 text-green-600' /> : <X className='h-3.5 w-3.5 text-muted-foreground' />}
                    <span className={`text-xs ${feedback.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>At least 10 characters</span>
                </div>
                <div className='flex items-center gap-1.5'>
                    {feedback.hasUppercase ? <Check className='h-3.5 w-3.5 text-green-600' /> : <X className='h-3.5 w-3.5 text-muted-foreground' />}
                    <span className={`text-xs ${feedback.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`}>Uppercase letter</span>
                </div>
                <div className='flex items-center gap-1.5'>
                    {feedback.hasLowercase ? <Check className='h-3.5 w-3.5 text-green-600' /> : <X className='h-3.5 w-3.5 text-muted-foreground' />}
                    <span className={`text-xs ${feedback.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}`}>Lowercase letter</span>
                </div>
                <div className='flex items-center gap-1.5'>
                    {feedback.hasNumber ? <Check className='h-3.5 w-3.5 text-green-600' /> : <X className='h-3.5 w-3.5 text-muted-foreground' />}
                    <span className={`text-xs ${feedback.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>Number</span>
                </div>
                <div className='flex items-center gap-1.5'>
                    {feedback.hasSpecial ? <Check className='h-3.5 w-3.5 text-green-600' /> : <X className='h-3.5 w-3.5 text-muted-foreground' />}
                    <span className={`text-xs ${feedback.hasSpecial ? 'text-green-600' : 'text-muted-foreground'}`}>Special character</span>
                </div>
            </div>
        </div>
    );
};

// Role selection card component
const RoleCard = ({
    title,
    description,
    icon: Icon,
    isSelected,
    value,
    onSelect,
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    isSelected: boolean;
    value: string;
    onSelect: (value: string) => void;
}) => {
    return (
        <div
            className={`relative border rounded-lg p-4 transition-all cursor-pointer hover:border-primary/70 ${
                isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border'
            }`}
            onClick={() => onSelect(value)}
        >
            {isSelected && <Badge className='absolute -top-2 -right-2 bg-primary text-primary-foreground'>Selected</Badge>}
            <div className='flex gap-3 items-start'>
                <div className={`p-2 rounded-md ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <Icon className='h-5 w-5' />
                </div>
                <div>
                    <h3 className='font-medium'>{title}</h3>
                    <p className='text-sm text-muted-foreground mt-1'>{description}</p>
                </div>
            </div>
        </div>
    );
};

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<User>(
        new User(uuidv4(), '', '', '', '', '', '', new Date().toISOString(), [], [], UserRole.USER, false, [])
    );
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState<'account' | 'details' | 'role'>('account');
    const [formProgress, setFormProgress] = useState(33);

    const signUp = userStore((state) => state.signup);

    // Update form progress based on current step
    useEffect(() => {
        if (currentStep === 'account') setFormProgress(33);
        else if (currentStep === 'details') setFormProgress(66);
        else setFormProgress(100);
    }, [currentStep]);

    const validateAccountStep = () => {
        if (!formData.email) {
            throw new Error('Email cannot be empty.');
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            throw new Error('Please enter a valid email address.');
        }
        if (!formData.password) {
            throw new Error('Password cannot be empty.');
        }
        if (!formData.confirmPassword) {
            throw new Error('Confirm Password cannot be empty.');
        }
        if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match.');
        }

        // Check password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,15}$/;
        if (!passwordRegex.test(formData.password)) {
            throw new Error('Password does not meet the requirements.');
        }
    };

    const validateDetailsStep = () => {
        if (!formData.firstName) {
            throw new Error('First name cannot be empty.');
        }
        if (!formData.lastName) {
            throw new Error('Last name cannot be empty.');
        }
        if (!formData.username) {
            throw new Error('Username cannot be empty.');
        }
    };

    const validateRoleStep = () => {
        if (!formData.role) {
            throw new Error('You must select a role');
        }
        if (!formData.tnC) {
            throw new Error('You must agree to the terms and conditions');
        }
    };

    const validateUser = (user: User) => {
        validateAccountStep();
        validateDetailsStep();
        validateRoleStep();
    };

    const handleNext = () => {
        try {
            if (currentStep === 'account') {
                validateAccountStep();
                setCurrentStep('details');
            } else if (currentStep === 'details') {
                validateDetailsStep();
                setCurrentStep('role');
            }
        } catch (error: any) {
            toast({
                title: 'Validation Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handlePrevious = () => {
        if (currentStep === 'details') {
            setCurrentStep('account');
        } else if (currentStep === 'role') {
            setCurrentStep('details');
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            validateRoleStep();

            setLoading(true);
            validateUser(formData);
            await signUp(formData);

            toast({
                title: 'Account Created Successfully',
                description: 'Your account has been created. Redirecting to login...',
            });

            // Redirect after a short delay for better UX
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (role: UserRole) => {
        const newUser = new User(
            formData.id,
            formData.firstName,
            formData.lastName,
            formData.username,
            formData.email,
            formData.password,
            formData.confirmPassword,
            formData.createdAt,
            formData.jobs,
            formData.applications,
            role,
            formData.tnC,
            formData.workflows
        );
        setFormData(newUser);
    };

    return (
        <div className='min-h-screen bg-background flex flex-col items-center justify-center py-10 px-4'>
            <div className='flex w-full max-w-5xl mx-auto'>
                {/* Left Side - Image and Info */}
                <div className='hidden lg:flex flex-col w-1/2 pr-10'>
                    <div className='mb-8'>
                        <Link href='/' className='text-2xl font-bold flex items-center'>
                            <Briefcase className='mr-2 h-6 w-6 text-primary' />
                            JobConnect
                        </Link>
                    </div>

                    <div className='mb-8'>
                        <h1 className='text-3xl font-bold mb-4'>Start Your Professional Journey</h1>
                        <p className='text-muted-foreground'>Create an account to unlock a world of job opportunities and career advancement.</p>
                    </div>

                    <div className='relative mt-4 flex-1 flex items-center justify-center'>
                        <div className='absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-60 rounded-xl'></div>
                        <Image
                            src='/signup.jpeg'
                            alt='Signup Image'
                            width={500}
                            height={500}
                            className='relative object-cover rounded-xl shadow-xl max-h-[500px] z-10'
                        />
                    </div>

                    <div className='mt-8 grid grid-cols-3 gap-4'>
                        {[
                            { title: 'Easy Apply', icon: CheckCircle },
                            { title: 'Company Reviews', icon: Briefcase },
                            { title: 'Career Growth', icon: UserIcon },
                        ].map((item, index) => (
                            <div key={index} className='flex flex-col items-center'>
                                <div className='p-2 rounded-full bg-primary/10 mb-2'>
                                    <item.icon className='h-5 w-5 text-primary' />
                                </div>
                                <span className='text-sm font-medium'>{item.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Form */}
                <Card className='flex-1 lg:w-1/2 max-w-md mx-auto border-muted/60 shadow-lg'>
                    <CardHeader className='pb-2'>
                        <div className='lg:hidden mb-4'>
                            <Link href='/' className='text-xl font-bold flex items-center justify-center'>
                                <Briefcase className='mr-2 h-5 w-5 text-primary' />
                                JobConnect
                            </Link>
                        </div>
                        <CardTitle className='text-xl font-bold'>Create Account</CardTitle>
                        <CardDescription>Complete the steps below to set up your account</CardDescription>
                    </CardHeader>

                    <CardContent className='pt-4'>
                        {/* Progress tracker */}
                        <div className='mb-6'>
                            <div className='flex justify-between mb-1.5'>
                                <span className='text-xs text-muted-foreground'>
                                    Step {currentStep === 'account' ? '1' : currentStep === 'details' ? '2' : '3'} of 3
                                </span>
                                <span className='text-xs font-medium'>{formProgress}% Complete</span>
                            </div>
                            <Progress value={formProgress} className='h-1.5' />
                        </div>

                        <form className='space-y-4' onSubmit={handleSubmit}>
                            {currentStep === 'account' && (
                                <div className='space-y-4'>
                                    <div>
                                        <Label htmlFor='email' className='flex items-center gap-1.5'>
                                            <Mail className='h-3.5 w-3.5' />
                                            Email
                                        </Label>
                                        <div className='relative mt-1.5'>
                                            <Input
                                                name='email'
                                                value={formData.email}
                                                onChange={(e) => {
                                                    const newUser = { ...formData, email: e.target.value };
                                                    setFormData(newUser as User);
                                                }}
                                                id='email'
                                                type='email'
                                                placeholder='name@example.com'
                                                autoComplete='email'
                                                className='bg-background'
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor='password' className='flex items-center gap-1.5'>
                                            <Lock className='h-3.5 w-3.5' />
                                            Password
                                        </Label>
                                        <div className='relative mt-1.5'>
                                            <Input
                                                name='password'
                                                value={formData.password}
                                                onChange={(e) => {
                                                    const newUser = { ...formData, password: e.target.value };
                                                    setFormData(newUser as User);
                                                }}
                                                id='password'
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder='Create a secure password'
                                                autoComplete='new-password'
                                                className='pr-10 bg-background'
                                            />
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                className='absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground'
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                                <span className='sr-only'>{showPassword ? 'Hide password' : 'Show password'}</span>
                                            </Button>
                                        </div>
                                    </div>

                                    <PasswordStrengthIndicator password={formData.password} />

                                    <div>
                                        <Label htmlFor='confirmPassword' className='flex items-center gap-1.5'>
                                            <Lock className='h-3.5 w-3.5' />
                                            Confirm Password
                                        </Label>
                                        <div className='relative mt-1.5'>
                                            <Input
                                                name='confirmPassword'
                                                value={formData.confirmPassword}
                                                onChange={(e) => {
                                                    const newUser = { ...formData, confirmPassword: e.target.value };
                                                    setFormData(newUser as User);
                                                }}
                                                id='confirmPassword'
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder='Confirm your password'
                                                autoComplete='new-password'
                                                className='pr-10 bg-background'
                                            />
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                className='absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground'
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                                <span className='sr-only'>{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                                            </Button>
                                        </div>

                                        {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                            <p className='text-xs text-red-500 mt-1 flex items-center gap-1'>
                                                <AlertCircle className='h-3 w-3' />
                                                Passwords do not match
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentStep === 'details' && (
                                <div className='space-y-4'>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <Label htmlFor='firstName'>First Name</Label>
                                            <Input
                                                name='firstName'
                                                value={formData.firstName}
                                                onChange={(e) => {
                                                    const newUser = { ...formData, firstName: e.target.value };
                                                    setFormData(newUser as User);
                                                }}
                                                id='firstName'
                                                placeholder='John'
                                                className='mt-1.5 bg-background'
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor='lastName'>Last Name</Label>
                                            <Input
                                                name='lastName'
                                                value={formData.lastName}
                                                onChange={(e) => {
                                                    const newUser = { ...formData, lastName: e.target.value };
                                                    setFormData(newUser as User);
                                                }}
                                                id='lastName'
                                                placeholder='Doe'
                                                className='mt-1.5 bg-background'
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor='username'>Username</Label>
                                        <Input
                                            name='username'
                                            value={formData.username}
                                            onChange={(e) => {
                                                const newUser = { ...formData, username: e.target.value };
                                                setFormData(newUser as User);
                                            }}
                                            id='username'
                                            placeholder='johndoe123'
                                            className='mt-1.5 bg-background'
                                        />
                                        <p className='text-xs text-muted-foreground mt-1'>This will be your unique identifier on the platform</p>
                                    </div>
                                </div>
                            )}

                            {currentStep === 'role' && (
                                <div className='space-y-6'>
                                    <div>
                                        <Label className='text-base'>Choose Your Role</Label>
                                        <p className='text-sm text-muted-foreground mb-4'>Select how you&#39;ll primarily use JobConnect</p>

                                        <div className='space-y-3'>
                                            <RoleCard
                                                title='Job Seeker'
                                                description='Find job opportunities and apply to positions'
                                                icon={UserIcon}
                                                isSelected={formData.role === UserRole.USER}
                                                value={UserRole.USER}
                                                onSelect={() => handleRoleSelect(UserRole.USER)}
                                            />

                                            <RoleCard
                                                title='Employer'
                                                description='Post jobs and manage applications'
                                                icon={Briefcase}
                                                isSelected={formData.role === UserRole.ADMIN}
                                                value={UserRole.ADMIN}
                                                onSelect={() => handleRoleSelect(UserRole.ADMIN)}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className='flex items-center gap-2'>
                                        <Switch
                                            id='terms'
                                            checked={formData.tnC}
                                            onCheckedChange={(checked) => {
                                                const newUser = { ...formData, tnC: checked };
                                                setFormData(newUser as User);
                                            }}
                                        />
                                        <Label htmlFor='terms' className='text-sm'>
                                            I agree to the{' '}
                                            <Link href='/terms' className='text-primary hover:underline'>
                                                Terms of Service
                                            </Link>{' '}
                                            and{' '}
                                            <Link href='/privacy' className='text-primary hover:underline'>
                                                Privacy Policy
                                            </Link>
                                        </Label>
                                    </div>
                                </div>
                            )}

                            <div className='flex justify-between pt-4'>
                                {currentStep !== 'account' ? (
                                    <Button type='button' variant='outline' onClick={handlePrevious}>
                                        Back
                                    </Button>
                                ) : (
                                    <div></div>
                                )}

                                {currentStep !== 'role' ? (
                                    <Button type='button' onClick={handleNext}>
                                        Continue
                                    </Button>
                                ) : (
                                    <Button type='submit' disabled={loading || !formData.tnC} className='min-w-[120px]'>
                                        {loading ? (
                                            <>
                                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className='flex flex-col space-y-4 pt-0'>
                        <div className='text-center w-full'>
                            <Separator className='mb-4' />
                            <p className='text-sm text-muted-foreground'>
                                Already have an account?{' '}
                                <Link href='/login' className='text-primary font-medium hover:underline'>
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
