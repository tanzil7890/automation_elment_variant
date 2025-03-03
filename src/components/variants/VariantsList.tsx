"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Edit2Icon, TrashIcon, SettingsIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

interface Variant {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  elementId: string;
  conditionsCount?: number;
}

interface VariantsListProps {
  elementId: string;
  id: string;
}

export default function VariantsList({ elementId, id }: VariantsListProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch variants for the element
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/variants?elementId=${elementId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch variants");
        }
        
        const data = await response.json();
        setVariants(data);
      } catch (err) {
        console.error("Error fetching variants:", err);
        setError("Failed to load variants. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load variants",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [elementId, toast]);

  // Handle making a variant the default
  const handleMakeDefault = async (variantId: string) => {
    try {
      const response = await fetch(`/api/variants/${variantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isDefault: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update variant");
      }

      // Update the local state to reflect the change
      setVariants((prevVariants) =>
        prevVariants.map((variant) => ({
          ...variant,
          isDefault: variant.id === variantId,
        }))
      );

      toast({
        title: "Success",
        description: "Default variant updated successfully",
      });
    } catch (err) {
      console.error("Error updating variant:", err);
      toast({
        title: "Error",
        description: "Failed to update default variant",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a variant
  const handleDelete = async (variantId: string) => {
    // First check if it's safe to delete (not the only variant, not default if there are others)
    if (variants.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one variant for an element",
        variant: "destructive",
      });
      return;
    }

    const isDefault = variants.find((v) => v.id === variantId)?.isDefault;
    if (isDefault && variants.length > 1) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the default variant. Make another variant default first.",
        variant: "destructive",
      });
      return;
    }

    if (confirm("Are you sure you want to delete this variant?")) {
      try {
        const response = await fetch(`/api/variants/${variantId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete variant");
        }

        // Remove the deleted variant from state
        setVariants((prevVariants) => 
          prevVariants.filter((variant) => variant.id !== variantId)
        );

        toast({
          title: "Success",
          description: "Variant deleted successfully",
        });
      } catch (err) {
        console.error("Error deleting variant:", err);
        toast({
          title: "Error",
          description: "Failed to delete variant",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <EmptyState
        title="No variants found"
        description="Create your first variant to get started"
        actionLink={`/dashboard/websites/${id}/elements/${elementId}/variants/new`}
        actionLabel="Create Variant"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Conditions</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant.id}>
              <TableCell className="font-medium">{variant.name}</TableCell>
              <TableCell>
                {variant.isDefault ? (
                  <Badge>Default</Badge>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleMakeDefault(variant.id)}
                  >
                    Make Default
                  </Button>
                )}
              </TableCell>
              <TableCell>
                <Link href={`/dashboard/websites/${id}/elements/${elementId}/variants/${variant.id}/conditions`}>
                  <Button variant="ghost" size="sm">
                    {variant.conditionsCount || 0} Conditions
                    <SettingsIcon className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </TableCell>
              <TableCell>{new Date(variant.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right space-x-2">
                <Link href={`/dashboard/websites/${id}/elements/${elementId}/variants/${variant.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(variant.id)}
                  disabled={variant.isDefault && variants.length > 1}
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
} 