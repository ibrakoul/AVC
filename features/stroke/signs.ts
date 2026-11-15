/**
 * FAST / BE-FAST warning-sign definitions. Text lives in the locale files
 * under `stroke.signs.<letter>`; this module only defines structure.
 */
export type SignLetter = 'B' | 'E' | 'F' | 'A' | 'S' | 'T';
export type StrokeProtocol = 'FAST' | 'BE-FAST';

/** Observable signs (T = Time is the action, not a symptom). */
export type ObservableSign = Exclude<SignLetter, 'T'>;

export const FAST_SEQUENCE: readonly SignLetter[] = ['F', 'A', 'S', 'T'];
export const BEFAST_SEQUENCE: readonly SignLetter[] = ['B', 'E', 'F', 'A', 'S', 'T'];

export function sequenceFor(protocol: StrokeProtocol): readonly SignLetter[] {
  return protocol === 'FAST' ? FAST_SEQUENCE : BEFAST_SEQUENCE;
}

export function isObservable(letter: SignLetter): letter is ObservableSign {
  return letter !== 'T';
}

/** Icon name (lucide) per sign — illustration for low-literacy users. */
export const SIGN_ICONS: Record<SignLetter, 'Scale' | 'Eye' | 'Smile' | 'Hand' | 'MessageCircle' | 'Timer'> = {
  B: 'Scale',
  E: 'Eye',
  F: 'Smile',
  A: 'Hand',
  S: 'MessageCircle',
  T: 'Timer',
};
