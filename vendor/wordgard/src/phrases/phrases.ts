import {PhraseSet} from "./phraseset.ts"

/// The phrase set for the core package and basic menu items.
export const phrases = PhraseSet.define({
  dialog_close: "关闭",

  // Menu labels
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
})

/// Phrases used by the {@link schema.image.button image dialog}.
export const imagePhrases = PhraseSet.define({
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
  auto: "自动"
})

/// Phrases (mostly color names) used by the {@link schema.ColorPicker
/// color picker}.
export const colorNames = PhraseSet.define({
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
})

/// Phrases used by [wordgard/table](#table).
export const tablePhrases = PhraseSet.define({
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
  split_cell: "拆分单元格"
})
