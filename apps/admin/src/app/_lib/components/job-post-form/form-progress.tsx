import { CheckCircle } from 'lucide-react';
import { Progress } from '@jobify/ui/progress';
import { FORM_STEPS } from '@/app/_lib/utils';

export function FormProgress({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
    const progress = (currentPage / totalPages) * 100;

    return (
        <div className='mb-6'>
            <div className='flex justify-between mb-2'>
                {FORM_STEPS.map((step, index) => (
                    <div
                        key={step.id}
                        className={`text-center flex flex-col items-center relative w-full ${
                            index !== FORM_STEPS.length - 1
                                ? "after:content-[''] after:h-[2px] after:w-full after:absolute after:top-4 after:left-1/2 after:bg-muted"
                                : ''
                        }`}
                    >
                        <div
                            className={`z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium mb-1 
              ${
                  currentPage > step.id
                      ? 'bg-primary text-primary-foreground'
                      : currentPage === step.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
              }`}
                        >
                            {currentPage > step.id ? <CheckCircle className='h-4 w-4' /> : step.id}
                        </div>
                        <span className='text-xs hidden md:block'>{step.title}</span>
                    </div>
                ))}
            </div>
            <Progress value={progress} className='h-2' />
        </div>
    );
}
