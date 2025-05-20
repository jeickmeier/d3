import { ParagraphPlugin } from "@udecode/plate/react";
import { BasicMarksPlugin } from "@udecode/plate-basic-marks/react";
import { HeadingPlugin } from "@udecode/plate-heading/react";
import { IndentPlugin } from "@udecode/plate-indent/react";
import { IndentListPlugin } from "@udecode/plate-indent-list/react";
import { mediaPlugins } from "@/components/editor/core/plugins/media-plugins";
import { tablePlugin } from "@/components/editor/core/plugins/table-plugin";

export const MINI_EDITOR_PLUGINS = [
  ParagraphPlugin,
  BasicMarksPlugin,
  HeadingPlugin.configure({ options: { levels: 3 } }),
  IndentPlugin,
  IndentListPlugin,
  ...mediaPlugins,
  tablePlugin,
] as const;
