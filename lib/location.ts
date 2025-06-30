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

export const getLocationDataFromIp = async (ipAddress: string): Promise<Location> => {
    try {
        const response = await fetch(`https://ip-api.com/json/${ipAddress}?fields=status,message,country,city,currency`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch location data from ip-api for IP: ${ipAddress}. Status: ${response.status}`);
            return {
                country: 'United States', city: 'San Francisco', currencyCode: 'USD', currencySymbol: '$', localStores: []
            };
        }

        const data = await response.json();

        if (data.status === 'fail') {
            console.error(`ip-api returned failure for IP ${ipAddress}: ${data.message}`);
            return {
                country: 'United States', city: 'San Francisco', currencyCode: 'USD', currencySymbol: '$', localStores: []
            };
        }

        // The free API may not return currency symbol. We'll use a map for common ones.
        const currencyMap: { [key: string]: string } = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': '$', 'AUD': '$'
        };
        
        const currencyCode = data.currency || 'USD';
        const currencySymbol = currencyMap[currencyCode] || '$';

        return {
            country: data.country || 'United States',
            city: data.city || 'San Francisco',
            currencyCode: currencyCode,
            currencySymbol: currencySymbol,
            localStores: []
        };
    } catch (error) {
        console.error(`Exception in getLocationDataFromIp for IP ${ipAddress}:`, error);
        return {
            country: 'United States',
            city: 'San Francisco',
            currencyCode: 'USD',
            currencySymbol: '$',
            localStores: []
        };
    }
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
    try {
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
            console.warn("Could not find user IP address. Using default location.");
            return { country: 'United States', city: 'San Francisco', currencyCode: 'USD', currencySymbol: '$', localStores: [] };
        }
        
        const locationData = await getLocationDataFromIp(userIpAddress);
        
        // Cache the location data in user object (excluding localStores which will be populated in AI flow)
        await updateUserLocation(userId, { ...locationData, localStores: [] }); // Exclude localStores from DB cache
        
        console.log(`Cached new location for user ${userId}: ${locationData.city}, ${locationData.country}`);
        return locationData;
    } catch (error) {
        console.error("Error in getLocationDataWithCaching, returning default location:", error);
        return {
            country: 'United States',
            city: 'San Francisco',
            currencyCode: 'USD',
            currencySymbol: '$',
            localStores: []
        };
    }
}

export const getUserIpAddress = async (sessionId: string): Promise<string | null> => {
    try {
        const session = await prisma.session.findUnique({
          where: {
            id: sessionId,
          },
        });
        if (!session || !session.ipAddress) {
          console.warn("Session not found or IP address not available for session:", sessionId);
          return null;
        }

        console.log(`User IP Address for session ${sessionId}: ${session.ipAddress}`);
      
        
        return session.ipAddress;
    } catch (error) {
        console.error("Error fetching IP from session:", error);
        return null;
    }
  };
      