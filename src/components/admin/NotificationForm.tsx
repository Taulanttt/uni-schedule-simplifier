import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axiosInstance from "@/utils/axiosInstance";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 1) Define Zod schema
// We keep it simple: recipients, subject, message
const formSchema = z.object({
  recipients: z.string().min(1, "At least one recipient is required"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const NotificationForm: React.FC = () => {
  const { toast } = useToast();

  // 2) React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipients: "",
      subject: "",
      message: "",
    },
  });

  // 3) On Submit → post to /email/send
  const onSubmit = async (data: FormValues) => {
    try {
      // Convert 'recipients' string into an array
      // e.g. "abc@example.com, def@example.com" => ["abc@example.com","def@example.com"]
      const toArray = data.recipients
        .split(/[\s,]+/) // split by spaces or commas
        .filter(Boolean);

      // POST with axiosInstance
      await axiosInstance.post("/email/send", {
        to: toArray,
        subject: data.subject,
        message: data.message,
      });

      toast({
        title: "Email Sent",
        description: `Your email has been sent to: ${toArray.join(", ")}`,
      });

      form.reset();
    } catch (error) {
      console.error("Email send error:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Check console.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Send Email Notification</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Recipients */}
          <FormField
            control={form.control}
            name="recipients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipients</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste or type email addresses (comma or space separated)"
                    className="h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subject */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Class Cancellation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Message */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Type your email body here..."
                    className="h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Send Button */}
          <Button type="submit" className="w-full md:w-auto">
            Send Email
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NotificationForm;
