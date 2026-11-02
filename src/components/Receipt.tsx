'use client';

import { forwardRef, useState } from 'react';
import { BLURBS } from '@/data/blurbs';
import links from '@/data/program-links.json';
import {
  borrowedAlongside,
  budget,
  categories,
  formatHours,
  formatMoney,
  shareOf,
  type Category,
  type Marks,
  type Stance,
} from '@/lib/tax';
import { PenMark } from './PenMark';

const wiki = links as Record<string, string>;

interface ReceiptProps {
  tax: number;
  isSample: boolean;
  wage: number | null;
  showHours: boolean;
  marks: Marks;
  today: string | null;
  onMark: (id: string, stance: Stance) => void;
}

function MarkButtons({ id, label, stance, onMark }: { id: string; label: string; stance?: Stance; onMark: ReceiptProps['onMark'] }) {
  return (
    <span className="mark-buttons" data-export="hide">
      <button type="button" aria-pressed={stance === 'less'} aria-label={`Spend less on ${label}`} data-stance="less" onClick={() => onMark(id, 'less')}>
        Less
      </button>
      <button type="button" aria-pressed={stance === 'more'} aria-label={`Spend more on ${label}`} data-stance="more" onClick={() => onMark(id, 'more')}>
        More
      </button>
    </span>
  );
}

function CategoryRow({ category, tax, wage, showHours, marks, onMark }: { category: Category } & Pick<ReceiptProps, 'tax' | 'wage' | 'showHours' | 'marks' | 'onMark'>) {
  const [open, setOpen] = useState(false);
  const display = (amountB: number) => {
    const dollars = shareOf(tax, amountB);
    return showHours && wage ? formatHours(dollars, wage) : formatMoney(dollars);
  };
  const share = (category.amountB / budget.totals.outlaysB) * 100;
  const markedInside = category.programs.filter((p) => marks[p.id]);
  const hasPrograms = category.programs.length > 0;
  const selfMark = marks[category.id];
  const panelId = `lines-${category.id}`;

  return (
    <li className="rc-category">
      <button type="button" className="rc-row" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
        <span className="rc-toggle" aria-hidden="true">{open ? '−' : '+'}</span>
        <span className="rc-label">
          <span className="rc-label-text">
            {category.label}
            {selfMark === 'less' && <PenMark stance="less" />}
          </span>
          {markedInside.length > 0 && !open && <span className="pen-note">{markedInside.length} marked</span>}
        </span>
        <span className="rc-share">{share.toFixed(1)}%</span>
        <span className="rc-amount">
          {display(category.amountB)}
          {selfMark === 'more' && <PenMark stance="more" />}
        </span>
      </button>

      {open && (
        <div id={panelId} className="rc-panel">
          {!hasPrograms && (
            <div className="rc-program">
              <p className="rc-blurb">{BLURBS[category.id]}</p>
              <MarkButtons id={category.id} label={category.label} stance={selfMark} onMark={onMark} />
            </div>
          )}
          {category.programs.map((program) => {
            const stance = marks[program.id];
            return (
              <div key={program.id} className="rc-program">
                <div className="rc-program-line">
                  <span className="rc-label-text">
                    {program.label}
                    {stance === 'less' && <PenMark stance="less" />}
                  </span>
                  <span className="rc-amount">
                    {display(program.amountB)}
                    {stance === 'more' && <PenMark stance="more" />}
                  </span>
                </div>
                {BLURBS[program.id] && (
                  <p className="rc-blurb">
                    {BLURBS[program.id]}
                    {wiki[program.id] && (
                      <>
                        {' '}
                        <a href={wiki[program.id]} target="_blank" rel="noreferrer" aria-label={`Read more about ${program.label}`}>
                          Read more
                        </a>
                      </>
                    )}
                  </p>
                )}
                {program.note && <p className="rc-note">{program.note}</p>}
                <MarkButtons id={program.id} label={program.label} stance={stance} onMark={onMark} />
              </div>
            );
          })}
        </div>
      )}
    </li>
  );
}

/** Bar widths encode each category's share of spending, so the barcode is the budget. */
function BudgetBarcode() {
  return (
    <div className="rc-barcode" role="img" aria-label="A barcode whose bars are sized by each category's share of federal spending">
      {categories.map((category) => (
        <span key={category.id} style={{ flexGrow: category.amountB }} />
      ))}
    </div>
  );
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(function Receipt({ tax, isSample, wage, showHours, marks, today, onMark }, ref) {
  const hoursOn = showHours && wage !== null;
  return (
    <div ref={ref} className="receipt">
      <header className="rc-header">
        <p className="rc-store">Uncle Sam &amp; Co.</p>
        <p>Est. 1776, Washington, DC</p>
      </header>

      <dl className="rc-meta">
        <div><dt>Fiscal year</dt><dd>{budget.fiscalYear}</dd></div>
        {today && <div><dt>Printed</dt><dd>{today}</dd></div>}
        <div><dt>Customer</dt><dd>{isSample ? 'Average filer' : 'You'}</dd></div>
        <div><dt>Served by</dt><dd>535 members of Congress</dd></div>
      </dl>

      <ol className="rc-lines">
        {categories.map((category) => (
          <CategoryRow key={category.id} category={category} tax={tax} wage={wage} showHours={showHours} marks={marks} onMark={onMark} />
        ))}
      </ol>

      <div className="rc-totals">
        <div className="rc-total">
          <span>Total paid</span>
          <span>{formatMoney(tax)}</span>
        </div>
        {hoursOn && (
          <div className="rc-subtotal">
            <span>Time worked to pay it</span>
            <span>{formatHours(tax, wage)}</span>
          </div>
        )}
        <div className="rc-subtotal">
          <span>Borrowed on top, on your behalf</span>
          <span>{formatMoney(borrowedAlongside(tax))}</span>
        </div>
      </div>

      <BudgetBarcode />
      <footer className="rc-footer">
        <p>All returns due April 15.</p>
        <p>mytaxreceipt.org</p>
      </footer>
    </div>
  );
});
