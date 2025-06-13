import type { SelectedItem } from '@/services/tax-spending';
import { toneBucket } from './utils';

export const SUBJECT = [
    'Regarding Federal Budget Priorities',
    'A Constituent\'s Perspective on the Federal Budget',
    'Urgent: My Input on Federal Spending',
    'Action Needed on Federal Budget Allocation',
];

export function generateStandardEmail(
    items: SelectedItem[],
    aggressiveness: number,
    userName: string,
    userLocation: string,
    balanceBudget: boolean
) {
    const tone = toneBucket(aggressiveness);
    const subject = SUBJECT[tone] || SUBJECT[0];

    const intro = `Dear [Representative Name],

I am a constituent from ${userLocation}, writing to you today to express my views on federal budget priorities. As a taxpayer, it is important to me that my contributions are allocated in a way that reflects the values and needs of our community and the nation.`;

    const budgetStance = balanceBudget
        ? `\n\nMy primary concern is the national debt and the need for a balanced budget. Fiscal responsibility is paramount, and I urge you to prioritize measures that will lead to sustainable government spending.`
        : '';

    const fundingPrioritiesHeader = `\n\nRegarding specific funding areas, I have outlined my preferences below. I have indicated where I believe funds should be increased, decreased, or where efficiencies could be found:`;

    const itemsList = items.map(item => {
        let fundingAction;
        switch (item.fundingLevel) {
            case 2: fundingAction = "Strongly Increase Funding"; break;
            case 1: fundingAction = "Increase Funding"; break;
            case 0: fundingAction = "Review for Efficiency"; break;
            case -1: fundingAction = "Decrease Funding"; break;
            case -2: fundingAction = "Strongly Decrease Funding"; break;
            default: fundingAction = "Maintain Current Level";
        }
        return `\n- For "${item.description}": I recommend you vote to **${fundingAction}**.`;
    }).join('');

    const conclusion = `\n\nI believe these adjustments will better serve the public interest. I trust that you will consider my perspective during upcoming budget discussions and legislative votes.

Thank you for your time and dedication to serving our district.

Sincerely,
${userName}
${userLocation}`;

    const body = `${intro}${budgetStance}${fundingPrioritiesHeader}${itemsList}${conclusion}`;

    return { subject, body };
} 