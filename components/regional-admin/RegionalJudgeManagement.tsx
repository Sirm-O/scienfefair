

import React from 'react';
import { User, NewUser } from '../../types';
import JudgesAndCoordinators from '../shared/JudgesAndCoordinators';

interface RegionalJudgeManagementProps {
    users: User[];
    onAddUser: (userData: NewUser) => Promise<User>;
    onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
    onRemoveUser: (userId: string) => Promise<void>;
    currentUser: User;
}

const RegionalJudgeManagement: React.FC<RegionalJudgeManagementProps> = (props) => {
    return (
        <JudgesAndCoordinators
            {...props}
            level="Regional"
        />
    );
};

export default RegionalJudgeManagement;