// The control page's actual commands: the table, and how each one acts.
//
// Two things about the shape of this file are deliberate.
//
// COMMAND_SPECS is a plain array literal and nothing at module scope touches
// the DOM, so commands_test.ts can import the *real* table and check it for
// conflicts. That check is the only reason "the palette and the keys can't
// disagree" is a fact rather than a hope.
//
// And it does not import teleprompter.ts, not even for a type. That import
// would pull the control page's raw CSS imports into the test's module graph,
// which only the bundler can resolve — the failure deno.jsonc documents as the
// reason `deno test` runs --no-check. CommandHost describes what a command
// needs instead, and Teleprompter satisfies it structurally.

import {
  applyPadBindings,
  type Command,
  type CommandSpec,
  type PaletteMode,
} from "./commands.ts";
import { PAD_BINDINGS, PAD_LABELS } from "./gamepad.ts";
import {
  colourSearchText,
  DEFAULT_COLOUR_ID,
  SCRIPT_COLOURS,
} from "./colours.ts";

/** A slider the commands nudge. Web Awesome's wa-slider satisfies this. */
interface Slider {
  value: number;
  dispatchEvent(event: Event): boolean;
}

interface Clickable {
  click(): void;
}

/**
 * What the commands need from the control page.
 *
 * Every member here is something `Teleprompter` already exposes, with one
 * exception (`toggleAutoScroll`) that is a move of its old Space-bar handler.
 */
export interface CommandHost {
  btnPop: Clickable;
  btnMessage: Clickable;
  btnGoToViewers: Clickable;
  btnSendPosition: Clickable;
  btnMatchScale: Clickable;
  btnSendScale: Clickable;
  btnPushContent: Clickable;
  rngSpeed: Slider;
  rngScale: Slider;
  tpClockControl: {
    btnStart: Clickable;
    btnStop: Clickable;
    btnReset: Clickable;
  };
  docControls: { promptNew(): void };
  /** Colour the selection, by id from colours.ts. See textColour.ts. */
  applyColour(id: string): void;
  /** Apply whatever colour was used last. */
  repeatColour(): void;
  lnkViewerLink: { href: string };
  palette: { open(mode: PaletteMode): void };
  settings: { open(): void };
  closePdf(): void;
  toggleAutoScroll(): void;
  toggleLiveEditing(): void;
  togglePreviewScrub(): void;
  /** Step the editor's own reading size. See nudgeEditorScale. */
  nudgeEditorScale(tenths: number): void;
  resetSliders(): void;
}

/** How far one nudge moves each slider. */
/* Speed steps in the same units the slider counts, which are pixels per second.
 * They came down with the slider's range (see index.html): ten units used to be
 * 2% of a ±500 track and is 10% of a ±100 one, which is far too coarse for a
 * control that is trimmed by ear while somebody is reading. One unit is about
 * 1.25 lines a minute at the default size — a nudge you can hear — and five is
 * the step for covering ground. */
const SPEED_STEP = 1;
const SPEED_STEP_LARGE = 5;
const SCALE_STEP = 5;
// Tenths of a rem, so two is 0.2rem — a smaller step than the viewers' because
// the operator is looking straight at the result and nudges it to taste.
const EDITOR_STEP = 2;

export const COMMAND_SPECS: CommandSpec[] = [
  {
    id: "scroll.toggle",
    label: "开始 / 暂停滚动",
    group: "滚动",
    shortcut: "Space",
    keywords: ["play", "pause", "resume"],
  },
  {
    // Down is faster, up is slower: to scroll forward is to scroll *down* the
    // script, so the arrow points the way the text travels. Note this is the
    // opposite of the slider's own geometry — Forward sits at the bottom, so
    // "faster" also steps the thumb downward. The two agree by coincidence of
    // metaphor, not by construction; the sign lives in the action below.
    id: "speed.up",
    label: "加快滚动",
    group: "滚动",
    shortcut: "Mod+ArrowDown",
    repeatable: true,
  },
  {
    id: "speed.down",
    label: "减慢滚动",
    group: "滚动",
    shortcut: "Mod+ArrowUp",
    repeatable: true,
  },
  {
    id: "speed.up.large",
    label: "加快滚动（大步）",
    group: "滚动",
    shortcut: "Mod+Shift+ArrowDown",
    repeatable: true,
  },
  {
    id: "speed.down.large",
    label: "减慢滚动（大步）",
    group: "滚动",
    shortcut: "Mod+Shift+ArrowUp",
    repeatable: true,
  },
  {
    // Distinct from pausing: this leaves the pacer running at zero, which is
    // what the operator wants when the next cue is a jump rather than a
    // resume.
    id: "speed.zero",
    label: "滚动速度归零",
    group: "滚动",
    shortcut: "Mod+Alt+Digit0",
    keywords: ["stop", "halt", "still"],
  },
  {
    // The operator's pane reads ahead of the viewers on purpose, so these two
    // are how the gap gets closed deliberately in either direction.
    id: "position.get",
    label: "跳到显示器位置",
    group: "滚动",
    shortcut: "Mod+Alt+KeyG",
    keywords: ["jump", "catch up", "where", "sync"],
  },
  {
    id: "position.send",
    label: "把我的位置发给显示器",
    group: "滚动",
    shortcut: "Mod+Alt+KeyJ",
    keywords: ["jump", "cue", "skip", "sync"],
  },
  {
    id: "scale.up",
    label: "放大显示器字号",
    group: "文字",
    shortcut: "Mod+Alt+Equal",
    keywords: ["zoom", "larger", "scale"],
    repeatable: true,
  },
  {
    id: "scale.down",
    label: "缩小显示器字号",
    group: "文字",
    shortcut: "Mod+Alt+Minus",
    keywords: ["zoom", "scale"],
    repeatable: true,
  },
  {
    // No shortcut on either: they are set-up actions taken once before a
    // service, not things reached for mid-scroll, and the chord set is already
    // long enough to have to be looked up.
    id: "scale.match",
    label: "跟随显示器字号",
    group: "文字",
    keywords: ["sync", "size", "font", "same"],
  },
  {
    id: "scale.send",
    label: "把我的字号发给显示器",
    group: "文字",
    keywords: ["sync", "size", "font", "push"],
  },
  {
    // The operator's own pane, not the viewers': same group because "Text" is
    // where an operator looks for a size, and the labels say whose text it is.
    id: "editor.up",
    label: "放大编辑区字号",
    group: "文字",
    // Mod+Alt+Equal/Minus are the viewers' size; the brackets are free.
    // Physical key names, as anything carrying Alt must be.
    shortcut: "Mod+Alt+BracketRight",
    keywords: ["zoom", "larger", "script", "mine", "editor"],
    repeatable: true,
  },
  {
    id: "editor.down",
    label: "缩小编辑区字号",
    group: "文字",
    shortcut: "Mod+Alt+BracketLeft",
    keywords: ["zoom", "script", "mine", "editor"],
    repeatable: true,
  },
  {
    // Whether the preview is a scrub surface. In "Scroll" because that is what
    // it moves, and it is the operator's answer to "put them on this line".
    id: "preview.scrub",
    label: "预览区滚动全场 开 / 关",
    group: "滚动",
    shortcut: "Mod+Alt+KeyS",
    keywords: ["preview", "scrub", "drag", "wheel", "audience", "displays"],
  },
  {
    // No shortcut: a right-click on a slider is the gesture, and this is how an
    // operator finds out that it exists.
    id: "transport.reset",
    label: "滑块恢复默认值",
    group: "滚动",
    keywords: ["default", "zero", "slider", "speed", "size"],
  },
  {
    // The one binding that earns its keep most: type the message, send it
    // without reaching for the mouse.
    id: "message.send",
    label: "发送消息",
    group: "消息",
    shortcut: "Mod+Enter",
    allowWhileTyping: true,
  },
  {
    id: "message.clear",
    label: "清空消息",
    group: "消息",
    keywords: ["blank", "remove"],
  },
  { id: "clock.start", label: "开始倒计时", group: "时钟" },
  { id: "clock.stop", label: "暂停倒计时", group: "时钟" },
  { id: "clock.reset", label: "重置倒计时", group: "时钟" },
  {
    // Ctrl+Alt+C rather than a bare Alt+C: bare Alt+letter opens the browser's
    // own menus on Windows and Linux and inserts a character on macOS, where
    // Option+Y is ¥ — and these are pressed *with the cursor in the script*,
    // so a chord that fights the editor is worse than no chord. Ctrl+Alt is
    // also the family the rest of this table uses, and what Google Docs picked
    // for its own colour shortcut.
    id: "colour.pick",
    label: "文字颜色…",
    group: "文字",
    shortcut: "Mod+Alt+KeyC",
    keywords: ["color", "palette", "highlight", "red", "yellow", "swatch"],
    // Every colour command is reached mid-sentence from the editor. Suppressed
    // while typing — the default — they would be shortcuts that never fire
    // when they are wanted, the same reasoning the live-editing pair carries.
    allowWhileTyping: true,
  },
  {
    // The one colour shortcut that *is* standard: Notion applies the last used
    // colour with Ctrl+Shift+H, Google Docs highlights with Ctrl+Alt+H. H for
    // the same reason both of them chose it.
    id: "colour.repeat",
    label: "重复上次颜色",
    group: "文字",
    shortcut: "Mod+Alt+KeyH",
    keywords: ["color", "again", "same", "last"],
    allowWhileTyping: true,
  },
  {
    id: "colour.yellow",
    label: "颜色：黄色",
    group: "文字",
    shortcut: "Mod+Alt+KeyY",
    keywords: ["color", "cue", "emphasis"],
    allowWhileTyping: true,
  },
  {
    id: "colour.red",
    label: "颜色：红色",
    group: "文字",
    shortcut: "Mod+Alt+KeyR",
    keywords: ["color", "warning"],
    allowWhileTyping: true,
  },
  {
    id: "colour.blue",
    label: "颜色：蓝色",
    group: "文字",
    shortcut: "Mod+Alt+KeyB",
    keywords: ["color", "speaker"],
    allowWhileTyping: true,
  },
  {
    // Not "white": clearing the mark lets the run inherit --viewer-color, so
    // it follows a user theme. See colours.ts.
    id: "colour.none",
    label: "颜色：默认",
    group: "文字",
    shortcut: "Mod+Alt+KeyN",
    keywords: ["color", "clear", "none", "remove", "plain"],
    allowWhileTyping: true,
  },
  { id: "document.new", label: "新建稿件", group: "稿件" },
  { id: "pdf.close", label: "关闭 PDF", group: "稿件" },
  {
    // Whether the script travels as it is typed. In "Document" rather than
    // "Text", which is about how big the words are, not which words.
    id: "content.live",
    label: "实时编辑 开 / 关",
    group: "稿件",
    shortcut: "Mod+Alt+KeyL",
    keywords: ["hold", "freeze", "draft", "audience", "displays"],
    // Both of these are reached *from* the editor, with the cursor in the
    // script — "hold this while I fix it" and "right, show them" are things
    // an operator says mid-sentence. Suppressed while typing, as the default
    // is, they would be shortcuts that never fire when they are wanted; the
    // same reason message.send carries this.
    allowWhileTyping: true,
  },
  {
    id: "content.push",
    label: "把稿件发给显示器",
    group: "稿件",
    shortcut: "Mod+Alt+KeyU",
    keywords: ["update", "go live", "push", "audience", "displays"],
    allowWhileTyping: true,
  },
  {
    id: "viewer.pop",
    label: "打开 / 关闭本机显示",
    group: "显示器",
    shortcut: "Mod+Alt+KeyP",
    keywords: ["popup", "screen", "display", "close", "fullscreen"],
  },
  {
    id: "viewer.copyLink",
    label: "复制显示器链接",
    group: "显示器",
    keywords: ["share", "url"],
  },
  {
    // Reachable from the palette as well as the app bar, because an operator
    // whose scroll direction is backwards is already reaching for the keyboard.
    id: "settings.open",
    label: "设置",
    group: "帮助",
    keywords: ["preferences", "options", "scroll", "wheel", "invert"],
  },
  {
    id: "palette.open",
    label: "命令面板",
    group: "帮助",
    shortcut: "Mod+K",
    allowWhileTyping: true,
  },
  {
    id: "help.shortcuts",
    label: "键盘快捷键",
    group: "帮助",
    shortcut: "Mod+/",
    keywords: ["cheatsheet", "keys", "help"],
    allowWhileTyping: true,
  },
];

/**
 * What the document commands need. `DocControls` satisfies it.
 *
 * Structural again, so a test can hand these providers a plain object and
 * check what they produce without a DOM or a localStorage.
 */
export interface DocumentHost {
  storage: {
    list(): [string, { name: string }][];
    getCurrentID(): string;
  };
  load(id: string): void;
}

/** What the layout commands need. `ThemeControls` satisfies it. */
export interface LayoutHost {
  storage: {
    layouts(): [string, string][];
    getLayout(): string;
  };
  apply(layout: string): void;
}

/**
 * One "open this document" command per stored document.
 *
 * A provider rather than part of COMMAND_SPECS because the list changes as
 * documents come and go, and it is re-read on every palette open so it cannot
 * show a document that has been deleted. None of these carry a shortcut —
 * that is the rule that lets the key bindings be installed exactly once.
 */
export function documentCommands(host: DocumentHost): Command[] {
  const current = host.storage.getCurrentID();
  return host.storage.list().map(([id, doc]): Command => ({
    id: `document.open.${id}`,
    // Prefixed so the whole set is reachable by typing "open", and so a
    // document called "Scroll faster" can't be mistaken for the command.
    label: `打开：${doc.name}`,
    group: "稿件",
    hint: id === current ? "当前" : undefined,
    keywords: ["document", "script"],
    run: () => host.load(id),
  }));
}

/** One "wear this layout" command per layout, built-in and user-authored. */
export function layoutCommands(host: LayoutHost): Command[] {
  const current = host.storage.getLayout();
  return host.storage.layouts().map(([layout, name]): Command => ({
    id: `layout.apply.${layout}`,
    label: `布局：${name}`,
    group: "布局",
    hint: layout === current ? "当前" : undefined,
    keywords: ["theme", "viewer"],
    run: () => host.apply(layout),
  }));
}

/**
 * Move a slider and tell the page, exactly as dragging it would.
 *
 * The "input" event is what listenRangeSpeed/listenRangeScale already listen
 * for, so a command and a drag end up in the same handler and cannot diverge.
 * Clamping is left to the component, which is also what listenSpeedWheel does.
 */
function nudge(slider: Slider, delta: number) {
  slider.value += delta;
  slider.dispatchEvent(new Event("input"));
}

/**
 * Bind the table to the control page.
 *
 * Commands act by pressing the controls the operator would have clicked. That
 * is not laziness: it means a command and a click are the same code path. The
 * clock is the case that proves it — clock.ts's click handler both dispatches
 * the event teleprompter.ts listens for *and* drives the local countdown, and
 * that event doesn't bubble, so a synthetic one would do half the job.
 */
export function buildCommands(host: CommandHost): Command[] {
  const actions: Record<string, () => void | Promise<void>> = {
    "scroll.toggle": () => host.toggleAutoScroll(),
    // A *negative* step is faster. Wire speed is `-rngSpeed.value`, which is
    // what puts Forward at the bottom of the vertical slider so the thumb
    // travels the way the text does (the same metaphor as listenSpeedWheel's
    // `value += -e.deltaY`). These commands are named for the speed the
    // operator wants, not the direction the thumb moves — so speed.up steps
    // the value *down*. The two used to disagree, and "Scroll faster" scrolled
    // backwards; commands_test.ts guards the sign.
    "speed.up": () => nudge(host.rngSpeed, -SPEED_STEP),
    "speed.down": () => nudge(host.rngSpeed, SPEED_STEP),
    "speed.up.large": () => nudge(host.rngSpeed, -SPEED_STEP_LARGE),
    "speed.down.large": () => nudge(host.rngSpeed, SPEED_STEP_LARGE),
    "speed.zero": () => {
      host.rngSpeed.value = 0;
      host.rngSpeed.dispatchEvent(new Event("input"));
    },
    "position.get": () => host.btnGoToViewers.click(),
    "position.send": () => host.btnSendPosition.click(),
    "scale.up": () => nudge(host.rngScale, SCALE_STEP),
    "scale.down": () => nudge(host.rngScale, -SCALE_STEP),
    // No sign inversion on this one, unlike speed.*: bigger text is a bigger
    // number. It goes through the page rather than a slider because the
    // editor's size no longer has one — the control is in the editor's own
    // toolbar, and the page holds the number.
    "editor.up": () => host.nudgeEditorScale(EDITOR_STEP),
    "editor.down": () => host.nudgeEditorScale(-EDITOR_STEP),
    "transport.reset": () => host.resetSliders(),
    "scale.match": () => host.btnMatchScale.click(),
    "scale.send": () => host.btnSendScale.click(),
    "message.send": () => host.btnMessage.click(),
    "message.clear": () => {
      // Queried here rather than held on the host because that is what
      // listenMessage itself does — the input is read fresh every send.
      const input = document.querySelector<HTMLInputElement>("#txtMessage");
      if (input) input.value = "";
      host.btnMessage.click();
    },
    "clock.start": () => host.tpClockControl.btnStart.click(),
    "clock.stop": () => host.tpClockControl.btnStop.click(),
    "clock.reset": () => host.tpClockControl.btnReset.click(),
    // A host method, like scroll.toggle: the switch reports intent and this
    // owns what it means, so the two cannot end up disagreeing about which
    // way "toggle" went.
    "preview.scrub": () => host.togglePreviewScrub(),
    "content.live": () => host.toggleLiveEditing(),
    "content.push": () => host.btnPushContent.click(),
    "document.new": () => host.docControls.promptNew(),
    "pdf.close": () => host.closePdf(),
    "viewer.pop": () => host.btnPop.click(),
    // `navigator.clipboard` is secure-context gated like crypto.randomUUID
    // was, so it is simply absent over plain HTTP to anything but localhost —
    // which is how an operator reaches this from a phone before there is TLS
    // in front of it. Unguarded this threw a TypeError into the palette and
    // the command did nothing with no explanation. The link is on screen to
    // be read either way.
    "viewer.copyLink": () => {
      const url = host.lnkViewerLink.href;
      if (!navigator.clipboard) {
        console.warn(`no clipboard on this origin; the viewer link is ${url}`);
        return;
      }
      navigator.clipboard.writeText(url);
    },
    // Read through the host when the key fires, not now: the palette is
    // constructed *from* this list, so it does not exist yet.
    "colour.pick": () => host.palette.open("colours"),
    "colour.repeat": () => host.repeatColour(),
    "colour.yellow": () => host.applyColour("yellow"),
    "colour.red": () => host.applyColour("red"),
    "colour.blue": () => host.applyColour("blue"),
    "colour.none": () => host.applyColour(DEFAULT_COLOUR_ID),
    "settings.open": () => host.settings.open(),
    "palette.open": () => host.palette.open("all"),
    "help.shortcuts": () => host.palette.open("shortcuts"),
  };

  // The controller buttons are stamped on here rather than written into the
  // table, so the button the palette shows is the button gamepadControls.ts
  // actually dispatches.
  return applyPadBindings(COMMAND_SPECS, PAD_BINDINGS, PAD_LABELS).map(
    (spec) => {
      const run = actions[spec.id];
      if (!run) {
        // Reachable only by adding a spec and forgetting its action, in which
        // case the palette would list a row that does nothing when picked.
        throw new Error(`command ${spec.id} has no action`);
      }
      return { ...spec, run };
    },
  );
}

/**
 * The colour palette as commands, for the picker the `colour.pick` chord opens.
 *
 * Commands rather than a list of its own, so the dialog's fuzzy search, arrow
 * keys, hover and Enter are the ones the command palette already has — the
 * same "one list feeds both" rule the keyboard and the palette follow. The
 * keywords are what make "warn" find red and "clear" find the default.
 *
 * No `shortcut` on these rows even for the four colours that have one: the
 * palette strips shortcuts from provided commands, and a row advertising a
 * chord bound elsewhere in the table would be advertising it twice. The chord
 * is on the `colour.*` spec above, which is where the cheatsheet reads it.
 */
export function colourCommands(host: CommandHost): Command[] {
  return SCRIPT_COLOURS.map((colour) => ({
    id: `colour.pick.${colour.id}`,
    label: colour.name,
    group: "文字" as const,
    keywords: colourSearchText(colour).split(" "),
    // The chip is the point of a colour row; see Command.swatch.
    swatch: colour.hex,
    run: () => host.applyColour(colour.id),
  }));
}
