import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Authenticate user
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'User not authenticated' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const {
            name,
            description,
            prepTime,
            cookTime,
            servings,
            difficulty,
            ingredients,
            instructions,
            tags,
            nutrition,
            imageUrl
        } = body;

        if (!name || !ingredients || !instructions) {
            return NextResponse.json(
                { success: false, error: 'Missing required recipe data' },
                { status: 400 }
            );
        }

        // Save recipe to database
        const savedRecipe = await prisma.recipe.create({
            data: {
                userId: session.user.id,
                name,
                description: description || '',
                prepTime: prepTime || '',
                cookTime: cookTime || '',
                servings: servings || 1,
                difficulty: difficulty || 'Medium',
                ingredients: ingredients as any,
                instructions: instructions as any,
                tags: tags || [],
                calories: nutrition?.calories || 0,
                protein: nutrition?.protein || 0,
                carbs: nutrition?.carbs || 0,
                fat: nutrition?.fat || 0,
                imageUrl: imageUrl || '',
            }
        });

        return NextResponse.json({
            success: true,
            recipe: savedRecipe,
            message: 'Recipe saved successfully'
        });

    } catch (error) {
        console.error('[POST /api/recipes/save] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to save recipe'
            },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'User not authenticated' },
                { status: 401 }
            );
        }

        // Fetch user's saved recipes
        const recipes = await prisma.recipe.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({
            success: true,
            recipes
        });

    } catch (error) {
        console.error('[GET /api/recipes/save] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch recipes'
            },
            { status: 500 }
        );
    }
}
