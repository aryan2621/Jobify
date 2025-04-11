export const REJECTION_EMAIL_CONTENT = `Dear {applicant_name},

Thank you for applying for the {job_title} position at {company_name}. We appreciate the time and effort you've put into your application.

After careful consideration of your qualifications and experience, we have decided to move forward with other candidates who more closely match our current requirements for this role.

We encourage you to apply for future positions that match your skills and interests.

Best regards,
{company_name} HR Team`;

export const SELECTION_EMAIL_CONTENT = `Dear {applicant_name},

We are pleased to inform you that you have been selected for the {job_title} position at {company_name}.

Your qualifications and experience impressed our team, and we believe you will be a valuable addition to our organization. 

Please respond to this email to confirm your acceptance, and we will provide further details about the next steps.

Congratulations, and welcome to the team!

Best regards,
{company_name} HR Team`;

export const predefinedSkills = [
    'JavaScript',
    'TypeScript',
    'React',
    'Angular',
    'Vue.js',
    'Node.js',
    'Python',
    'Java',
    'C#',
    'C++',
    'Go',
    'Ruby',
    'Swift',
    'PHP',
    'AWS',
    'Azure',
    'GCP',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'SQL',
    'NoSQL',
    'MongoDB',
    'Redis',
    'GraphQL',
    'REST API',
    'HTML',
    'CSS',
    'Sass',
    'UI/UX',
    'Figma',
    'Adobe XD',
    'Git',
    'Agile',
    'Scrum',
    'DevOps',
    'TDD',
    'Security',
];

export type ValidationState = {
    [key: string]: {
        valid: boolean;
        message: string;
        touched: boolean;
    };
};

export const FORM_STEPS = [
    { id: 1, title: 'Basic Info', description: 'Job title and description' },
    { id: 2, title: 'Job Details', description: 'Type, location and deadline' },
    { id: 3, title: 'Required Skills', description: 'Select skills needed' },
    { id: 4, title: 'Email Templates', description: 'Customize email responses' },
    { id: 5, title: 'Review', description: 'Preview and submit' },
];
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
