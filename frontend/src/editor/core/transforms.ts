"use client";

import type { PlateEditor } from "@udecode/plate/react";

import {
  type NodeEntry,
  type Path,
  type TElement,
  PathApi,
} from "@udecode/plate";
import { insertCallout } from "@udecode/plate-callout";
import { CalloutPlugin } from "@udecode/plate-callout/react";
import { insertCodeBlock } from "@udecode/plate-code-block";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { insertDate } from "@udecode/plate-date";
import { DatePlugin } from "@udecode/plate-date/react";
import { insertToc } from "@udecode/plate-heading";
import { TocPlugin } from "@udecode/plate-heading/react";
import { INDENT_LIST_KEYS, ListStyleType } from "@udecode/plate-indent-list";
import { IndentListPlugin } from "@udecode/plate-indent-list/react";
import { insertColumnGroup, toggleColumnGroup } from "@udecode/plate-layout";
import { ColumnItemPlugin, ColumnPlugin } from "@udecode/plate-layout/react";
import { LinkPlugin, triggerFloatingLink } from "@udecode/plate-link/react";
import { insertEquation, insertInlineEquation } from "@udecode/plate-math";
import {
  EquationPlugin,
  InlineEquationPlugin,
} from "@udecode/plate-math/react";
import {
  insertAudioPlaceholder,
  insertFilePlaceholder,
  insertMedia,
  insertVideoPlaceholder,
} from "@udecode/plate-media";
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from "@udecode/plate-media/react";
import { SuggestionPlugin } from "@udecode/plate-suggestion/react";
import {
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@udecode/plate-table/react";

/**
 * Array of Plate plugin keys that are considered structural, meaning they
 * define the layout or structure of the content rather than formatting.
 * Used to identify elements that should not be easily replaced by other block types.
 */
export const STRUCTURAL_TYPES: string[] = [
  ColumnPlugin.key,
  ColumnItemPlugin.key,
  TablePlugin.key,
  TableRowPlugin.key,
  TableCellPlugin.key,
];

const ACTION_THREE_COLUMNS = "action_three_columns";

/**
 * Inserts a list node (e.g., bulleted, numbered, todo) into the editor.
 * @param editor The Plate editor instance.
 * @param type The specific list style type (e.g., 'decimal', 'disc', 'todo').
 */
const insertList = (editor: PlateEditor, type: string) => {
  editor.tf.insertNodes(
    editor.api.create.block({
      indent: 1,
      listStyleType: type,
    }),
    { select: true },
  );
};

const insertBlockMap: Record<
  string,
  (editor: PlateEditor, type: string) => void
> = {
  [INDENT_LIST_KEYS.todo]: insertList,
  [ListStyleType.Decimal]: insertList,
  [ListStyleType.Disc]: insertList,
  [ACTION_THREE_COLUMNS]: (editor) =>
    insertColumnGroup(editor, { columns: 3, select: true }),
  [AudioPlugin.key]: (editor) =>
    insertAudioPlaceholder(editor, { select: true }),
  [CalloutPlugin.key]: (editor) => insertCallout(editor, { select: true }),
  [CodeBlockPlugin.key]: (editor) => insertCodeBlock(editor, { select: true }),
  [EquationPlugin.key]: (editor) => insertEquation(editor, { select: true }),
  [FilePlugin.key]: (editor) => insertFilePlaceholder(editor, { select: true }),
  [ImagePlugin.key]: (editor) =>
    insertMedia(editor, {
      select: true,
      type: ImagePlugin.key,
    }),
  [MediaEmbedPlugin.key]: (editor) =>
    insertMedia(editor, {
      select: true,
      type: MediaEmbedPlugin.key,
    }),
  [TablePlugin.key]: (editor) =>
    editor.getTransforms(TablePlugin).insert.table({}, { select: true }),
  [TocPlugin.key]: (editor) => insertToc(editor, { select: true }),
  [VideoPlugin.key]: (editor) =>
    insertVideoPlaceholder(editor, { select: true }),
};

const insertInlineMap: Record<
  string,
  (editor: PlateEditor, type: string) => void
> = {
  [DatePlugin.key]: (editor) => insertDate(editor, { select: true }),
  [InlineEquationPlugin.key]: (editor) =>
    insertInlineEquation(editor, "", { select: true }),
  [LinkPlugin.key]: (editor) => triggerFloatingLink(editor, { focused: true }),
};

/**
 * Inserts a block element of a given type into the editor.
 * It uses a map (`insertBlockMap`) for custom insertion logic for specific block types,
 * otherwise, it inserts a generic block. It also handles removing the previous empty block
 * if the new block type is different.
 * @param editor The Plate editor instance.
 * @param type The type of the block element to insert.
 */
export const insertBlock = (editor: PlateEditor, type: string) => {
  editor.tf.withoutNormalizing(() => {
    const block = editor.api.block();

    if (!block) return;
    if (type in insertBlockMap) {
      insertBlockMap[type](editor, type);
    } else {
      editor.tf.insertNodes(editor.api.create.block({ type }), {
        at: PathApi.next(block[1]),
        select: true,
      });
    }
    if (getBlockType(block[0]) !== type) {
      editor.getApi(SuggestionPlugin).suggestion.withoutSuggestions(() => {
        editor.tf.removeNodes({ previousEmptyBlock: true });
      });
    }
  });
};

/**
 * Inserts an inline element of a given type into the editor.
 * It uses a map (`insertInlineMap`) for custom insertion logic for specific inline types.
 * @param editor The Plate editor instance.
 * @param type The type of the inline element to insert.
 */
export const insertInlineElement = (editor: PlateEditor, type: string) => {
  if (insertInlineMap[type]) {
    insertInlineMap[type](editor, type);
  }
};

const setList = (
  editor: PlateEditor,
  type: string,
  entry: NodeEntry<TElement>,
) => {
  editor.tf.setNodes(
    editor.api.create.block({
      indent: 1,
      listStyleType: type,
    }),
    {
      at: entry[1],
    },
  );
};

const setBlockMap: Record<
  string,
  (editor: PlateEditor, type: string, entry: NodeEntry<TElement>) => void
> = {
  [INDENT_LIST_KEYS.todo]: setList,
  [ListStyleType.Decimal]: setList,
  [ListStyleType.Disc]: setList,
  [ACTION_THREE_COLUMNS]: (editor) => toggleColumnGroup(editor, { columns: 3 }),
};

/**
 * Sets the type of the block element at the current selection or a specified path.
 * It handles unsetting list-related properties if the new type is not a list.
 * It uses a map (`setBlockMap`) for custom transformation logic for specific block types.
 * @param editor The Plate editor instance.
 * @param type The new type for the block element.
 * @param at Optional path to the block element to modify. Defaults to the current selection.
 */
export const setBlockType = (
  editor: PlateEditor,
  type: string,
  { at }: { at?: Path } = {},
) => {
  editor.tf.withoutNormalizing(() => {
    const setEntry = (entry: NodeEntry<TElement>) => {
      const [node, path] = entry;

      if (node[IndentListPlugin.key]) {
        editor.tf.unsetNodes([IndentListPlugin.key, "indent"], { at: path });
      }
      if (type in setBlockMap) {
        return setBlockMap[type](editor, type, entry);
      }
      if (node.type !== type) {
        editor.tf.setNodes({ type }, { at: path });
      }
    };

    if (at) {
      const entry = editor.api.node<TElement>(at);

      if (entry) {
        setEntry(entry);

        return;
      }
    }

    const entries = editor.api.blocks({ mode: "lowest" });

    entries.forEach((entry) => setEntry(entry));
  });
};

/**
 * Gets the effective block type of a given TElement.
 * This is particularly useful for list items, as it correctly identifies
 * the list style type (decimal, todo, disc) instead of just a generic 'list-item' type.
 * For other elements, it returns the element's `type` property.
 * @param block The TElement to get the type from.
 * @returns The effective block type as a string.
 */
export const getBlockType = (block: TElement) => {
  if (block[IndentListPlugin.key]) {
    if (block[IndentListPlugin.key] === ListStyleType.Decimal) {
      return ListStyleType.Decimal;
    } else if (block[IndentListPlugin.key] === INDENT_LIST_KEYS.todo) {
      return INDENT_LIST_KEYS.todo;
    } else {
      return ListStyleType.Disc;
    }
  }

  return block.type;
};
