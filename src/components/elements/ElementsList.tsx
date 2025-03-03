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
import { Edit2Icon, TrashIcon, LayersIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

interface Element {
  id: string;
  name: string;
  selector: string;
  websiteId: string;
  createdAt: string;
  updatedAt: string;
  variantsCount?: number;
}

interface ElementsListProps {
  websiteId: string;
}

export default function ElementsList({ websiteId }: ElementsListProps) {
  const [elements, setElements] = useState<Element[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchElements();
  }, [websiteId]);

  const fetchElements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/elements?websiteId=${websiteId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch elements');
      }
      
      const data = await response.json();
      setElements(data);
    } catch (error) {
      console.error('Error fetching elements:', error);
      setError('Failed to load elements. Please try again.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load elements. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (elementId: string) => {
    if (!confirm('Are you sure you want to delete this element? This will also delete all associated variants and conditions.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/elements/${elementId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete element');
      }
      
      setElements(elements.filter(element => element.id !== elementId));
      toast({
        title: "Success",
        description: "Element deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting element:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the element. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (elements.length === 0) {
    return (
      <EmptyState
        title="No Elements Found"
        description="You haven't created any elements yet. Elements are HTML elements on your website that you want to personalize."
        actionLink={`/dashboard/websites/${websiteId}/elements/new`}
        actionLabel="Create Element"
      />
    );
  }

  return (
    <Card className="shadow-sm">
      <div className="p-4 sm:p-6 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold text-black">Elements</h2>
        <Link href={`/dashboard/websites/${websiteId}/elements/new`}>
          <Button>Add Element</Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Selector</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {elements.map((element) => (
              <TableRow key={element.id}>
                <TableCell className="font-medium text-black">
                  {element.name}
                </TableCell>
                <TableCell className="font-mono text-sm text-black">
                  {element.selector}
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/websites/${websiteId}/elements/${element.id}/variants`}>
                    <Button variant="ghost" size="sm">
                      {element.variantsCount || 0} Variants
                      <LayersIcon className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/dashboard/websites/${websiteId}/elements/${element.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(element.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
} 