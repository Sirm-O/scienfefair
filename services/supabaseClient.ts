
import { createClient, User as AuthUser } from '@supabase/supabase-js';
import { User, UserRole } from '../types';

const supabaseUrl = 'https://rwpmndfzrytnungopglw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cG1uZGZ6cnl0bnVuZ29wZ2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjEzOTIsImV4cCI6MjA3MjAzNzM5Mn0.l9r7LWdpNO8eZqOQgThKfkxmZHUx-udj14_Q23SFFJ4';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches the full user profile from the `profiles` table.
 * @param authUser The user object from `supabase.auth.getUser()`
 * @returns A promise that resolves to the full user profile or null.
 */
export const getFullUserProfile = async (authUser: AuthUser | null): Promise<User | null> => {
    if (!authUser) return null;
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

        if (error) {
            // This is an expected "error" if the profile hasn't been created by the trigger yet (race condition).
            // Only log if it's not the "0 rows found" error.
            if (error.code !== 'PGRST116') { 
                console.error('Error fetching profile:', error.message);
                return null;
            }
            
            // Handle the race condition where the profile doesn't exist yet by returning a temporary profile.
            const metadata = authUser.user_metadata;
            return {
                id: authUser.id,
                email: authUser.email || '',
                name: metadata.name || 'New User',
                role: metadata.role || UserRole.PATRON,
                status: 'Active',
            } as User;
        }
        
        // Manually map from snake_case (DB) to camelCase (TS type)
        return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            status: data.status,
            forcePasswordChange: data.force_password_change,
            idNumber: data.id_number,
            tscNumber: data.tsc_number,
            school: data.school,
            teachingSubjects: data.teaching_subjects,
            phoneNumber: data.phone_number,
            assignments: data.assignments,
            coordinatorCategory: data.coordinator_category,
            assignedRegion: data.assigned_region,
            assignedCounty: data.assigned_county,
            assignedSubCounty: data.assigned_sub_county,
        };
    } catch (e) {
        console.error('An unexpected error occurred while fetching the profile:', e);
        return null;
    }
};
