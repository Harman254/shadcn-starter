import MealPlanDetailPage from '@/components/Details'
import React from 'react'

const Details = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const { id } = params;
  return (
    


      <MealPlanDetailPage id={id} />
  
  )
}

export default Details