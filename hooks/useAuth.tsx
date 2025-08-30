



import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User, NewUser, UserRole } from '../types';
import { supabase, getFullUserProfile } from '../services/supabaseClient';

export interface BulkAddResult {
    successCount: number;
    errors: { email: string, name: string, reason: string }[];
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password?: string) => Promise<User>;
  logout: () => void;
  signup: (userData: NewUser) => Promise<User | null>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  addUser: (userData: NewUser) => Promise<User>;
  addBulkUsers: (users: NewUser[]) => Promise<BulkAddResult>;
  changePassword: (userId: string, oldPassword?: string, newPassword?: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  fetchAllUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [forceShowApp, setForceShowApp] = useState(false);

  // Fallback timer to prevent infinite loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      console.warn('useAuth: Loading took too long, forcing app to show');
      setForceShowApp(true);
      setLoading(false);
    }, 15000); // 15 seconds max loading time

    return () => clearTimeout(fallbackTimer);
  }, []);

  const fetchAllUsers = useCallback(async () => {
    // Only fetch users if an admin is logged in.
    if (currentUser && currentUser.role.toLowerCase().includes('admin')) {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            // Map snake_case from DB to camelCase for each user in the list
            const mappedUsers = data.map((user: any) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                forcePasswordChange: user.force_password_change,
                idNumber: user.id_number,
                tscNumber: user.tsc_number,
                school: user.school,
                teachingSubjects: user.teaching_subjects,
                phoneNumber: user.phone_number,
                assignments: user.assignments,
                coordinatorCategory: user.coordinator_category,
                assignedRegion: user.assigned_region,
                assignedCounty: user.assigned_county,
                assignedSubCounty: user.assigned_sub_county,
            }));
            setUsers(mappedUsers);
        }
    }
  }, [currentUser]);

  // Effect to fetch the list of all users when the current (admin) user changes.
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Effect to manage the current user's session state. Runs only once on mount.
  useEffect(() => {
    setLoading(true);
    
    // Check for active session on initial load with timeout
    const checkSession = async () => {
        try {
            console.log('useAuth: Starting session check...');
            
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Session check timeout')), 10000)
            );
            
            // Race the session check against the timeout
            const sessionResult = await Promise.race([
                supabase.auth.getSession(),
                timeoutPromise
            ]) as any;
            
            console.log('useAuth: Session check completed:', sessionResult?.data?.session ? 'Session found' : 'No session');
            
            const user = await getFullUserProfile(sessionResult?.data?.session?.user ?? null);
            console.log('useAuth: Profile retrieved:', user ? 'Success' : 'No profile');
            
            setCurrentUser(user);
        } catch (error) {
            console.error('useAuth: Error checking session:', error);
            // On any error, just set no user and continue
            setCurrentUser(null);
        } finally {
            console.log('useAuth: Session check complete, setting loading to false');
            setLoading(false);
        }
    };
    
    checkSession();

    // Listen for auth state changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        console.log('useAuth: Auth state changed:', _event);
        const user = await getFullUserProfile(session?.user ?? null);
        setCurrentUser(user);
      } catch (error) {
        console.error('useAuth: Error in auth state change:', error);
        setCurrentUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // <-- Empty dependency array ensures this effect runs only once.

  const login = useCallback(async (email: string, password?: string): Promise<User> => {
    console.log('login: Attempting login for email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: password! });
    if (error) {
        console.error('login: Authentication error:', error);
        throw error;
    }
    if (!data.user) {
        console.error('login: No user data returned from authentication');
        throw new Error("Login failed, user not found.");
    }
    
    console.log('login: Authentication successful, fetching profile...');
    
    try {
        const profile = await getFullUserProfile(data.user);
        if (!profile) {
            console.error('login: Profile retrieval returned null');
            throw new Error("Could not retrieve user profile. The user account may not be properly set up in the database.");
        }
        
        console.log('login: Profile retrieved successfully:', profile);
        
        if (profile.status === 'Inactive') {
            console.log('login: User account is inactive, logging out');
            await supabase.auth.signOut(); // Log them out immediately
            throw new Error("This account is inactive. Please contact an administrator.");
        }
        
        return profile;
    } catch (profileError) {
        console.error('login: Error during profile retrieval:', profileError);
        // Sign out the user since we can't get their profile
        await supabase.auth.signOut();
        throw profileError;
    }
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error signing out:", error.message);
    }
    setCurrentUser(null);
    setUsers([]);
  }, []);
  
  const signup = useCallback(async (userData: NewUser): Promise<User | null> => {
     const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: 'ksef2026', // Use the default password for testing
        options: {
            // @ts-ignore - Undocumented option to auto-confirm email for testing purposes
            email_confirm: true,
            data: {
                name: userData.name,
                role: userData.role,
                school: userData.school,
                phone_number: userData.phoneNumber,
                id_number: userData.idNumber,
                tsc_number: userData.tscNumber,
                teaching_subjects: userData.teachingSubjects,
            },
        },
    });

    if (error) throw error;
    
    // The profile will be created by the trigger.
    // The user's email is auto-confirmed.
    alert('Registration successful! You can now sign in with your email and the default password: ksef2026');
    // We don't log them in automatically, they can now go to the sign in page.
    return null;
  }, []);
  
  const addUser = useCallback(async (userData: NewUser): Promise<User> => {
     // 1. Save the current admin's session.
     const { data: { session: currentAdminSession } } = await supabase.auth.getSession();
     if (!currentAdminSession) {
        throw new Error("Operation failed: You must be logged in as an administrator.");
     }

     const defaultPassword = 'ksef2026';

     const { data: authData, error } = await supabase.auth.signUp({
        email: userData.email,
        password: defaultPassword,
        options: {
            // @ts-ignore
            email_confirm: true,
            data: { 
                name: userData.name, 
                role: userData.role,
                assigned_region: userData.assignedRegion,
                assigned_county: userData.assignedCounty,
                assigned_sub_county: userData.assignedSubCounty,
            },
        }
     });
     if (error) throw error;
     if (!authData.user) throw new Error("User creation failed in Supabase Auth.");

     let profileData: any | null = null;
     for (let i = 0; i < 5; i++) {
         await new Promise(res => setTimeout(res, 300 * i)); 

         const { data, error: updateError } = await supabase
             .from('profiles')
             .update({ 
                 role: userData.role,
                 assigned_region: userData.assignedRegion,
                 assigned_county: userData.assignedCounty,
                 assigned_sub_county: userData.assignedSubCounty,
                 force_password_change: false,
             })
             .eq('id', authData.user.id)
             .select()
             .single();

         if (data) {
             profileData = data;
             break; 
         }

         if (updateError && updateError.code !== 'PGRST116') throw updateError;
     }
     
     if (!profileData) {
         throw new Error("Failed to update user profile after creation. The profile was not found after several attempts.");
     }
     
     // 2. Restore the original admin's session.
     const { error: sessionError } = await supabase.auth.setSession({
        access_token: currentAdminSession.access_token,
        refresh_token: currentAdminSession.refresh_token,
     });
     
     if (sessionError) {
        console.error("Critical: Failed to restore admin session. Logging out.", sessionError.message);
        await logout(); // Fail-safe logout
        throw new Error("Could not restore your session after user creation. Please log in again.");
     }

     // 3. Return the newly created user profile data.
     // The onAuthStateChange listener will handle updating the currentUser and user list.
     return {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        status: profileData.status,
        forcePasswordChange: profileData.force_password_change,
        idNumber: profileData.id_number,
        tscNumber: profileData.tsc_number,
        school: profileData.school,
        teachingSubjects: profileData.teaching_subjects,
        phoneNumber: profileData.phone_number,
        assignments: profileData.assignments,
        coordinatorCategory: profileData.coordinator_category,
        assignedRegion: profileData.assigned_region,
        assignedCounty: profileData.assigned_county,
        assignedSubCounty: profileData.assigned_sub_county,
    };
  }, [logout]);
  
  const addBulkUsers = useCallback(async (newUsers: NewUser[]): Promise<BulkAddResult> => {
    const results: BulkAddResult = { successCount: 0, errors: [] };
    const { data: { session: currentAdminSession } } = await supabase.auth.getSession();
    if (!currentAdminSession) {
        throw new Error("Operation failed: You must be logged in as an administrator.");
    }

    const defaultPassword = 'ksef2026';

    for (const userData of newUsers) {
        try {
            // signUp will switch the user session temporarily
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: userData.email,
                password: defaultPassword,
                options: {
                    // @ts-ignore
                    email_confirm: true,
                    data: {
                        name: userData.name, 
                        role: userData.role
                    },
                }
            });

            if (signUpError) throw signUpError;
            if (!authData.user) throw new Error("User creation failed in Supabase Auth.");

            let profileUpdated = false;
            // Retry updating the profile to combat trigger latency
            for (let i = 0; i < 5; i++) {
                await new Promise(res => setTimeout(res, 300 * (i + 1)));
                
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ 
                        role: userData.role,
                        assigned_region: userData.assignedRegion,
                        assigned_county: userData.assignedCounty,
                        assigned_sub_county: userData.assignedSubCounty,
                        assignments: userData.assignments,
                        force_password_change: true, // They must change the default password
                    })
                    .eq('id', authData.user.id);
                
                if (!updateError) {
                    profileUpdated = true;
                    break;
                }
                
                if (updateError && updateError.code !== 'PGRST116') { // PGRST116 is "No rows found"
                    throw updateError;
                }
                // If it's PGRST116, the loop continues and retries
            }

            if (!profileUpdated) {
                throw new Error("Failed to update user profile after creation. The database trigger may be slow or failing.");
            }

            results.successCount++;
        } catch (error) {
            results.errors.push({
                name: userData.name,
                email: userData.email,
                reason: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    
    // Restore the original admin's session after the loop
    const { error: sessionError } = await supabase.auth.setSession({
        access_token: currentAdminSession.access_token,
        refresh_token: currentAdminSession.refresh_token,
    });
    
    if (sessionError) {
        console.error("Critical: Failed to restore admin session after bulk add. Logging out.", sessionError.message);
        await logout();
        throw new Error("Could not restore your session. Please log in again.");
    }
    
    // Refresh the user list in the UI
    await fetchAllUsers();
    return results;
  }, [logout, fetchAllUsers]);

  const removeUser = useCallback(async (userId: string): Promise<void> => {
    if (currentUser?.id === userId) throw new Error("You cannot remove yourself.");
    const userToRemove = users.find(u => u.id === userId);
    if (userToRemove?.role === UserRole.SUPERADMIN) {
        throw new Error("Cannot remove the Super Administrator.");
    }
    const { error } = await supabase.rpc('delete_user', { user_id: userId });
    if (error) throw error;
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, [currentUser, users]);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>): Promise<void> => {
    // Correctly map camelCase to snake_case for the database update.
    const dbUpdates: { [key: string]: any } = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.school !== undefined) dbUpdates.school = updates.school;
    if (updates.idNumber !== undefined) dbUpdates.id_number = updates.idNumber;
    if (updates.tscNumber !== undefined) dbUpdates.tsc_number = updates.tscNumber;
    if (updates.teachingSubjects !== undefined) dbUpdates.teaching_subjects = updates.teachingSubjects;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.assignments !== undefined) dbUpdates.assignments = updates.assignments;
    if (updates.coordinatorCategory !== undefined) dbUpdates.coordinator_category = updates.coordinatorCategory;
    if (updates.assignedRegion !== undefined) dbUpdates.assigned_region = updates.assignedRegion;
    if (updates.assignedCounty !== undefined) dbUpdates.assigned_county = updates.assignedCounty;
    if (updates.assignedSubCounty !== undefined) dbUpdates.assigned_sub_county = updates.assignedSubCounty;
    if (updates.forcePasswordChange !== undefined) dbUpdates.force_password_change = updates.forcePasswordChange;

    const { data: rawData, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .single();
    
    if (error) throw error;
    
    // After updating, we get snake_case data back. We need to convert it to camelCase for our state.
    const data: User = {
        id: rawData.id,
        name: rawData.name,
        email: rawData.email,
        role: rawData.role,
        status: rawData.status,
        forcePasswordChange: rawData.force_password_change,
        idNumber: rawData.id_number,
        tscNumber: rawData.tsc_number,
        school: rawData.school,
        teachingSubjects: rawData.teaching_subjects,
        phoneNumber: rawData.phone_number,
        assignments: rawData.assignments,
        coordinatorCategory: rawData.coordinator_category,
        assignedRegion: rawData.assigned_region,
        assignedCounty: rawData.assigned_county,
        assignedSubCounty: rawData.assigned_sub_county,
    };

    setUsers(prev => prev.map(u => u.id === userId ? data : u));
    if (currentUser?.id === userId) {
        setCurrentUser(data);
    }
 }, [currentUser]);

 const changePassword = useCallback(async (userId: string, oldPassword?: string, newPassword?: string): Promise<void> => {
    if (!newPassword) {
      throw new Error("A new password must be provided.");
    }

    // Step 1: Update the user's password in Supabase Auth.
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
        if (updateError.message.includes("same as the old")) {
            throw new Error("The new password must be different from the default password.");
        }
        throw updateError;
    }
    
    // Step 2: Atomically update the profile and get the new data back.
    // This combines the update and re-fetch, eliminating race conditions.
    const { data: updatedProfileData, error: profileError } = await supabase
        .from('profiles')
        .update({ force_password_change: false })
        .eq('id', userId)
        .select()
        .single();
    
    if (profileError) {
        console.error("Failed to update force_password_change flag:", profileError);
        // If the update fails, we can't be sure of the user's state. It's safer to log them out.
        await logout();
        throw new Error("Could not finalize password change. Please log in again.");
    }
    
    // Step 3: Map the snake_case data from Supabase to our camelCase User type.
    const refreshedProfile: User = {
        id: updatedProfileData.id,
        name: updatedProfileData.name,
        email: updatedProfileData.email,
        role: updatedProfileData.role,
        status: updatedProfileData.status,
        forcePasswordChange: updatedProfileData.force_password_change, // This will be false
        idNumber: updatedProfileData.id_number,
        tscNumber: updatedProfileData.tsc_number,
        school: updatedProfileData.school,
        teachingSubjects: updatedProfileData.teaching_subjects,
        phoneNumber: updatedProfileData.phone_number,
        assignments: updatedProfileData.assignments,
        coordinatorCategory: updatedProfileData.coordinator_category,
        assignedRegion: updatedProfileData.assigned_region,
        assignedCounty: updatedProfileData.assigned_county,
        assignedSubCounty: updatedProfileData.assigned_sub_county,
    };

    // Step 4: Authoritatively update the application state with the fresh data.
    setCurrentUser(refreshedProfile);
    setUsers(prev => prev.map(u => u.id === userId ? refreshedProfile : u));
 }, [logout]);

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, signup, updateUser, addUser, removeUser, addBulkUsers, changePassword, fetchAllUsers }}>
      {loading && !forceShowApp ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading KSEF Platform...</p>
            <p className="mt-2 text-sm text-gray-400">Checking authentication status...</p>
            
            <div className="mt-8">
              <button
                onClick={() => {
                  console.log('User manually bypassed loading');
                  setLoading(false);
                  setForceShowApp(true);
                }}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Continue Without Login
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
              Taking too long? Check your internet connection.
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};