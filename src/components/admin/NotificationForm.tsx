
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  courseCode: z.string().min(2, { message: "Course code is required" }),
  notificationType: z.string().min(1, { message: "Notification type is required" }),
  studyYear: z.string().min(1, { message: "Study year is required" }),
  recipients: z.string().min(1, { message: "At least one recipient is required" }),
  subject: z.string().min(5, { message: "Subject should be at least 5 characters" }),
  message: z.string().min(10, { message: "Message should be at least 10 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const NotificationForm: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseCode: '',
      notificationType: '',
      studyYear: '',
      recipients: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    // In a real app, this would send the notification via API
    console.log('Notification data:', data);
    
    toast({
      title: "Notification Sent",
      description: "Your notification has been sent successfully.",
    });

    form.reset();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="courseCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CS101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notificationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="cancellation">Class Cancellation</SelectItem>
                        <SelectItem value="reschedule">Class Reschedule</SelectItem>
                        <SelectItem value="reminder">Assignment Reminder</SelectItem>
                        <SelectItem value="announcement">General Announcement</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="studyYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Year</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select study year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="year1">Year 1</SelectItem>
                        <SelectItem value="year2">Year 2</SelectItem>
                        <SelectItem value="year3">Year 3</SelectItem>
                        <SelectItem value="year4">Year 4</SelectItem>
                        <SelectItem value="all">All Years</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lecture Cancellation - January 15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="recipients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipients</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Paste email addresses here (separated by commas, spaces, or new lines)" 
                    className="h-24"
                    {...field} 
                  />
                </FormControl>
                <p className="text-sm text-gray-500 mt-1">
                  Supports multiple formats: CSV, Excel column paste, or comma-separated
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter the notification message..." 
                    className="h-32"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full md:w-auto">
            Send Notification
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NotificationForm;
