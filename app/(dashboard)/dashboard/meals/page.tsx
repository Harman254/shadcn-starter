import MealPlans from '@/components/meal-plans'
import { getMealsByUserId } from '@/data'
import { Meal, MealType } from '@/types'
import { auth, currentUser } from '@clerk/nextjs/server'
import React from 'react'






const Meals = async () => {
    const { userId} = await auth()

    const meals: Meal[] = (await getMealsByUserId(userId as string)).map((meal) => ({
        ...meal,
        type: meal.type as MealType,
      }))
  return (
    
    
<div>
<MealPlans mealPlans={meals}/>

</div>    
    
    
      
  )
}

export default Meals
