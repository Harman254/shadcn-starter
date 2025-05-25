
// http://ip-api.com/json/{query}

import { getDBSession } from "@/data"
import prisma from "./prisma"


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
    return data
}


export const getUserIpAddressById = async (userId: string) => {
    

    


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
      