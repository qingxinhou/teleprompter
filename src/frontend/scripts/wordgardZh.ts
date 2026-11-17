import { colorNames, imagePhrases, phrases, tablePhrases } from "wordgard/phrases";
import type { GardState } from "wordgard/state";

/**
 * Chinese for the strings Wordgard draws itself — the block-style dropdown,
 * every toolbar button's tooltip and aria-label, the colour picker's names,
 * the image dialog and the table menu.
 *
 * No fork of the library is involved. Wordgard keeps its interface text in
 * four `PhraseSet`s (`wordgard/phrases`), each a tag-to-English table, and
 * `translatePartial` installs an override in editor state that every `get` /
 * `ref` reads through — so a phrase translated here is translated wherever
 * the library put it, including the `title` attributes on the bar buttons and
 * the labels that are only computed when a menu opens.
 *
 * `translatePartial` rather than `translate`: the latter demands every tag in
 * the set, including ones no page here reaches, and it would turn any tag a
 * future version adds into a build error instead of a phrase that simply
 * stays English.
 *
 * Tags this version does not define are absent from the types — Wordgard
 * 0.5.x has no `heading_4`/`heading_5`/`heading_6` phrase, because it only
 * ships buttons for the first three levels; the extra levels this project
 * adds label themselves (see `deepHeadingButtons` in editor.ts).
 */

/** Core interface: bar tooltips, block styles, dialogs. */
export const wordgardPhrases = phrases.translatePartial({
  dialog_close: "关闭",
  overflow_more: "更多",
  block_style: "段落样式",
  toggle_strong: "加粗",
  toggle_em: "斜体",
  toggle_code: "代码字体",
  toggle_underline: "下划线",
  toggle_strikethrough: "删除线",
  toggle_super: "上标",
  toggle_sub: "下标",
  link_target: "链接地址",
  create_link: "插入链接",
  text_color: "文字颜色",
  background_color: "背景色",
  undo: "撤销",
  redo: "重做",
  paragraph: "正文",
  code_block: "代码块",
  heading_1: "标题 1",
  heading_2: "标题 2",
  heading_3: "标题 3",
  toggle_bullet_list: "无序列表",
  toggle_ordered_list: "有序列表",
  toggle_quote: "引用块",
  alignment: "对齐",
  align_start: "靠版心起始端对齐",
  align_end: "靠版心末尾对齐",
  align_center: "居中",
  text_dir: "文字方向",
  text_dir_ltr: "从左到右",
  text_dir_rtl: "从右到左",
  text_dir_auto: "自动判断方向",
});

/** Colour picker swatches, used by the text and background colour buttons. */
export const wordgardColors = colorNames.translatePartial({
  none: "无",
  black: "黑色",
  white: "白色",
  grey: "灰色",
  red_berry: "红莓色",
  red: "红色",
  orange: "橙色",
  yellow: "黄色",
  green: "绿色",
  cyan: "青色",
  cornflower: "矢车菊蓝",
  blue: "蓝色",
  purple: "紫色",
  magenta: "品红",
  dark: "深",
  darker: "更深",
  darkest: "最深",
  light: "浅",
  lighter: "更浅",
  lightest: "最浅",
});

/** Image dialog. Reachable from a pasted or dragged image rather than a button. */
export const wordgardImages = imagePhrases.translatePartial({
  insert_image: "插入图片",
  update_image: "更新图片",
  update: "更新",
  insert: "插入",
  cancel: "取消",
  inline: "嵌入行内",
  figure: "图注框",
  figure_center: "居中",
  figure_end: "靠末尾",
  captioned: "带图注",
  image_style: "图片样式",
  uploading: "上传中…",
  upload_failed: "图片上传失败",
  width: "宽度（像素）",
  upload_image: "上传图片",
  image_source: "图片地址",
  alt_text: "替代文本",
  describe_image: "描述这张图片",
  auto: "自动",
});

/** Table menu. `$1` and `$2` are the row and column counts. */
export const wordgardTables = tablePhrases.translatePartial({
  dimensions_title: "表格尺寸 $1 行 × $2 列，可用方向键调整",
  dimensions_live: "$1 行 × $2 列",
  insert_table: "插入表格",
  modify_table: "修改表格",
  toggle_header: "切换表头单元格",
  add_row_above: "在上方插入行",
  add_row_below: "在下方插入行",
  delete_row: "删除行",
  add_col_before: "在左侧插入列",
  add_col_after: "在右侧插入列",
  delete_col: "删除列",
  merge_cells: "合并单元格",
  split_cell: "拆分单元格",
});

/** Every set at once, for spreading into an editor configuration. */
export const wordgardZh: GardState.Extension[] = [
  wordgardPhrases,
  wordgardColors,
  wordgardImages,
  wordgardTables,
];
