'use client';

import { Input } from '@/components/ui/input';
import { User } from 'lucide-react';
import { Application, JobSource } from '@/model/application';
import { memo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AtSign, MapPin, Phone } from 'lucide-react';
import { Gender } from '@/model/application';
import { FormValidation } from '../../utils';
import { FormField, FormSectionTitle } from '..';
import { countries } from '@/lib/utils/joconnect-utils';

export const PersonalInfoForm = memo(
    ({
        formData,
        validation,
        setFormData,
        onFieldChange,
        selectedCountry,
        setSelectedCountry,
    }: {
        formData: Application;
        validation: FormValidation;
        setFormData: (data: Application) => void;
        onFieldChange: (field: string, value: any) => void;
        selectedCountry: string;
        setSelectedCountry: (country: string) => void;
    }) => (
        <div className='space-y-6'>
            <FormSectionTitle title='Personal Information' subtitle='Tell us about yourself' icon={<User className='w-5 h-5 text-primary' />} />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
                <FormField label='First Name' error={validation.firstName?.errorMessage} touched={validation.firstName?.touched} required>
                    <Input
                        id='first-name'
                        placeholder='Enter your first name'
                        value={formData.firstName}
                        onChange={(e) => onFieldChange('firstName', e.target.value)}
                        aria-invalid={validation.firstName?.touched && !validation.firstName?.isValid}
                        className={validation.firstName?.touched && !validation.firstName?.isValid ? 'border-destructive' : ''}
                    />
                </FormField>

                <FormField label='Last Name' error={validation.lastName?.errorMessage} touched={validation.lastName?.touched} required>
                    <Input
                        id='last-name'
                        placeholder='Enter your last name'
                        value={formData.lastName}
                        onChange={(e) => onFieldChange('lastName', e.target.value)}
                        aria-invalid={validation.lastName?.touched && !validation.lastName?.isValid}
                        className={validation.lastName?.touched && !validation.lastName?.isValid ? 'border-destructive' : ''}
                    />
                </FormField>
            </div>

            <FormField label='Email Address' error={validation.email?.errorMessage} touched={validation.email?.touched} required>
                <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <AtSign className='h-4 w-4 text-muted-foreground' />
                    </div>
                    <Input
                        id='email'
                        type='email'
                        placeholder='name@example.com'
                        value={formData.email}
                        onChange={(e) => onFieldChange('email', e.target.value)}
                        aria-invalid={validation.email?.touched && !validation.email?.isValid}
                        className={`pl-10 ${validation.email?.touched && !validation.email?.isValid ? 'border-destructive' : ''}`}
                    />
                </div>
            </FormField>

            <FormField label='Phone Number' error={validation.phone?.errorMessage} touched={validation.phone?.touched} required>
                <div className='flex gap-2'>
                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className='w-[120px] p-2 border rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-1'
                        aria-label='Country Code'
                    >
                        {countries.map((country, index) => (
                            <option key={index} value={country.dial_code}>
                                {country.flag} {country.dial_code}
                            </option>
                        ))}
                    </select>

                    <div className='relative flex-grow'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <Phone className='h-4 w-4 text-muted-foreground' />
                        </div>
                        <Input
                            id='phone'
                            placeholder='Phone Number'
                            value={formData.phone}
                            onChange={(e) => onFieldChange('phone', e.target.value)}
                            className={`pl-10 ${validation.phone?.touched && !validation.phone?.isValid ? 'border-destructive' : ''}`}
                        />
                    </div>
                </div>
            </FormField>

            <FormField
                label='Current Location'
                error={validation.currentLocation?.errorMessage}
                touched={validation.currentLocation?.touched}
                required
            >
                <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <MapPin className='h-4 w-4 text-muted-foreground' />
                    </div>
                    <Input
                        id='current-location'
                        placeholder='City, Country'
                        value={formData.currentLocation}
                        onChange={(e) => onFieldChange('currentLocation', e.target.value)}
                        className={`pl-10 ${validation.currentLocation?.touched && !validation.currentLocation?.isValid ? 'border-destructive' : ''}`}
                    />
                </div>
            </FormField>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField label='Gender' required>
                    <Select value={formData.gender} onValueChange={(value) => onFieldChange('gender', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder='Select Gender' />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(Gender).map((gender) => (
                                <SelectItem key={gender} value={gender}>
                                    {gender}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField label='How did you hear about us?' required>
                    <Select value={formData.source} onValueChange={(value) => onFieldChange('source', value as JobSource)}>
                        <SelectTrigger>
                            <SelectValue placeholder='Select a source' />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(JobSource).map((source) => (
                                <SelectItem key={source} value={source}>
                                    {source}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
            </div>
        </div>
    )
);

PersonalInfoForm.displayName = 'PersonalInfoForm';
