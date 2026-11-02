/**
 * The strongest plain-language case a constituent might make for each direction.
 * Each side is written so someone who holds that view would agree with it, and each
 * claim must stay general enough to hold up without a citation. Figures come from the budget data.
 */
export const REASONS: Record<string, { less: string; more: string }> = {
  interest_debt: {
    less: 'Every dollar of interest buys nothing new, and the way to shrink this line is to stop adding to the debt.',
    more: 'If this bill has to be paid, it should be paid in full and on time, with a real plan for bringing it down, so the country keeps its credit.',
  },

  ss_retirement: {
    less: 'The program pays out more than it takes in, and I would rather see gradual changes now, aimed at the wealthiest retirees, than sudden cuts later.',
    more: 'People paid into this for their whole working lives, and for many retirees it is most of what they live on.',
  },
  ss_disability: {
    less: 'Benefits should go to those who truly cannot work, with stronger reviews and better paths back to a job.',
    more: 'People who can no longer work wait far too long for benefits that are modest to begin with.',
  },

  medicare: {
    less: 'Costs keep climbing faster than the economy, and the program should pay less for overpriced care and stop overpaying private plans.',
    more: 'Older Americans still struggle with costs for care that traditional Medicare does not fully cover, such as dental, vision, and hearing.',
  },
  medicaid: {
    less: 'States should have stronger incentives to control costs and make sure coverage reaches the people it was designed for.',
    more: 'Losing this coverage means skipped care, medical debt, and hospitals in low-income and rural areas under strain.',
  },
  aca_subsidies: {
    less: 'Subsidies send public money to insurers without doing enough about the underlying price of care.',
    more: 'Without this help, many working families would be priced out of insurance altogether.',
  },
  chip: {
    less: 'Coverage should be focused on the children who have no other options, without replacing private insurance.',
    more: 'No child should go without a doctor because of where their parents’ income happens to fall.',
  },
  nih: {
    less: 'Too much of each grant goes to overhead, and I would like to see those dollars tied more closely to results.',
    more: 'Medical breakthroughs start with this research, and private companies will not pay for most of it on their own.',
  },
  cdc: {
    less: 'The agency needs to refocus on infectious disease and earn back public trust before it gets more money.',
    more: 'It is far cheaper to catch an outbreak early than to pay for one after it spreads.',
  },

  military_personnel: {
    less: 'A smaller force with fewer overseas commitments would cost less and still protect the country.',
    more: 'Too many service members and their families struggle with low pay and poor housing.',
  },
  operations_maintenance: {
    less: 'The Pentagon has never passed a full audit, and it should account for what it has before it receives more.',
    more: 'Readiness depends on training and repairs, and deferring them costs more in the end.',
  },
  weapons_procurement: {
    less: 'Weapons programs routinely run over budget and behind schedule while contractors face too few consequences.',
    more: 'Our military needs enough modern equipment and munitions to deter conflict, and an industrial base that can produce them.',
  },
  nuclear_weapons: {
    less: 'We already hold enough warheads to end civilization, and a costly modernization will not make anyone safer.',
    more: 'A credible, modern deterrent is what keeps these weapons from ever being used.',
  },
  foreign_military_aid: {
    less: 'American weapons should not be sent abroad without strict conditions and a clear benefit to our own security.',
    more: 'Arming allies helps them defend themselves and costs less than sending American troops.',
  },

  va_programs: {
    less: 'Veterans deserve care, but the VA needs reform, and more choice of private doctors, before it needs a bigger budget.',
    more: 'We made a promise to the people who served, and long waits for care break that promise.',
  },
  military_pensions: {
    less: 'Retirement benefits should be modernized in step with what the rest of the country receives.',
    more: 'Career service members gave decades to the country and earned the retirement they were promised.',
  },
  civilian_pensions: {
    less: 'Federal retirement should be brought closer to what private-sector workers receive.',
    more: 'A dependable retirement is how government keeps experienced people in public service.',
  },
  pact_act: {
    less: 'Toxic-exposure claims should be handled with strict oversight so that the money reaches those who were really harmed.',
    more: 'Veterans who were exposed to burn pits and other toxins should not have to fight for care.',
  },

  snap: {
    less: 'Benefits should be better targeted, with strong work requirements and tighter controls on improper payments.',
    more: 'Food assistance keeps families from going hungry, and the benefit often runs out before the month does.',
  },
  unemployment_insurance: {
    less: 'The system should be run more carefully, with less fraud and stronger incentives to return to work.',
    more: 'A layoff should not cost a family its home, and this system needs to be ready before the next downturn.',
  },
  ssi: {
    less: 'Eligibility reviews should be strengthened to make sure this money reaches those it was meant for.',
    more: 'SSI payments leave recipients below the poverty line, and its asset limits have barely moved in decades.',
  },
  tanf: {
    less: 'States have too much room to spend these funds on things other than helping families find work.',
    more: 'This aid has lost most of its value to inflation and reaches only a fraction of the families in poverty.',
  },
  child_tax_credit: {
    less: 'Tax credits make the code more complicated, and I would rather see lower rates for everyone.',
    more: 'Raising children is expensive, and this credit is one of the most direct ways to help working families.',
  },
  liheap: {
    less: 'This program should be better targeted or handled by states, with lower overhead.',
    more: 'Nobody should have to choose between paying for heat and paying for food.',
  },

  k12_schools: {
    less: 'Schools are best run by states and local communities, without so much federal money and so many strings attached.',
    more: 'Students in low-income schools and students with disabilities depend on this money, and Congress has never fully funded its share.',
  },
  college_aid: {
    less: 'Easy federal money has helped push tuition up, and colleges should share the risk when students cannot repay.',
    more: 'College costs keep rising faster than Pell Grants, and students should not start adult life buried in debt.',
  },
  ed_ops: {
    less: 'Washington does not need this much bureaucracy to send money to states and schools.',
    more: 'Someone has to protect student civil rights and oversee loans, and that takes enough staff to do it well.',
  },

  hud: {
    less: 'Federal housing programs are costly and slow, and zoning reform would do more to bring prices down.',
    more: 'Rents have outrun paychecks across the country, and we need more affordable housing.',
  },
  public_housing: {
    less: 'Public housing is costly to maintain, and rental aid should be better targeted and tied to work where possible.',
    more: 'Most families who qualify for rental help never get it, because there is not enough to go around.',
  },
  fema_disaster: {
    less: 'States and insurers should carry more of the cost, and we should stop subsidizing rebuilding in the same risky places.',
    more: 'Disasters are getting costlier, and communities need help that arrives quickly when one hits.',
  },
  head_start: {
    less: 'This money should be tied to evidence of lasting results, with more options for parents.',
    more: 'The earliest years shape a child’s whole life, and many eligible kids are still left out.',
  },
  community_block_grants: {
    less: 'Local projects should be funded locally, without sending the money through Washington first.',
    more: 'These flexible grants let towns fix local problems that a national program would never reach.',
  },

  highways: {
    less: 'We should fix the roads we have before building new ones, and let states decide more of their own priorities.',
    more: 'Too many of our roads and bridges are in poor repair, and that costs drivers and businesses every day.',
  },
  public_transit: {
    less: 'Transit systems should cover more of their own costs and control construction budgets that run far above other countries’.',
    more: 'Reliable transit gets people to work, reduces traffic, and helps those who cannot drive.',
  },
  rail_service: {
    less: 'Amtrak should have to make its long-distance routes pay their way or let them go.',
    more: 'Other developed countries have fast, reliable passenger trains, and Americans should have them as well.',
  },
  tsa: {
    less: 'Screening costs a lot and intrudes on travelers, and it should be reformed or opened to private competition.',
    more: 'Aviation security is not the place to cut corners, and officers and equipment should be kept up to date.',
  },
  faa: {
    less: 'Air traffic control should be restructured so that it does not rely on so much public money.',
    more: 'An outdated air traffic system and too few controllers put travelers at risk.',
  },

  epa: {
    less: 'Regulators have gone too far and impose costs on businesses and families that outweigh the benefits.',
    more: 'Clean air and safe water are basic, and enforcement only works if the agency has enough staff.',
  },
  renewables: {
    less: 'The energy market should pick winners, without federal subsidies tilting the field.',
    more: 'Investing in clean energy cuts pollution, creates jobs, and lowers costs over the long run.',
  },
  forest_service: {
    less: 'Forest management should be simpler and less costly, with more decisions made locally.',
    more: 'Wildfires are getting worse, and prevention is far cheaper than fighting a fire after it starts.',
  },
  national_parks: {
    less: 'The parks should take care of what they have, with more funding from visitors and private partners.',
    more: 'Our national parks have a huge maintenance backlog and too few rangers to look after them.',
  },
  noaa: {
    less: 'Weather and climate programs should be reviewed for overlap, with more use of private-sector data.',
    more: 'Accurate forecasts and storm warnings save lives and cost very little compared with what they protect.',
  },

  diplomacy: {
    less: 'The State Department is overstaffed in places, and it should be streamlined and made to focus on American interests.',
    more: 'Diplomacy costs a tiny fraction of what a war costs and can stop one from starting.',
  },
  usaid: {
    less: 'Aid abroad should wait until needs at home are met, and every program should show that it works.',
    more: 'Foreign aid is a very small part of the budget, and it saves lives while building goodwill for the US.',
  },
  climate_aid: {
    less: 'US taxpayers should not be paying for climate programs in other countries.',
    more: 'Climate disasters abroad lead to instability and migration, and it is cheaper to help before that happens.',
  },

  fbi: {
    less: 'The agency needs stricter oversight, and limits on surveillance of Americans, before it gets more money.',
    more: 'Federal agents are needed to fight violent crime, fraud, and terrorism, and that work should have the resources it requires.',
  },
  border_security: {
    less: 'Enforcement budgets keep growing without solving the problem, and the money should go to courts and legal pathways.',
    more: 'A country needs a secure border and enough agents and immigration judges to enforce its laws.',
  },
  federal_prisons: {
    less: 'We lock up too many people for too long, and sentencing reform would save money and lives.',
    more: 'Prisons are short-staffed and falling apart, which makes them dangerous for officers and for the people held there.',
  },

  nasa: {
    less: 'Exploration programs run badly over budget, and space should give way to more urgent needs here at home.',
    more: 'NASA’s science and exploration lead the world and return far more than they cost.',
  },
  nsf: {
    less: 'Grants should be held to a higher standard and focused on research with clear national value.',
    more: 'Basic research is where tomorrow’s industries come from, and rivals are investing heavily in it.',
  },
  arpa_research: {
    less: 'High-risk research should be open to more scrutiny, and the private sector should take on more of the cost.',
    more: 'This kind of research gave us the internet and GPS, and it is exactly the risk that markets will not take.',
  },
  commercial_space: {
    less: 'Billion-dollar companies should not rely so heavily on public contracts.',
    more: 'Buying launches on the open market is cheaper than building them ourselves and keeps the US ahead.',
  },

  irs: {
    less: 'The tax code should be simpler, so we would not need such a large agency to enforce it.',
    more: 'Better funding means phones get answered, and it means wealthy tax cheats are less likely to get away with it.',
  },
  federal_courts: {
    less: 'The courts should find savings in administration and show they are using what they have well.',
    more: 'Cases should not sit for years because there are too few judges and staff.',
  },
  public_defenders: {
    less: 'Costs should be checked regularly so the money is used efficiently.',
    more: 'The right to a lawyer means little if defenders have too many cases to handle them well.',
  },
  cfpb: {
    less: 'This agency has too much power and too little accountability to Congress.',
    more: 'Families need a regulator on their side against hidden fees and predatory lending.',
  },
  mbda: {
    less: 'Federal business programs should be open to everyone, regardless of race.',
    more: 'Minority-owned businesses still have a harder time getting capital and contracts, and this help is small but useful.',
  },
};

/** Used for any line without its own reason, such as an "other" residual. */
export const DEFAULT_REASON = {
  less: 'I do not think it is the best use of what I pay.',
  more: 'I think it deserves a bigger share of what I pay.',
};
