import React, { useEffect, useState } from "react";
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

// 1) Validimi
const formSchema = z.object({
  recipients: z.string().min(1, "Të paktën një marrës është i nevojshëm"),
  subject: z.string().min(1, "Subjekti duhet të ketë të paktën 5 karaktere"),
  message: z.string().min(1, "Mesazhi duhet të ketë të paktën 10 karaktere"),
});

type FormValues = z.infer<typeof formSchema>;

// 2) Tipi për listat e emailave
interface EmailList {
  id: string;
  name: string;
  emails: string[];
}

const NotificationForm: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipients: "",
      subject: "",
      message: "",
    },
  });

  const [emailLists, setEmailLists] = useState<EmailList[]>([]);

  // Merr listat e emailave
  useEffect(() => {
    const fetchEmailLists = async () => {
      try {
        const res = await axiosInstance.get("/emailList");
        setEmailLists(res.data);
      } catch (error) {
        console.error("Gabim në marrjen e listave të emailave:", error);
      }
    };
    fetchEmailLists();
  }, []);

  // 3) Submit i formës
  const onSubmit = async (data: FormValues) => {
    try {
      const toArray = data.recipients
        .split(/[\s,]+/)
        .filter(Boolean);

      await axiosInstance.post("/email/send", {
        to: toArray,
        subject: data.subject,
        message: data.message,
      });

      toast({
        title: "Email-i u dërgua me sukses",
        description: `Email-i është dërguar te: ${toArray.join(", ")}`,
      });

      form.reset(); // 🔥 reset pas dërgimit
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
    <div className="w-full bg-white p-6 md:p-8 rounded-lg shadow">

      <h2 className="text-xl font-semibold mb-4">Dërgo Njoftim me Email</h2>

      {/* Dropdown për zgjedhjen e listes së emailave */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Zgjidh një Listë Emailash</label>
        <select
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedList = emailLists.find((list) => list.id === selectedId);
            if (selectedList) {
              form.setValue("recipients", selectedList.emails.join(", "));
            }
          }}
          className="border px-3 py-2 rounded w-full"
          defaultValue=""
        >
          <option value="" disabled>Zgjidh Listën</option>
          {emailLists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name} 
            </option>
          ))}
        </select>
      </div>

      {/* Forma për dërgimin e emailit */}
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
