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
        currencyCode: data.currency.code || '$', // ip-api provides currency code directly
        currencySymbol: data.currency.symbol || '$',
        localStores: [] // This will be populated by the AI flow
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
    
    // Cache the location data in user object (excluding localStores which will be populated in AI flow)
    await updateUserLocation(userId, { ...locationData, localStores: [] }); // Exclude localStores from DB cache
    
    console.log(`Cached new location for user ${userId}: ${locationData.city}, ${locationData.country}`);
    return locationData;
}

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
      