// Builds the slim dataset the site ships from the full sourced dataset in data/.
import fs from 'node:fs';

const full = JSON.parse(fs.readFileSync('data/budget-fy2026.json', 'utf8'));

const CATEGORY_LABELS = {
  health: 'Health & Medicare',
  social_security: 'Social Security',
  interest_debt: 'Interest on the debt',
  defense: 'Defense',
  economic_security: 'Income support & federal pensions',
  veterans_retirement: 'Veterans',
  transportation: 'Transportation',
  law_enforcement: 'Law enforcement & courts',
  education: 'Education & job training',
  energy_environment: 'Energy & environment',
  housing_community: 'Communities & disaster relief',
  agriculture: 'Agriculture',
  international_affairs: 'Foreign affairs',
  science: 'Science & space',
  government_ops: 'Running the government',
  commerce_housing_credit: 'Commerce & housing credit',
  other_offsetting_receipts: 'Money agencies took in',
};

const PROGRAM_LABELS = {
  medicare: 'Medicare',
  medicaid: 'Medicaid',
  aca_subsidies: 'ACA marketplace subsidies',
  chip: 'CHIP (children)',
  nih: 'NIH medical research',
  cdc: 'CDC',
  mental_health: 'Mental health and addiction services',
  hrsa: 'Community health centers and clinics',
  indian_health_service: 'Indian Health Service',
  ss_retirement: 'Retirement and survivor benefits',
  ss_disability: 'Disability benefits',
  net_interest: 'Interest paid on the debt',
  military_personnel: 'Military pay and benefits',
  operations_maintenance: 'Military operations and maintenance',
  weapons_procurement: 'Weapons procurement',
  nuclear_weapons: 'Nuclear weapons',
  defense_rdte: 'Military research and development',
  military_construction: 'Military construction',
  snap: 'SNAP (food assistance)',
  unemployment_insurance: 'Unemployment insurance',
  ssi: 'Supplemental Security Income',
  tanf: 'TANF family assistance',
  child_tax_credit: 'Child tax credit refunds',
  liheap: 'Home energy assistance',
  public_housing: 'Public housing and rental vouchers',
  military_pensions: 'Military pensions',
  civilian_pensions: 'Federal civilian pensions',
  earned_income_tax_credit: 'Earned income tax credit refunds',
  child_nutrition: 'School meals',
  wic: 'WIC (mothers and infants)',
  child_care: 'Child care grants',
  foster_care: 'Foster care and adoption',
  va_programs: 'Veterans Affairs',
  pact_act: 'Toxic exposure care (PACT Act)',
  highways: 'Highways',
  public_transit: 'Public transit',
  rail_service: 'Amtrak and rail',
  faa: 'FAA and air traffic control',
  tsa: 'TSA',
  nasa_aeronautics: 'NASA aeronautics',
  fbi: 'FBI',
  border_security: 'Border Patrol, customs and ICE',
  federal_prisons: 'Federal prisons',
  federal_courts: 'Federal courts and public defenders',
  k12_schools: 'K-12 schools',
  college_aid: 'College aid and student loans',
  ed_ops: 'Running the Education Department',
  student_loan_and_education_offsets: 'Student loan repayments and adjustments',
  epa: 'EPA',
  renewables: 'Clean energy programs',
  forest_service: 'Forest Service',
  national_parks: 'National parks',
  noaa: 'NOAA weather and oceans',
  arpa_e: 'ARPA-E energy research',
  fema_disaster: 'FEMA disaster relief',
  community_block_grants: 'Community development grants',
  crop_insurance: 'Crop insurance',
  commodity_credit: 'Farm commodity payments',
  diplomacy: 'Diplomacy and embassies',
  usaid: 'Foreign aid (former USAID accounts)',
  foreign_military_aid: 'Foreign military aid',
  global_health_aid: 'Global health aid',
  refugee_aid: 'Refugee assistance',
  peace_corps: 'Peace Corps',
  nasa: 'NASA',
  nsf: 'National Science Foundation',
  doe_science: 'Energy Department science labs',
  irs: 'IRS',
  legislative_branch: 'Congress',
  cfpb: 'Consumer Financial Protection Bureau',
  mbda: 'Minority Business Development Agency',
  fdic: 'FDIC recoveries',
  undistributed_offsetting_receipts: 'Offsetting receipts',
};

// Accounting lines rather than things a person could ask Congress to change.
const UNMARKABLE = new Set(['fdic', 'student_loan_and_education_offsets', 'undistributed_offsetting_receipts']);
const round = (value) => Math.round(value * 1000) / 1000;

const categories = full.categories.map((category) => ({
  id: category.id,
  label: CATEGORY_LABELS[category.id] ?? category.label,
  amountB: round(category.amountB),
  programs: category.programs
    .filter((program) => Math.abs(program.amountB) >= 0.005)
    .map((program) => {
      const residual = program.id.startsWith('other_');
      if (!residual && !PROGRAM_LABELS[program.id]) throw new Error(`No label for ${program.id}`);
      return {
        id: program.id,
        label: residual ? 'Everything else' : PROGRAM_LABELS[program.id],
        amountB: round(program.amountB),
        markable: !residual && !UNMARKABLE.has(program.id),
      };
    }),
}));

const SOURCES = [
  ['mts', 'Monthly Treasury Statement, September 2026, table 9: spending by function'],
  ['mts5', 'Monthly Treasury Statement, September 2026, table 5: spending by agency and program'],
  ['usa_pact', 'USAspending: PACT Act toxic exposures fund'],
  ['irs2023', 'IRS Statistics of Income, tax year 2023: income tax per return'],
  ['irsbrackets', 'IRS Revenue Procedure 2024-40: 2025 tax brackets'],
  ['irsdeduction', 'IRS Publication 501: 2025 standard deductions'],
  ['gao_usaid', 'GAO, September 2026: foreign assistance after USAID'],
];

const output = {
  fiscalYear: full.fiscalYear,
  dataStatus: full.dataStatus,
  asOf: full.asOf,
  totals: {
    outlaysB: round(full.totals.outlaysB),
    receiptsB: round(full.totals.receiptsB),
    deficitB: round(full.totals.deficitB),
  },
  sources: SOURCES.map(([id, title]) => ({ id, title, url: full.sources.find((s) => s.id === id).url })),
  categories,
  taxEstimator: {
    taxYear: full.taxEstimator.taxYear,
    brackets: full.taxEstimator.brackets,
    standardDeduction: full.taxEstimator.standardDeduction,
    averageIncomeTaxPerReturn: full.taxEstimator.averageIncomeTaxPerReturn,
    averagesYear: full.taxEstimator.averagesYear,
  },
};

fs.writeFileSync('src/data/budget.json', `${JSON.stringify(output, null, 1)}\n`);
console.log(`Wrote ${categories.length} categories, ${categories.flatMap((c) => c.programs).length} programs`);
