'use client';

import { useState } from 'react';
import { TrashIcon, Loader2Icon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { deleteMealPlanById } from '@/data';
import { toast } from 'sonner';

type Props = {
  id: string;
};

const DeleteButton = ({ id }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const formData = new FormData();
    formData.append('id', id);

    setIsDeleting(true);
    try {
      await deleteMealPlanById(formData);
      toast.success('Meal plan deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete meal plan.');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="px-3 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          disabled={isDeleting}
        >
           {isDeleting ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent
      
        onEscapeKeyDown={(e) => isDeleting && e.preventDefault()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <p>This action cannot be undone. It will permanently delete this meal plan.</p>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteButton;
