// http://ip-api.com/json/{query}

import { getDBSession } from "@/data"
import prisma from "./prisma"

// Define Location type based on the schema used in AI flows
export interface Location {
    country: string;
    city: string;
    currencyCode: string;
    currencySymbol: string;
    localStores?: string[];
}

export const getLocationDataFromIp = async (ipAddress: string) => {

    const response = await fetch(`http://ip-api.com/json/${ipAddress}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch location data')
    }

    const data = await response.json()

    // Map ip-api response to our Location interface
    return {
        country: data.country || 'Unknown',
        city: data.city || 'Unknown',
        currencyCode: data.currency || '$', // ip-api provides currency code directly
        currencySymbol: data.currencySymbol || '$',
        localStores: [] // ip-api doesn't provide this
    } as Location;
}

// Get cached location data from user object
export const getCachedUserLocation = async (userId: string): Promise<Location | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                country: true,
                city: true,
                currencyCode: true,
                currencySymbol: true
            }
        });

        if (user && user.country && user.city && user.currencyCode && user.currencySymbol) {
            return {
                country: user.country,
                city: user.city,
                currencyCode: user.currencyCode,
                currencySymbol: user.currencySymbol,
                localStores: [] // Not stored in user object, will be empty
            };
        }
        
        return null;
    } catch (error) {
        console.error("Error fetching cached user location:", error);
        return null;
    }
}

// Update user location in database
export const updateUserLocation = async (userId: string, location: Location): Promise<void> => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                country: location.country,
                city: location.city,
                currencyCode: location.currencyCode,
                currencySymbol: location.currencySymbol
            }
        });
        console.log(`Updated location for user ${userId}: ${location.city}, ${location.country}`);
    } catch (error) {
        console.error("Error updating user location:", error);
        throw error;
    }
}

// Get location data with caching - checks user object first, then fetches from IP
export const getLocationDataWithCaching = async (userId: string, sessionId: string): Promise<Location> => {
    // First, try to get cached location from user object
    const cachedLocation = await getCachedUserLocation(userId);
    
    if (cachedLocation) {
        console.log(`Using cached location for user ${userId}: ${cachedLocation.city}, ${cachedLocation.country}`);
        return cachedLocation;
    }
    
    // If no cached location, fetch from IP and cache it
    console.log(`No cached location found for user ${userId}, fetching from IP...`);
    const userIpAddress = await getUserIpAddress(sessionId);
    if (!userIpAddress) {
        throw new Error("User IP address not found");
    }
    
    const locationData = await getLocationDataFromIp(userIpAddress);
    
    // Cache the location data in user object
    await updateUserLocation(userId, locationData);
    
    console.log(`Cached new location for user ${userId}: ${locationData.city}, ${locationData.country}`);
    return locationData;
}

// Helper to fetch location data from coordinates using Positionstack
// export async function fetchLocationDataFromCoordinates(
//     latitude: string,
//     longitude: string
// ): Promise<Location | null> {
//     const positionStackApiKey = process.env.POSITIONSTACK_API_KEY;
//     if (!positionStackApiKey) {
//         console.warn("POSITIONSTACK_API_KEY is not set. Cannot fetch location data from coordinates.");
//         return null;
//     }

//     // Using http for Positionstack free tier. For production, consider HTTPS with paid plan.
//     const url = `http://api.positionstack.com/v1/reverse?access_key=${positionStackApiKey}&query=${latitude},${longitude}&output=json&limit=1`;

//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             console.error(`Positionstack API error: ${response.status} ${response.statusText}`);
//             return null;
//         }
//         const data = await response.json();

//         if (data.data && data.data.length > 0) {
//             const location = data.data[0];
//             const countryName = location.country;
//             const cityName = location.locality || location.region || location.name; // Prioritize locality, then region, then name

//             let currencyCode = "$";
//             let currencySymbol = "$";

//             // Attempt to find currency from positionstack's country_module (if available) or a local map (from generate-grocery-list)
//             if (location.country_module && location.country_module.currencies && location.country_module.currencies.length > 0) {
//                 currencyCode = location.country_module.currencies[0].code || currencyCode;
//                 currencySymbol = location.country_module.currencies[0].symbol || currencySymbol;
//             }
            
//             // Note: Positionstack free tier might not provide currency details reliably. 
//             // You might need a more robust currency mapping here or a paid plan.
//             // For now, we'll rely on the API's response or simple defaults.

//             return {
//                 country: countryName,
//                 city: cityName,
//                 currencyCode,
//                 currencySymbol,
//                 localStores: [] // Positionstack doesn't provide this directly
//             };
//         }
//     } catch (error) {
//         console.error("Error fetching location data from Positionstack:", error);
//     }
//     return null;
// }

// export const getUserIpAddressById = async (userId: string) => {
    

    


//     }


    export const getUserIpAddress = async (sessionId: string): Promise<string> => {
        const session = await prisma.session.findUnique({
          where: {
            id: sessionId,
          },
        });
        if (!session || !session.ipAddress) {
          throw new Error("Session not found or IP address not available");
        }

        console.log(`User IP Address for session ${sessionId}: ${session.ipAddress}`);
      
        
        return session.ipAddress;
      };
      