

import React from 'react';
import { User, NewUser } from '../../types';
import JudgesAndCoordinators from '../shared/JudgesAndCoordinators';

interface CountyJudgeManagementProps {
    users: User[];
    onAddUser: (userData: NewUser) => Promise<User>;
    onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
    onRemoveUser: (userId: string) => Promise<void>;
    currentUser: User;
}

const CountyJudgeManagement: React.FC<CountyJudgeManagementProps> = (props) => {
    return (
        <JudgesAndCoordinators
            {...props}
            level="County"
        />
    );
};

export default CountyJudgeManagement;