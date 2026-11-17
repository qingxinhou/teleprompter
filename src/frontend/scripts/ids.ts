// Minting the ids this app stores: document ids, theme slugs' random half,
// the room id and the control key.
//
// It exists for one reason. `crypto.randomUUID` is gated on a **secure
// context**, so it is simply absent over plain HTTP to anything but
// localhost — which is exactly how an operator reaches this app from a phone,
// or from another machine on the same network, before there is any TLS in
// front of it. Called unguarded it threw `crypto.randomUUID is not a
// function` out of the control page's constructor, and because that happens
// while the page is still wiring itself up the result was a dead page: no
// editor, no room id, an empty viewer link and a signalling badge stuck on
// "Connecting" forever. Nothing said why.
//
// The failure was reachable only on a *first* visit in the sense that the
// three seeding paths — no room id yet, no control key yet, no documents yet —
// are the only code that mints an id at all; a browser that had got past them
// once would have had the answers in storage.

/**
 * The slice of `crypto` this needs, injected so a test can hand it a source
 * with no `randomUUID` — which is the whole case worth testing and the one no
 * secure-context test environment can produce by itself.
 */
export interface RandomSource {
  randomUUID?: () => string;
  // Not generic: the DOM's `crypto.getRandomValues` is generic over
  // `ArrayBufferView`, and a narrower type parameter here would make the real
  // `crypto` unassignable to this interface. Only bytes are ever requested, so
  // the plain signature is enough.
  getRandomValues(array: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer>;
}

/**
 * A random v4 UUID, on an insecure origin as well as a secure one.
 *
 * `getRandomValues` is deliberately the fallback rather than `Math.random`:
 * it carries no secure-context requirement and has been present for as long
 * as anything else this app needs, so there is no third tier to write — and
 * one of these ids is the control key, which is what stops a stranger on the
 * same network claiming control of a room. Weakening that to `Math.random`
 * to save a branch would be trading the wrong thing.
 */
export function randomID(source: RandomSource = crypto): string {
  if (typeof source.randomUUID === "function") return source.randomUUID();

  const bytes = source.getRandomValues(new Uint8Array(16));
  // The two fields that make this a v4 UUID rather than 16 random bytes:
  // version 4 in the high nibble of byte 6, variant 1 in the top bits of
  // byte 8. Kept faithful because these ids are stored, compared and — in the
  // room's case — sliced, so anything reading them later should not be able to
  // tell which branch minted it.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

/**
 * Six digits for a room.
 *
 * The room id is the one id here a person reads off one screen and types into
 * another — often across a room, often on a phone — so the alphabet matters
 * more than the entropy does. `randomID().slice(0, 8)` gave eight characters
 * drawn from `0-9a-f`: fine to paste, awkward to say ("nine one one nine two
 * oh dee one") and easy to mistype where `0` and `o` look alike.
 *
 * Six digits read aloud in pairs and land on a phone's numeric keypad. The
 * leading digit is forced to 1-9 so the code is never five digits with a
 * leading zero, which is the one shape that gets dropped when written down.
 *
 * 900,000 rooms: a collision needs two controllers to draw the same code, and
 * the signalling hub already refuses a second controller in a room, so a clash
 * is a visible error rather than a silent cross-talk.
 */
export function roomCode(source: RandomSource = crypto): string {
  const bytes = source.getRandomValues(new Uint8Array(4));
  const n = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) |
    bytes[3]) >>> 0;
  return String(100000 + (n % 900000));
}
