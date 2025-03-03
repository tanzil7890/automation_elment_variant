"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Form validation schema
const elementFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  selector: z.string().min(1, { message: "CSS selector is required" }),
});

type ElementFormValues = z.infer<typeof elementFormSchema>;

interface ElementFormProps {
  websiteId: string;
  id?: string;
  element?: {
    id: string;
    name: string;
    selector: string;
  };
}

export default function ElementForm({
  websiteId,
  id = "new",
  element,
}: ElementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ElementFormValues>({
    resolver: zodResolver(elementFormSchema),
    defaultValues: {
      name: element?.name || "",
      selector: element?.selector || "",
    },
  });

  const onSubmit = async (data: ElementFormValues) => {
    setIsSubmitting(true);

    try {
      const url = id === "new" 
        ? "/api/elements" 
        : `/api/elements/${id}`;
      
      const method = id === "new" ? "POST" : "PUT";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          websiteId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save element");
      }

      toast({
        title: "Success",
        description: `Element ${id === "new" ? "created" : "updated"} successfully`,
      });

      router.push(`/dashboard/websites/${websiteId}`);
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save element. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Element Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Header Content" 
                      {...field} 
                      className="text-black"
                    />
                  </FormControl>
                  <FormDescription>
                    Give your element a descriptive name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CSS Selector</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="#header-content" 
                      {...field} 
                      className="font-mono text-black"
                    />
                  </FormControl>
                  <FormDescription>
                    CSS selector to target this element (e.g., #header, .intro-text)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner size={20} /> : id === "new" ? "Create Element" : "Update Element"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 