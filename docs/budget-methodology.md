# Federal spending dataset, as of November 2, 2026

## Year and accounting boundary

Use **FY2026**, October 1, 2025–September 30, 2026. Treasury's September records are available through the official MTS API: [table 9, functional outlays and receipts](https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_9?filter=record_date:eq:2026-09-30&page%5Bsize%5D=10000), [table 5, agency/program outlays](https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5?filter=record_date:eq:2026-09-30&page%5Bsize%5D=10000), and [table 4, receipts](https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_4?filter=record_date:eq:2026-09-30&page%5Bsize%5D=10000). Retained JSON snapshots are in `sources/`. The old Treasury PDF path returned an HTML redirect, so it was **not** treated as a PDF or as evidence of any figure. FY2025 fallback is unnecessary.

Unified outlays are **$7,395.79998331323 billion**, receipts **$5,403.32675896081 billion**, and deficit **$1,992.47322435242 billion**. Values use the API dollar fields divided by 1 billion, retaining cents through decimal arithmetic. `final` means year-end MTS actuals, not an audited financial report or immunity from later revisions. Category totals use all 19 functional rows in table 9 exactly once, grouped into 17 categories.

[CBO's October 8 FY2026 review](https://www.cbo.gov/system/files/2026-10/61985-MBR.pdf) exists, but explicitly labels its FY2026 numbers preliminary, using August MTS and September daily statements. Treasury controls this dataset. A material discrepancy is retained: CBO's preliminary net interest is $1,143 billion; the retrieved Treasury table 9 net-interest row is $1,051.75396931111 billion. No unsupported explanation or blending of these source vintages is attempted.

## Category mapping and double-counting controls

These are **unified functional categories**, not NPP's federal-funds-only categories. Table 5 provides detailed accounts; each record includes source rows and scope caveats. Residuals are the exact functional total minus named lines. They include remaining programs, net receipts and agency/function classification differences; they are not independently published program totals.

| Retained category ID | Functional boundary and material decisions |
|---|---|
| `social_security` | 650; OASI retirement **and survivors**, DI benefits; administration/remaining transactions in residual. |
| `health` | 550 + 570; Medicare uses the **net** function total. ACA outlays include both Treasury and HHS entries, including the negative Treasury entry. No second premium, trust-fund transfer or gross Medicare benefit line. |
| `defense` | 050; military personnel, O&M, procurement, R&D, construction and DOE atomic defense accounts. DARPA stays inside R&D. FMF moves to international affairs. |
| `interest_debt` | 900; net interest. Gross Treasury interest and trust-fund interest are not added again. |
| `veterans_retirement` | 700; label changed to veterans benefits/services. VA amount subtracts the separate toxic-exposure account. Civilian and military pensions move to income security. |
| `economic_security` | 600; includes pensions, nutrition, housing assistance, unemployment, SSI, TANF, child care and refundable CTC/EITC. TANF is not exclusively household cash assistance. |
| `education` | 500; includes training/social services. K–12 is broader than Title I/IDEA. College aid includes subsidy-budget accounting; negative Education proprietary receipts remain explicit. |
| `housing_community` | 450; community/regional development, FEMA Disaster Relief and HUD Community Development Fund. Public housing/vouchers are in income security. CDF includes disaster recovery, not just regular CDBG. |
| `transportation` | 400; includes TSA, FAA and NASA aeronautics. FRA covers more than Amtrak alone. |
| `energy_environment` | 270 + 300; includes ARPA-E, excludes DOE atomic defense and Office of Science. |
| `international_affairs` | 150; diplomacy, aid and FMF. Legacy USAID accounting is not evidence of an independently operating USAID. |
| `law_enforcement` | 750; includes judiciary/defender services, moved from government operations. |
| `science` | 250; NASA less aeronautics, NSF and DOE Science. Commercial contracts are embedded in NASA. |
| `government_ops` | 800; IRS operations exclude refundable-credit payments and refund interest. |
| `agriculture` | 350, newly explicit; crop insurance/commodity programs. Nutrition remains in income security. |
| `commerce_housing_credit` | 370, newly explicit; includes CFPB, MBDA and negative FDIC net outlays. |
| `other_offsetting_receipts` | 950, **negative**, newly explicit. Do not additionally subtract table 5's broader undistributed receipts grouping, which includes trust-fund interest already handled by functional net interest. |

The broad `hud` identifier survives as a **nonadditive** $68.26337380371 billion agency total spanning several categories. Adding HUD plus its housing/CDF components would duplicate spending. All 70 old category/program IDs survive in additive records or `nonAdditivePrograms`; callers must respect `additive: false`.

## Actuals, gaps and provisional detail

All additive spending values are FY2026 reported outlays or explicit residual arithmetic. **No appropriation, pledge, prior-year amount, obligation or contract ceiling is passed off as an actual outlay.** There are three provisional USAspending splits: [PACT toxic-exposure account, $47.74262866029 billion](https://api.usaspending.gov/api/v2/federal_accounts/6479/fiscal_year_snapshot/2026/), [ARPA-E, $0.31845740923 billion](https://api.usaspending.gov/api/v2/federal_accounts/5813/fiscal_year_snapshot/2026/), and [MBDA, $0.01515988556 billion](https://api.usaspending.gov/api/v2/federal_accounts/3664/fiscal_year_snapshot/2026/). These are the endpoint's `outlay`, not `appropriations` or `budget_authority`. The snapshots do not establish September certification/completeness, so their records say `preliminary`; residuals retain source-system differences. PACT is the named fund, not every cost associated with that law. MBDA outlays do not prove current staffing or organizational status.

Separately unavailable FY2026 actuals are **Head Start, federal defender services, NASA commercial space contracts, international climate aid, and a comprehensive DARPA/ARPA aggregate**. Their identifiers remain flagged with `amountB: null`, outside additive sums, with containing programs indicated. Broad Children and Families Services cannot be relabeled Head Start; DC defender payments cannot stand in for national federal defenders. ARPA-E is listed separately, DARPA remains within military R&D. No unverified funding figure was inserted to fill these gaps.

[GAO's September 2026 foreign-assistance review](https://www.gao.gov/products/gao-26-108607) confirms that State assumed remaining USAID programs after USAID ceased administering awards July 1, 2025. Treasury still reports $7.34968647457 billion under legacy USAID accounts. The record is labeled transferred/closeout activity; neither zero spending nor unchanged agency operations is inferred.

## Recommended receipt methodology

**Income tax versus payroll.** Recommend a financing-aware income-tax allocation that separates dedicated trust-fund financing from general funding. Do not describe a simple income-tax-times-unified-outlay-share calculation as tracing that person's money. Such a calculation is defensible only as an explicitly proportional illustration of the whole budget. This JSON supplies unified spending, **not** the additional federal-funds/trust-funds financing allocation needed for the stronger claim.

[NPP's 2025 methodology](https://www.nationalpriorities.org/analysis/2025/tax-day-2025-your-tax-receipt/tax-day-2025-notes-and-sources/) separates federal funds from trust funds, uses federal-fund outlays and excludes payroll taxes from its income-tax receipt. The [archived White House receipt](https://obamawhitehouse.archives.gov/issues/taxes/tax-receipt) takes income tax, Social Security tax and Medicare tax separately; its income-tax section accounts for dedicated funding and includes shortfalls covered by income taxes. It also discusses dedicated unemployment and transportation taxes. Medicare cannot simply be removed as entirely payroll-funded: [Parts B/D rely heavily on general revenues and premiums, while Part A uses payroll taxes](https://www.medicare.gov/about-us/how-is-medicare-funded).

**Deficit.** Recommend separating financing from spending. Receipts finance **73.0594%** of FY2026 net outlays; the deficit finances **26.9406%** in the budget identity. For a proportional illustration, allocate tax amount `T` as `T × category_outlays / total_outlays`; keep the deficit separate, without allocating the same tax dollar twice. If using `category_outlays / receipts`, the displayed spending sums to **136.8749%** of `T`: identify the extra **36.8749%** as associated deficit financing, never taxes actually paid by the person. Net borrowing, debt growth and cash-balance changes need not equal the budget deficit. No source earmarks particular borrowed dollars to particular programs.

**Tax estimator and mean/median.** Use the [2025 IRS ordinary-income brackets](https://www.irs.gov/irb/2024-45_IRB), applied progressively to taxable income, and the **updated** [2025 standard deductions](https://www.irs.gov/publications/p501): single $15,750; married joint $31,500; head of household $23,625. Earlier pre-legislation 2025 deductions are obsolete. Brackets plus the basic deduction estimate ordinary-income tax before credits; they omit itemization, capital-gains rates, payroll/self-employment taxes, dependents/credits and special deductions. They are not a complete liability calculator.

For the national/state statistic, use one reproducible definition: **income tax after nonrefundable credits, Form 1040 line 22 (`A06500 × 1,000`), divided by all returns (`N1`)**, nominal tax-year 2023 dollars. [IRS 2023 CSV](https://www.irs.gov/pub/irs-soi/23in55cmcsv.csv) and [documentation](https://www.irs.gov/pub/irs-soi/23incmdocguide.doc) yield **$13,223.50 per return** from 159,949,000 returns and $2,115,085,827,000. Restricting the denominator to returns with income tax gives **$18,474.58**, a different mean. This defined measure excludes NIIT/other Schedule 2 Part II taxes and does not net refundable credits. It is not fiscal-year Treasury cash collections per return or an all-household burden. The published AGI-grouped aggregates do **not** identify the median tax liability; `medianIncomeTaxPerReturn` is therefore `null`. Tax on median income and differences between marginal income medians are not median taxes.

Tax-year 2023 is the latest year listed in [IRS Historic Table 2](https://www.irs.gov/statistics/soi-tax-stats-historic-table-2) at access. `byState` includes 50 states, DC and Puerto Rico. IRS counts are rounded to 10, addresses can differ from residence, and federal-return filers in PR are not representative of all Puerto Rican households. No inflation adjustment or FY2026 projection is implied.

## Concrete legacy errors

Audit is pinned to repository commit `f59585b39c6fbf883a22910b129c4ea050f45c2a`; concurrent rebuild changes were not altered.

- `NATIONAL_MEDIAN_FEDERAL_TAX = 17766` has no provenance and is mislabeled a median. The helper calls the identical number a national **average**. Neither it nor the state figures identify tax year, denominator or inflation basis. They do not equal the defined current IRS means: old NY $23,821 versus $17,353.78; DC $31,757 versus $25,418.26; PR $22,469 versus $6,059.86. Different-denominator or inflation-adjusted means could differ, so their original provenance cannot be inferred just from numerical proximity.
- Whole-number category percentages sum to 100%, but program reference dollars total **$44,293**. Including the $6,760 implied by the interest category leaves **$947 unallocated** out of $52,000. Health programs total $12,000 against a category amount of $11,960; economic security $2,820 against $3,640; government operations $353 against $520. The two allocation levels disagree.
- Aggregate-plus-subcomponent hazards include VA/PACT, HUD/housing/CDBG, NASA/commercial contracts, judiciary/defenders, and USAID/climate aid. The old record set gives no subtraction or residual establishing disjoint amounts. It omits explicit agriculture, commerce/credit and negative offsets. IRS operations, refundable credits, loan subsidies, appropriations and award obligations must not be conflated.

## ZIP audit

The frozen original function was executed after removing only TypeScript annotations; reproduction is in `audit_zip.js`. Outputs include:

| Input | Old result | Correct state/area |
|---|---|---|
| `20190` | DC | VA |
| `20601` | DC | MD |
| `02840` | MA | RI |
| `05401` | NY | VT |
| `19380` | NY | PA |
| `83001` | ID | WY |
| `00901` | NY | PR |
| `96910` | CA | GU |

Guam 96910 is confirmed by the [U.S. Department of Justice office address](https://www.justice.gov/usao-gu/contact-us). The first seven conflicts follow USPS state/prefix assignments in [Postal Explorer, exhibit 215.1](https://pe.usps.com/text/imm/immc2_006.htm); that exhibit is a service-area list, not a complete ZIP validation table. The function's `20` branch shadows VA `201` and MD `206–209`; `02` swallows RI; `83` shadows WY exceptions. It has no VT/PR/VI/military-territory handling. `trim()` is applied only to the first-character dispatch: `20190` returns DC but ` 20190` returns VA. Invalid `2abc` returns VA and six-digit `999999` returns AK, so it does not validate ZIPs.

Recommend replacing prefix guesses with maintained **five-digit** postal data, preserving leading zeros, normalizing once, validating format, and returning unknown for unsupported codes. State inference is not always exact: [HUD's crosswalk documentation](https://www.huduser.gov/portal/datasets/usps_crosswalk.html) confirms ZIPs can cross state boundaries and notes missing/PO-box limitations. Use the address's state when available; do not silently turn ambiguous ZIPs into a claimed precise residence.

## Validation

`python3 research/validate_budget.py` passes with exact `Decimal` arithmetic: **17 categories, 90 additive lines, 70 retained legacy IDs, 52 state/area records**, and **zero** differences for every category's program sum, all categories versus Treasury outlays, receipt components versus receipts, and outlays minus receipts versus deficit. Source-row values, USAspending splits and all IRS means are independently recomputed. `validation.json` holds the result. Exact sums establish accounting reconciliation, not separate certification of every residual's functional attribution or of provisional USAspending coverage.
