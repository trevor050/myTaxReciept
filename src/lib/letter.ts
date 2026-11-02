import { DEFAULT_REASON, REASONS } from '@/data/reasons';
import { findLine, formatBillions, formatWhole, shareOf, type Marks, type Stance } from './tax';

export type Tone = 'polite' | 'direct' | 'furious';
export type Chamber = 'representative' | 'senator';

export const TONES: { id: Tone; label: string }[] = [
  { id: 'polite', label: 'Polite' },
  { id: 'direct', label: 'Direct' },
  { id: 'furious', label: 'Furious' },
];

const TITLES: Record<Chamber, string> = { representative: 'Representative', senator: 'Senator' };

/** Beyond this many lines the letter stops arguing each one; staff read short letters. */
const MAX_ARGUED_LINES = 5;

export interface LetterInput {
  marks: Marks;
  tax: number;
  fiscalYear: number;
  tone: Tone;
  chamber: Chamber;
  recipient: string;
  name: string;
  place: string;
  story: string;
}

const opening: Record<Tone, (who: string, paid: string) => string> = {
  polite: (who, paid) =>
    `I'm ${who}, and this year I paid ${paid} in federal income tax. I looked up where that money goes, line by line, and I'm writing to share what I'd like to see change.`,
  direct: (who, paid) =>
    `I'm ${who}. I paid ${paid} in federal income tax this year, I looked up where it goes, and I want the next budget to change.`,
  furious: (who, paid) =>
    `I'm ${who}. I paid ${paid} in federal income tax this year. I read the itemized breakdown, and I'm angry about how my money is being spent.`,
};

const heading: Record<Tone, Record<Stance, string>> = {
  polite: { less: 'I would ask you to spend less on:', more: 'I would ask you to spend more on:' },
  direct: { less: 'Spend less on:', more: 'Spend more on:' },
  furious: { less: 'Stop pouring my money into:', more: 'Stop shortchanging:' },
};

const closing: Record<Tone, string> = {
  polite: 'When the next budget comes up, will you support these changes? I would appreciate a reply telling me where you stand. Thank you for your time.',
  direct: 'When the next budget comes to a vote, will you support these changes? Please reply and tell me where you stand on each one.',
  furious: 'When the next budget comes to a vote, will you support these changes? I expect a straight answer on each one, and I will remember your votes when I fill out my ballot.',
};

const signoff: Record<Tone, string> = { polite: 'Sincerely,', direct: 'Regards,', furious: 'Your constituent, and a voter,' };

/** "NIH – Medical research" reads badly in a sentence; keep the part a person would say. */
function spokenLabel(label: string): string {
  return label.split(/\s+[–—-]\s+/)[0].replace(/\s*\([^)]*\)/, '').trim();
}

function money(amount: number): string {
  return `$${formatWhole(amount)}`;
}

function marked(marks: Marks, stance: Stance): string[] {
  return Object.keys(marks).filter((id) => marks[id] === stance && findLine(id));
}

function arguedLine(id: string, stance: Stance, tax: number, fiscalYear: number): string {
  const line = findLine(id)!;
  const reason = (REASONS[id] ?? DEFAULT_REASON)[stance];
  return `${spokenLabel(line.label)} cost ${formatBillions(line.amountB)} in fiscal ${fiscalYear}, about ${money(shareOf(tax, line.amountB))} of what I paid. ${reason}`;
}

function listedLines(ids: string[]): string {
  const labels = ids.map((id) => spokenLabel(findLine(id)!.label));
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

function buildSubject({ marks }: Pick<LetterInput, 'marks'>): string {
  const parts: string[] = [];
  const less = marked(marks, 'less');
  const more = marked(marks, 'more');
  if (less.length) parts.push(`less on ${spokenLabel(findLine(less[0])!.label)}${less.length > 1 ? ' and more' : ''}`);
  if (more.length) parts.push(`more on ${spokenLabel(findLine(more[0])!.label)}${more.length > 1 ? ' and others' : ''}`);
  return `Constituent request: spend ${parts.join(', ')}`;
}

export function buildLetter(input: LetterInput): { subject: string; body: string } {
  const { marks, tax, fiscalYear, tone, chamber, recipient, name, place, story } = input;
  const who = place.trim() ? `your constituent in ${place.trim()}` : 'your constituent';
  const total = Object.keys(marks).length;
  const sections: string[] = [];

  let argued = 0;
  for (const stance of ['less', 'more'] as const) {
    const ids = marked(marks, stance);
    if (!ids.length) continue;
    const room = Math.max(0, MAX_ARGUED_LINES - argued);
    // Keep at least one argued line per direction so neither side becomes a bare list.
    const take = total <= MAX_ARGUED_LINES ? ids.length : Math.max(1, Math.min(room, ids.length));
    const full = ids.slice(0, take);
    const rest = ids.slice(take);
    argued += full.length;
    const paragraphs = full.map((id) => arguedLine(id, stance, tax, fiscalYear));
    if (rest.length) paragraphs.push(`The same goes for ${listedLines(rest)}.`);
    sections.push([heading[tone][stance], ...paragraphs].join('\n\n'));
  }

  const signature = [name.trim() || '[Your name]', place.trim()].filter(Boolean).join('\n');
  const body = [
    `Dear ${TITLES[chamber]} ${recipient.trim() || '[Last name]'},`,
    opening[tone](who, money(tax)),
    ...sections,
    ...(story.trim() ? [story.trim()] : []),
    closing[tone],
    `${signoff[tone]}\n${signature}`,
  ].join('\n\n');

  return { subject: buildSubject(input), body };
}

const TONE_WORDS: Record<Tone, string> = {
  polite: 'warm, respectful',
  direct: 'plain, firm',
  furious: 'angry but civil, no insults',
};

const encodedLength = (text: string) => encodeURIComponent(text).length;

/**
 * Builds a self-contained prompt that fits in a URL. Chatbots need the facts and the
 * position, not a draft, so it sends compact data and instructions. As space runs out it
 * sheds, in order, per-person shares, the story, and then whole lines (noting how many),
 * never the instructions or the user's direction on the lines that remain.
 */
export function buildPrompt(input: LetterInput, maxEncoded: number): string {
  const { marks, tax, fiscalYear, tone, chamber, recipient, name, place, story } = input;
  const line = (id: string, withShare: boolean) => {
    const found = findLine(id)!;
    const billions = `$${Math.round(found.amountB)}B`;
    return `${spokenLabel(found.label)} ${billions}${withShare ? ` (my share ${money(shareOf(tax, found.amountB))})` : ''}`;
  };

  const compose = (withShare: boolean, withStory: boolean, keep: number) => {
    const ids = [...marked(marks, 'less'), ...marked(marks, 'more')];
    const kept = new Set(ids.slice(0, keep));
    const group = (stance: Stance) => marked(marks, stance).filter((id) => kept.has(id)).map((id) => line(id, withShare)).join('; ');
    const less = group('less');
    const more = group('more');
    const dropped = ids.length - kept.size;
    return [
      `Write my letter to my US ${TITLES[chamber].toLowerCase()}${recipient.trim() ? ` ${recipient.trim()}` : ''}.`,
      `Me: ${name.trim() || '[name]'}, constituent${place.trim() ? ` in ${place.trim()}` : ''}, paid ${money(tax)} federal income tax.`,
      `Figures are FY${fiscalYear} federal outlays.`,
      less && `I want LESS spent on: ${less}.`,
      more && `I want MORE spent on: ${more}.`,
      dropped > 0 && `Also ${dropped} more lines; add a placeholder for them.`,
      withStory && story.trim() && `Why it matters to me: ${story.trim()}`,
      `Tone: ${TONE_WORDS[tone]}.`,
      'Rules: under 200 words; first person; sound like a real person, not a template; one specific reason per program, arguing my side honestly; use my figures and invent no other statistics or personal details; end by asking how they will vote on the next budget.',
      'Output only subject line and letter.',
    ]
      .filter(Boolean)
      .join(' ');
  };

  const count = Object.keys(marks).length;
  for (const [withShare, withStory] of [[true, true], [false, true], [false, false]] as const) {
    const prompt = compose(withShare, withStory, count);
    if (encodedLength(prompt) <= maxEncoded) return prompt;
  }
  for (let keep = count - 1; keep > 0; keep -= 1) {
    const prompt = compose(false, false, keep);
    if (encodedLength(prompt) <= maxEncoded) return prompt;
  }
  return compose(false, false, 1);
}
