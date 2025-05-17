import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { COMMENT_TYPES, CommentTypeId } from "@comments/types/comment-types";

/**
 * CommentTypeFilterList
 * ---------------------
 * A small presentational component used within the editor comment feature.
 * It renders a list of check-boxes (one for every available comment type)
 * allowing the user to control which comment types should currently be
 * displayed.
 *
 * Props
 * -----
 * visibleTypes: CommentTypeId[]
 *     A list of comment-type IDs that are currently visible. A checkbox will
 *     appear checked if its corresponding type ID is present in this array.
 * onChange: (types: CommentTypeId[]) => void
 *     Callback fired whenever the user toggles a checkbox.  The callback is
 *     provided with the updated list of visible comment-type IDs so that the
 *     parent component can keep the source of truth.
 */

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
        // Determine if the checkbox should appear checked based on current
        // `visibleTypes` state maintained by the parent component.
        const checked = visibleTypes.includes(t.id);
        return (
          <div key={t.id} className="flex items-center space-x-2 p-1">
            <Checkbox
              checked={checked}
              // Sync the local toggle interaction back to the parent.
              // `checkbox` from Radix UI returns `checkedState` which can be
              // `true`, `false`, or "indeterminate" (null). We treat only the
              // boolean `true` case as the box being checked.
              onCheckedChange={(checkedState) => {
                const isChecked = checkedState === true;

                // When the box is checked we add the comment type to the set
                // of visible types, otherwise we remove it.
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
