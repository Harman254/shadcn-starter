// 'use client';

// import { useState, useMemo } from "react";
// import {
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Utensils,
// } from "lucide-react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Meal, MealType } from "@/types";

// const mealTypeColors: Record<MealType, string> = {
//   breakfast: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-800 dark:text-amber-200 dark:border-amber-600",
//   lunch: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-800 dark:text-emerald-200 dark:border-emerald-600",
//   dinner: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-800 dark:text-indigo-200 dark:border-indigo-600",
//   snack: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-800 dark:text-sky-200 dark:border-sky-600",
// };

// const mealTypeIcons: Record<MealType, React.ReactNode> = {
//   breakfast: <span className="mr-1">🍳</span>,
//   lunch: <span className="mr-1">🥗</span>,
//   dinner: <span className="mr-1">🍽️</span>,
//   snack: <span className="mr-1">🍎</span>,
// };

// type MealPlansProps = {
//   mealPlans: Meal[];
// };

// const MealPlans = ({ mealPlans }: MealPlansProps) => {
//   const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [view, setView] = useState("daily");

//   const mealsByDate = useMemo(() => {
//     const result: Record<string, Meal[]> = {};
//     for (const meal of mealPlans) {
//       const dateKey = new Date(meal.dayMeal.date).toISOString().split("T")[0];
//       if (!result[dateKey]) result[dateKey] = [];
//       result[dateKey].push(meal);
//     }
//     return result;
//   }, [mealPlans]);

//   const formatDate = (date: Date | string) =>
//     new Date(date).toLocaleDateString("en-US", {
//       weekday: "long",
//       month: "long",
//       day: "numeric",
//     });

//   const currentDateStr = currentDate.toISOString().split("T")[0];
//   const currentDayMeals = mealsByDate[currentDateStr] || [];

//   const sortedMeals = [...currentDayMeals].sort((a, b) => {
//     const order = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
//     return order[a.type as MealType] - order[b.type as MealType];
//   });

//   const MealCard = ({ meal }: { meal: Meal }) => (
//     <Card
//       className="p-5 mb-4 cursor-pointer border border-gray-200 dark:border-zinc-700 rounded-xl group transition-all bg-white dark:bg-zinc-900 hover:shadow-md dark:hover:shadow-lg"
//       onClick={() => setSelectedMeal(meal)}
//     >
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <div className="flex flex-wrap items-center gap-2 mb-2">
//             <Badge
//               variant="outline"
//               className={`${mealTypeColors[meal.type]} px-3 py-1 rounded-full text-xs font-medium flex items-center`}
//             >
//               {mealTypeIcons[meal.type]}
//               {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
//             </Badge>
//             <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
//               <Clock className="w-3.5 h-3.5 mr-1" />
//               {meal.calories} cal
//             </span>
//           </div>
//           <h3 className="font-semibold text-lg mb-1 group-hover:text-indigo-600 transition-colors dark:text-indigo-100">
//             {meal.name}
//           </h3>
//           <p className="text-gray-600 text-sm line-clamp-2 dark:text-gray-300">
//             {meal.description}
//           </p>
//         </div>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-800 rounded-full h-8 w-8"
//         >
//           <Utensils className="h-4 w-4" />
//         </Button>
//       </div>
//     </Card>
//   );

//   const navigateDay = (direction: "prev" | "next") => {
//     const newDate = new Date(currentDate);
//     newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
//     setCurrentDate(newDate);
//   };

//   return (
//     <div className="container mx-auto  text-foreground min-h-screen transition-colors">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
//         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
//           <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
//           <span className="bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
//             Your Meal Plans
//           </span>
//         </h1>
//         <Select value={view} onValueChange={setView}>
//           <SelectTrigger className="w-[160px] sm:w-[180px] border-none m-5 dark:bg-zinc-800 dark:text-white">
//             <SelectValue placeholder="Select view" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="daily">Daily View</SelectItem>
//             <SelectItem value="weekly">Weekly View</SelectItem>
//             <SelectItem value="monthly">Monthly View</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       <Card className="mb-6 overflow-hidden border-none rounded-md sm:rounded-lg">
//         <div className="p-4 flex items-center justify-between sticky top-0 z-10 bg-white dark:bg-zinc-900">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => navigateDay("prev")}
//             className="rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
//           >
//             <ChevronLeft className="h-5 w-5" />
//           </Button>
//           <h2 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-slate-300">
//             {formatDate(currentDate)}
//           </h2>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => navigateDay("next")}
//             className="rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
//           >
//             <ChevronRight className="h-5 w-5" />
//           </Button>
//         </div>

//         <ScrollArea className="h-[calc(100vh-280px)] sm:h-[calc(100vh-260px)] p-4">
//           {sortedMeals.length > 0 ? (
//             sortedMeals.map((meal) => <MealCard key={meal.id} meal={meal} />)
//           ) : (
//             <div className="text-center text-gray-500 dark:text-gray-400 py-12 px-4">
//               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
//                 <Utensils className="h-8 w-8 text-gray-400 dark:text-gray-500" />
//               </div>
//               <h3 className="font-medium text-lg mb-1">No meals planned</h3>
//               <p className="text-sm">No meals are scheduled for this day</p>
//             </div>
//           )}
//         </ScrollArea>
//       </Card>

//       <Dialog open={!!selectedMeal} onOpenChange={(open) => !open && setSelectedMeal(null)}>
//         <DialogContent className="max-w-md sm:max-w-lg bg-gradient-to-br from-white to-slate-100 dark:from-zinc-900 dark:to-slate-800 rounded-xl overflow-hidden transition-colors">
//           {selectedMeal && (
//             <>
//               <div className={`p-6 ${mealTypeColors[selectedMeal.type].split(" ")[0]} bg-opacity-50`}>
//                 <DialogHeader className="pb-2">
//                   <div className="flex justify-between items-start">
//                     <DialogTitle className="text-xl sm:text-2xl font-bold dark:text-white">
//                       {selectedMeal.name}
//                     </DialogTitle>
//                     <Badge
//                       variant="outline"
//                       className={`${mealTypeColors[selectedMeal.type]} px-3 py-1 rounded-full text-xs font-medium flex items-center self-start`}
//                     >
//                       {mealTypeIcons[selectedMeal.type]}
//                       {selectedMeal.type.charAt(0).toUpperCase() + selectedMeal.type.slice(1)}
//                     </Badge>
//                   </div>
//                   <DialogDescription className="text-base text-gray-700 dark:text-gray-300 mt-1">
//                     {formatDate(currentDate)} • {selectedMeal.calories} calories
//                   </DialogDescription>
//                 </DialogHeader>
//               </div>

//               <div className="p-6 dark:bg-zinc-900">
//                 <div className="space-y-6">
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h4>
//                     <p className="text-gray-700 dark:text-gray-200">{selectedMeal.description}</p>
//                   </div>
//                   <div className="pt-2">
//                     <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Nutrition Information</h4>
//                     <div className="grid grid-cols-3 gap-4 text-center">
//                       <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
//                         <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedMeal.calories}</p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Calories</p>
//                       </div>
//                       <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
//                         <p className="text-2xl font-bold text-gray-900 dark:text-white">25g</p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
//                       </div>
//                       <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
//                         <p className="text-2xl font-bold text-gray-900 dark:text-white">12g</p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Fat</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-zinc-800 border-t dark:border-zinc-700">
//                 <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
//                   View Full Recipe
//                 </Button>
//               </DialogFooter>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default MealPlans;
