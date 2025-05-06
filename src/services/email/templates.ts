/**
 * @fileOverview Stores constants and template strings used for generating representative emails.
 */

import type { SelectedItem } from '@/services/tax-spending'; // Import necessary types

// --- Tone Buckets ---
export type Tone = 0 | 1 | 2 | 3; // 0: Polite, 1: Concerned, 2: Stern, 3: Angry

// --- Email Components ---

// SUBJECT Lines
export const SUBJECT: Record<Tone, string> = {
  0: "A Constituent's Perspective on Federal Budget Priorities",
  1: "Concerns Regarding Specific Federal Spending Allocations",
  2: "Urgent Request: Reevaluate Federal Budget Priorities and Debt",
  3: "Demand for Immediate Action: Federal Spending & Fiscal Responsibility",
};

// OPENING Paragraphs
export const OPENING: Record<Tone, (loc: string) => string> = {
  0: loc => `I hope this message finds you well. As a concerned constituent residing in ${loc || '[Your Area]'}, I am writing to respectfully share my perspective on the current allocation of federal tax dollars. I believe thoughtful discussion about these priorities is essential for effective governance.`,
  1: loc => `I am writing to you today as a constituent from ${loc || '[Your Area]'} with growing concerns about federal spending patterns. Analyzing how our tax money is distributed raises important questions about efficiency, necessity, and alignment with our community's values.`,
  2: loc => `Representing constituents like myself in ${loc || '[Your Area]'}, I must register my strong dissatisfaction with the current trajectory of federal spending. It is imperative that these priorities undergo immediate and serious reevaluation to ensure taxpayer money serves the public good effectively.`,
  3: loc => `From ${loc || '[Your Area]'}, I am compelled to demand immediate and decisive action regarding the federal budget. The current pattern of spending, marked by questionable priorities and apparent waste, is fiscally irresponsible and requires your urgent intervention.`,
};

// INTRODUCTIONS to the list of items (More variety)
export const LIST_INTRO: Record<Tone, string[]> = {
  0: [
    "After reviewing estimates of how federal funds are spent, I wanted to highlight a few areas that I believe warrant closer examination:",
    "Reflecting on our budget priorities, several specific funding allocations stand out to me:",
    "My review of the federal spending breakdown brings the following items to my attention:",
    "Regarding the current budget, I'd like to offer my perspective on the following specific areas:",
    "Several aspects of the federal budget allocation deserve discussion, including:",
    "Considering the federal budget, the following points are particularly salient:",
  ],
  1: [
    "My analysis of the budget breakdown reveals several specific items that cause me significant concern and which I urge you to address:",
    "Looking at where our tax dollars go, I am particularly troubled by the funding levels for the following programs:",
    "The following expenditures raise serious questions and demand your attention:",
    "I am writing to express concern about the following specific budget allocations:",
    "Certain spending priorities reflected in the budget warrant scrutiny, notably:",
    "Several budget items require closer examination due to potential inefficiencies or misalignment with priorities:",
  ],
  2: [
    "Based on current spending levels, the following programs stand out as demanding significant reassessment and potential correction:",
    "Several areas of the federal budget appear deeply problematic and require immediate attention:",
    "It is difficult to justify the current funding for these specific items, which need urgent review:",
    "The following spending decisions are particularly concerning and require your prompt review:",
    "I must insist on a reevaluation of funding for the following items:",
    "The current allocation for these programs raises serious questions about fiscal prudence:",
  ],
  3: [
    "Below are some of the most glaring examples of what I perceive as misguided priorities and wasteful spending requiring your direct action:",
    "The following expenditures represent unacceptable uses of taxpayer funds and must be addressed immediately:",
    "These specific funding decisions exemplify the fiscal irresponsibility I am demanding you correct:",
    "The current allocation for these items is deeply flawed and requires immediate reform:",
    "I demand action on the following examples of wasteful or misguided spending:",
    "The lack of fiscal discipline is evident in the funding of these programs:",
  ]
};

// ACTION Phrases (indexed by fundingLevel + tone bucket)
export const ACTION_PHRASES: Record<SelectedItem['fundingLevel'], [string, string, string, string]> = {
    [-2]: [ // Slash Heavily
        "should be considered for significant reduction or phasing out",
        "requires a substantial cut; its current funding level seems excessive",
        "must be drastically scaled back; this expenditure is difficult to justify",
        "must be eliminated or fundamentally reformed; this spending is unacceptable",
    ],
    [-1]: [ // Cut Significantly
        "funding could likely be reduced without compromising essential functions",
        "should undergo significant cuts; there are clear opportunities for savings",
        "demands a sharp reduction to better align with fiscal responsibility",
        "needs an aggressive cut; taxpayers expect more prudent use of funds",
    ],
    [0]: [ // Improve Efficiency / Maintain with Oversight
        "funding should be maintained, but with a strong emphasis on improving efficiency and accountability",
        "could continue at current levels, provided there's rigorous oversight to maximize its effectiveness",
        "might remain level, but only if waste is eliminated and performance metrics are met",
        "funding is questionable, but acceptable only with strict audits and proven results",
    ],
    [1]: [ // Fund / Modest Increase
        "deserves stable and perhaps modestly increased funding to ensure it can meet its objectives",
        "should receive reliable support, potentially with a moderate increase to enhance its impact",
        "warrants a noticeable funding boost to strengthen its capabilities and reach",
        "requires a clear increase in resources to adequately address important public needs",
    ],
    [2]: [ // Fund More / Substantial Increase
        "merits a substantial increase in funding; the potential benefits are significant",
        "needs robust new investment to expand its positive impact and capabilities",
        "should be prioritized for major funding growth to address critical challenges",
        "demands urgent and considerable expansion; underfunding this area is shortsighted",
    ]
};

// RATIONALE Snippets (indexed by item.id + fundingLevel rationale type)
export type FundingActionRationale = 'cut' | 'review' | 'fund';

// Keys: `${item.id}_${FundingActionRationale}` (e.g., 'medicaid_cut', 'nih_fund', 'pentagon_review')
export const SPECIFIC_RATIONALES: Record<string, string[]> = {
    // --- Health ---
    medicaid_cut: [
        "exploring reforms to enhance Medicaid's long-term fiscal sustainability is crucial, even while preserving essential care.",
        "targeting Medicaid resources more effectively towards core health services could improve efficiency.",
        "while a vital safety net, Medicaid's growth necessitates exploring ways to control costs responsibly.",
        "ensuring state and federal Medicaid funds are used with maximum efficiency should be a constant goal.",
    ],
    medicaid_fund: [
        "expanding Medicaid eligibility remains a powerful tool for improving health outcomes and economic security for vulnerable families.",
        "robust Medicaid funding is essential for covering low-income children, seniors, and individuals with disabilities.",
        "investing adequately in Medicaid strengthens community health infrastructure and reduces uncompensated care costs.",
        "ensuring fair reimbursement rates within Medicaid helps maintain access to providers for recipients.",
    ],
    medicaid_review: [
        "implementing stronger measures to prevent fraud, waste, and abuse within Medicaid protects taxpayer dollars.",
        "continuously evaluating Medicaid delivery models for efficiency and effectiveness is key to responsible stewardship.",
        "focusing Medicaid resources on high-value care and preventative services can lead to better long-term health outcomes.",
        "streamlining Medicaid administration could reduce overhead and direct more funds to patient care.",
    ],
    medicare_cut: [
        "addressing Medicare's long-term solvency requires exploring options like negotiating drug prices and reducing administrative waste.",
        "implementing reforms to improve Medicare's cost-effectiveness is vital for its future.",
        "careful scrutiny of Medicare spending can prevent unnecessary procedures and ensure value for taxpayers.",
        "promoting efficiency within the Medicare system is necessary given demographic pressures.",
    ],
    medicare_fund: [
        "guaranteeing reliable and comprehensive healthcare for seniors through a strong Medicare program is a fundamental commitment.",
        "strengthening Medicare, potentially by adding benefits like dental or vision coverage, improves seniors' quality of life.",
        "adequate Medicare funding is critical for the health and financial security of millions of older Americans and those with disabilities.",
        "ensuring Medicare can negotiate prescription drug prices effectively would lower costs for both beneficiaries and the government.",
    ],
    medicare_review: [
        "combating fraud and abuse within the Medicare system must remain a top priority.",
        "ongoing evaluation of Medicare payment systems is needed to incentivize high-quality, efficient care.",
        "promoting value-based care models within Medicare can lead to better outcomes at a sustainable cost.",
        "simplifying Medicare enrollment and navigation would benefit beneficiaries.",
    ],
    nih_cut: [
        "while vital, NIH funding should prioritize research with the highest potential for broad public health impact.",
        "ensuring NIH grants avoid duplication and target truly innovative science is important for fiscal prudence.",
        "streamlining NIH grant administration could maximize the research impact of taxpayer dollars.",
        "balancing NIH funding with other national priorities requires careful consideration.",
    ],
    nih_fund: [
        "investing boldly in the National Institutes of Health accelerates medical breakthroughs and maintains U.S. leadership in biomedical science.",
        "increased NIH funding is essential for tackling devastating diseases and improving human health across the lifespan.",
        "supporting basic science research through the NIH provides the crucial foundation for future cures and treatments.",
        "NIH funding drives innovation, creates high-tech jobs, and yields significant long-term economic benefits.",
    ],
    nih_review: [
        "refining the NIH grant review process ensures fairness and supports the most promising research endeavors.",
        "fostering greater collaboration and data sharing facilitated by the NIH can speed up scientific progress.",
        "directing NIH resources towards addressing health disparities is a critical aspect of promoting health equity.",
        "ensuring transparency and accountability in how NIH funds are utilized.",
    ],
    cdc_cut: [
        "focusing CDC resources tightly on core functions like disease surveillance and emergency response is essential.",
        "evaluating the effectiveness of all CDC programs ensures taxpayer money yields tangible public health benefits.",
        "streamlining CDC operations and reducing administrative overhead could enhance its efficiency.",
        "ensuring CDC activities do not overlap unnecessarily with state or local health departments.",
    ],
    cdc_fund: [
        "a fully funded CDC is paramount for national security, pandemic preparedness, and effective public health protection.",
        "investing in the CDC's data systems, labs, and workforce strengthens our ability to prevent and control disease outbreaks.",
        "supporting the CDC's global health security efforts helps contain threats before they reach the U.S.",
        "adequate CDC funding ensures timely and reliable public health guidance.",
    ],
    cdc_review: [
        "improving the clarity and timeliness of CDC guidance during public health emergencies builds trust.",
        "enhancing CDC communication strategies and transparency is vital for public health effectiveness.",
        "ensuring the CDC maintains scientific integrity and avoids politicization is crucial.",
        "strengthening partnerships between the CDC and state/local health agencies improves coordination.",
    ],
    substance_mental_health_cut: [
        "funding for mental health and substance use programs must prioritize evidence-based treatments with proven outcomes.",
        "careful evaluation is needed to avoid duplication between federal, state, and private mental health initiatives.",
        "targeting resources towards programs demonstrably reducing overdoses and supporting long-term recovery.",
        "ensuring fiscal accountability within substance use and mental health grant programs.",
    ],
    substance_mental_health_fund: [
        "addressing the nation's mental health and addiction crises requires significantly increased investment in prevention, treatment, and recovery.",
        "expanding access to affordable mental healthcare and substance use disorder services, especially in underserved areas.",
        "investing in the behavioral health workforce and integrating mental/physical care are critical steps.",
        "supporting crisis response systems (like the 988 hotline) requires adequate federal resources.",
    ],
    substance_mental_health_review: [
        "improving coordination among agencies involved in mental health and substance use is key to effective service delivery.",
        "enforcing mental health parity laws ensures equitable insurance coverage.",
        "evaluating the effectiveness of different treatment models helps optimize the use of public funds.",
        "reducing stigma associated with seeking mental health or substance use treatment requires ongoing effort.",
    ],
    // --- War and Weapons ---
    pentagon_cut: [
        "the immense Pentagon budget demands significant reduction, focusing on genuine defense needs over wasteful projects.",
        "a thorough audit of Pentagon spending is essential to identify inefficiencies and save taxpayer dollars.",
        "shifting funds from unproven weapons systems towards readiness and personnel could strengthen defense more effectively.",
        "reducing the Pentagon's budget would free up critical resources for pressing domestic needs.",
    ],
    pentagon_fund: [ // Often framed as 'modernization' or 'readiness'
        "maintaining a strong national defense in a complex world requires sufficient funding for personnel, training, and modernization.",
        "investing in advanced military capabilities is necessary to deter adversaries and protect U.S. interests.",
        "ensuring our troops have the best equipment and support is vital for mission success.",
        "predictable defense funding enhances strategic planning and readiness.",
    ],
    pentagon_review: [
        "rigorous oversight of Pentagon spending is crucial to prevent waste, fraud, and abuse.",
        "reforming the Pentagon's acquisition process is needed to control costs and deliver capabilities faster.",
        "regularly reassessing strategic priorities ensures the military is optimized for current threats, not past ones.",
        "improving transparency and accountability in all defense spending is paramount.",
    ],
    pentagon_contractors_cut: [
        "over-reliance on expensive defense contractors inflates costs and requires stricter oversight and reduced outsourcing.",
        "billions could be saved by bringing more functions currently performed by contractors back in-house.",
        "requiring more competition and fixed-price contracts for defense services protects taxpayer interests.",
        "the revolving door between the Pentagon and defense contractors warrants scrutiny and reform.",
    ],
    pentagon_contractors_review: [
        "enhancing transparency in defense contracting, including performance and cost data, is essential.",
        "implementing stronger mechanisms to prevent waste and fraud in defense contracts.",
        "evaluating the cost-effectiveness of outsourcing versus using government personnel for specific functions.",
        "ensuring contractor performance meets rigorous standards and provides value for money.",
    ],
    pentagon_personnel_cut: [
        "while supporting troops is vital, reviewing personnel costs for efficiencies in areas like healthcare administration or redundant basing.",
        "optimizing military force structure could potentially yield savings in personnel costs.",
        "balancing personnel compensation with investments in training and equipment requires careful management.",
    ],
    pentagon_personnel_fund: [
        "attracting and retaining skilled military personnel necessitates competitive pay, benefits, and quality family support.",
        "investing in the well-being and readiness of service members is crucial for an effective all-volunteer force.",
        "adequate funding for military personnel accounts directly impacts morale, retention, and national security.",
        "ensuring high-quality healthcare and housing for military members and their families is a necessary cost.",
    ],
    pentagon_personnel_review: [
        "regularly reviewing military compensation packages to ensure competitiveness.",
        "improving access to quality healthcare, mental health services, and childcare for military families.",
        "streamlining personnel management processes to reduce administrative burdens.",
        "focusing on programs that genuinely support service member well-being and readiness.",
    ],
    pentagon_top5_contractors_cut: [ // Specific focus on largest contractors
        "the heavy concentration of defense contracts among a few large firms warrants action to promote greater competition.",
        "reducing the share of contracts flowing to the top 5 defense corporations could foster a more diverse industrial base.",
        "increased scrutiny is needed on contracts awarded to the largest defense firms to ensure taxpayers receive fair value.",
        "breaking up the excessive influence of the largest defense contractors on policy and spending.",
    ],
    pentagon_top5_contractors_review: [
        "the relationship between the Pentagon and its largest contractors needs close oversight to prevent undue influence.",
        "evaluating the strategic risks of relying heavily on a small number of dominant defense firms.",
        "promoting opportunities for smaller, innovative companies in the defense sector.",
        "ensuring mergers among large defense contractors do not further reduce competition.",
    ],
    nuclear_weapons_cut: [
        "the exorbitant cost of maintaining and modernizing a vast nuclear arsenal should be sharply curtailed.",
        "reducing reliance on nuclear weapons and pursuing arms control could save billions and enhance global security.",
        "questioning the necessity of specific, costly nuclear modernization programs like the Sentinel ICBM.",
        "shifting resources from nuclear weapons to conventional deterrence or pressing domestic needs.",
    ],
    nuclear_weapons_fund: [ // Often framed as 'modernization' or 'deterrence'
        "modernizing the nuclear triad is essential for strategic deterrence.",
        "ensuring the safety, security, and reliability of the existing nuclear stockpile requires ongoing investment.",
        "maintaining a credible nuclear deterrent is vital in a world with nuclear-armed adversaries.",
    ],
    nuclear_weapons_review: [
        "the long-term costs and strategic rationale for all nuclear modernization programs require rigorous congressional review.",
        "ensuring robust command, control, and safety measures for the nuclear arsenal necessitates continuous oversight.",
        "balancing investments in nuclear deterrence with conventional forces and diplomacy.",
        "pursuing arms control negotiations to reduce nuclear risks globally.",
    ],
    foreign_military_aid_cut: [
        "U.S. foreign military aid often fuels conflicts and diverts resources from domestic needs; it should be sharply reduced.",
        "providing weapons abroad can entangle the U.S. in foreign disputes with unintended consequences.",
        "reallocating funds from foreign military aid to diplomacy or development assistance would be wiser.",
        "conditioning all military aid strictly on human rights and accountability.",
    ],
    foreign_military_aid_fund: [ // Often framed as 'strategic interest'
        "strategic foreign military aid can strengthen key allies and enhance regional stability.",
        "security assistance helps partner nations defend themselves and counter shared threats like terrorism.",
        "military aid can be a tool to build relationships and advance U.S. interests abroad.",
    ],
    foreign_military_aid_review: [
        "all foreign military aid must be subject to strict conditions regarding human rights and democratic governance.",
        "the effectiveness and strategic rationale for each military aid package require constant evaluation.",
        "transparency regarding the specific uses and impacts of U.S. military aid is essential.",
        "balancing military aid with diplomatic and economic tools in foreign policy.",
    ],
    israel_wars_cut: [ // More specific version of foreign_military_aid_cut
        "unconditional military aid to specific nations, like Israel, drains U.S. resources and can enable controversial actions.",
        "the level of military funding provided to Israel warrants scrutiny compared to domestic needs.",
        "conditioning military aid to Israel on compliance with international law and U.S. policy goals.",
        "reassessing the strategic benefits versus the costs and risks of extensive military aid to Israel.",
    ],
     israel_wars_fund: [ // Specific version of foreign_military_aid_fund
        "supporting Israel's security through military aid is a key U.S. policy pillar in the Middle East.",
        "funding for systems like Iron Dome enhances Israeli defense against regional threats.",
        "security assistance to Israel is mutually beneficial for intelligence sharing and defense innovation.",
    ],
     israel_wars_review: [
        "the impact of U.S. military aid to Israel on regional stability and the Israeli-Palestinian conflict requires critical assessment.",
        "transparency regarding the specific uses of U.S. military aid by Israel is crucial.",
        "balancing the security partnership with Israel against broader U.S. interests and values in the region.",
        "ensuring U.S.-provided weapons are used in accordance with international law.",
    ],
    f35_cut: [
        "the F-35 program's staggering cost overruns and persistent performance issues warrant significant funding cuts.",
        "reducing the total number of F-35s procured could save billions for other priorities.",
        "continuing massive funding for the F-35 without addressing affordability and reliability is fiscally irresponsible.",
        "exploring more cost-effective aircraft alternatives for certain mission sets.",
    ],
    f35_review: [
        "rigorous, independent testing of the F-35's performance, maintenance costs, and combat effectiveness is crucial.",
        "holding Lockheed Martin accountable for meeting F-35 cost and performance targets.",
        "ensuring the F-35 program delivers the promised capabilities at an acceptable cost.",
        "considering the long-term sustainment costs of the F-35 fleet.",
    ],
    pentagon_spacex_cut: [ // Similar to NASA_SpaceX_cut, but DoD focus
        "Pentagon contracts with profitable private space companies like SpaceX need stronger justification regarding unique value.",
        "ensuring fair competition in national security space launches, avoiding over-reliance on one provider.",
        "questioning the need to subsidize established commercial space ventures with defense contracts.",
        "demanding greater transparency on the cost and terms of Pentagon-SpaceX contracts.",
    ],
    pentagon_spacex_review: [
        "contracts awarded to SpaceX require robust oversight for performance, cost control, and security.",
        "transparency regarding the terms and value of Pentagon contracts with commercial space companies.",
        "assessing the long-term strategy for utilizing commercial partners for national security space missions.",
        "ensuring competition is maintained in the national security launch market.",
    ],
    pentagon_dei_cut: [
        "funding for Pentagon DEI initiatives should be evaluated for effectiveness, ensuring demonstrable contribution to readiness.",
        "resources allocated to DEI programs must be justified based on clear objectives and outcomes.",
        "ensuring DEI efforts focus on equal opportunity and merit, not divisive identity politics.",
        "preventing DEI programs from becoming overly bureaucratic or detracting from core mission focus.",
    ],
    pentagon_dei_fund: [ // Often framed as enhancing readiness/talent pool
        "well-implemented DEI initiatives can enhance military readiness by attracting diverse talent and fostering teamwork.",
        "promoting an inclusive environment strengthens the Armed Forces by ensuring fair treatment for all.",
        "addressing discrimination or bias through DEI programs contributes to unit cohesion.",
    ],
    pentagon_dei_review: [
        "the goals, metrics, and costs of Pentagon DEI programs require clear definition and congressional oversight.",
        "ensuring DEI training is evidence-based and genuinely contributes to a more effective military.",
        "balancing DEI goals with the military's primary mission of national defense.",
        "guaranteeing DEI initiatives uphold principles of meritocracy and equal opportunity.",
    ],
    // --- Veterans ---
    va_cut: [
        "while supporting veterans, the VA system needs continuous efforts to improve efficiency and reduce bureaucracy.",
        "modernizing VA operations and IT systems could allow resources to focus more directly on veteran care.",
        "ensuring accountability and eliminating wasteful spending within the VA maximizes fund effectiveness.",
        "streamlining VA service delivery without compromising quality of care.",
    ],
    va_fund: [
        "fulfilling our nation's promise to veterans requires robust funding for VA healthcare, mental health, and benefits.",
        "investing in the VA system, including expanding access and reducing wait times, meets veterans' complex needs.",
        "adequate funding for VA benefits like the GI Bill and housing assistance helps veterans thrive.",
        "supporting VA research contributes to advancements in veteran healthcare.",
    ],
    va_review: [
        "improving the timeliness and accuracy of VA disability claims processing remains critical.",
        "enhancing mental healthcare access and suicide prevention programs for veterans must be a top VA priority.",
        "ensuring seamless coordination between the VA and DoD for transitioning service members.",
        "modernizing VA facilities and infrastructure to provide state-of-the-art care.",
    ],
    pact_act_fund: [ // PACT Act focus is generally on funding/implementation
        "fully funding and effectively implementing the PACT Act is essential for veterans exposed to toxins.",
        "ensuring the VA has resources to process PACT Act claims efficiently and provide specialized care.",
        "outreach efforts to inform eligible veterans about PACT Act benefits require adequate support.",
        "investing in research on toxic exposure health effects, funded through the PACT Act.",
    ],
    pact_act_review: [
        "monitoring the VA's progress in implementing the PACT Act, including claims processing and access to care.",
        "continued research into the long-term health effects of military toxic exposures.",
        "ensuring healthcare providers are knowledgeable about toxic exposure issues.",
        "streamlining the process for veterans to access PACT Act benefits.",
    ],
    // --- Unemployment and Labor ---
    tanf_cut: [
        "TANF's effectiveness needs rigorous evaluation; funding should prioritize programs proven to move families out of poverty.",
        "ensuring TANF work requirements are meaningful and supported by adequate job training.",
        "reducing state flexibility to use TANF funds for unrelated purposes could improve focus.",
        "evaluating whether TANF benefit levels create disincentives to work.",
    ],
    tanf_fund: [
        "strengthening the safety net requires adequate TANF funding for vulnerable families facing hardship.",
        "investing in TANF-funded job training and supportive services helps parents secure stable employment.",
        "adjusting TANF benefit levels for inflation is necessary to provide meaningful assistance.",
        "supporting TANF programs that address barriers to employment like childcare and transportation.",
    ],
    tanf_review: [
        "evaluating the impact of TANF time limits and sanctions on family well-being.",
        "improving data collection on TANF outcomes to assess program effectiveness.",
        "ensuring TANF programs are responsive to the needs of diverse families.",
        "strengthening TANF's role in poverty reduction and promoting economic mobility.",
    ],
    child_tax_credit_cut: [
        "the Child Tax Credit (CTC) structure should be reviewed for fiscal sustainability and effective targeting.",
        "exploring modifications to the CTC, like strengthening work requirements or adjusting income limits.",
        "balancing the CTC's poverty reduction impact against its overall cost.",
        "considering whether CTC expansion contributes significantly to inflation.",
    ],
    child_tax_credit_fund: [ // Focus on expansion/permanence
        "expanding the Child Tax Credit, especially for the lowest-income families, effectively reduces child poverty.",
        "making recent CTC expansions permanent provides stability for working families.",
        "the CTC helps families cover rising costs, boosting local economies.",
        "simplifying CTC claiming processes ensures eligible families receive the benefit.",
    ],
    child_tax_credit_review: [
        "simplifying the process for eligible families to claim the CTC.",
        "evaluating the CTC's impact on parental employment and family economic decisions.",
        "ensuring the CTC interacts effectively with other safety net programs.",
        "assessing the administrative costs versus the benefits delivered by the CTC.",
    ],
    refugee_assistance_cut: [
        "refugee resettlement costs should be managed efficiently, focusing on rapid self-sufficiency.",
        "ensuring adequate security screening alongside resettlement programs.",
        "balancing humanitarian commitments with fiscal capacity and integration challenges.",
        "exploring ways to increase private sponsorship or community support for refugees.",
    ],
    refugee_assistance_fund: [
        "providing adequate resources for refugee resettlement reflects American humanitarian values.",
        "investing in effective integration programs helps refugees become self-sufficient contributors.",
        "supporting refugee assistance demonstrates U.S. leadership and compassion.",
        "ensuring resettlement agencies have the resources to meet refugees' initial needs.",
    ],
    refugee_assistance_review: [
        "improving coordination between federal agencies, resettlement organizations, and local communities.",
        "evaluating the long-term outcomes of refugees resettled in the U.S.",
        "ensuring resettlement programs are adequately resourced to handle fluctuating arrivals.",
        "streamlining the process for refugees to obtain work authorization.",
    ],
    liheap_cut: [
        "LIHEAP funding should target the most vulnerable households, with strong verification.",
        "encouraging energy efficiency alongside bill assistance provides more sustainable solutions.",
        "ensuring LIHEAP funds supplement, not replace, individual responsibility.",
        "reviewing LIHEAP administrative costs for potential savings.",
    ],
    liheap_fund: [
        "LIHEAP is crucial for preventing dangerous energy shutoffs for vulnerable households.",
        "adequate LIHEAP funding provides a vital safety net against energy poverty.",
        "supporting LIHEAP weatherization programs helps low-income households reduce energy costs permanently.",
        "increased LIHEAP funding is needed due to rising energy prices.",
    ],
    liheap_review: [
        "streamlining the LIHEAP application process improves access for eligible households.",
        "ensuring equitable distribution of LIHEAP funds based on need and climate.",
        "coordinating LIHEAP with other utility assistance and efficiency programs maximizes impact.",
        "evaluating the effectiveness of LIHEAP in preventing energy crises.",
    ],
    nlrb_cut: [
        "the NLRB's actions sometimes face criticism regarding fairness; its funding and authority warrant review.",
        "ensuring the NLRB applies labor laws impartially and efficiently.",
        "evaluating whether the NLRB's structure is suited to the modern economy.",
        "questioning the necessity of certain NLRB enforcement actions.",
    ],
    nlrb_fund: [
        "protecting workers' rights to organize and bargain collectively requires a fully funded NLRB.",
        "adequate resources allow the NLRB to investigate charges promptly and remedy violations.",
        "a strong NLRB is essential for maintaining a balance between employers and employees.",
        "funding the NLRB ensures fair labor practices are upheld.",
    ],
    nlrb_review: [
        "improving the speed and efficiency of NLRB case processing.",
        "ensuring NLRB decisions are consistent and well-reasoned.",
        "adapting NLRB rules to address challenges in the modern workforce (e.g., gig economy).",
        "maintaining the NLRB's independence and impartiality.",
    ],
    // --- Education ---
    dept_education_cut: [
        "the federal role in education should be limited, avoiding bureaucratic overreach and respecting local control.",
        "consolidating duplicative programs within the Department of Education could yield savings.",
        "evaluating the effectiveness of federal education mandates is necessary.",
        "reducing the administrative burden associated with federal education grants.",
    ],
    dept_education_fund: [
        "investing in education at all levels is crucial for opportunity and economic growth.",
        "the Department of Education plays a vital role in promoting equity and ensuring civil rights in schools.",
        "adequate federal funding is necessary to support key education initiatives, especially for disadvantaged students.",
        "supporting research and innovation in education through federal grants.",
    ],
    dept_education_review: [
        "simplifying federal grant applications for schools and colleges.",
        "improving data collection on the outcomes of federal education programs.",
        "ensuring effective enforcement of civil rights laws in education.",
        "strengthening the Department's oversight of federal student aid programs.",
    ],
    college_aid_cut: [
        "federal college aid programs need reform to address soaring tuition costs, not just subsidize them.",
        "exploring ways to simplify federal student aid and better target it based on need.",
        "holding colleges more accountable for student outcomes and controlling administrative costs.",
        "questioning the effectiveness of current student loan programs and seeking alternatives.",
    ],
    college_aid_fund: [
        "expanding access to affordable higher education requires increased funding for Pell Grants and work-study.",
        "reducing the burden of student loan debt supports economic security and mobility.",
        "simplifying the FAFSA application makes it easier for students to access aid.",
        "investing in programs that support college completion, not just enrollment.",
    ],
    college_aid_review: [
        "reviewing student loan interest rates, repayment options, and servicing practices.",
        "evaluating the effectiveness of different types of college aid.",
        "ensuring federal aid programs support quality institutions and protect students.",
        "strengthening oversight of for-profit colleges receiving federal aid.",
    ],
    k12_schools_cut: [
        "federal K-12 funding should primarily supplement state/local efforts, focusing on national priorities.",
        "reducing federal mandates and returning control over education policy to states and districts.",
        "consolidating overlapping federal K-12 grant programs could increase efficiency.",
        "evaluating the actual impact of federal K-12 spending on student achievement.",
    ],
    k12_schools_fund: [
        "targeted federal funding for K-12 schools is crucial for supporting under-resourced districts and vulnerable students (IDEA, Title I).",
        "investing in programs supporting teachers, school infrastructure, and technology improves educational quality.",
        "federal support plays a key role in promoting educational equity.",
        "funding programs that address learning loss and support student mental health.",
    ],
    k12_schools_review: [
        "ensuring federal K-12 funds effectively improve outcomes, especially for disadvantaged groups.",
        "evaluating the impact of federal education laws on local school districts.",
        "promoting innovation and evidence-based practices in K-12 education.",
        "strengthening support for students with disabilities and English language learners.",
    ],
    cpb_cut: [
        "in today's diverse media landscape, federal funding for the Corporation for Public Broadcasting faces scrutiny.",
        "questions about political bias sometimes lead to calls for reducing CPB subsidies.",
        "phasing out federal support could encourage public broadcasters to rely more on private donations.",
        "evaluating the necessity of CPB funding compared to other pressing needs.",
    ],
    cpb_fund: [ // Focus on public service mission
        "CPB provides essential funding for quality educational programming and objective news accessible to all.",
        "public broadcasting serves underserved communities and offers a vital non-commercial alternative.",
        "federal support ensures the independence and reach of public radio and television.",
        "CPB funding supports local stations that provide valuable community services.",
    ],
    cpb_review: [
        "ensuring CPB funding distribution is fair, transparent, and supports diverse programming.",
        "evaluating mechanisms for maintaining editorial independence in public broadcasting.",
        "assessing public broadcasting's role and adaptation in the digital age.",
        "strengthening oversight of how CPB funds are used by local stations.",
    ],
    imls_cut: [
        "while libraries/museums are valuable, federal IMLS funding could potentially be reduced, shifting responsibility elsewhere.",
        "prioritizing IMLS grants towards programs with the broadest impact or serving the most underserved.",
        "evaluating the specific outcomes achieved through IMLS funding.",
        "considering whether IMLS functions could be absorbed by other agencies.",
    ],
    imls_fund: [
        "IMLS provides crucial federal support for libraries and museums, enabling vital educational resources and community programs.",
        "IMLS funding helps libraries bridge the digital divide and supports museums in preserving cultural heritage.",
        "federal support through IMLS leverages state/local funding, strengthening these community institutions.",
        "IMLS grants support innovation and adaptation in library and museum services.",
    ],
    imls_review: [
        "ensuring IMLS grants are accessible to institutions of all sizes, including rural/underserved areas.",
        "focusing IMLS initiatives on key priorities like digital literacy and workforce development.",
        "improving data collection on the impact of IMLS-funded programs.",
        "strengthening IMLS's role in promoting information access and lifelong learning.",
    ],
    // --- Food and Agriculture ---
    snap_cut: [
        "reforming SNAP (food stamps) to strengthen work requirements and improve program integrity could lead to savings.",
        "ensuring SNAP benefits are used for nutritious food items warrants consideration.",
        "tightening SNAP eligibility requires balancing fiscal concerns and food security.",
        "reducing SNAP fraud and abuse through better verification methods.",
    ],
    snap_fund: [
        "SNAP is the nation's most effective anti-hunger program and should be fully funded.",
        "strengthening SNAP benefits reduces food insecurity and improves health outcomes.",
        "maintaining broad SNAP eligibility is crucial, especially during economic downturns.",
        "SNAP benefits provide significant economic stimulus to local communities.",
    ],
    snap_review: [
        "simplifying the SNAP application process improves access for eligible households.",
        "improving SNAP Employment & Training programs to connect recipients with jobs.",
        "ensuring SNAP benefit levels reflect the actual cost of a nutritious diet.",
        "using technology to make SNAP benefits easier to access and use.",
    ],
    school_lunch_cut: [
        "reviewing nutritional standards and administrative costs of the School Lunch Program for efficiencies.",
        "ensuring school meal programs target assistance effectively to low-income students.",
        "exploring partnerships or alternative models for providing nutritious school meals.",
        "balancing meal quality with program cost requires careful management.",
    ],
    school_lunch_fund: [
        "expanding access to free school meals ensures children have the nutrition needed to learn.",
        "investing in universal free school meals reduces stigma and improves student health.",
        "supporting programs using fresh, locally sourced foods in school meals enhances quality.",
        "adequate funding allows schools to meet nutritional standards and cover rising food costs.",
    ],
    school_lunch_review: [
        "improving the nutritional quality and appeal of school meals to increase participation.",
        "streamlining the application process for free/reduced-price meals.",
        "ensuring adequate funding for schools to meet updated nutritional standards.",
        "reducing food waste within school meal programs.",
    ],
    fsa_cut: [
        "reforming farm subsidies administered by the Farm Service Agency (FSA) is needed to reduce market distortions.",
        "limiting FSA payments to large agricultural corporations and better targeting support to small farmers.",
        "phasing out certain commodity support programs could save taxpayer money.",
        "shifting FSA resources from subsidies towards conservation programs.",
    ],
    fsa_fund: [
        "the FSA provides crucial support for farmers, including credit, disaster aid, and conservation programs.",
        "adequate funding for FSA loan programs helps beginning and underserved farmers access capital.",
        "investing in FSA conservation programs protects natural resources.",
        "FSA programs help ensure a stable food supply and support rural economies.",
    ],
    fsa_review: [
        "improving the accessibility of FSA programs for small, mid-sized, and minority farmers.",
        "ensuring FSA disaster assistance is timely and effective.",
        "evaluating the effectiveness of commodity support versus conservation incentives.",
        "modernizing FSA technology and service delivery.",
    ],
    wic_cut: [
        "while valuable, reviewing WIC's administrative costs for efficiency is prudent.",
        "targeting WIC benefits effectively to those most nutritionally at risk.",
        "coordinating WIC services with other maternal/child health programs to reduce duplication.",
        "ensuring WIC food packages offer the best nutritional value for cost.",
    ],
    wic_fund: [
        "WIC provides critical nutritional support for low-income pregnant women, mothers, and young children, improving health outcomes.",
        "fully funding WIC ensures all eligible participants receive benefits, reducing infant mortality and supporting healthy development.",
        "investing in WIC is a cost-effective way to improve long-term health.",
        "WIC's nutrition education and breastfeeding support components are highly valuable.",
    ],
    wic_review: [
        "modernizing WIC food packages to align with current dietary guidelines.",
        "improving the WIC shopping experience through enhanced EBT systems.",
        "strengthening WIC's role in providing nutrition education and healthcare referrals.",
        "increasing WIC participation rates among eligible populations.",
    ],
    // --- Government Operations ---
    fdic_review: [ // FDIC is funded by bank premiums, not direct taxes - focus on oversight/effectiveness
        "ensuring the FDIC effectively manages the deposit insurance fund and regulates banks.",
        "maintaining public confidence requires demonstrating the FDIC's independence and financial strength.",
        "evaluating the adequacy of FDIC resources to handle potential bank failures.",
        "assessing the FDIC's role in addressing emerging risks in the financial system.",
    ],
    irs_cut: [
        "IRS funding should prioritize efficient tax administration and taxpayer service, avoiding burdensome enforcement.",
        "concerns about IRS overreach sometimes lead to calls for budget constraints.",
        "simplifying the tax code itself could be more effective than just increasing IRS enforcement.",
        "ensuring IRS resources are used fairly and not politically motivated.",
    ],
    irs_fund: [
        "adequate IRS funding is essential to close the 'tax gap' and ensure fairness.",
        "investing in IRS modernization improves efficiency and taxpayer service.",
        "effective IRS enforcement targeting high-income non-compliance yields significant revenue returns.",
        "providing the IRS resources to combat sophisticated tax evasion schemes.",
    ],
    irs_review: [
        "ensuring the IRS uses its resources fairly requires strong congressional oversight.",
        "improving IRS taxpayer service, including phone support and online tools.",
        "protecting taxpayer rights and ensuring due process during audits.",
        "focusing IRS enforcement efforts on areas with the highest rates of non-compliance.",
    ],
    federal_courts_cut: [
        "reviewing federal court operations for efficiencies in case management and administration.",
        "exploring alternatives to litigation might reduce court caseloads.",
        "careful budgeting is necessary, but must not compromise the judiciary's ability to function.",
    ],
    federal_courts_fund: [
        "a well-functioning judiciary requires sufficient funding for judgeships, staff, security, and technology.",
        "investing in the federal courts ensures access to justice and upholds the rule of law.",
        "adequate resources are needed to protect judges and maintain secure facilities.",
        "funding technology upgrades enhances court efficiency and public access.",
    ],
    federal_courts_review: [
        "addressing judicial vacancies to reduce case backlogs.",
        "improving access to the courts for low-income individuals.",
        "modernizing court technology and electronic filing systems.",
        "ensuring the judiciary remains independent and impartial.",
    ],
    public_defenders_fund: [ // Focus is almost always on underfunding
        "ensuring the constitutional right to counsel requires adequate funding for federal public defenders.",
        "underfunded public defense systems compromise the quality of representation.",
        "investing in public defense ensures fairness in the justice system.",
        "addressing high caseloads requires increased resources for public defenders.",
    ],
    public_defenders_review: [
        "addressing high caseloads and ensuring defenders have resources for investigations.",
        "promoting pay parity between public defenders and prosecutors.",
        "evaluating models for providing indigent defense in federal court.",
        "supporting training and professional development for public defenders.",
    ],
    usps_review: [ // USPS is largely self-funded but faces mandates/challenges - focus on reform/oversight
        "reviewing congressional mandates, like retiree health pre-funding, that impact USPS finances.",
        "supporting USPS modernization efforts and adjustments to service standards.",
        "allowing USPS diversification of revenue streams warrants consideration.",
        "ensuring the Postal Service can fulfill its universal service obligation sustainably.",
    ],
    cfpb_cut: [
        "the CFPB's broad authority and funding structure warrant scrutiny regarding accountability.",
        "concerns about CFPB regulations being overly burdensome on financial institutions.",
        "ensuring the CFPB focuses on clear consumer harm, avoiding regulatory overreach.",
        "limiting the CFPB's power or budget is sometimes proposed.",
    ],
    cfpb_fund: [
        "the CFPB plays a vital role in protecting consumers from predatory financial practices.",
        "strong CFPB enforcement returns billions to harmed consumers and deters misconduct.",
        "funding CFPB's consumer education helps empower individuals financially.",
        "adequate resources allow the CFPB to supervise financial institutions effectively.",
    ],
    cfpb_review: [
        "ensuring the CFPB's rulemaking process is transparent and data-driven.",
        "improving coordination between the CFPB and other financial regulators.",
        "evaluating the effectiveness of CFPB enforcement and education programs.",
        "maintaining the CFPB's independence to protect consumers.",
    ],
    mbda_cut: [
        "evaluating the MBDA's effectiveness compared to broader small business support programs.",
        "ensuring MBDA programs deliver measurable results in promoting minority business growth.",
        "consolidating business development programs could potentially increase efficiency.",
    ],
    mbda_fund: [
        "the MBDA plays a unique role in addressing systemic barriers for minority-owned businesses.",
        "investing in MBDA programs helps create jobs and build wealth in underserved communities.",
        "expanding MBDA's reach can help close the persistent racial wealth gap.",
        "supporting MBDA strengthens the overall economy through diversity.",
    ],
    mbda_review: [
        "improving access to capital and federal contracting for minority-owned businesses via MBDA.",
        "strengthening partnerships between MBDA and other agencies/private sector.",
        "enhancing data collection on minority-owned businesses to inform MBDA strategies.",
        "ensuring MBDA programs are effectively targeted and managed.",
    ],
    usich_review: [ // Funding is very small - focus on effectiveness/coordination
        "evaluating USICH's effectiveness in coordinating federal efforts to end homelessness.",
        "ensuring USICH's role complements, rather than duplicates, HUD's work.",
        "strengthening USICH's ability to promote evidence-based practices like Housing First.",
        "improving coordination between federal efforts and state/local homelessness systems.",
    ],
    // --- Housing and Community ---
    fema_cut: [
        "FEMA's disaster response requires review for efficiency in administration and aid delivery.",
        "ensuring FEMA funds prioritize immediate life-saving needs while minimizing fraud.",
        "balancing federal disaster aid with state/local preparedness efforts.",
        "scrutinizing FEMA contracting practices for cost-effectiveness.",
    ],
    fema_fund: [
        "increasing disaster frequency requires robust FEMA funding for response, recovery, and mitigation.",
        "investing in FEMA's capacity provides timely assistance to disaster survivors.",
        "supporting FEMA's pre-disaster mitigation programs reduces long-term costs.",
        "ensuring FEMA has the resources to handle large-scale disasters effectively.",
    ],
    fema_review: [
        "improving the speed and accessibility of FEMA's individual assistance programs.",
        "strengthening FEMA's coordination with state, local, and tribal governments.",
        "ensuring FEMA programs promote resilience and address climate impacts.",
        "increasing transparency in FEMA spending and decision-making.",
    ],
    fema_drf_fund: [ // Specific fund within FEMA - focus is usually on adequate balance
        "maintaining a sufficiently funded Disaster Relief Fund (DRF) is crucial for immediate disaster response.",
        "predictable and adequate DRF funding provides stability for disaster planning.",
        "replenishing the DRF proactively ensures resources are available when needed.",
        "ensuring the DRF can cover the costs of increasingly frequent and severe disasters.",
    ],
    fema_drf_review: [
        "improving transparency regarding DRF spending and obligations.",
        "ensuring DRF funding formulas are equitable and based on actual disaster needs.",
        "evaluating the long-term solvency of the DRF given rising disaster costs.",
        "streamlining processes for accessing DRF funds for recovery projects.",
    ],
    hud_cut: [
        "HUD programs need review for effectiveness in addressing the affordable housing crisis.",
        "streamlining HUD bureaucracy and reducing burdensome regulations.",
        "evaluating the cost-effectiveness of different HUD programs (vouchers vs. development).",
        "encouraging more private sector involvement in affordable housing.",
    ],
    hud_fund: [
        "tackling the affordable housing crisis requires significant investment in HUD programs like rental assistance.",
        "expanding HUD resources is essential for reducing homelessness and promoting housing stability.",
        "investing in affordable housing development through HUD stimulates local economies.",
        "funding HUD programs that support community development and fair housing.",
    ],
    hud_review: [
        "improving the efficiency of HUD's rental assistance programs to serve more families.",
        "addressing the large capital repair backlog in public housing requires sustained investment.",
        "ensuring HUD programs effectively promote fair housing and reduce segregation.",
        "strengthening HUD oversight of grantees and program performance.",
    ],
    head_start_cut: [
        "Head Start programs should be rigorously evaluated for long-term impact.",
        "improving quality standards and accountability across all Head Start centers.",
        "ensuring Head Start funding complements, not duplicates, state pre-K programs.",
        "focusing Head Start resources on the most effective interventions.",
    ],
    head_start_fund: [
        "Head Start provides critical comprehensive early childhood services, improving school readiness.",
        "expanding access to high-quality Head Start, especially Early Head Start, is vital.",
        "adequate funding allows Head Start to maintain quality standards and comprehensive services.",
        "Head Start demonstrably improves long-term outcomes for low-income children.",
    ],
    head_start_review: [
        "strengthening Head Start performance standards and ensuring consistent quality.",
        "improving coordination between Head Start and K-12 school systems.",
        "enhancing support for Head Start staff, including pay and professional development.",
        "focusing Head Start on evidence-based practices in early childhood education.",
    ],
    public_housing_cut: [
        "the traditional public housing model faces challenges; exploring alternatives is needed.",
        "improving management efficiency and safety in existing public housing.",
        "shifting towards housing vouchers is sometimes proposed as more cost-effective.",
        "addressing the root causes of issues within public housing developments.",
    ],
    public_housing_fund: [
        "addressing the significant capital repair backlog in public housing is crucial for resident safety.",
        "investing in the preservation and modernization of public housing keeps it available.",
        "funding is needed to support resident services and improve management.",
        "public housing provides deeply affordable homes for very low-income households.",
    ],
    public_housing_review: [
        "implementing effective strategies to address crime and improve safety.",
        "promoting resident involvement and empowerment in management.",
        "exploring mixed-finance models to revitalize public housing communities.",
        "ensuring public housing is well-maintained and provides decent living conditions.",
    ],
    // --- Energy and Environment ---
    epa_cut: [
        "EPA regulations should balance environmental goals with economic burdens.",
        "streamlining EPA permitting processes is needed.",
        "evaluating the cost-effectiveness of specific EPA regulations.",
        "ensuring the EPA relies on sound science and transparent data.",
    ],
    epa_fund: [
        "addressing critical environmental challenges requires a well-funded EPA.",
        "investing in EPA enforcement ensures environmental laws are upheld.",
        "supporting EPA's scientific research provides the basis for sound policy.",
        "funding EPA programs that protect air and water quality is essential for public health.",
    ],
    epa_review: [
        "improving the timeliness of EPA's permitting and regulatory reviews.",
        "ensuring EPA regulations reflect the best available science.",
        "strengthening EPA's capacity to address environmental justice issues.",
        "enhancing EPA transparency and public participation in rulemaking.",
    ],
    forest_service_cut: [
        "reviewing Forest Service operations for efficiencies in timber management and administration.",
        "balancing environmental protection with economic uses of national forests.",
        "prioritizing Forest Service resources towards critical wildfire prevention.",
        "ensuring cost-effectiveness in Forest Service land management activities.",
    ],
    forest_service_fund: [
        "increased Forest Service funding is needed to address the escalating wildfire crisis.",
        "investing in the health of national forests protects watersheds and biodiversity.",
        "adequate resources allow sustainable management of national forests.",
        "supporting federal wildland firefighters with better pay and resources.",
    ],
    forest_service_review: [
        "improving the pace and scale of hazardous fuels treatments.",
        "strengthening partnerships for wildfire response and forest management.",
        "ensuring adequate compensation and support for wildland firefighters.",
        "using the best available science to guide forest restoration efforts.",
    ],
    noaa_cut: [
        "evaluating NOAA programs for potential duplication with other agencies.",
        "prioritizing NOAA resources towards core functions like weather forecasting.",
        "ensuring efficiency in NOAA's satellite and research vessel operations.",
        "considering whether certain NOAA functions could be handled by the private sector.",
    ],
    noaa_fund: [
        "NOAA provides essential services like weather forecasts, climate data, and fisheries management.",
        "investing in NOAA's weather prediction capabilities protects lives and property.",
        "supporting NOAA's research on oceans and climate is critical.",
        "funding NOAA helps ensure sustainable management of marine resources.",
    ],
    noaa_review: [
        "improving the accuracy and lead time of NOAA weather forecasts.",
        "enhancing NOAA's role in supporting coastal resilience.",
        "ensuring sustainable fisheries management based on NOAA science.",
        "modernizing NOAA's observation systems (satellites, buoys).",
    ],
    renewable_energy_cut: [
        "government subsidies for mature renewable energy technologies should be phased out.",
        "focusing federal energy R&D on breakthrough technologies, not subsidizing existing ones.",
        "evaluating the cost-effectiveness of specific DOE renewable energy programs.",
        "allowing market forces to drive renewable energy deployment.",
    ],
    renewable_energy_fund: [
        "accelerating the clean energy transition requires federal investment in renewables and efficiency.",
        "supporting renewable energy programs creates jobs and reduces emissions.",
        "investing in grid modernization is crucial for integrating more renewables.",
        "funding research into next-generation renewable technologies and storage.",
    ],
    renewable_energy_review: [
        "ensuring federal renewable energy programs effectively drive innovation.",
        "improving permitting processes for renewable energy projects.",
        "targeting investments towards advanced renewable technologies.",
        "analyzing the grid impacts of increasing renewable energy penetration.",
    ],
    nps_cut: [
        "reviewing National Park Service (NPS) operations for efficiencies.",
        "exploring increased reliance on visitor fees or private partnerships for NPS.",
        "prioritizing NPS resources towards deferred maintenance and core preservation.",
        "balancing visitor access with resource protection requires careful budget choices.",
    ],
    nps_fund: [
        "protecting America's natural heritage requires adequate NPS funding to manage parks.",
        "addressing the significant deferred maintenance backlog in National Parks.",
        "investing in our National Parks preserves resources and supports local economies.",
        "providing sufficient resources for NPS staff (rangers, maintenance).",
    ],
    nps_review: [
        "developing sustainable solutions for the NPS deferred maintenance backlog.",
        "managing increasing visitor numbers to prevent resource damage.",
        "enhancing interpretation and education programs in parks.",
        "improving infrastructure within National Parks.",
    ],
    // --- International Affairs ---
    diplomacy_cut: [
        "reviewing State Department operations for efficiencies and consolidating posts.",
        "evaluating the necessity and cost-effectiveness of all diplomatic programs.",
        "balancing investments in diplomacy with defense and development aid.",
        "ensuring diplomatic resources align with core foreign policy objectives.",
    ],
    diplomacy_fund: [
        "robust funding for diplomacy strengthens U.S. influence and promotes peace.",
        "investing in our diplomatic corps provides the front line for global engagement.",
        "supporting public diplomacy enhances mutual understanding.",
        "effective diplomacy can often avoid the need for costlier military interventions.",
    ],
    diplomacy_review: [
        "ensuring the State Department has resources to address complex global challenges.",
        "modernizing diplomatic tools and communication strategies.",
        "strengthening coordination between the State Department and other foreign affairs agencies.",
        "supporting the professional development and security of Foreign Service officers.",
    ],
    usaid_cut: [
        "USAID programs require rigorous oversight for effectiveness and accountability.",
        "focusing foreign aid on countries and sectors where it can achieve sustainable outcomes.",
        "reducing administrative overhead within USAID.",
        "ensuring foreign aid aligns clearly with U.S. strategic interests.",
    ],
    usaid_fund: [
        "U.S. foreign aid via USAID addresses global poverty, promotes health, and supports democracy.",
        "investing in global development prevents conflicts and creates economic partners.",
        "adequate USAID funding allows effective response to humanitarian crises.",
        "supporting USAID advances both American values and interests abroad.",
    ],
    usaid_review: [
        "improving measurement and reporting of USAID program outcomes.",
        "strengthening local partnerships for sustainable development.",
        "ensuring USAID programs have strong safeguards against corruption.",
        "adapting USAID strategies to address emerging global challenges.",
    ],
    usaid_climate_cut: [ // Specific USAID area
        "international climate aid needs careful evaluation for effectiveness and verification.",
        "prioritizing climate finance towards projects with the greatest impact.",
        "ensuring transparency in how U.S. climate aid is used.",
        "balancing international climate aid against pressing domestic needs.",
    ],
    usaid_climate_fund: [
        "addressing the global climate crisis requires U.S. leadership, including supporting developing nations via USAID.",
        "international climate finance helps mitigate global emissions and fosters cooperation.",
        "investing in climate adaptation abroad can reduce instability and migration.",
        "supporting clean energy transitions in developing countries benefits global climate goals.",
    ],
    usaid_climate_review: [
        "ensuring U.S. climate aid aligns with broader development goals.",
        "improving coordination of climate finance across U.S. agencies.",
        "developing robust monitoring and verification for international climate projects.",
        "leveraging private sector investment for global climate solutions.",
    ],
    // --- Law Enforcement ---
    deportations_border_cut: [
        "focusing border resources on humane processing and addressing root causes of migration may be more effective.",
        "reviewing the cost and effectiveness of large-scale detention and deportation.",
        "prioritizing enforcement actions based on public safety risks.",
        "investing in technology and infrastructure at ports of entry for efficient processing.",
    ],
    deportations_border_fund: [
        "securing borders requires adequate resources for CBP personnel, technology, and infrastructure.",
        "funding for ICE is needed for interior enforcement and managing removal proceedings.",
        "investing in border security helps maintain national sovereignty.",
        "providing resources to combat smuggling and trafficking at the border.",
    ],
    deportations_border_review: [
        "ensuring humane treatment and due process in immigration enforcement.",
        "improving efficiency in immigration courts and asylum processing.",
        "enhancing coordination between CBP, ICE, and other agencies.",
        "utilizing technology effectively for border surveillance and management.",
    ],
    federal_prisons_cut: [
        "exploring criminal justice reforms to reduce incarceration rates for non-violent offenses.",
        "expanding alternatives to imprisonment could lower costs.",
        "improving rehabilitation programs to reduce recidivism.",
        "addressing overcrowding through sentencing reform or other measures.",
    ],
    federal_prisons_fund: [
        "maintaining safe and humane federal prisons requires funding for staffing, maintenance, and healthcare.",
        "investing in education and job training programs within prisons reduces recidivism.",
        "addressing understaffing ensures safety for inmates and correctional officers.",
        "providing adequate mental health and substance abuse treatment in prisons.",
    ],
    federal_prisons_review: [
        "implementing evidence-based practices to reduce violence in prisons.",
        "enhancing oversight of healthcare services for federal inmates.",
        "improving reentry programs to support successful community transitions.",
        "evaluating the effectiveness of different correctional programs.",
    ],
    // --- Transportation ---
    highways_cut: [
        "federal highway funding should prioritize maintenance over costly new expansion.",
        "ensuring states use federal highway funds efficiently.",
        "balancing highway investments with support for transit and rail.",
        "exploring innovative financing mechanisms for highways.",
    ],
    highways_fund: [
        "modernizing America's aging highway infrastructure requires significant federal investment.",
        "predictable federal funding allows states to undertake large transportation projects.",
        "investing in highway improvements enhances safety, reduces congestion, and supports freight movement.",
        "upgrading bridges and roads is critical for economic activity.",
    ],
    highways_review: [
        "prioritizing projects that improve safety and reduce bottlenecks.",
        "streamlining environmental review for critical infrastructure projects.",
        "incorporating technology to improve traffic flow and safety.",
        "ensuring highway projects are resilient to climate change impacts.",
    ],
    public_transit_cut: [
        "federal transit funding should prioritize systems with high ridership and efficiency.",
        "encouraging local/state governments to bear a larger share of transit operating costs.",
        "evaluating the cost-effectiveness of specific large transit projects.",
        "ensuring transit agencies operate efficiently.",
    ],
    public_transit_fund: [
        "investing in public transit reduces congestion, lowers emissions, and increases accessibility.",
        "adequate federal funding helps transit agencies maintain safe service and upgrade infrastructure.",
        "supporting transit provides affordable transportation options.",
        "funding the transition to cleaner transit fleets (electric buses).",
    ],
    public_transit_review: [
        "improving transit service frequency, reliability, and coverage.",
        "integrating transit with other modes like biking and walking.",
        "ensuring transit systems are accessible to people with disabilities.",
        "using technology to improve the rider experience (real-time info, payments).",
    ],
    tsa_cut: [
        "reviewing TSA screening procedures for efficiency, potentially using more risk-based approaches.",
        "evaluating the cost-effectiveness of specific TSA technologies.",
        "ensuring appropriate staffing levels and minimizing administrative overhead.",
        "comparing TSA performance and cost against international counterparts.",
    ],
    tsa_fund: [
        "maintaining aviation security requires adequate TSA funding for staffing and technology.",
        "investing in advanced screening technologies enhances security effectiveness.",
        "providing competitive pay and training for TSA officers improves performance.",
        "adapting TSA protocols to address evolving security threats.",
    ],
    tsa_review: [
        "balancing rigorous security screening with passenger facilitation.",
        "continuously adapting security protocols to counter new threats.",
        "improving communication between TSA, airports, and airlines.",
        "evaluating the effectiveness of different screening methods.",
    ],
    faa_cut: [
        "ensuring the FAA operates efficiently, especially in air traffic control modernization.",
        "evaluating the necessity of all FAA programs, prioritizing core safety functions.",
        "streamlining aircraft certification while maintaining rigorous safety standards.",
        "reducing bureaucratic delays within the FAA.",
    ],
    faa_fund: [
        "ensuring airspace safety requires robust FAA funding for oversight and air traffic control.",
        "adequate FAA resources are critical for maintaining aviation safety.",
        "investing in NextGen air traffic control modernization enhances efficiency.",
        "funding FAA oversight of aircraft manufacturing and maintenance.",
    ],
    faa_review: [
        "addressing air traffic controller staffing shortages.",
        "accelerating the implementation of NextGen technologies.",
        "enhancing oversight of aircraft manufacturing processes.",
        "improving coordination between the FAA and international aviation authorities.",
    ],
    amtrak_cut: [
        "Amtrak's reliance on federal subsidies warrants scrutiny regarding operational efficiency.",
        "focusing federal rail investments on corridors with high potential ridership.",
        "exploring increased private sector involvement in passenger rail.",
        "demanding greater financial accountability from Amtrak.",
    ],
    amtrak_fund: [
        "investing in Amtrak offers an alternative to congested highways and airports.",
        "adequate funding allows Amtrak to upgrade infrastructure and modernize its fleet.",
        "supporting passenger rail connects communities and reduces emissions.",
        "expanding Amtrak service to underserved areas.",
    ],
    amtrak_review: [
        "improving Amtrak's on-time performance and customer service.",
        "developing a long-term strategic plan for national passenger rail.",
        "ensuring fair access for Amtrak trains on freight railroad tracks.",
        "evaluating the economic and environmental benefits of specific Amtrak routes.",
    ],
    // --- Science ---
    nasa_cut: [
        "NASA's budget requires careful prioritization, potentially focusing on core science missions.",
        "evaluating the balance between human spaceflight and robotic missions.",
        "encouraging greater efficiency in NASA project management.",
        "scrutinizing the costs of large flagship programs like Artemis.",
    ],
    nasa_fund: [
        "investing in NASA fuels scientific discovery and technological innovation.",
        "funding NASA missions expands human knowledge and benefits life on Earth.",
        "supporting NASA maintains U.S. leadership in space exploration.",
        "NASA programs inspire the next generation of scientists and engineers.",
    ],
    nasa_review: [
        "ensuring NASA maintains a balanced portfolio across science, aeronautics, and exploration.",
        "managing the costs and schedules of large, complex missions.",
        "strengthening partnerships between NASA and the commercial space industry.",
        "prioritizing NASA missions based on scientific merit and national goals.",
    ],
    nsf_cut: [
        "ensuring NSF grants target truly fundamental, high-impact research.",
        "evaluating the balance of NSF funding across scientific disciplines.",
        "minimizing administrative overhead associated with NSF grants.",
        "prioritizing NSF funding based on national needs and scientific opportunity.",
    ],
    nsf_fund: [
        "the NSF provides essential funding for fundamental research across science and engineering.",
        "investing in basic science through the NSF drives innovation and economic competitiveness.",
        "supporting NSF programs broadens participation in STEM fields.",
        "NSF funding trains the future scientific and technical workforce.",
    ],
    nsf_review: [
        "maintaining the integrity of NSF's merit review process.",
        "enhancing NSF's role in translating basic research into applications.",
        "supporting STEM education initiatives from K-12 through graduate school.",
        "ensuring NSF investments align with long-term national interests.",
    ],
    nasa_spacex_cut: [ // Similar to Pentagon_SpaceX, but NASA context
        "NASA's reliance on commercial partners like SpaceX needs oversight for cost-effectiveness and safety.",
        "promoting competition among commercial space providers controls costs.",
        "evaluating the long-term strategy for public-private partnerships in space.",
        "ensuring taxpayer value in NASA's commercial contracts.",
    ],
    nasa_spacex_review: [
        "ensuring rigorous safety standards for commercial crew and cargo missions.",
        "transparency regarding costs and performance of NASA's commercial contracts.",
        "balancing investments in commercial partnerships with NASA's internal capabilities.",
        "defining clear roles and responsibilities between NASA and commercial partners.",
    ],
    // --- Generic Fallbacks (Least specific) ---
    default_cut: [
        "this program's current funding level appears disproportionately high compared to its apparent benefits.",
        "resources allocated here might be better utilized if redirected towards more pressing needs.",
        "a reduction in funding for this area should be seriously considered during budget negotiations.",
        "the justification for this level of spending requires much closer scrutiny.",
    ],
    default_fund: [
        "adequate investment in this area is likely necessary for it to achieve its stated mission effectively.",
        "increased resources could potentially unlock greater public benefit from this program.",
        "ensuring this program has sufficient funding seems prudent based on its objectives.",
        "this appears to be a valuable program deserving of continued or increased support.",
    ],
    default_review: [
        "closer examination of this program's operations is warranted to ensure efficiency.",
        "regular oversight is needed to confirm this program is delivering value for taxpayer money.",
        "an evaluation of this program's effectiveness and impact would be beneficial.",
        "transparency regarding this program's spending and outcomes should be improved.",
    ],
};

// Paragraph about BUDGET/DEBT
export const BUDGET_DEBT: Record<Tone, string> = {
    0: "Additionally, while addressing specific programs, I hope Congress will also maintain a focus on long-term fiscal responsibility and work towards a sustainable budget path.",
    1: "Beyond these specific items, I strongly urge you to prioritize measures that lead to greater fiscal sustainability and begin addressing our growing national debt.",
    2: "Furthermore, addressing the national debt cannot be postponed. Fiscal discipline must be central to every spending decision Congress makes, starting now.",
    3: "Critically, the soaring national debt is an existential threat to our economic future. A concrete, aggressive debt-reduction plan is not optional—it is an absolute necessity.",
};

// CALL TO ACTION (More direct and demanding at higher tones)
export const CALL_TO_ACTION: Record<Tone, string> = {
    0: "Could you please share your perspective on how these specific funding issues might be addressed in upcoming budget discussions? I appreciate your time and service.",
    1: "I request that you outline the steps you intend to take to address these spending concerns and promote greater fiscal responsibility. Keeping constituents informed is important.",
    2: "I expect a detailed response outlining the concrete actions you will champion to correct these spending priorities and aggressively tackle the national debt. Accountability is essential.",
    3: "I demand a prompt and specific action plan from your office detailing how you will fight to realign this irresponsible spending and put our nation on a sustainable fiscal path. Failure to act is unacceptable.",
};

// Transition phrases between items or between rationale and next item start
export const TRANSITIONS: string[] = [
    "Furthermore,", "Additionally,", "Moving on,", "Another point to consider is",
    "Similarly,", "In addition,", "Moreover,", "Equally important is"
];

// Sentence openers to introduce an item's funding level (varied)
export const ITEM_OPENERS: Record<FundingActionRationale, string[]> = {
    cut: [
        "Regarding funding for {ITEM}, my view is that it",
        "When it comes to {ITEM}, my perspective is that it",
        "The allocation for {ITEM}",
        "Funding levels for {ITEM}",
        "Concerning {ITEM}, the budget",
        "Turning to {ITEM}, I believe its funding",
        "The expenditure on {ITEM}",
    ],
    fund: [
        "Regarding {ITEM}, I believe increased investment is warranted.",
        "For {ITEM}, adequate funding is crucial.",
        "It's important to support {ITEM}; therefore, its funding",
        "Considering {ITEM}, the current budget",
        "When discussing {ITEM}, it seems clear that its funding",
        "Investment in {ITEM}",
    ],
    review: [
        "The funding for {ITEM} requires careful review.",
        "With respect to {ITEM}, its budget",
        "Oversight of {ITEM} is critical, meaning its funding",
        "The allocation towards {ITEM}",
        "For {ITEM}, ensuring efficiency means its funding",
        "Evaluating {ITEM} suggests its budget",
    ]
};


// Connectors between action phrase and rationale (varied)
export const RATIONALE_CONNECTORS: { polite: string[], firm: string[] } = {
    polite: [", as", ", because", ". Specifically,", ". For instance,", ". My reasoning is that"],
    firm: [";", ". Clearly,", ". Simply put,", ". This is because", "; the justification being that"]
};

// Phrases to introduce categories (varied)
export const CATEGORY_INTRO_PHRASES: Record<string, string[]> = {
    default: [
        "In the area of {CATEGORY}, several points stand out:",
        "Looking specifically at {CATEGORY}:",
        "My thoughts on {CATEGORY} funding include the following:",
        "Regarding the {CATEGORY} budget:",
        "Within the {CATEGORY} allocation:",
    ],
    "War and Weapons": [
        "Turning to defense spending and related areas:",
        "Regarding the substantial budget for {CATEGORY}:",
        "My concerns about {CATEGORY} spending are as follows:",
    ],
     "Health": [
        "In the critical area of {CATEGORY} funding:",
        "Considering our nation's {CATEGORY} priorities:",
        "With respect to the {CATEGORY} budget:",
    ],
     "Interest on Debt": [ // Special handling for this category
        "The significant amount allocated to {CATEGORY} is deeply concerning.",
        "Addressing the burden of {CATEGORY} requires immediate focus.",
    ]
    // Add more category-specific intros if desired
};

// Phrases to connect sentences within a paragraph (more subtle than full transitions)
export const INTRA_PARAGRAPH_CONNECTORS: string[] = [
    " ", // Just a space
    " Also, ",
    " Furthermore, ",
    " Additionally, ",
    " Moreover, ",
    " In this context, ",
    " Similarly, ",
];

// Closing salutations
export const SALUTATIONS: string[] = [
    "Sincerely,", "Respectfully,", "Regards,", "Thank you for your consideration,",
];
