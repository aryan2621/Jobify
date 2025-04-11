import { Badge } from '@/components/ui/badge';

interface JobSkillBadgesProps {
    skills: string[];
    limit?: number;
    className?: string;
}

export const JobSkillBadges = ({ skills, limit = 3, className = '' }: JobSkillBadgesProps) => {
    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            {skills.slice(0, limit).map((skill, i) => (
                <Badge key={i} variant='secondary' className='text-xs py-0 h-5'>
                    {skill}
                </Badge>
            ))}
            {skills.length > limit && (
                <Badge variant='secondary' className='text-xs py-0 h-5'>
                    +{skills.length - limit}
                </Badge>
            )}
        </div>
    );
};
