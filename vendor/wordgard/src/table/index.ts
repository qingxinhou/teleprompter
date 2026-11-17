//- Table editing support. Defines a custom {@link CellSelection cell
//- selection} type, a number of commands, and some support extensions
//- to make table editing work.

//- ### Support

//- Miscellaneous extensions needed for working with tables.

export {tables} from "./table.ts"
export {tableMenu} from "./menu.ts"

//- ### Cell Selection

//- Custom handling of cross-cell selections makes it possible to
//- select rows, columns, or rectangles in a table.

export {CellSelection} from "./cellselection.ts"

//- ### Commands

//- Table editing commands.

export {addColumn, addRow, deleteColumn, deleteRow, toggleHeaderCell, mergeCells, splitCell} from "./tablecommands.ts"

export {handleTablePaste} from "./tablepaste.ts"
