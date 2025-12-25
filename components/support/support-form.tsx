'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProFeatures } from '@/hooks/use-pro-features';
import { Loader2, Send, MessageSquare, Crown, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SupportForm() {
  const { isPro, hasFeature } = useProFeatures();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const hasPriority = hasFeature('priority-support');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast({
        title: 'Required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          message,
          category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit support request');
      }

      toast({
        title: 'Support request submitted!',
        description: data.message || 'We\'ll get back to you soon.',
      });

      // Reset form
      setSubject('');
      setMessage('');
      setCategory('general');
      setIsSubmitted(true);

      // Reset submitted state after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error: any) {
      toast({
        title: 'Submission failed',
        description: error.message || 'Failed to submit support request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Support
          </CardTitle>
          {hasPriority && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
              <Crown className="h-3 w-3" />
              Priority
            </span>
          )}
        </div>
        <CardDescription>
          {hasPriority ? (
            <div className="flex items-center gap-2 mt-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600 font-medium">Priority support - 24 hour response time</span>
            </div>
          ) : (
            'We typically respond within 48-72 hours. Upgrade to Pro for priority support (24 hours).'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-4">
              <Send className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              {hasPriority
                ? 'We\'ll respond within 24 hours.'
                : 'We\'ll respond within 48-72 hours.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing Question</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject *</label>
              <Input
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message *</label>
              <Textarea
                placeholder="Please provide details about your issue or question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                rows={6}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !subject.trim() || !message.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

