export interface ShareClass {
  id: number;
  name: string;
  type: "preferred" | "common";
  seniority: number;
  liquidationPref: number;
  prefType: "participating" | "non-participating";
  cap: number | null;
}

export interface Transaction {
  id: number;
  shareClass: string;
  shares: number;
  investment: number;
  stakeholder: string;
}

export interface WaterfallStep {
  name: string;
  value: number;
  remainingProceeds: number;
  isStarting?: boolean;
  shareClass?: string;
  lpMultiple?: number;
  participationFactor?: number;
  description?: string;
}

export interface SummaryData {
  name: string;
  payout: number;
  percentage: number;
  components: {
    "Liquidation Preference": number;
    "Participation": number;
    "Common Distribution": number;
  };
}

export interface TransactionSummary {
  id: number;
  name: string;
  shareClass: string;
  shares: number;
  investment: number;
  payout: number;
  percentage: number;
  components: Record<string, number>;
}

export function calculateDetailedWaterfall(
  exitAmount: number,
  shareClasses: ShareClass[],
  transactions: Transaction[],
  distributionMethod: "standard" | "residual"
): WaterfallStep[] {
  let results: WaterfallStep[] = [];
  let remainingProceeds = exitAmount;

  results.push({
    name: "Total Exit Proceeds",
    value: exitAmount,
    remainingProceeds: remainingProceeds,
    isStarting: true,
  });

  if (transactions.length === 0) return results;

  const activeShareClasses = shareClasses.filter((sc) =>
    transactions.some((tx) => tx.shareClass === sc.name)
  );

  const sharesByClass: Record<string, number> = {};
  transactions.forEach((tx) => {
    sharesByClass[tx.shareClass] = (sharesByClass[tx.shareClass] || 0) + tx.shares;
  });

  const totalShares = Object.values(sharesByClass).reduce((s, v) => s + v, 0);
  if (totalShares <= 0) return results;

  const investmentByClass: Record<string, number> = {};
  transactions.forEach((tx) => {
    investmentByClass[tx.shareClass] =
      (investmentByClass[tx.shareClass] || 0) + tx.investment;
  });

  const preferredClasses = activeShareClasses
    .filter((sc) => sc.type === "preferred")
    .sort((a, b) => (a.seniority || Number.MAX_SAFE_INTEGER) - (b.seniority || Number.MAX_SAFE_INTEGER));
  const commonClasses = activeShareClasses.filter((sc) => sc.type === "common");

  const payoutsByClass: Record<string, number> = {};
  activeShareClasses.forEach((sc) => {
    payoutsByClass[sc.name] = 0;
  });

  // ========== STEP 1: LIQUIDATION PREFERENCES ==========
  for (const sc of preferredClasses) {
    if (remainingProceeds <= 0) break;

    const totalInvestment = investmentByClass[sc.name] || 0;
    const liquidationPrefAmount = totalInvestment * (sc.liquidationPref || 1);
    const prefPayout = Math.min(liquidationPrefAmount, remainingProceeds);

    if (prefPayout > 0) {
      results.push({
        name: `${sc.name} (Liquidation Preference)`,
        value: -prefPayout,
        lpMultiple: sc.liquidationPref || 1,
        description: `${sc.name} receives liquidation preference of $${prefPayout.toLocaleString()}`,
        remainingProceeds: remainingProceeds - prefPayout,
        shareClass: sc.name,
      });

      payoutsByClass[sc.name] += prefPayout;
      remainingProceeds -= prefPayout;
    }
  }

  // ========== STEP 2: PARTICIPATION (with cap overflow redistribution) ==========
  if (remainingProceeds > 0) {
    const participatingPreferred = preferredClasses.filter(
      (sc) => sc.prefType === "participating"
    );
    const participatingClasses = [...participatingPreferred, ...commonClasses];

    const participatingTotal = participatingClasses.reduce(
      (sum, sc) => sum + (sharesByClass[sc.name] || 0),
      0
    );

    if (participatingTotal > 0) {
      const participationPool = remainingProceeds;

      const phantomDistributions: Record<
        string,
        { amount: number; proRataShare: number; actualAmount?: number; isCapped?: boolean }
      > = {};
      participatingClasses.forEach((sc) => {
        const proRataShare = (sharesByClass[sc.name] || 0) / participatingTotal;
        phantomDistributions[sc.name] = {
          amount: proRataShare * participationPool,
          proRataShare: proRataShare,
        };
      });

      let totalOverflow = 0;
      const cappedClasses: string[] = [];
      const uncappedParticipatingPreferred: ShareClass[] = [];

      participatingPreferred.forEach((sc) => {
        if (sc.cap) {
          const totalInvestment = investmentByClass[sc.name] || 0;
          const capAmount = totalInvestment * sc.cap;
          const currentPayout = payoutsByClass[sc.name];
          const remainingCap = Math.max(0, capAmount - currentPayout);
          const phantomAmount = phantomDistributions[sc.name].amount;

          if (phantomAmount > remainingCap) {
            totalOverflow += phantomAmount - remainingCap;
            cappedClasses.push(sc.name);
            phantomDistributions[sc.name].actualAmount = remainingCap;
            phantomDistributions[sc.name].isCapped = true;
          } else {
            phantomDistributions[sc.name].actualAmount = phantomAmount;
            uncappedParticipatingPreferred.push(sc);
          }
        } else {
          phantomDistributions[sc.name].actualAmount =
            phantomDistributions[sc.name].amount;
          uncappedParticipatingPreferred.push(sc);
        }
      });

      commonClasses.forEach((sc) => {
        phantomDistributions[sc.name].actualAmount =
          phantomDistributions[sc.name].amount;
      });

      participatingClasses.forEach((sc) => {
        const dist = phantomDistributions[sc.name];
        if (dist.actualAmount && dist.actualAmount > 0.01) {
          const distributionType =
            sc.type === "common" ? "Common Distribution" : "Participation";
          results.push({
            name: `${sc.name} (${distributionType})`,
            value: -dist.actualAmount,
            participationFactor: dist.proRataShare,
            description: `${sc.name} receives ${distributionType.toLowerCase()} of $${dist.actualAmount.toLocaleString()}`,
            remainingProceeds: remainingProceeds - dist.actualAmount,
            shareClass: sc.name,
          });
          payoutsByClass[sc.name] += dist.actualAmount;
          remainingProceeds -= dist.actualAmount;
        }
      });

      // ========== STEP 3 & 4: REDISTRIBUTE OVERFLOW ==========
      if (totalOverflow > 0.01) {
        if (distributionMethod === "standard") {
          const remainingClasses = [
            ...uncappedParticipatingPreferred,
            ...commonClasses,
          ];
          const remainingShares = remainingClasses.reduce(
            (sum, sc) => sum + (sharesByClass[sc.name] || 0),
            0
          );

          if (remainingShares > 0) {
            remainingClasses.forEach((sc) => {
              const proportionalShare =
                (sharesByClass[sc.name] || 0) / remainingShares;
              const additionalAmount = proportionalShare * totalOverflow;

              if (additionalAmount > 0.01) {
                const label =
                  sc.type === "common"
                    ? "Overflow Distribution"
                    : "Additional Participation";
                results.push({
                  name: `${sc.name} (${label})`,
                  value: -additionalAmount,
                  participationFactor: proportionalShare,
                  description: `${sc.name} receives ${label.toLowerCase()} of $${additionalAmount.toLocaleString()} (Standard method: ${(
                    proportionalShare * 100
                  ).toFixed(1)}% of overflow)`,
                  remainingProceeds: remainingProceeds - additionalAmount,
                  shareClass: sc.name,
                });
                payoutsByClass[sc.name] += additionalAmount;
                remainingProceeds -= additionalAmount;
              }
            });
          }
        } else {
          // residual common
          uncappedParticipatingPreferred.forEach((sc) => {
            const totalOwnershipShare =
              (sharesByClass[sc.name] || 0) / totalShares;
            const additionalAmount = totalOwnershipShare * totalOverflow;

            if (additionalAmount > 0.01) {
              results.push({
                name: `${sc.name} (Additional Participation)`,
                value: -additionalAmount,
                participationFactor: totalOwnershipShare,
                description: `${sc.name} receives additional distribution of $${additionalAmount.toLocaleString()} (Residual method: ${(
                  totalOwnershipShare * 100
                ).toFixed(1)}% of total)`,
                remainingProceeds: remainingProceeds - additionalAmount,
                shareClass: sc.name,
              });
              payoutsByClass[sc.name] += additionalAmount;
              remainingProceeds -= additionalAmount;
            }
          });

          if (remainingProceeds > 0.01 && commonClasses.length > 0) {
            const totalCommonShares = commonClasses.reduce(
              (sum, sc) => sum + (sharesByClass[sc.name] || 0),
              0
            );

            const finalPool = remainingProceeds;
            commonClasses.forEach((sc) => {
              const commonShare =
                (sharesByClass[sc.name] || 0) / totalCommonShares;
              const finalAmount = commonShare * finalPool;

              if (finalAmount > 0.01) {
                results.push({
                  name: `${sc.name} (Residual Distribution)`,
                  value: -finalAmount,
                  participationFactor: commonShare,
                  description: `${sc.name} receives residual distribution of $${finalAmount.toLocaleString()}`,
                  remainingProceeds: remainingProceeds - finalAmount,
                  shareClass: sc.name,
                });
                payoutsByClass[sc.name] += finalAmount;
                remainingProceeds -= finalAmount;
              }
            });
          }
        }
      }
    }
  }

  return results;
}

export function calculateSummaryWaterfall(
  detailedResults: WaterfallStep[],
  exitAmount: number
): SummaryData[] {
  const summaryByClass: Record<string, SummaryData> = {};

  detailedResults.slice(1).forEach((result) => {
    if (!result.shareClass) return;

    if (!summaryByClass[result.shareClass]) {
      summaryByClass[result.shareClass] = {
        name: result.shareClass,
        payout: 0,
        percentage: 0,
        components: {
          "Liquidation Preference": 0,
          "Participation": 0,
          "Common Distribution": 0,
        },
      };
    }

    const amount = Math.abs(result.value);
    summaryByClass[result.shareClass].payout += amount;

    if (result.name.includes("Liquidation Preference")) {
      summaryByClass[result.shareClass].components["Liquidation Preference"] +=
        amount;
    } else if (
      result.name.includes("Participation") ||
      result.name.includes("Additional Participation")
    ) {
      summaryByClass[result.shareClass].components["Participation"] += amount;
    } else if (
      result.name.includes("Common") ||
      result.name.includes("Final Distribution") ||
      result.name.includes("Overflow Distribution") ||
      result.name.includes("Residual Distribution")
    ) {
      summaryByClass[result.shareClass].components["Common Distribution"] +=
        amount;
    }
  });

  return Object.values(summaryByClass).map((summary) => ({
    ...summary,
    percentage:
      exitAmount > 0
        ? Math.round((summary.payout / exitAmount) * 10000) / 100
        : 0,
  }));
}

export function calculateTransactionSummary(
  summaryData: SummaryData[],
  transactions: Transaction[],
  exitAmount: number
): TransactionSummary[] {
  const sharesByClass: Record<string, number> = {};
  const investmentByClass: Record<string, number> = {};

  transactions.forEach((tx) => {
    sharesByClass[tx.shareClass] =
      (sharesByClass[tx.shareClass] || 0) + tx.shares;
    investmentByClass[tx.shareClass] =
      (investmentByClass[tx.shareClass] || 0) + tx.investment;
  });

  const transactionSummaries: TransactionSummary[] = [];

  transactions.forEach((tx) => {
    const classSummary = summaryData.find((s) => s.name === tx.shareClass);
    if (!classSummary || classSummary.payout <= 0) return;

    const totalClassShares = sharesByClass[tx.shareClass] || 0;
    const payout =
      totalClassShares > 0
        ? (tx.shares / totalClassShares) * classSummary.payout
        : 0;
    const percentage =
      exitAmount > 0 ? Math.round((payout / exitAmount) * 10000) / 100 : 0;

    const components: Record<string, number> = {};
    Object.keys(classSummary.components || {}).forEach((key) => {
      const classComponent: number =
        (classSummary.components as any)[key] || 0;
      components[key] =
        totalClassShares > 0
          ? (tx.shares / totalClassShares) * classComponent
          : 0;
    });

    transactionSummaries.push({
      id: tx.id,
      name: tx.stakeholder ? tx.stakeholder : "Unnamed Stakeholder",
      shareClass: tx.shareClass,
      shares: tx.shares,
      investment: tx.investment,
      payout,
      percentage,
      components,
    });
  });

  return transactionSummaries;
}

export function exportToExcel(
  summaryData: SummaryData[],
  txSummary: TransactionSummary[],
  waterfallSteps: WaterfallStep[],
  transactions: Transaction[],
  shareClasses: ShareClass[],
  exitAmount: number
) {
  if (typeof window === "undefined") return;

  import("xlsx").then((XLSX) => {
    const aggregates: Record<string, { investment: number; shares: number }> =
      {};
    transactions.forEach((tx) => {
      const cls = tx.shareClass;
      if (!aggregates[cls]) aggregates[cls] = { investment: 0, shares: 0 };
      aggregates[cls].investment += tx.investment;
      aggregates[cls].shares += tx.shares;
    });

    const totalSharesAll = Object.values(aggregates).reduce(
      (s, v) => s + v.shares,
      0
    );
    const totalInvestmentAll = Object.values(aggregates).reduce(
      (s, v) => s + v.investment,
      0
    );

    const wb = XLSX.utils.book_new();

    // Cap Table sheet
    const capSheet: any[] = [];
    capSheet.push(["Cap Table - Share Classes"]);
    capSheet.push([
      "Name",
      "% Ownership",
      "Investment ($)",
      "Type",
      "Seniority",
      "Liquidation Pref",
      "Pref Type",
      "Cap",
    ]);

    const capClassStartRow = capSheet.length + 1;
    summaryData.forEach((item, idx) => {
      const agg = aggregates[item.name] || { investment: 0, shares: 0 };
      const scMeta = shareClasses.find((sc) => sc.name === item.name) || ({} as any);
      capSheet.push([
        item.name,
        { t: "n", f: totalSharesAll > 0 ? `${agg.shares}/${totalSharesAll}` : "0" },
        { t: "n", v: agg.investment },
        scMeta.type || "",
        scMeta.seniority || "",
        scMeta.liquidationPref || "",
        scMeta.prefType || "",
        scMeta.cap != null ? scMeta.cap : "",
      ]);
    });

    capSheet.push([
      "Total",
      { t: "n", v: 1 },
      { t: "n", v: totalInvestmentAll },
      "",
      "",
      "",
      "",
      "",
    ]);

    capSheet.push([]);
    capSheet.push(["Cap Table - Share Transactions"]);
    capSheet.push(["Name", "% Ownership", "Investment ($)"]);

    transactions.forEach((tx) => {
      capSheet.push([
        tx.stakeholder || `Tx ${tx.id}`,
        { t: "n", f: totalSharesAll > 0 ? `${tx.shares}/${totalSharesAll}` : "0" },
        { t: "n", v: tx.investment },
      ]);
    });

    const txInvestTotal = transactions.reduce((s, tx) => s + tx.investment, 0);
    capSheet.push(["Total", { t: "n", v: 1 }, { t: "n", v: txInvestTotal }]);

    const capWS = XLSX.utils.aoa_to_sheet(capSheet);
    XLSX.utils.book_append_sheet(wb, capWS, "Cap Table");

    // Share Class sheet
    const scSheet: any[] = [
      [
        "Share Class",
        "Amount ($)",
        "Distribution % (LP adj.)",
        "ROI",
        "Price/Share",
        "Investment ($)",
        "Shares",
      ],
    ];

    summaryData.forEach((item, idx) => {
      const rowIndex = idx + 2;
      const agg = aggregates[item.name] || { investment: 0, shares: 0 };
      scSheet.push([
        item.name,
        { t: "n", v: item.payout },
        { t: "n", v: item.percentage },
        { t: "n", f: `B${rowIndex}/F${rowIndex}` },
        { t: "n", f: `B${rowIndex}/G${rowIndex}` },
        { t: "n", v: agg.investment },
        { t: "n", v: agg.shares },
      ]);
    });

    scSheet.push([
      "Total",
      { t: "n", v: exitAmount },
      { t: "n", v: 100 },
      "",
      "",
      { t: "n", v: totalInvestmentAll },
      { t: "n", v: totalSharesAll },
    ]);

    const scWS = XLSX.utils.aoa_to_sheet(scSheet);
    XLSX.utils.book_append_sheet(wb, scWS, "By Share Class");

    // Transaction sheet
    const txSheet: any[] = [
      [
        "Stakeholder / Transaction",
        "Share Class",
        "Amount ($)",
        "Distribution % (LP adj.)",
        "ROI",
        "Price/Share",
        "Investment ($)",
        "Shares",
      ],
    ];

    txSummary.forEach((item, idx) => {
      const rowIndex = idx + 2;
      txSheet.push([
        item.name,
        item.shareClass,
        { t: "n", v: item.payout },
        { t: "n", v: item.percentage },
        { t: "n", f: `C${rowIndex}/G${rowIndex}` },
        { t: "n", f: `C${rowIndex}/H${rowIndex}` },
        { t: "n", v: item.investment },
        { t: "n", v: item.shares },
      ]);
    });

    txSheet.push(["Total", "", { t: "n", v: exitAmount }, { t: "n", v: 100 }, "", "", "", ""]);
    const txWS = XLSX.utils.aoa_to_sheet(txSheet);
    XLSX.utils.book_append_sheet(wb, txWS, "By Transaction");

    // Steps sheet
    const stepsSheet: any[] = [
      ["Step", "Share Class", "Amount ($)", "LP / Participation Factor", "Remaining Proceeds ($)", "Description"],
    ];

    stepsSheet.push([
      "Total Exit Proceeds",
      "",
      { t: "n", v: exitAmount },
      "",
      { t: "n", v: exitAmount },
      "Starting total proceeds",
    ]);

    let runningRemaining = exitAmount;

    waterfallSteps.slice(1).forEach((step) => {
      const scName = step.shareClass || "";
      const amount = Math.abs(step.value || 0);
      let factor = "";
      if (step.lpMultiple !== undefined) factor = String(step.lpMultiple);
      else if (step.participationFactor !== undefined) factor = String(step.participationFactor);

      runningRemaining -= amount;

      stepsSheet.push([
        step.name || "",
        scName,
        { t: "n", v: amount },
        { t: "n", v: factor },
        { t: "n", v: Math.max(0, runningRemaining) },
        step.description || "",
      ]);
    });

    const stepsWS = XLSX.utils.aoa_to_sheet(stepsSheet);
    XLSX.utils.book_append_sheet(wb, stepsWS, "Waterfall Steps");

    XLSX.writeFile(wb, "waterfall_export.xlsx");
  });
}
