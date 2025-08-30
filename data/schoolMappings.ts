
// This file introduces the "Zone" level to the administrative hierarchy.
// It maps schools to their respective zones, sub-counties, counties, and regions.
// In a real application, this data would likely come from a database.

interface SchoolMapping {
    school: string;
    zone: string;
    subCounty: string;
    county: string;
    region: string;
}

export const SCHOOL_MAPPINGS: SchoolMapping[] = [
    // Coast
    { school: 'Mombasa High', zone: 'Mvita Zone', subCounty: 'Mvita', county: 'Mombasa', region: 'Coast' },
    { school: 'Kisauni Secondary School', zone: 'Kisauni North Zone', subCounty: 'Kisauni', county: 'Mombasa', region: 'Coast' },
    { school: 'Frere Town Secondary', zone: 'Kisauni North Zone', subCounty: 'Kisauni', county: 'Mombasa', region: 'Coast' },
    { school: 'Watamu Secondary', zone: 'Malindi East Zone', subCounty: 'Malindi', county: 'Kilifi', region: 'Coast' },

    // Central
    { school: 'Alliance High School', zone: 'Kikuyu Central Zone', subCounty: 'Kikuyu', county: 'Kiambu', region: 'Central' },

    // Nyanza
    { school: 'Maseno School', zone: 'Kisumu West Central', subCounty: 'Kisumu West', county: 'Kisumu', region: 'Nyanza' },

    // Rift Valley
    { school: 'Kapsabet High School', zone: 'Emgwen Central Zone', subCounty: 'Emgwen', county: 'Nandi', region: 'Rift Valley' },

    // Nairobi
    { school: 'Pangani Girls High School', zone: 'Starehe Central Zone', subCounty: 'Starehe', county: 'Nairobi City', region: 'Nairobi' },
    { school: 'Kenya High School', zone: 'Langata South Zone', subCounty: 'Langata', county: 'Nairobi City', region: 'Nairobi' },
];

// Helper function to get a mapping for a school
export const getSchoolMapping = (schoolName: string): SchoolMapping | undefined => {
    return SCHOOL_MAPPINGS.find(m => m.school === schoolName);
};
