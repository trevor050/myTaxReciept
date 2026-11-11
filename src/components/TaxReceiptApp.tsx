'use client';

import { getFontEmbedCSS, toPng } from 'html-to-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  budget,
  decodeMarks,
  buildShareUrl,
  estimatePayrollTax,
  estimateTax,
  formatMoneyInput,
  formatWhole,
  parseMoney,
  parseSharedTax,
  SAMPLE_TAX,
  type FilingStatus,
  type Marks,
  type Stance,
} from '@/lib/tax';
import { LetterSection } from './LetterSection';
import { Receipt } from './Receipt';

const STATUSES: { id: FilingStatus; label: string }[] = [
  { id: 'single', label: 'Single' },
  { id: 'married_joint', label: 'Married, jointly' },
  { id: 'head_of_household', label: 'Head of household' },
];

const WORK_HOURS_PER_YEAR = 2080;

export function TaxReceiptApp() {
  const [taxInput, setTaxInput] = useState('');
  const [estimating, setEstimating] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');
  const [status, setStatus] = useState<FilingStatus>('single');
  const [payrollInput, setPayrollInput] = useState('');
  const [wageInput, setWageInput] = useState('');
  const [showHours, setShowHours] = useState(false);
  const [marks, setMarks] = useState<Marks>({});
  const [today, setToday] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Share links carry the amount and marks, so they can only be read once in the browser.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedTax = parseSharedTax(params.get('tax'));
    if (sharedTax !== null) setTaxInput(formatMoneyInput(String(sharedTax)));
    setMarks(decodeMarks(params.get('marks')));
    setToday(new Date().toLocaleDateString('en-US'));
  }, []);

  const income = parseMoney(incomeInput);
  const estimated = estimating && income !== null ? estimateTax(income, status) : null;
  const estimatedPayroll = estimated !== null && income !== null ? estimatePayrollTax(income, status) : null;
  const payroll = estimating ? (estimatedPayroll ?? 0) : (parseMoney(payrollInput) ?? 0);
  const entered = estimating ? estimated : parseMoney(taxInput);
  const tax = entered === null ? SAMPLE_TAX : entered + payroll;
  const isSample = entered === null;

  const wage = useMemo(() => {
    const typed = parseMoney(wageInput);
    if (typed && typed > 0) return typed;
    return estimating && income ? income / WORK_HOURS_PER_YEAR : null;
  }, [wageInput, estimating, income]);

  const markCount = Object.keys(marks).length;
  const hoursOn = showHours && wage !== null;

  function toggleMark(id: string, stance: Stance) {
    setMarks((current) => {
      const next = { ...current };
      if (next[id] === stance) delete next[id];
      else next[id] = stance;
      return next;
    });
  }

  function flash(note: string) {
    setActionNote(note);
    window.setTimeout(() => setActionNote(null), 2400);
  }

  async function saveImage() {
    const node = receiptRef.current;
    if (!node) return;
    try {
      const fonts = await getFontEmbedCSS(node);
      const url = await toPng(node, {
        pixelRatio: 2,
        // The cloned receipt must not restart its slide-in animation during capture.
        style: { animation: 'none', transform: 'none' },
        // Pen strokes animate too; capture their completed state in the clone only.
        fontEmbedCSS: `${fonts}
          .receipt * { animation: none !important; transition: none !important; }
          .pen-strike { background-size: 100% 0.5em !important; }
          .pen-mark path { stroke-dashoffset: 0 !important; }
        `,
        filter: (el) => !(el instanceof HTMLElement && el.dataset.export === 'hide'),
      });
      const link = document.createElement('a');
      link.download = 'my-tax-receipt.png';
      link.href = url;
      link.click();
      flash('Receipt saved');
    } catch {
      flash('Could not save the image. Take a screenshot instead.');
    }
  }

  async function copyLink() {
    const url = buildShareUrl(window.location.origin, isSample ? null : tax, marks);
    try {
      await navigator.clipboard.writeText(url);
      flash(isSample ? 'Link copied' : 'Link copied. It includes your amount.');
    } catch {
      flash('Could not copy. Your browser blocked clipboard access.');
    }
  }

  return (
    <>
      <main className="workbench">
        <section className="intake">
          <h1>Here&rsquo;s what your federal taxes bought.</h1>
          <p className="lede">
            Enter what you paid. The figures come from federal spending records for fiscal {budget.fiscalYear}.
          </p>

          <div className="form-lines">
            {!estimating ? (
              <label className="form-line">
                <span className="line-no">24</span>
                <span className="line-name">Total tax, Form 1040</span>
                <span className="line-box">
                  <span aria-hidden="true">$</span>
                  <input inputMode="decimal" autoComplete="off" placeholder={formatWhole(SAMPLE_TAX)} value={taxInput} onChange={(e) => setTaxInput(formatMoneyInput(e.target.value))} />
                </span>
              </label>
            ) : (
              <>
                <label className="form-line">
                  <span className="line-no">1z</span>
                  <span className="line-name">Your yearly income</span>
                  <span className="line-box">
                    <span aria-hidden="true">$</span>
                    <input inputMode="decimal" autoComplete="off" autoFocus placeholder="65,000" value={incomeInput} onChange={(e) => setIncomeInput(formatMoneyInput(e.target.value))} />
                  </span>
                </label>
                <fieldset className="filing">
                  <legend>Filing status</legend>
                  {STATUSES.map((option) => (
                    <label key={option.id}>
                      <input type="radio" name="status" checked={status === option.id} onChange={() => setStatus(option.id)} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </fieldset>
                {estimated !== null && (
                  <p className="estimate-result" role="status">
                    About <strong>${formatWhole(estimated)}</strong> in income tax with the standard deduction, before credits, plus <strong>${formatWhole(estimatedPayroll ?? 0)}</strong> in Social Security and Medicare tax.
                  </p>
                )}
              </>
            )}
            <button type="button" className="text-button" onClick={() => setEstimating(!estimating)}>
              {estimating ? 'I know my total tax' : 'Don’t have it? Estimate from income'}
            </button>

            {!estimating && (
              <label className="form-line">
                <span className="line-no">W-2</span>
                <span className="line-name">Social Security and Medicare withheld, boxes 4 and 6 (optional)</span>
                <span className="line-box line-box-mid">
                  <span aria-hidden="true">$</span>
                  <input inputMode="decimal" autoComplete="off" placeholder="0" value={payrollInput} onChange={(e) => setPayrollInput(formatMoneyInput(e.target.value))} />
                </span>
              </label>
            )}

            <label className="form-line">
              <span className="line-no">$/h</span>
              <span className="line-name">Your hourly pay, to see work time</span>
              <span className="line-box line-box-short">
                <span aria-hidden="true">$</span>
                <input
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={estimating && income ? (income / WORK_HOURS_PER_YEAR).toFixed(0) : '30'}
                  value={wageInput}
                  onChange={(e) => setWageInput(e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </span>
            </label>
          </div>

          <div className="units" role="group" aria-label="Show amounts in">
            <button type="button" aria-pressed={!hoursOn} onClick={() => setShowHours(false)}>Dollars</button>
            <button type="button" aria-pressed={hoursOn} disabled={!wage} onClick={() => setShowHours(true)}>Hours of work</button>
          </div>

          <div className="actions">
            <button type="button" className="button" onClick={saveImage}>Save image</button>
            <button type="button" className="button button-quiet" onClick={copyLink}>Copy link</button>
            {markCount > 0 && <a className="button button-pen" href="#letter">Write to Congress</a>}
            <p className="action-note" role="status">{actionNote}</p>
          </div>

          <p className="hint">Open any line on the receipt to see its programs. Mark what you&rsquo;d change, and your letter to Congress writes itself.</p>
        </section>

        <section className="printer" aria-label="Your receipt">
          <div className="printer-slot" aria-hidden="true" />
          <div className="printer-feed">
            <Receipt ref={receiptRef} tax={tax} isSample={isSample} wage={wage} showHours={hoursOn} marks={marks} today={today} onMark={toggleMark} />
          </div>
        </section>
      </main>

      <LetterSection marks={marks} tax={tax} />

      <footer className="colophon">
        <div className="method">
          <h2>How this is calculated</h2>
          <p>
            Each line is that category&rsquo;s share of fiscal {budget.fiscalYear} federal spending, applied to the amount you entered. This is a proportional picture of the whole budget, not a trace of your dollars. Taxes aren&rsquo;t earmarked this way, and Social Security and much of Medicare run mainly on their own payroll taxes.
          </p>
          <p>
            The government collected ${(budget.totals.receiptsB / 1000).toFixed(2)} trillion and spent ${(budget.totals.outlaysB / 1000).toFixed(2)} trillion, borrowing about {Math.round((budget.totals.deficitB / budget.totals.receiptsB) * 100)}&cent; for every dollar it collected. That&rsquo;s the credit card line. It isn&rsquo;t money you paid. Negative lines are money agencies took in, which is counted against spending.
          </p>
          <p>
            Figures are Treasury actuals, except the PACT Act, ARPA-E, and Minority Business Development Agency lines, which use preliminary USAspending data. If your Form 1040 total already includes Additional Medicare or self-employment tax, leave that amount out of the W-2 line. The sample uses the average of ${formatWhole(SAMPLE_TAX)} per return from IRS data for tax year {budget.taxEstimator.averagesYear}.
          </p>
        </div>
        <div>
          <h2>Sources</h2>
          <ul>
            {budget.sources.map((source) => (
              <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>
            ))}
          </ul>
        </div>
        <p className="credit">
          Built by <a href="https://github.com/trevor050">Trevor Rosato</a>. <a href="https://github.com/trevor050/myTaxReciept">Open source on GitHub</a>. Nothing you enter leaves your browser.
        </p>
      </footer>

      {markCount > 0 && (
        <a className="mobile-letter-bar" href="#letter">
          Write to Congress about {markCount} {markCount === 1 ? 'line' : 'lines'}
        </a>
      )}
    </>
  );
}
