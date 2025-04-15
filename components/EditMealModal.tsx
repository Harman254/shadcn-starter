
'use client'
import React, { useState, useEffect } from "react";
import { Meal } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/lable";
import { Textarea } from "@/components/ui/textarea";

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
  onSave: (updatedMeal: Meal) => void;
}

const EditMealModal: React.FC<EditMealModalProps> = ({ isOpen, onClose, meal, onSave }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState(0);

  useEffect(() => {
    if (meal) {
      setName(meal.name);
      setDescription(meal.description);
      setCalories(meal.calories);
    }
  }, [meal]);

  const handleSave = () => {
    if (!meal) return;

    const updatedMeal: Meal = {
      ...meal,
      name,
      description,
      calories,
    };

    onSave(updatedMeal);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Meal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meal name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meal description"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              placeholder="Calories"
              min={0}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMealModal;