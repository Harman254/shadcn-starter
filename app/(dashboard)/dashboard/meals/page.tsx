import MealPlans from '@/components/meal-plans'
import { getMealsByUserId } from '@/data'
import { Meal, MealType } from '@/types'
import { auth, currentUser } from '@clerk/nextjs/server'
import React from 'react'






const Meals = async () => {
    const { userId} = await auth()

    const meals = (await getMealsByUserId(userId as string)).map((meal) => ({
        ...meal,
        type: meal.type as MealType,
      }))
  return (
    <>
    
    <MealPlans mealPlans={meals}/>
    
    
    </>
      
  )
}

export default Meals
