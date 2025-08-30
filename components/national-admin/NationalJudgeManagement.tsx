

import React from 'react';
import { User, NewUser } from '../../types';
import JudgesAndCoordinators from '../shared/JudgesAndCoordinators';

interface NationalJudgeManagementProps {
    users: User[];
    onAddUser: (userData: NewUser) => Promise<User>;
    onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
    onRemoveUser: (userId: string) => Promise<void>;
    currentUser: User;
}

const NationalJudgeManagement: React.FC<NationalJudgeManagementProps> = (props) => {
    return (
        <JudgesAndCoordinators
            {...props}
            level="National"
        />
    );
};

export default NationalJudgeManagement;