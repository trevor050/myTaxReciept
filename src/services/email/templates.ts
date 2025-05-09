
/**
 * @fileOverview Stores constants and template strings used for generating representative emails.
 * Includes variations for tone, action, rationale, and structure.
 * Expanded with more options and refined phrasing.
 */

import type {
    Tone, FundingLevel, FundingActionRationale, EmailTemplates, ActionPhrases,
    RationaleOptions, CategoryIntroPhrases
} from './types';

// --- SUBJECT Lines ---
export const SUBJECT: EmailTemplates<string> = {
  0: "Perspective on Federal Budget Priorities",
  1: "Concerns on Federal Spending Allocations",
  2: "Urgent: Reevaluate Budget & Debt",
  3: "Action Demanded: Federal Spending",
};

// --- OPENING Paragraphs ---
export const OPENING: EmailTemplates<(loc: string) => string> = {
  0: loc => `As a constituent in ${loc || '[Your Area]'}, I am writing to share my perspective on federal tax dollar allocation. Thoughtful discussion is key.`,
  1: loc => `I am a constituent from ${loc || '[Your Area]'} with concerns about federal spending. Current distributions raise questions on efficiency and community values.`,
  2: loc => `From ${loc || '[Your Area]'}, I register my strong dissatisfaction with current federal spending. Priorities must be reevaluated for public good.`,
  3: loc => `From ${loc || '[Your Area]'}, I demand immediate action on the federal budget. Current spending is fiscally irresponsible and needs your intervention.`,
};

// --- INTRODUCTIONS to the list of items ---
export const LIST_INTRO: EmailTemplates<string[]> = {
  0: [
    "Specific areas I believe warrant closer examination:",
    "Reflecting on budget priorities, these allocations stand out:",
    "My review of federal spending brings these items to my attention:",
    "Regarding the budget, my perspective on these areas:",
  ],
  1: [
    "Several budget items cause me significant concern:",
    "I am particularly troubled by funding for these programs:",
    "These expenditures raise serious questions:",
    "I am concerned about these budget allocations:",
  ],
  2: [
    "These programs demand significant reassessment:",
    "Several areas of the budget appear deeply problematic:",
    "It is hard to justify current funding for these items:",
    "These spending decisions are particularly concerning:",
  ],
  3: [
    "These are glaring examples of misplaced priorities needing action:",
    "The following expenditures are unacceptable uses of taxpayer funds:",
    "These funding decisions exemplify fiscal irresponsibility:",
    "Current allocations for these items are flawed and require reform:",
  ]
};

// --- ACTION Phrases (indexed by fundingLevel + tone bucket) ---
// Made more concise.
export const ACTION_PHRASES: Record<FundingLevel, EmailTemplates<string>> = {
    [-2]: { // Slash Heavily
        0: "could be significantly reduced or phased out.",
        1: "funding seems excessive and needs substantial cuts.",
        2: "must be drastically scaled back; this is hard to justify.",
        3: "must be eliminated or reformed; this spending is unacceptable.",
    },
    [-1]: { // Cut Significantly
        0: "could likely be reduced without compromising essentials.",
        1: "should undergo significant cuts; savings are possible.",
        2: "demands sharp reduction for fiscal responsibility.",
        3: "needs an aggressive cut for prudent fund use.",
    },
    [0]: { // Improve Efficiency / Maintain with Oversight
        0: "funding could be maintained with more emphasis on efficiency.",
        1: "can continue at current levels, with rigorous oversight.",
        2: "funding might remain, but only if waste is cut and metrics met.",
        3: "is questionable; acceptable only with strict audits and results.",
    },
    [1]: { // Fund / Modest Increase
        0: "deserves stable, perhaps modestly increased, funding.",
        1: "should receive reliable support, possibly with a moderate increase.",
        2: "warrants a funding boost to strengthen capabilities.",
        3: "requires a clear resource increase to address needs.",
    },
    [2]: { // Fund More / Substantial Increase
        0: "merits substantial funding increase; benefits are significant.",
        1: "needs robust new investment to expand its impact.",
        2: "should be prioritized for major funding growth.",
        3: "demands urgent, considerable expansion; underfunding is shortsighted.",
    }
};


// --- RATIONALE Snippets ---
// Shortened significantly.
export const SPECIFIC_RATIONALES: RationaleOptions = {
    medicaid_cut: ["Enhance Medicaid's fiscal sustainability.", "Target Medicaid resources more effectively.", "Control rising Medicaid costs responsibly."],
    medicaid_fund: ["Expand Medicaid to improve health outcomes.", "Medicaid is essential for low-income individuals.", "Strengthen community health via Medicaid."],
    medicaid_review: ["Prevent Medicaid fraud, waste, and abuse.", "Evaluate Medicaid delivery models for efficiency.", "Focus Medicaid on high-value preventative care."],
    medicare_cut: ["Address Medicare's solvency by negotiating drug prices.", "Improve Medicare cost-effectiveness (e.g., competitive bidding).", "Scrutinize Medicare spending to prevent overutilization."],
    medicare_fund: ["Ensure comprehensive healthcare for seniors via Medicare.", "Strengthen Medicare with essential benefits (dental, vision).", "Medicare is vital for seniors' health and financial stability."],
    medicare_review: ["Combat Medicare fraud, waste, and abuse.", "Refine Medicare payment systems for patient-centered care.", "Promote value-based care in Medicare."],
    nih_cut: ["Prioritize NIH funding for high-impact research.", "Ensure NIH grants avoid duplication, target innovation.", "Streamline NIH grant administration for efficiency."],
    nih_fund: ["Invest in NIH for medical breakthroughs.", "NIH funding is key for tackling major diseases.", "Support basic science research via NIH."],
    nih_review: ["Refine NIH grant review for fairness and innovation.", "Foster collaboration and open science via NIH.", "Direct NIH resources to address health disparities."],
    cdc_cut: ["Focus CDC on core public health: surveillance, emergency response.", "Evaluate CDC programs for tangible health benefits.", "Streamline CDC operations, reduce overhead."],
    cdc_fund: ["A fully funded CDC is vital for pandemic preparedness.", "Invest in CDC data systems and lab capacity.", "Support CDC's global health security efforts."],
    cdc_review: ["Improve CDC guidance clarity during health emergencies.", "Enhance CDC communication and transparency.", "Ensure CDC maintains scientific integrity."],
    substance_mental_health_cut: ["Prioritize mental health/substance use funds for evidence-based treatments.", "Avoid duplication in federal mental health initiatives.", "Target resources to programs reducing overdose deaths."],
    substance_mental_health_fund: ["Increase investment to address mental health/addiction crises.", "Expand access to affordable mental healthcare.", "Invest in the behavioral health workforce."],
    substance_mental_health_review: ["Improve coordination among mental health agencies.", "Enforce mental health parity laws fully.", "Evaluate effectiveness of different treatment models."],

    pentagon_cut: ["Reduce the immense Pentagon budget.", "Audit Pentagon spending to eliminate waste.", "Shift funds from unproven weapons to readiness."],
    pentagon_fund: ["Ensure strong national defense with sufficient funding.", "Invest in advanced military capabilities.", "Provide troops with best equipment and support."],
    pentagon_review: ["Oversee Pentagon spending to prevent waste/fraud.", "Reform Pentagon's acquisition process.", "Reassess global strategic priorities regularly."],
    pentagon_contractors_cut: ["Reduce Pentagon reliance on expensive contractors.", "Save billions by insourcing contractor functions.", "Require more competition in defense services."],
    pentagon_contractors_review: ["Enhance transparency in defense contracting.", "Prevent waste/fraud in defense contracts.", "Evaluate cost-effectiveness of outsourcing vs. government personnel."],
    pentagon_personnel_cut: ["Review military personnel costs for efficiencies.", "Optimize military force structure for modern threats.", "Balance tech investments with personnel costs."],
    pentagon_personnel_fund: ["Ensure competitive pay and benefits for military personnel.", "Invest in service member well-being and training.", "Adequate personnel funding impacts morale and retention."],
    pentagon_personnel_review: ["Review military compensation for competitiveness.", "Improve healthcare access for military families.", "Streamline personnel management processes."],
    pentagon_top5_contractors_cut: ["Promote competition beyond top 5 defense firms.", "Reduce contract concentration among largest firms.", "Scrutinize large, sole-source contracts to top firms."],
    pentagon_top5_contractors_review: ["Oversee relationship between Pentagon and largest contractors.", "Evaluate risks of relying on few dominant defense firms.", "Promote opportunities for smaller, innovative companies."],
    nuclear_weapons_cut: ["Curtail exorbitant cost of nuclear arsenal modernization.", "Reduce reliance on specific nuclear triad legs.", "Question rationale for costly new nuclear programs."],
    nuclear_weapons_fund: ["Modernize aging nuclear triad for deterrence.", "Ensure safety and reliability of nuclear stockpile.", "Maintain credible nuclear deterrent while others possess them."],
    nuclear_weapons_review: ["Review costs/implications of nuclear modernization.", "Ensure robust command/control for nuclear arsenal.", "Balance nuclear investments with conventional forces."],
    foreign_military_aid_cut: ["Reduce military aid fueling conflicts/supporting autocrats.", "Advanced weaponry abroad can entangle the U.S.", "Reallocate military aid to diplomacy/development."],
    foreign_military_aid_fund: ["Strategic military aid can strengthen key allies.", "Security assistance helps partners counter threats.", "Military aid can build important relationships."],
    foreign_military_aid_review: ["Condition military aid on human rights/end-use monitoring.", "Evaluate strategic effectiveness of aid packages.", "Ensure transparency in military aid recipients/types."],
    israel_wars_cut: ["Reassess large, unconditional military aid to Israel.", "Compare aid to Israel with domestic needs.", "Condition aid to Israel on international law compliance."],
    israel_wars_fund: ["Support Israel's security via military aid (stated U.S. policy).", "Fund defensive systems like Iron Dome.", "Security aid to Israel can offer mutual benefits (intel)."],
    israel_wars_review: ["Assess aid's impact on regional stability/Palestinian rights.", "Ensure transparency in U.S. military aid use by Israel.", "Balance strategic partnership with broader U.S. interests."],
    f35_cut: ["Cut F-35 funding due to cost overruns/delays.", "Reduce total planned F-35 procurement.", "Address F-35 affordability/high operating costs."],
    f35_review: ["Independently test F-35 performance/reliability.", "Hold Lockheed Martin accountable for F-35 costs/milestones.", "Ensure F-35 delivers promised capabilities affordably."],
    pentagon_spacex_cut: ["Strengthen justification/transparency for Pentagon-SpaceX contracts.", "Ensure fair competition in national security space launch.", "Question subsidies for established commercial space ventures."],
    pentagon_spacex_review: ["Ensure robust oversight for commercial space missions.", "Demand transparency on costs/terms of Pentagon-commercial contracts.", "Assess long-term strategy of using commercial partners."],
    pentagon_dei_cut: ["Evaluate Pentagon DEI initiatives for mission relevance.", "Justify DEI programs by military readiness outcomes.", "Ensure DEI focuses on equal opportunity/meritocracy."],
    pentagon_dei_fund: ["DEI can enhance readiness by attracting diverse talent.", "Inclusive environments strengthen military effectiveness.", "DEI can address discrimination and improve unit cohesion."],
    pentagon_dei_review: ["Define clear goals/metrics for Pentagon DEI programs.", "Ensure DEI training is evidence-based and mission-focused.", "Balance DEI goals with military readiness priorities."],

    va_cut: ["Improve VA efficiency, reduce bureaucracy.", "Modernize VA IT systems and scheduling.", "Ensure accountability for VA performance/spending."],
    va_fund: ["Robust VA funding for healthcare/benefits is crucial.", "Invest in VA to expand access, hire providers.", "Adequate VA funding for GI Bill, disability comp."],
    va_review: ["Improve VA disability claims processing timeliness.", "Enhance access to mental healthcare for veterans.", "Ensure seamless VA-DoD coordination for transitions."],
    pact_act_fund: ["Fully fund PACT Act for veterans exposed to toxins.", "Ensure VA resources for PACT Act claims/care.", "Robust outreach for PACT Act benefits."],
    pact_act_review: ["Monitor PACT Act implementation progress.", "Research long-term health effects of toxic exposures.", "Train providers on toxic exposure presumptive conditions."],

    tanf_cut: ["Evaluate TANF for promoting self-sufficiency.", "Ensure meaningful TANF work requirements.", "Reduce states' diversion of TANF funds."],
    tanf_fund: ["Strengthen cash safety net with adequate TANF funding.", "Invest in TANF job training/barrier removal.", "Adjust TANF benefits for inflation."],
    tanf_review: ["Evaluate impact of TANF time limits/sanctions.", "Improve data collection on TANF outcomes.", "Ensure TANF programs are flexible for diverse needs."],
    child_tax_credit_cut: ["Review expanded CTC for fiscal sustainability.", "Explore strengthening CTC work requirements.", "Balance CTC poverty reduction with cost/labor impact."],
    child_tax_credit_fund: ["Expand/make permanent enhanced CTC to cut child poverty.", "Make full CTC available to lowest-income families.", "CTC helps families cover essentials."],
    child_tax_credit_review: ["Simplify CTC claiming for low/no-income families.", "Evaluate CTC impact on parental employment.", "Ensure CTC interacts effectively with other safety nets."],
    refugee_assistance_cut: ["Manage refugee resettlement costs efficiently.", "Ensure adequate security screening with resettlement.", "Balance humanitarian commitments with fiscal capacity."],
    refugee_assistance_fund: ["Resource refugee resettlement reflecting U.S. values.", "Invest in refugee integration programs.", "Support robust refugee assistance for U.S. leadership."],
    refugee_assistance_review: ["Improve coordination in refugee support services.", "Evaluate long-term outcomes of resettled refugees.", "Ensure programs are flexible for fluctuating arrivals."],
    liheap_cut: ["Target LIHEAP funds to most vulnerable households.", "Fund energy efficiency alongside bill assistance.", "Ensure LIHEAP supplements, not replaces, responsibility."],
    liheap_fund: ["LIHEAP is crucial for preventing utility shutoffs.", "Adequate LIHEAP funding for low-income energy needs.", "Support LIHEAP weatherization for long-term savings."],
    liheap_review: ["Streamline LIHEAP application process.", "Ensure equitable LIHEAP fund distribution.", "Coordinate LIHEAP with other assistance programs."],
    nlrb_cut: ["Review NLRB for fairness/impartiality.", "Evaluate if NLRB structure suits modern economy.", "Question NLRB actions perceived as overreach."],
    nlrb_fund: ["Fund NLRB to protect workers' right to organize.", "Resource NLRB for prompt investigations/elections.", "Strong NLRB ensures fair employer-employee balance."],
    nlrb_review: ["Improve NLRB case processing speed/fairness.", "Ensure NLRB decisions are consistent/well-reasoned.", "Adapt NLRB rules for emerging workforce challenges."],

    dept_education_cut: ["Limit federal role in K-12; respect state/local authority.", "Consolidate duplicative federal education programs.", "Evaluate burdensome federal education mandates."],
    dept_education_fund: ["Invest in education via DoE for equal opportunity.", "DoE vital for equity, civil rights, disadvantaged students.", "Federal funding supports IDEA, Title I."],
    dept_education_review: ["Simplify federal grant applications for schools.", "Improve data on federal education program outcomes.", "Ensure robust enforcement of civil rights in education."],
    college_aid_cut: ["Reform college aid to address soaring tuition causes.", "Simplify student aid; target grants to needy students.", "Hold colleges accountable for student outcomes."],
    college_aid_fund: ["Expand access to affordable higher education.", "Reduce student loan debt burden.", "Simplify FAFSA application process."],
    college_aid_review: ["Review student loan rates, repayment, forgiveness.", "Evaluate effectiveness of grants, loans, work-study.", "Ensure aid supports quality, not predatory, institutions."],
    k12_schools_cut: ["Federal K-12 funding should supplement state/local.", "Reduce federal mandates; return control to states/districts.", "Consolidate overlapping federal K-12 grant programs."],
    k12_schools_fund: ["Target federal K-12 funding for under-resourced districts.", "Invest in quality teachers, infrastructure, learning resources.", "Federal support (Title I, IDEA) promotes equity."],
    k12_schools_review: ["Ensure federal K-12 funds improve student outcomes.", "Evaluate impact of federal education laws like ESSA.", "Promote innovation via targeted federal initiatives."],
    cpb_cut: ["Scrutinize federal CPB funding in diverse media landscape.", "Address persistent questions of bias in public broadcasting.", "Encourage public broadcasting reliance on private/local support."],
    cpb_fund: ["CPB funds essential non-commercial educational programming.", "Public broadcasting serves rural/underserved communities.", "Federal support helps ensure editorial independence."],
    cpb_review: ["Ensure fair/transparent CPB fund distribution.", "Strengthen safeguards for public broadcasting objectivity.", "Assess public broadcasting's role in digital age."],
    imls_cut: ["Target IMLS grants for broadest national impact.", "Evaluate outcomes of IMLS funding for ROI.", "Consider if IMLS functions could be absorbed elsewhere."],
    imls_fund: ["IMLS provides crucial support for libraries/museums.", "IMLS funding helps bridge digital divide.", "Federal IMLS support often leverages other funding."],
    imls_review: ["Ensure IMLS grants accessible to all institutions.", "Focus IMLS on digital literacy, STEM, preservation.", "Improve data on IMLS-funded program impact."],

    snap_cut: ["Reform SNAP with stronger work requirements.", "Ensure SNAP benefits for nutritious food.", "Tighten SNAP eligibility/income verification."],
    snap_fund: ["SNAP is most effective anti-hunger program.", "Strengthen SNAP to reflect healthy diet costs.", "Maintain broad SNAP eligibility for stability."],
    snap_review: ["Simplify SNAP application/recertification.", "Improve SNAP E&T program effectiveness.", "Ensure SNAP benefits reflect current food costs."],
    school_lunch_cut: ["Review school lunch standards for practicality/appeal.", "Target school meal aid to genuinely needy students.", "Explore efficient alternatives for school meals."],
    school_lunch_fund: ["Expand access to free school meals for all students.", "Invest in universal free school meals.", "Support schools procuring fresh, local foods."],
    school_lunch_review: ["Improve nutritional quality/appeal of school meals.", "Streamline free/reduced-price meal applications.", "Ensure adequate federal reimbursement for schools."],
    fsa_cut: ["Reform outdated FSA farm subsidy programs.", "Limit FSA payments to large, profitable corporations.", "Phase out commodity programs distorting markets."],
    fsa_fund: ["FSA provides crucial support for family farmers.", "Fund FSA loans for new/underserved producers.", "Invest in FSA conservation programs (CRP, EQIP)."],
    fsa_review: ["Improve FSA program accessibility for small farmers.", "Ensure timely/equitable FSA disaster assistance.", "Evaluate commodity support vs. crop insurance."],
    wic_cut: ["Review WIC administrative costs for efficiency.", "Target WIC effectively to at-risk women/children.", "Coordinate WIC with other health/nutrition programs."],
    wic_fund: ["WIC provides critical nutritional support.", "Fully fund WIC to serve all eligible participants.", "WIC is cost-effective, improves health outcomes."],
    wic_review: ["Modernize WIC food packages per dietary guidelines.", "Improve WIC shopping experience (EBT, apps).", "Strengthen WIC nutrition education/counseling."],

    fdic_review: ["Ensure FDIC effectively manages Deposit Insurance Fund.", "Maintain public confidence via FDIC independence/competence.", "Evaluate FDIC resources for handling bank failures."],
    irs_cut: ["Prioritize IRS funding for efficient tax admin/service.", "Address concerns of IRS overreach/targeting.", "Simplify tax code for better compliance."],
    irs_fund: ["Fund IRS to close 'tax gap' from wealthy/corporations.", "Invest in IRS modernization (IT, taxpayer service).", "Effective IRS enforcement on high-income evasion yields revenue."],
    irs_review: ["Ensure fair/ethical IRS resource use via oversight.", "Dramatically improve IRS taxpayer service.", "Strengthen taxpayer rights/due process in IRS actions."],
    federal_courts_cut: ["Review federal court operations for efficiencies.", "Promote ADR to reduce judicial caseloads/costs.", "Budget judiciary carefully without compromising function."],
    federal_courts_fund: ["Fund federal judiciary for effective justice admin.", "Invest in courts for timely access to justice.", "Resource judicial security adequately."],
    federal_courts_review: ["Address judicial vacancies promptly.", "Improve court access for low-income individuals.", "Modernize court technology/cybersecurity."],
    public_defenders_fund: ["Fund federal public defenders for right to counsel.", "Address underfunded public defense systems.", "Invest equitably in public defense (parity with prosecution)."],
    public_defenders_review: ["Address high public defender caseloads.", "Promote pay parity for public defenders/prosecutors.", "Evaluate models for indigent defense services."],
    usps_review: ["Reform congressional mandates on USPS finances.", "Support USPS modernization (fleet, operations).", "Allow USPS flexibility in service/pricing."],
    cfpb_review: ["Ensure transparent/data-driven CFPB rulemaking.", "Improve CFPB coordination with other regulators.", "Evaluate CFPB enforcement effectiveness."],
    mbda_review: ["Improve access to capital for minority businesses.", "Strengthen MBDA/SBA/Treasury partnerships.", "Enhance data on minority business challenges/successes."],
    usich_review: ["Evaluate USICH effectiveness in coordinating homeless response.", "Ensure USICH plan promotes Housing First.", "Strengthen USICH authority for interagency collaboration."],

    fema_cut: ["Review FEMA disaster response for efficiency/cost control.", "Prioritize FEMA funds for life-saving/essential recovery.", "Balance federal aid with state/local preparedness."],
    fema_fund: ["Robust FEMA funding for increasing disaster frequency.", "Invest in FEMA operational capacity for timely aid.", "Support FEMA pre-disaster mitigation (BRIC)."],
    fema_review: ["Improve speed/equity of FEMA individual assistance.", "Strengthen FEMA coordination with state/local/tribal govts.", "Ensure FEMA programs promote climate resilience."],
    fema_drf_review: ["Improve transparency of DRF balances/expenditures.", "Ensure DRF funding formulas are equitable/responsive.", "Evaluate long-term DRF solvency/sustainability."],
    hud_cut: ["Evaluate HUD programs for effectiveness/consolidation.", "Streamline HUD bureaucracy/regulations.", "Critically evaluate HUD program cost-effectiveness."],
    hud_fund: ["Increase HUD investment to tackle housing crisis.", "Expand HUD rental assistance (Section 8).", "Invest in affordable housing development/preservation."],
    hud_review: ["Improve HUD rental assistance efficiency/success.", "Address public housing capital repair backlog.", "Ensure HUD programs affirmatively further fair housing."],
    head_start_cut: ["Evaluate Head Start for long-term student impact.", "Improve quality standards across Head Start centers.", "Ensure Head Start complements state pre-K programs."],
    head_start_fund: ["Head Start provides critical early childhood services.", "Expand Head Start access to close achievement gaps.", "Adequate Head Start funding for quality/staffing."],
    head_start_review: ["Strengthen Head Start performance standards.", "Improve Head Start/K-12 coordination.", "Enhance support/training for Head Start workforce."],
    public_housing_cut: ["Explore alternatives to traditional public housing.", "Improve public housing management/cost efficiency.", "Shift towards tenant-based aid like vouchers."],
    public_housing_fund: ["Address public housing capital repair backlog.", "Invest in preserving existing public housing.", "Fund resident services/security in public housing."],
    public_housing_review: ["Implement strategies to improve public housing safety.", "Promote resident involvement/self-sufficiency.", "Explore mixed-finance models for public housing revitalization."],

    epa_cut: ["Balance EPA rules with economic impacts.", "Streamline EPA permitting processes.", "Evaluate EPA rule cost-effectiveness/necessity."],
    epa_fund: ["Fund EPA for climate change, pollution challenges.", "Invest in EPA enforcement of environmental laws.", "Support EPA scientific research."],
    epa_review: ["Improve EPA permitting timeliness/predictability.", "Ensure EPA rules based on best science/cost-benefit.", "Strengthen EPA environmental justice efforts."],
    forest_service_cut: ["Review Forest Service operations for efficiencies.", "Balance forest protection with sustainable economic uses.", "Prioritize Forest Service for wildfire prevention."],
    forest_service_fund: ["Increase Forest Service funding for wildfire crisis.", "Invest in national forest health/resilience.", "Adequate resources for Forest Service sustainable management."],
    forest_service_review: ["Improve scale/effectiveness of hazardous fuels reduction.", "Strengthen wildfire prevention/response partnerships.", "Ensure adequate pay/benefits for wildland firefighters."],
    noaa_cut: ["Evaluate NOAA for duplication with other agencies/private sector.", "Prioritize NOAA for weather forecasting, storm warnings.", "Ensure efficiency in NOAA satellite/data programs."],
    noaa_fund: ["NOAA provides life-saving weather forecasts/warnings.", "Invest in NOAA weather prediction (satellites, supercomputers).", "Support NOAA research on oceans, climate, atmosphere."],
    noaa_review: ["Improve NOAA weather forecast accuracy/timeliness.", "Enhance NOAA role in coastal resilience/climate adaptation.", "Ensure sustainable fisheries management via NOAA science."],
    renewable_energy_cut: ["Phase out subsidies for mature renewable tech (solar, wind).", "Focus federal energy R&D on breakthrough tech.", "Evaluate cost-effectiveness of DOE renewable programs."],
    renewable_energy_fund: ["Invest in renewable deployment/grid modernization.", "Support renewables via tax credits/grants for jobs/security.", "Modernize electric grid for renewable integration."],
    renewable_energy_review: ["Ensure federal renewable programs drive innovation/cost cuts.", "Streamline permitting for renewable projects/transmission.", "Target investments in advanced renewables/storage."],
    nps_cut: ["Review NPS operations for efficiencies.", "Increase reliance on visitor fees/partnerships for parks.", "Prioritize NPS for deferred maintenance backlog."],
    nps_fund: ["Fund NPS to protect natural/cultural heritage.", "Address NPS deferred maintenance backlog.", "Invest in National Parks to preserve resources."],
    nps_review: ["Develop sustainable funding for NPS maintenance.", "Manage increasing park visitor numbers sustainably.", "Enhance park interpretive programs/visitor services."],

    diplomacy_cut: ["Review State Dept. operations for efficiencies.", "Evaluate necessity/effectiveness of diplomatic programs.", "Balance diplomacy/aid with domestic needs/defense."],
    diplomacy_fund: ["Fund diplomacy/development for U.S. influence/stability.", "Invest in professional diplomatic corps.", "Support public diplomacy for mutual understanding."],
    diplomacy_review: ["Ensure State/USAID address global challenges effectively.", "Modernize diplomatic tools/communication.", "Strengthen State/USAID/DoD/intel agency coordination."],
    usaid_cut: ["Oversee USAID programs for effectiveness/value.", "Focus foreign aid on measurable, sustainable outcomes.", "Reduce USAID administrative overhead/contracting costs."],
    usaid_fund: ["USAID addresses global poverty, improves health, education.", "Invest in development/democracy via USAID for security.", "Fund USAID for humanitarian crisis response."],
    usaid_review: ["Improve measurement/reporting of USAID outcomes.", "Strengthen local partnerships for sustainable solutions.", "Ensure USAID safeguards against corruption/waste."],
    usaid_climate_cut: ["Evaluate U.S. international climate aid for results/waste.", "Prioritize climate finance for high-impact projects.", "Demand transparency/accountability in climate aid use."],
    usaid_climate_fund: ["U.S. leadership/finance for international climate efforts.", "Climate finance helps developing countries mitigate emissions.", "Invest in climate adaptation assistance abroad."],
    usaid_climate_review: ["Align U.S. climate aid with development goals.", "Improve coordination of climate finance across agencies.", "Develop robust MRV for international climate projects."],

    deportations_border_cut: ["Focus border resources on humane processing/root causes.", "Review cost/effectiveness of immigrant detention.", "Prioritize interior enforcement on public safety risks."],
    deportations_border_fund: ["Resource border security (personnel, tech, infrastructure).", "Fund ICE for interior enforcement/removals.", "Invest in border security for national sovereignty."],
    deportations_border_review: ["Ensure humane treatment/due process in immigration enforcement.", "Improve efficiency/reduce backlog in immigration courts.", "Enhance CBP/ICE/HHS/DOJ coordination."],
    federal_prisons_cut: ["Implement reforms to safely lower incarceration rates.", "Expand alternatives to imprisonment.", "Improve prison rehab/education/job training."],
    federal_prisons_fund: ["Ensure safe/secure/humane federal prisons.", "Invest in prison education/vocational/substance abuse programs.", "Address correctional officer understaffing."],
    federal_prisons_review: ["Reduce violence/contraband in federal prisons.", "Enhance oversight of inmate healthcare.", "Improve reentry programs (housing, employment)."],

    highways_cut: ["Prioritize highway funds for maintenance ('fix-it-first').", "Ensure states use highway funds efficiently.", "Balance highway investments with transit/walking/biking."],
    highways_fund: ["Invest in modernizing aging highway infrastructure.", "Predictable highway funding for large projects.", "Highway improvements enhance safety, reduce congestion."],
    highways_review: ["Prioritize highway funds for safety/congestion/economic returns.", "Streamline environmental review for infrastructure.", "Incorporate tech for traffic flow/safety."],
    public_transit_cut: ["Prioritize transit funds for high-ridership systems.", "Encourage local/state funding for transit.", "Evaluate cost-effectiveness of new transit expansions."],
    public_transit_fund: ["Invest in public transit to cut congestion/emissions.", "Fund transit for safe, reliable service/good repair.", "Support transit for access for seniors, disabled, low-income."],
    public_transit_review: ["Improve transit frequency, reliability, speed.", "Integrate transit with local land use planning.", "Ensure transit accessibility (ADA compliant)."],
    tsa_cut: ["Review TSA screening for efficiencies.", "Evaluate cost-effectiveness of TSA tech.", "Ensure TSA staffing deployed efficiently."],
    tsa_fund: ["Maintain robust aviation security via TSA funding.", "Invest in advanced screening tech (CT scanners).", "Provide competitive pay/training for TSA officers."],
    tsa_review: ["Balance security screening with passenger facilitation.", "Adapt security to evolving threats.", "Improve TSA/FBI/intel agency coordination."],
    faa_cut: ["Ensure FAA efficiency (NextGen ATC modernization).", "Evaluate necessity of FAA programs.", "Streamline aircraft certification processes."],
    faa_fund: ["Fund FAA for safe/efficient national airspace.", "Resource FAA for safety oversight (airlines, mfrs).", "Invest in NextGen ATC modernization."],
    faa_review: ["Address air traffic controller staffing shortages.", "Accelerate NextGen ATC implementation.", "Strengthen FAA oversight of aircraft manufacturing."],
    amtrak_cut: ["Scrutinize Amtrak subsidies, especially long-distance.", "Focus rail investments on high-ridership corridors.", "Explore private sector involvement in passenger rail."],
    amtrak_fund: ["Invest in modern national passenger rail via Amtrak.", "Fund Amtrak to upgrade infrastructure, modernize fleet.", "Support passenger rail to connect communities."],
    amtrak_review: ["Improve Amtrak on-time performance, customer service.", "Develop long-term, sustainable national rail plan.", "Ensure fair track access for Amtrak on freight lines."],

    nasa_cut: ["Prioritize NASA budget on core science/exploration.", "Evaluate cost of human spaceflight vs. robotic.", "Demand cost control/schedule discipline in NASA projects."],
    nasa_fund: ["Invest in NASA for scientific discovery, tech innovation.", "Fund NASA missions to explore solar system/universe.", "Support NASA for U.S. leadership in space."],
    nasa_review: ["Ensure NASA maintains balanced mission portfolio.", "Improve cost estimation/oversight for NASA flagships.", "Strengthen commercial space partnerships."],
    nsf_cut: ["Ensure NSF grants target fundamental, high-impact research.", "Balance NSF funding across disciplines.", "Minimize administrative burden of NSF grants."],
    nsf_fund: ["NSF funds essential fundamental research.", "Invest in basic science via NSF for competitiveness.", "Support NSF programs for STEM participation."],
    nsf_review: ["Maintain integrity of NSF peer review process.", "Enhance NSF role in translating research to applications.", "Strengthen support for STEM education initiatives."],
    nasa_spacex_cut: ["Oversee NASA's reliance on commercial partners like SpaceX.", "Foster competition among commercial space providers.", "Evaluate public-private partnerships vs. government capabilities."],
    nasa_spacex_review: ["Ensure safety/oversight for commercial crew/cargo missions.", "Maintain transparency in NASA commercial partnership costs.", "Balance commercial partnerships with NASA internal capabilities."],

    default_cut: [
        "This program's funding seems high for its outcomes.",
        "Resources here might be better used elsewhere.",
        "This area's funding needs review for savings.",
    ],
    default_fund: [
        "Adequate investment here is key for its mission.",
        "More resources could unlock greater public benefit.",
        "This program deserves consistent federal support.",
    ],
    default_review: [
        "This program's spending and performance need examination.",
        "Oversight is needed to confirm taxpayer value.",
        "An independent evaluation of this program's efficiency is due.",
    ],
};


// --- Paragraph about BUDGET/DEBT ---
// Shortened.
export const BUDGET_DEBT: EmailTemplates<string> = {
    0: "Additionally, Congress should focus on long-term fiscal responsibility and a sustainable budget.",
    1: "Beyond specifics, I urge prioritizing fiscal sustainability and addressing national debt.",
    2: "Furthermore, the national debt cannot be ignored. Fiscal discipline must guide every spending decision.",
    3: "Critically, the soaring national debt threatens our economic future. An aggressive debt-reduction plan is vital.",
};

// --- CALL TO ACTION ---
// Shortened.
export const CALL_TO_ACTION: EmailTemplates<string> = {
    0: "Could you share your perspective on these funding issues? I appreciate your time and service.",
    1: "Please outline steps to address these concerns and promote fiscal responsibility. Keep constituents informed.",
    2: "I expect a detailed response on actions you'll champion to fix these priorities and curb debt.",
    3: "I demand a prompt action plan to realign spending and tackle the national debt. Decisive action is needed.",
};

// --- Sentence openers to introduce an item's funding level ---
// Made more concise.
export const ITEM_OPENERS: Record<FundingActionRationale, string[]> = {
    cut: [
        "Regarding {ITEM}, it",
        "For {ITEM}, its funding",
        "The {ITEM} allocation",
        "Funding for {ITEM}",
        "Concerning {ITEM}, its budget",
    ],
    fund: [
        "Regarding {ITEM}, investment",
        "For {ITEM}, its funding",
        "Supporting {ITEM} means its budget",
        "Considering {ITEM}, its funding",
        "Investment in {ITEM}",
    ],
    review: [
        "Funding for {ITEM}",
        "With respect to {ITEM}, its budget",
        "Oversight of {ITEM} means its funding",
        "The {ITEM} allocation",
        "For {ITEM}, efficiency means its budget",
    ]
};


// --- Connectors between action phrase and rationale ---
// Shortened.
export const RATIONALE_CONNECTORS: EmailTemplates<string[]> = {
    0: ["; specifically,", "; for instance,", ", as", ", because", ". I believe", ". This is important as", ". Specifically,"],
    1: ["; specifically,", "; for example,", ", given that", ", particularly as", ". This is concerning as", ". The rationale being", ". Specifically,"],
    2: ["; specifically,", "; namely,", ". Simply put,", ". To be precise,", ". This is because", ". The justification:", ". Clearly,"],
    3: ["; specifically,", ". In fact,", ". The reality is,", ". This is unacceptable as", ". The justification is clear:", ". Bluntly,"],
};

// --- Phrases to introduce categories ---
// Made more concise.
export const CATEGORY_INTRO_PHRASES: CategoryIntroPhrases = {
    default: [
        "Regarding {CATEGORY}:",
        "For {CATEGORY} funding:",
        "On {CATEGORY} spending:",
        "Within the {CATEGORY} budget:",
    ],
    "War and Weapons": [
        "On defense and military spending:",
        "For the {CATEGORY} budget:",
        "My concerns about {CATEGORY}:",
    ],
     "Health": [
        "For {CATEGORY} funding:",
        "On national {CATEGORY} priorities:",
        "Regarding federal {CATEGORY} programs:",
    ],
     "Interest on Debt": [
        "The amount for {CATEGORY} is concerning:",
        "Addressing {CATEGORY} requires focus:",
        "Payments towards {CATEGORY} warrant attention:",
    ],
     "Education": [
         "On federal {CATEGORY} programs:",
         "Regarding investments in {CATEGORY}:",
         "For {CATEGORY} policy:",
    ],
    "Housing and Community": [
         "For {CATEGORY} development:",
         "On federal support for {CATEGORY}:",
         "Regarding {CATEGORY} needs:",
    ],
    "Veterans": [
         "On our commitment to {CATEGORY}:",
         "For the needs of {CATEGORY}:",
         "Regarding funding for {CATEGORY} benefits:",
    ],
    "Food and Agriculture": [
         "For {CATEGORY} policy and nutrition:",
         "On federal spending for {CATEGORY}:",
         "Regarding our {CATEGORY} system:",
    ],
    "Unemployment and Labor": [
         "For programs related to {CATEGORY}:",
         "On support for workers and {CATEGORY}:",
         "Regarding labor protections and safety net:",
    ]
};

// --- Phrases to connect sentences *within* a category paragraph ---
// Made more concise.
export const INTRA_PARAGRAPH_CONNECTORS: string[] = [
    "Additionally,", "Furthermore,", "Moreover,", "Similarly,", "Also,", "Specifically,", "Notably,", "In this vein,"
];

// --- Closing salutations ---
export const SALUTATIONS: string[] = [
    "Sincerely,", "Respectfully,", "Regards,", "Thank you,"
];

