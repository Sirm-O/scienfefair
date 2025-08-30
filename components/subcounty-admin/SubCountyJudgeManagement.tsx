

import React from 'react';
import { User, NewUser } from '../../types';
import JudgesAndCoordinators from '../shared/JudgesAndCoordinators';

interface SubCountyJudgeManagementProps {
    users: User[];
    onAddUser: (userData: NewUser) => Promise<User>;
    onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
    onRemoveUser: (userId: string) => Promise<void>;
    currentUser: User;
}

const SubCountyJudgeManagement: React.FC<SubCountyJudgeManagementProps> = (props) => {
    return (
        <JudgesAndCoordinators
            {...props}
            level="Sub-County"
        />
    );
};

export default SubCountyJudgeManagement;