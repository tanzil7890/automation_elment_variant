"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Define valid condition types and operators
const conditionTypes = [
  { value: "url", label: "URL" },
  { value: "path", label: "Path" },
  { value: "referrer", label: "Referrer" },
  { value: "device", label: "Device" },
  { value: "browser", label: "Browser" },
  { value: "os", label: "Operating System" },
  { value: "screenSize", label: "Screen Size" },
  { value: "time", label: "Time" },
  { value: "day", label: "Day of Week" },
  { value: "date", label: "Date" },
  { value: "cookies", label: "Cookies" },
  { value: "queryParam", label: "Query Parameter" },
  { value: "userRole", label: "User Role" },
  { value: "loginStatus", label: "Login Status" },
  { value: "language", label: "Language" },
  { value: "geolocation", label: "Geolocation" },
  { value: "custom", label: "Custom" },
];

const operators = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not Contains" },
  { value: "starts_with", label: "Starts With" },
  { value: "ends_with", label: "Ends With" },
  { value: "regex", label: "Matches Regex" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "exists", label: "Exists" },
  { value: "not_exists", label: "Does Not Exist" },
];

// Form validation schema
const conditionFormSchema = z.object({
  conditionType: z.string().min(1, "Condition type is required"),
  operator: z.string().min(1, "Operator is required"),
  value: z.string().min(1, "Value is required"),
  priority: z.number().int().default(0),
});

type ConditionFormValues = z.infer<typeof conditionFormSchema>;

interface ConditionFormProps {
  elementId: string;
  variantId: string;
  id: string;
  condition?: {
    id: string;
    name: string;
    type: string;
    operator: string;
    value: string;
  };
}

export default function ConditionForm({ elementId, variantId, id, condition }: ConditionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!condition;

  // Initialize form with default values or existing condition data
  const form = useForm<ConditionFormValues>({
    resolver: zodResolver(conditionFormSchema),
    defaultValues: {
      conditionType: condition?.conditionType || "",
      operator: condition?.operator || "",
      value: condition?.value || "",
      priority: condition?.priority || 0,
    },
  });

  // Helper to get the label for a condition type
  const getConditionTypeLabel = (value: string) => {
    return conditionTypes.find((type) => type.value === value)?.label || value;
  };

  // Helper to get the label for an operator
  const getOperatorLabel = (value: string) => {
    return operators.find((op) => op.value === value)?.label || value;
  };

  // Get field description based on selected condition type
  const getFieldDescription = (conditionType: string) => {
    const descriptions: Record<string, string> = {
      url: "Match against the full URL (e.g., https://example.com/path)",
      path: "Match against the URL path (e.g., /products/123)",
      referrer: "Match against the referring URL",
      device: "Match device type (e.g., mobile, tablet, desktop)",
      browser: "Match browser name (e.g., chrome, firefox, safari)",
      os: "Match operating system (e.g., windows, macos, ios, android)",
      screenSize: "Match screen width in pixels (e.g., 768)",
      time: "Match time of day in 24h format (e.g., 14:30)",
      day: "Match day of week (0-6, where 0 is Sunday)",
      date: "Match date in YYYY-MM-DD format",
      cookies: "Match cookie value (e.g., cookieName=value)",
      queryParam: "Match URL query parameter (e.g., param=value)",
      userRole: "Match user role or permission level",
      loginStatus: "Match login status (e.g., logged_in, logged_out)",
      language: "Match browser language (e.g., en, es, fr)",
      geolocation: "Match country code (e.g., US, CA, UK)",
      custom: "Custom condition with JavaScript evaluation",
    };
    
    return descriptions[conditionType] || "Enter a value to match against";
  };

  // Get operator options based on condition type
  const getOperatorOptions = (conditionType: string) => {
    // Some condition types have limited operator options
    switch (conditionType) {
      case "device":
      case "browser":
      case "os":
      case "day":
      case "loginStatus":
      case "language":
      case "geolocation":
        return operators.filter(op => 
          ["equals", "not_equals"].includes(op.value)
        );
      case "screenSize":
      case "time":
      case "date":
        return operators.filter(op => 
          ["equals", "not_equals", "greater_than", "less_than"].includes(op.value)
        );
      case "cookies":
      case "queryParam":
        return operators.filter(op => 
          ["equals", "not_equals", "contains", "exists", "not_exists"].includes(op.value)
        );
      default:
        return operators;
    }
  };

  // Watch condition type to update operator options
  const watchConditionType = form.watch("conditionType");
  const filteredOperators = getOperatorOptions(watchConditionType);

  // Get value placeholder based on condition type and operator
  const getValuePlaceholder = () => {
    const type = form.getValues("conditionType");
    const op = form.getValues("operator");
    
    // For exists/not_exists operators, value can be empty
    if (op === "exists" || op === "not_exists") {
      return "Leave empty or enter cookie/parameter name";
    }
    
    const placeholders: Record<string, string> = {
      url: "https://example.com/page",
      path: "/products/category",
      referrer: "https://google.com",
      device: "mobile, tablet, desktop",
      browser: "chrome, firefox, safari",
      os: "windows, macos, ios, android",
      screenSize: "768",
      time: "14:30",
      day: "0 (Sunday), 1 (Monday), etc.",
      date: "2023-12-31",
      cookies: "cookieName=value",
      queryParam: "paramName=value",
      userRole: "admin, user, editor",
      loginStatus: "logged_in, logged_out",
      language: "en, es, fr",
      geolocation: "US, CA, UK",
      custom: "document.querySelector('body').classList.contains('dark-mode')",
    };
    
    return placeholders[type] || "Enter value to match";
  };

  const onSubmit = async (data: ConditionFormValues) => {
    setIsSubmitting(true);
    try {
      const endpoint = isEditing
        ? `/api/conditions/${condition.id}`
        : "/api/conditions";
      
      const method = isEditing ? "PUT" : "POST";
      
      // Add variantId to the data for new conditions
      const payload = isEditing
        ? data
        : { ...data, variantId };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save condition");
      }

      toast({
        title: "Success",
        description: isEditing
          ? "Condition updated successfully"
          : "Condition created successfully",
      });

      // Redirect to conditions list
      router.push(`/dashboard/websites/${id}/elements/${elementId}/variants/${variantId}/conditions`);
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error("Error saving condition:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save condition",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset operator when condition type changes if current operator is invalid
  useEffect(() => {
    const currentOperator = form.getValues("operator");
    if (currentOperator && !filteredOperators.some(op => op.value === currentOperator)) {
      form.setValue("operator", "");
    }
  }, [watchConditionType, form, filteredOperators]);

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="conditionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {conditionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of condition to check
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operator</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting || !watchConditionType}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredOperators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How to compare the value
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={getValuePlaceholder()}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    {watchConditionType ? getFieldDescription(watchConditionType) : "Enter a value to match against"}
                  </FormDescription>
                  <FormMessage />
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
                  <>{isEditing ? "Update Condition" : "Create Condition"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 