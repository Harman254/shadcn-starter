"use client";

import { useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUserProfile } from '@/actions/updateUserProfile';

export function ProfileForm({ user }: { user: any }) {
  const [state, formAction] = useFormState(updateUserProfile, { success: false });

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={user.name} />
      </div>
      <Button type="submit">Update Profile</Button>
      {state?.success && <p className="text-green-600">Profile updated!</p>}
    </form>
  );
} 