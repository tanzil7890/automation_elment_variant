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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Form validation schema
const variantFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
  isDefault: z.boolean().default(false),
});

type VariantFormValues = z.infer<typeof variantFormSchema>;

interface VariantFormProps {
  variant?: {
    id: string;
    name: string;
    content: string;
    isDefault: boolean;
  };
  elementId: string;
  websiteId: string;
  isDefault?: boolean; // Used for creating the first variant
}

export default function VariantForm({
  variant,
  elementId,
  websiteId,
  isDefault = false,
}: VariantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!variant;

  // Initialize form with default values or existing variant data
  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      name: variant?.name || "",
      content: variant?.content || "",
      isDefault: variant?.isDefault || isDefault,
    },
  });

  const onSubmit = async (data: VariantFormValues) => {
    setIsSubmitting(true);
    try {
      const endpoint = isEditing
        ? `/api/variants/${variant.id}`
        : "/api/variants";
      
      const method = isEditing ? "PUT" : "POST";
      
      // Add elementId to the data for new variants
      const payload = isEditing
        ? data
        : { ...data, elementId };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save variant");
      }

      toast({
        title: "Success",
        description: isEditing
          ? "Variant updated successfully"
          : "Variant created successfully",
      });

      // Redirect to variants list
      router.push(`/dashboard/websites/${websiteId}/elements/${elementId}/variants`);
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error("Error saving variant:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save variant",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a name for this variant"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive name to identify this variant
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter HTML, CSS, or JavaScript content"
                      className="min-h-[200px] font-mono"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The HTML content or JavaScript code for this variant
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting || (variant?.isDefault && isEditing)}
                      aria-label="Make default variant"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Make this the default variant
                    </FormLabel>
                    <FormDescription>
                      The default variant will be shown when no targeting conditions match
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size={16} className="mr-2" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <>{isEditing ? "Update Variant" : "Create Variant"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 