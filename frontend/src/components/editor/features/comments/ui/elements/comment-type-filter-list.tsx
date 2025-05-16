import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { COMMENT_TYPES, CommentTypeId } from "@comments/types/comment-types";

interface CommentTypeFilterListProps {
  visibleTypes: CommentTypeId[];
  onChange: (types: CommentTypeId[]) => void;
}

export function CommentTypeFilterList({
  visibleTypes,
  onChange,
}: CommentTypeFilterListProps) {
  return (
    <>
      {COMMENT_TYPES.map((t) => {
        const checked = visibleTypes.includes(t.id);
        return (
          <div key={t.id} className="flex items-center space-x-2 p-1">
            <Checkbox
              checked={checked}
              onCheckedChange={(checkedState) => {
                const isChecked = checkedState === true;
                const newVisible = isChecked
                  ? [...visibleTypes, t.id]
                  : visibleTypes.filter((id) => id !== t.id);
                onChange(newVisible);
              }}
            />
            <span className="text-sm">{t.label}</span>
          </div>
        );
      })}
    </>
  );
}
