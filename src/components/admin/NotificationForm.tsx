import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axiosInstance from "@/utils/axiosInstance";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 1) Skema e validimit (Zod)
const formSchema = z.object({
  recipients: z.string().min(1, "Të paktën një marrës është i nevojshëm"),
  subject: z.string().min(5, "Subjekti duhet të ketë të paktën 5 karaktere"),
  message: z.string().min(10, "Mesazhi duhet të ketë të paktën 10 karaktere"),
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

  // 3) Kur dërgohet formulari → POST në /email/send
  const onSubmit = async (data: FormValues) => {
    try {
      // Ndaj adresat e email-it nga string në array
      const toArray = data.recipients
        .split(/[\s,]+/)
        .filter(Boolean);

      // POST për dërgimin e email-it
      await axiosInstance.post("/email/send", {
        to: toArray,
        subject: data.subject,
        message: data.message,
      });

      toast({
        title: "Email-i u dërgua me sukses",
        description: `Email-i është dërguar te: ${toArray.join(", ")}`,
      });

      form.reset();
    } catch (error) {
      console.error("Gabim në dërgimin e email-it:", error);
      toast({
        title: "Gabim",
        description: "Dërgimi i email-it dështoi. Kontrollo konsolën.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Dërgo Njoftim me Email</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Marrësit */}
          <FormField
            control={form.control}
            name="recipients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marrësit</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Shkruaj adresat e email-it të ndara me presje ose hapësirë"
                    className="h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subjekti */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subjekti</FormLabel>
                <FormControl>
                  <Input placeholder="Anulimi i ligjëratës" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mesazhi */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mesazhi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Shkruani përmbajtjen e mesazhit këtu..."
                    className="h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Butoni për dërgim */}
          <Button type="submit" className="w-full md:w-auto">
            Dërgo Email
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NotificationForm;
