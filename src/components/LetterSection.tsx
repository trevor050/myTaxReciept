'use client';

import { useEffect, useMemo, useState } from 'react';
import providers from '@/data/ai-providers.json';
import { buildLetter, buildPrompt, TONES, type Chamber, type Tone } from '@/lib/letter';
import { generalCutGroups, matchOrgs, type Direction } from '@/lib/orgs';
import { budget, findLine, type Marks } from '@/lib/tax';

const HOUSE_URL = 'https://www.house.gov/representatives/find-your-representative';
const SENATE_URL = 'https://www.senate.gov/senators/senators-contact.htm';

/** A pasted prompt has no URL to fit in, so it keeps every line. */
const FULL_PROMPT_CAP = 20_000;

const WANTS: Record<Direction, string> = { less: 'less for', more: 'more for', reform: 'changes to' };
const PARTIAL_WANTS: Record<Direction, string> = { less: 'cuts to part of', more: 'more for part of', reform: 'changes to' };

export function LetterSection({ marks, tax }: { marks: Marks; tax: number }) {
  const [tone, setTone] = useState<Tone>('direct');
  const [chamber, setChamber] = useState<Chamber>('representative');
  const [recipient, setRecipient] = useState('');
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [story, setStory] = useState('');
  const [edited, setEdited] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [opposing, setOpposing] = useState(false);

  const hasMarks = Object.keys(marks).length > 0;
  const input = { marks, tax, fiscalYear: budget.fiscalYear, tone, chamber, recipient, name, place, story };
  const letter = buildLetter(input);
  const orgs = useMemo(() => matchOrgs(marks, { opposing }), [marks, opposing]);
  const general = useMemo(() => {
    const { lines, orgs: groups } = generalCutGroups(marks);
    const listed = new Set(matchOrgs(marks).map(({ org }) => org.url));
    return { lines, orgs: groups.filter((org) => !listed.has(org.url)) };
  }, [marks]);
  const body = edited ?? letter.body;

  // With no marks left there is nothing to write about, so hand edits no longer apply.
  useEffect(() => {
    if (!hasMarks) setEdited(null);
  }, [hasMarks]);

  async function copyText(text: string, done: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(done);
    } catch {
      setCopied('Your browser blocked clipboard access. Select the text and copy it.');
    }
    window.setTimeout(() => setCopied(null), 2400);
  }

  return (
    <section id="letter" className="letter-section">
      <h2>Tell Congress what you&rsquo;d change</h2>
      {!hasMarks ? (
        <p className="letter-empty">Open a line on the receipt and mark a program with Less or More. Your letter will appear here.</p>
      ) : (
        <div className="letter-grid">
          <div className="letter-paper">
            <textarea aria-label="Your letter" value={body} onChange={(e) => setEdited(e.target.value)} spellCheck />
            {edited !== null && (
              <button type="button" className="text-button" onClick={() => setEdited(null)}>Discard my edits</button>
            )}
          </div>

          <div className="letter-controls">
            <div className="field-pair">
              <div className="plain-field">
                <span id="chamber-label">Writing to</span>
                <div className="units" role="group" aria-labelledby="chamber-label">
                  <button type="button" aria-pressed={chamber === 'representative'} onClick={() => setChamber('representative')}>Representative</button>
                  <button type="button" aria-pressed={chamber === 'senator'} onClick={() => setChamber('senator')}>Senator</button>
                </div>
              </div>
              <label className="plain-field">
                <span>Their last name</span>
                <input autoComplete="off" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </label>
            </div>
            <div className="field-pair">
              <label className="plain-field">
                <span>Your name</span>
                <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="plain-field">
                <span>City and state</span>
                <input autoComplete="off" placeholder="Dayton, Ohio" value={place} onChange={(e) => setPlace(e.target.value)} />
              </label>
            </div>
            <label className="plain-field">
              <span>Why this matters to you</span>
              <textarea rows={3} placeholder="A sentence or two about your own life. Staff remember these more than anything else." value={story} onChange={(e) => setStory(e.target.value)} />
            </label>

            <div className="plain-field">
              <span id="tone-label">Tone</span>
              <div className="units" role="group" aria-labelledby="tone-label">
                {TONES.map((option) => (
                  <button key={option.id} type="button" aria-pressed={tone === option.id} onClick={() => setTone(option.id)}>{option.label}</button>
                ))}
              </div>
            </div>
            {edited !== null && <p className="control-note">Your edits are in charge now. Discard them to apply changes from these fields.</p>}

            <div className="actions">
              <button type="button" className="button" onClick={() => copyText(`Subject: ${letter.subject}\n\n${body}`, 'Letter copied')}>Copy letter</button>
              <p className="action-note" role="status">{copied}</p>
            </div>

            <p className="send-to">
              Congress takes messages through each member&rsquo;s own contact form. Paste it into yours:{' '}
              <a href={HOUSE_URL} target="_blank" rel="noreferrer">find your representative</a> or{' '}
              <a href={SENATE_URL} target="_blank" rel="noreferrer">your senators</a>.
            </p>

            <div className="ai-links">
              <p>Or have an AI write it from your choices:</p>
              <ul>
                {providers.map((provider) => (
                  <li key={provider.id}>
                    <a
                      href={provider.urlTemplate.replace('{prompt}', encodeURIComponent(buildPrompt(input, provider.maxEncodedChars)))}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/ai/${provider.id}.svg`} alt="" width={18} height={18} />
                      {provider.name}
                    </a>
                  </li>
                ))}
                <li>
                  <button type="button" onClick={() => copyText(buildPrompt(input, FULL_PROMPT_CAP), 'Prompt copied. Paste it into any AI assistant.')}>Copy prompt</button>
                </li>
              </ul>
            </div>
          </div>

          <div className="org-list">
            <div className="org-head">
              <h3>{opposing ? 'Who argues the other side' : 'Groups working on this'}</h3>
              <button type="button" className="text-button" aria-pressed={opposing} onClick={() => setOpposing(!opposing)}>
                {opposing ? 'Show groups working on these lines' : 'See who argues the other side'}
              </button>
            </div>
            {orgs.length === 0 ? (
              <p className="letter-empty">
                {opposing ? 'We haven’t found a group arguing the other side on these lines yet.' : 'We haven’t found a group working on these lines yet. Your letter still counts.'}
              </p>
            ) : (
              <ul>
                {orgs.map(({ org, matched }) => (
                  <li key={org.url}>
                    <a href={org.url} target="_blank" rel="noreferrer">{org.name}</a>
                    <p>{org.description}</p>
                    <p className="org-why">
                      Wants{' '}
                      {matched.map(({ id, direction, evidenceUrl, partial }, index) => (
                        <span key={id}>
                          {index > 0 && '; '}
                          {partial ? PARTIAL_WANTS[direction] : WANTS[direction]}{' '}
                          {evidenceUrl ? (
                            <a className="org-evidence" href={evidenceUrl} target="_blank" rel="noreferrer">{findLine(id)?.label}</a>
                          ) : (
                            findLine(id)?.label
                          )}
                        </span>
                      ))}
                      {org.actionUrl && (
                        <>
                          {'. '}
                          <a className="org-action" href={org.actionUrl} target="_blank" rel="noreferrer">Get involved</a>
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {!opposing && general.lines.length > 0 && (
              <div className="org-general">
                <h4>
                  We found no group with a published position on cutting {general.lines.map((id) => findLine(id)?.label).join(', ')}. {general.orgs.length > 0 ? ' These campaign to cut federal spending in general:' : ' The spending watchdogs listed above campaign for cuts in general.'}
                </h4>
                {general.orgs.length > 0 && <ul>
                  {general.orgs.map((org) => (
                    <li key={org.url}>
                      <a href={org.url} target="_blank" rel="noreferrer">{org.name}</a>
                      <p>{org.description}</p>
                    </li>
                  ))}
                </ul>}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
