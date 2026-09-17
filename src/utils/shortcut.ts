export interface ShortcutKeyboardEvent {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  repeat: boolean;
}

const MODIFIER_NAMES = new Set(["alt", "ctrl", "control", "shift", "meta", "cmd", "command"]);

function normalizeModifier(name: string) {
  if (name === "control") return "ctrl";
  if (name === "cmd" || name === "command") return "meta";
  return name;
}

export function matchesShortcut(event: ShortcutKeyboardEvent, shortcut: string) {
  const parts = shortcut
    .split("+")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  if (parts.length === 0 || event.repeat) return false;

  const keyPart = parts.find((part) => !MODIFIER_NAMES.has(part));
  if (!keyPart || event.key.toLowerCase() !== keyPart) return false;

  const modifiers = new Set(parts.filter((part) => MODIFIER_NAMES.has(part)).map(normalizeModifier));
  return (
    event.altKey === modifiers.has("alt") &&
    event.ctrlKey === modifiers.has("ctrl") &&
    event.shiftKey === modifiers.has("shift") &&
    event.metaKey === modifiers.has("meta")
  );
}
