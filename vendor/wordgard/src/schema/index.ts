//- This module provides editing support extensions and convenient
//- bundle functions for most of the schema elements defined in
//- [wordgard/types](#types).

//- ### Block Structure

//- Extension bundle functions and individual extensions related to
//- block-level document structure.

export {paragraph, heading, alignment, direction, blockquote, horizontalRule} from "./block.ts"
export {bulletList, orderedList} from "./list.ts"
export {codeBlock, codeBlockLanguage} from "./code.ts"
export {blockDoc, inlineDoc} from "./block.ts"

//- ### Inline Structure

//- Extensions related to inline content.

export {lineBreak} from "./bundle.ts"
export {strong, emphasis, code, underline, strikethrough, superscript, subscript} from "./mark.ts"
export {color, backgroundColor, ColorPicker} from "./color.ts"
export {link} from "./link.ts"

//- ### Images

//- Support for images and a dialog to create or modify them.

export {image, figure, imageResizing} from "./image.ts"

//- ### Bundles

//- Helper functions that bundle the extensions provided by this
//- module into groups, so that they can easily be included in a
//- configuration.

export {basicMarks, inlineMarks, basicSchema, inlineSchema, fullSchema} from "./bundle.ts"
