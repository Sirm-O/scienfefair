
import { createClient, User as AuthUser } from '@supabase/supabase-js';
import { User, UserRole } from '../types';

const supabaseUrl = 'https://rwpmndfzrytnungopglw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cG1uZGZ6cnl0bnVuZ29wZ2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjEzOTIsImV4cCI6MjA3MjAzNzM5Mn0.l9r7LWdpNO8eZqOQgThKfkxmZHUx-udj14_Q23SFFJ4';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Tests the database connection and table availability
 */
export const testDatabaseConnection = async (): Promise<{ success: boolean; error?: string; details?: any }> => {
    try {
        console.log('Testing Supabase connection...');
        
        // Test 1: Basic connection
        const { data: healthCheck, error: healthError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
            
        if (healthError) {
            if (healthError.message.includes('relation "profiles" does not exist')) {
                return {
                    success: false,
                    error: 'Database tables not set up',
                    details: 'The profiles table does not exist. Please run the database schema setup script.'
                };
            }
            
            return {
                success: false,
                error: 'Database connection failed',
                details: healthError.message
            };
        }
        
        console.log('Database connection test passed');
        return { success: true };
    } catch (error) {
        console.error('Database connection test failed:', error);
        return {
            success: false,
            error: 'Connection test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

/**
 * Fetches the full user profile from the `profiles` table.
 * @param authUser The user object from `supabase.auth.getUser()`
 * @returns A promise that resolves to the full user profile or null.
 */
export const getFullUserProfile = async (authUser: AuthUser | null): Promise<User | null> => {
    if (!authUser) return null;
    
    console.log('getFullUserProfile: Fetching profile for user ID:', authUser.id);
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

        if (error) {
            console.log('getFullUserProfile: Database error:', error);
            
            // Check if the table doesn't exist
            if (error.message.includes('relation "profiles" does not exist')) {
                console.error('CRITICAL: The profiles table does not exist in the database!');
                throw new Error('Database setup incomplete: The profiles table is missing. Please run the database schema setup.');
            }
            
            // This is an expected "error" if the profile hasn't been created by the trigger yet (race condition).
            if (error.code === 'PGRST116') { // "0 rows found"
                console.log('getFullUserProfile: No profile found, creating temporary profile');
                
                // Handle the race condition where the profile doesn't exist yet by returning a temporary profile.
                const metadata = authUser.user_metadata;
                const tempProfile = {
                    id: authUser.id,
                    email: authUser.email || '',
                    name: metadata.name || 'New User',
                    role: metadata.role || UserRole.PATRON,
                    status: 'Active',
                } as User;
                
                console.log('getFullUserProfile: Returning temporary profile:', tempProfile);
                return tempProfile;
            }
            
            // For other errors, log and throw
            console.error('getFullUserProfile: Unexpected database error:', error);
            throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('getFullUserProfile: Profile found successfully:', data);
        
        // Manually map from snake_case (DB) to camelCase (TS type)
        const profile: User = {
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
        
        console.log('getFullUserProfile: Mapped profile:', profile);
        return profile;
    } catch (e) {
        console.error('getFullUserProfile: Unexpected error:', e);
        if (e instanceof Error) {
            throw e; // Re-throw known errors
        }
        throw new Error('An unexpected error occurred while fetching the user profile.');
    }
};
