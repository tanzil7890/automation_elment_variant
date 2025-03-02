import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Edit2Icon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";

// Define types for conditions
interface Condition {
  id: string;
  conditionType: string;
  operator: string;
  value: string;
  priority: number;
  variantId: string;
  createdAt: string;
  updatedAt: string;
}

interface ConditionsListProps {
  variantId: string;
  elementId: string;
  websiteId: string;
}

export default function ConditionsList({
  variantId,
  elementId,
  websiteId,
}: ConditionsListProps) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Format condition type for display
  const formatConditionType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format operator for display
  const formatOperator = (op: string) => {
    const operatorMap: { [key: string]: string } = {
      equals: "Equals",
      not_equals: "Not Equals",
      contains: "Contains",
      not_contains: "Not Contains",
      starts_with: "Starts With",
      ends_with: "Ends With",
      regex: "Matches Regex",
      greater_than: "Greater Than",
      less_than: "Less Than",
      exists: "Exists",
      not_exists: "Does Not Exist",
    };
    return operatorMap[op] || op;
  };

  // Fetch conditions for the variant
  useEffect(() => {
    const fetchConditions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/conditions?variantId=${variantId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch conditions");
        }
        
        const data = await response.json();
        setConditions(data);
      } catch (err) {
        console.error("Error fetching conditions:", err);
        setError("Failed to load conditions. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load conditions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConditions();
  }, [variantId, toast]);

  // Handle deleting a condition
  const handleDelete = async (conditionId: string) => {
    if (confirm("Are you sure you want to delete this condition?")) {
      try {
        const response = await fetch(`/api/conditions/${conditionId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete condition");
        }

        // Remove the deleted condition from state
        setConditions((prevConditions) => 
          prevConditions.filter((condition) => condition.id !== conditionId)
        );

        toast({
          title: "Success",
          description: "Condition deleted successfully",
        });
      } catch (err) {
        console.error("Error deleting condition:", err);
        toast({
          title: "Error",
          description: "Failed to delete condition",
          variant: "destructive",
        });
      }
    }
  };

  // Handle changing condition priority
  const handleChangePriority = async (conditionId: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = conditions.findIndex((c) => c.id === conditionId);
      if (currentIndex === -1) return;
      
      const currentCondition = conditions[currentIndex];
      let newPriority;
      
      if (direction === 'up') {
        if (currentIndex === 0) return; // Already at the top
        const prevCondition = conditions[currentIndex - 1];
        newPriority = prevCondition.priority - 1;
      } else {
        if (currentIndex === conditions.length - 1) return; // Already at the bottom
        const nextCondition = conditions[currentIndex + 1];
        newPriority = nextCondition.priority + 1;
      }
      
      const response = await fetch(`/api/conditions/${conditionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentCondition,
          priority: newPriority,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update condition priority");
      }

      // Re-fetch conditions to get updated priorities
      const refreshResponse = await fetch(`/api/conditions?variantId=${variantId}`);
      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh conditions");
      }
      
      const refreshedData = await refreshResponse.json();
      setConditions(refreshedData);

      toast({
        title: "Success",
        description: "Condition priority updated",
      });
    } catch (err) {
      console.error("Error updating condition priority:", err);
      toast({
        title: "Error",
        description: "Failed to update condition priority",
        variant: "destructive",
      });
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

  if (conditions.length === 0) {
    return (
      <EmptyState
        title="No conditions found"
        description="Add conditions to control when this variant should be displayed"
        actionLink={`/dashboard/websites/${websiteId}/elements/${elementId}/variants/${variantId}/conditions/new`}
        actionLabel="Add Condition"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Operator</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conditions.map((condition) => (
            <TableRow key={condition.id}>
              <TableCell>
                <Badge variant="outline">
                  {formatConditionType(condition.conditionType)}
                </Badge>
              </TableCell>
              <TableCell>{formatOperator(condition.operator)}</TableCell>
              <TableCell className="font-mono text-sm truncate max-w-xs">
                {condition.value}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span>{condition.priority}</span>
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleChangePriority(condition.id, 'up')}
                      disabled={conditions.indexOf(condition) === 0}
                      className="h-6 w-6"
                    >
                      <ArrowUpIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleChangePriority(condition.id, 'down')}
                      disabled={conditions.indexOf(condition) === conditions.length - 1}
                      className="h-6 w-6"
                    >
                      <ArrowDownIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Link href={`/dashboard/websites/${websiteId}/elements/${elementId}/variants/${variantId}/conditions/${condition.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(condition.id)}
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