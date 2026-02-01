import { useState } from "react";
import { CheckSquare, Square, Trash2, Tag, Move, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useCategories } from "./CategoryManager";
import { cn } from "@/lib/utils";

interface BatchEditModeProps {
  items: Array<{ id: string; mal_id: number; media_type: string; title: string }>;
  isActive: boolean;
  onToggle: () => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

const statusOptions = [
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "dropped", label: "Dropped" },
];

export function BatchEditMode({
  items,
  isActive,
  onToggle,
  selectedIds,
  onSelectionChange,
}: BatchEditModeProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleSelect = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  };

  const selectAll = () => {
    onSelectionChange(new Set(items.map((i) => i.id)));
  };

  const clearSelection = () => {
    onSelectionChange(new Set());
  };

  const handleBatchDelete = async () => {
    if (!user || selectedIds.size === 0) return;
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .in("id", Array.from(selectedIds));

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: `Removed ${selectedIds.size} items` });
      clearSelection();
      onToggle();
    } catch (error) {
      toast({ title: "Failed to remove items", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchStatus = async (status: string) => {
    if (!user || selectedIds.size === 0) return;
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from("watchlist")
        .update({ status })
        .in("id", Array.from(selectedIds));

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: `Updated ${selectedIds.size} items to "${status}"` });
      clearSelection();
    } catch (error) {
      toast({ title: "Failed to update items", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchCategory = async (category: string) => {
    if (!user || selectedIds.size === 0) return;
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from("watchlist")
        .update({ category: category || null })
        .in("id", Array.from(selectedIds));

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: `Moved ${selectedIds.size} items to "${category || 'No Category'}"` });
      clearSelection();
    } catch (error) {
      toast({ title: "Failed to move items", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isActive) {
    return (
      <Button variant="outline" size="sm" onClick={onToggle} className="gap-2 rounded-full">
        <CheckSquare className="w-4 h-4" />
        Select
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
      {/* Selection Info */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedIds.size} selected
        </span>
        <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs">
          Select All
        </Button>
        <Button variant="ghost" size="sm" onClick={clearSelection} className="h-7 text-xs">
          Clear
        </Button>
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Batch Actions */}
      <Select onValueChange={handleBatchStatus} disabled={selectedIds.size === 0 || isProcessing}>
        <SelectTrigger className="w-32 h-8 text-xs rounded-full">
          <Move className="w-3 h-3 mr-1" />
          <SelectValue placeholder="Set Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {categories.length > 0 && (
        <Select onValueChange={handleBatchCategory} disabled={selectedIds.size === 0 || isProcessing}>
          <SelectTrigger className="w-32 h-8 text-xs rounded-full">
            <Tag className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Set Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Category</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        variant="destructive"
        size="sm"
        onClick={handleBatchDelete}
        disabled={selectedIds.size === 0 || isProcessing}
        className="gap-1 h-8 text-xs rounded-full"
      >
        <Trash2 className="w-3 h-3" />
        Delete
      </Button>

      <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 ml-auto">
        <X className="w-4 h-4" />
        Cancel
      </Button>
    </div>
  );
}

// Checkbox component for individual items
export function BatchSelectCheckbox({
  id,
  isSelected,
  onToggle,
  isActive,
}: {
  id: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
  isActive: boolean;
}) {
  if (!isActive) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(id);
      }}
      className={cn(
        "absolute top-2 left-2 z-10 p-1 rounded-lg transition-colors",
        isSelected ? "bg-primary text-primary-foreground" : "bg-background/80 hover:bg-background"
      )}
    >
      {isSelected ? (
        <CheckSquare className="w-5 h-5" />
      ) : (
        <Square className="w-5 h-5" />
      )}
    </button>
  );
}
