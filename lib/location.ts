
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


export const getUserIpAddress = async (userId: string) => {
        const user = await prisma.session.findUnique({
            where: {
                id: userId
            },
            
        }

      )
        if (!user) {
            throw new Error('User not found')
        }
        return user.ipAddress
        
    }