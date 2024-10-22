import { NodeType, TaskType } from '@/app/workflows/model';
import { createContext, useContext, useState } from 'react';

const DnDContext = createContext<[NodeType | TaskType | null, React.Dispatch<React.SetStateAction<NodeType | TaskType | null>>]>([null, () => {}]);

export const DnDProvider = ({ children }: { children: React.ReactNode }) => {
    const [type, setType] = useState<any | null>(null);
    return <DnDContext.Provider value={[type, setType]}>{children}</DnDContext.Provider>;
};

export const useDnD = () => useContext(DnDContext);
