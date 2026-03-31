"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, CheckCircle2, AlertCircle, Download, FileSpreadsheet, ChevronLeft, ChevronRight, FileOutput } from "lucide-react";

interface ConvertedRecord {
  "Stakeholder Name": string;
  "Email": string;
  "Share Class": string;
  "Prefix": string;
  "ID": string;
  "Number of Shares": number;
  "Issue Price": number | string;
  "Issue Date": string;
  "Certificated Share Issuance": string;
  "Share Certificate Type": string;
  "Financing Round": string;
  "Comments": string;
}

export default function ShareRegistryConverterPage() {
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const [convertedData, setConvertedData] = useState<ConvertedRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(convertedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, convertedData.length);
  const pageData = convertedData.slice(startIndex, endIndex);

  const parseNumber = (value: any): number => {
    if (value === null || value === undefined || value === "") return 0;
    const num = parseFloat(String(value).replace(/[,$]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const findCertificateSheet = (sheetNames: string[]): string => {
    const patterns = [/certificate.*ledger/i, /ca.*certificate/i, /certificate/i, /ledger/i, /summary/i, /holdings/i];
    for (const pattern of patterns) {
      const found = sheetNames.find((name) => pattern.test(name));
      if (found) return found;
    }
    return sheetNames[0];
  };

  const findHeaderRow = (data: any[]): number => {
    const requiredColumns = ["stakeholder name", "quantity"];
    for (let i = 0; i < Math.min(15, data.length); i++) {
      const row = data[i];
      if (!row) continue;
      const rowText = row.map((cell: any) => String(cell || "").toLowerCase()).join(" ");
      const hasRequired = requiredColumns.every((col) => rowText.includes(col));
      if (hasRequired) return i;
    }
    return -1;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus({ type: "loading", message: "Reading and analyzing file..." });
    setConvertedData([]);

    try {
      const dataBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(dataBuffer, {
        type: "array",
        cellDates: true,
        cellNF: false,
        cellText: false,
        raw: true,
        codepage: 65001 // UTF-8
      });

      const sheetName = findCertificateSheet(workbook.SheetNames);
      if (!sheetName) throw new Error(`Could not find Certificate Ledger sheet. Available: ${workbook.SheetNames.join(", ")}`);

      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: true, defval: null, blankrows: false });

      const headerRowIndex = findHeaderRow(jsonData);
      if (headerRowIndex === -1) {
        throw new Error("Could not find header row. Ensure 'Stakeholder Name' and 'Quantity Issued' columns exist.");
      }

      const headers = jsonData[headerRowIndex].map((h: any) => String(h || "").toLowerCase());
      const findColumn = (patterns: string[]) => {
        for (const pattern of patterns) {
          const index = headers.findIndex((h: string) => h.includes(pattern));
          if (index !== -1) return index;
        }
        return -1;
      };

      const columnMap = {
        securityId: findColumn(["security id", "certificate id", "cert id"]),
        formattedSecurityId: findColumn(["formatted security", "formatted id", "certificate number"]),
        stakeholderName: findColumn(["stakeholder name", "holder name", "name"]),
        stakeholderEmail: findColumn(["email", "stakeholder email"]),
        quantityIssued: findColumn(["quantity issued", "shares issued", "issued"]),
        quantityOutstanding: findColumn(["quantity outstanding", "outstanding", "current shares"]),
        shareClass: findColumn(["share class", "class", "security type"]),
        pricePaidPerShare: findColumn(["price paid", "issue price", "price per share"]),
        issueDate: findColumn(["issue date", "grant date", "date"]),
        federalExemption: findColumn(["federal exemption", "exemption"]),
        financingRound: findColumn(["financing round", "round", "series"]),
        notes: findColumn(["notes", "comments", "memo"]),
        certificated: findColumn(["paper status", "certificated", "electronic"])
      };

      const sourceData: any[] = [];
      for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[columnMap.stakeholderName] || String(row[columnMap.stakeholderName]).toLowerCase().includes("total")) {
          continue;
        }

        const outstanding = parseNumber(row[columnMap.quantityOutstanding]);
        if (outstanding > 0) {
          sourceData.push({
            securityId: row[columnMap.securityId] || "",
            formattedSecurityId: row[columnMap.formattedSecurityId] || "",
            stakeholderName: row[columnMap.stakeholderName] || "",
            stakeholderEmail: row[columnMap.stakeholderEmail] || "",
            quantityIssued: parseNumber(row[columnMap.quantityIssued]),
            quantityOutstanding: outstanding,
            shareClass: row[columnMap.shareClass] || "Class A",
            pricePaidPerShare: parseNumber(row[columnMap.pricePaidPerShare]),
            issueDate: row[columnMap.issueDate] || "",
            financingRound: row[columnMap.financingRound] || "",
            notes: row[columnMap.notes] || "",
            certificated: row[columnMap.certificated] || ""
          });
        }
      }

      if (sourceData.length === 0) throw new Error("No valid share transactions found in the file.");

      const formatDate = (dateValue: any) => {
        if (!dateValue) return "";
        try {
          let date;
          if (typeof dateValue === "number") date = new Date((dateValue - 25569) * 86400 * 1000);
          else if (typeof dateValue === "string") date = new Date(dateValue);
          else if (dateValue instanceof Date) date = dateValue;
          else return "";
          
          if (isNaN(date.getTime())) return "";
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        } catch { return ""; }
      };

      const determineCertificateStatus = (certData: any) => {
        const data = String(certData || "").toLowerCase();
        if (data.includes("paper") || data.includes("physical")) return { issuance: "Yes", type: "Physical" };
        if ((data.includes("electronic") && !data.includes("not")) || data.includes("yes") || data.includes("certificated")) return { issuance: "Yes", type: "Electronic" };
        return { issuance: "No", type: "" };
      };

      const finalData: ConvertedRecord[] = sourceData.map((record) => {
        let prefix = "";
        let id = "";
        if (record.formattedSecurityId) {
          const match = record.formattedSecurityId.match(/^([A-Za-z]+)[-_]?(\\d+)$/);
          if (match) { prefix = match[1]; id = match[2]; }
        }

        const certStatus = determineCertificateStatus(record.certificated);

        return {
          "Stakeholder Name": record.stakeholderName,
          "Email": record.stakeholderEmail,
          "Share Class": record.shareClass,
          "Prefix": prefix,
          "ID": id,
          "Number of Shares": record.quantityOutstanding,
          "Issue Price": record.pricePaidPerShare,
          "Issue Date": formatDate(record.issueDate),
          "Certificated Share Issuance": certStatus.issuance,
          "Share Certificate Type": certStatus.type,
          "Financing Round": record.financingRound,
          "Comments": record.notes || `Converted from source ${record.formattedSecurityId || record.securityId}`
        };
      });

      setConvertedData(finalData);
      setCurrentPage(1);
      setStatus({ type: "success", message: `Successfully converted ${finalData.length} records. Ready for review or download.` });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", message: err.message || "An unexpected error occurred during processing." });
    }
  };

  const handleExportExcel = () => {
    if (convertedData.length === 0) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(convertedData);

    ws["!cols"] = [
      { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 40 }
    ];
    ws["!freeze"] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, ws, "Share Transactions");

    const stakeholderNames = Array.from(new Set(convertedData.map(r => r["Stakeholder Name"]))).filter(Boolean);
    const emails = Array.from(new Set(convertedData.map(r => r["Email"]))).filter(Boolean);
    const shareClasses = Array.from(new Set(convertedData.map(r => r["Share Class"]))).filter(Boolean);

    if (stakeholderNames.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Stakeholder Names"], ...stakeholderNames.map(n => [n])]), "Ref_StakeholderNames");
    if (emails.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Emails"], ...emails.map(e => [e])]), "Ref_Emails");
    if (shareClasses.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Share Classes"], ...shareClasses.map(c => [c])]), "Ref_ShareClasses");

    const filename = `ShareRegistry_Import_${new Date().toISOString().slice(0, 19).replace(/[:-]/g, "")}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const handleExportCSV = () => {
    if (convertedData.length === 0) return;
    const headers = Object.keys(convertedData[0]) as (keyof ConvertedRecord)[];
    const escapeCsv = (val: any) => {
      const v = String(val || "");
      if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`;
      return v;
    };

    const csvRows = [headers.map(escapeCsv).join(",")];
    convertedData.forEach((row) => csvRows.push(headers.map(h => escapeCsv(row[h])).join(",")));

    const blob = new Blob([csvRows.join("\\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ShareRegistry_Import_${new Date().toISOString().slice(0, 19).replace(/[:-]/g, "")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const uniqueShareholders = new Set(convertedData.map((r) => r["Stakeholder Name"])).size;
  const totalShares = convertedData.reduce((sum, r) => sum + (r["Number of Shares"] || 0), 0);
  const totalShareClasses = new Set(convertedData.map((r) => r["Share Class"])).size;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-md flex items-center justify-center shrink-0">
             <FileOutput className="text-white w-8 h-8" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Share Registry Converter</h1>
            <p className="text-slate-500 text-sm md:text-base">Transform messy cap table exports into clean, standardized import formats with automated matching.</p>
          </div>
        </div>

        {/* Upload Zone */}
        <Card className="border-dashed border-2 bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-none group">
          <CardContent className="p-12 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
             <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
               <UploadCloud className="w-10 h-10" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Drop your certificate ledger export here</h3>
             <p className="text-slate-500 max-w-md mx-auto">Upload an .xlsx or .xls file. We'll automatically identify columns logically, normalize data formats, and split IDs correctly.</p>
             
             {status.type !== "idle" && (
                <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  status.type === 'loading' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {status.type === 'loading' && <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                  {status.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                  {status.type === 'error' && <AlertCircle className="w-4 h-4" />}
                  {status.message}
                </div>
             )}
          </CardContent>
        </Card>

        {convertedData.length > 0 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4 flex flex-col items-center justify-center"><p className="text-sm font-bold text-slate-500 uppercase">Records</p><p className="text-3xl font-black text-slate-900">{convertedData.length}</p></CardContent></Card>
              <Card><CardContent className="p-4 flex flex-col items-center justify-center"><p className="text-sm font-bold text-slate-500 uppercase">Shareholders</p><p className="text-3xl font-black text-slate-900">{uniqueShareholders}</p></CardContent></Card>
              <Card><CardContent className="p-4 flex flex-col items-center justify-center"><p className="text-sm font-bold text-slate-500 uppercase">Total Shares</p><p className="text-3xl font-black text-slate-900">{totalShares.toLocaleString()}</p></CardContent></Card>
              <Card><CardContent className="p-4 flex flex-col items-center justify-center"><p className="text-sm font-bold text-slate-500 uppercase">Classes</p><p className="text-3xl font-black text-slate-900">{totalShareClasses}</p></CardContent></Card>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="font-bold text-slate-800">Preview Data</h2>
              <div className="flex gap-3">
                <Button variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" onClick={handleExportExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Download XLSX
                </Button>
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" /> Download CSV
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <Card className="overflow-hidden shadow-sm border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Stakeholder</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Prefix / ID</th>
                      <th className="px-4 py-3 text-right">Shares</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3">Issue Date</th>
                      <th className="px-4 py-3">Cert Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-800">{row["Stakeholder Name"]}</td>
                        <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">{row["Email"]}</td>
                        <td className="px-4 py-3"><Badge variant="secondary" className="bg-slate-100 font-normal">{row["Share Class"]}</Badge></td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.Prefix}-{row.ID}</td>
                        <td className="px-4 py-3 text-right font-medium">{row["Number of Shares"].toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{row["Issue Price"] ? `$${row["Issue Price"]}` : "-"}</td>
                        <td className="px-4 py-3 text-slate-500">{row["Issue Date"]}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className={row["Share Certificate Type"] ? "border-indigo-200 text-indigo-700" : ""}>{row["Share Certificate Type"] || "N/A"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-slate-50 p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500">
                <div>Showing {startIndex + 1} to {endIndex} of {convertedData.length} records</div>
                <div className="flex items-center gap-4 mt-3 sm:mt-0">
                  <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <select 
                      className="border border-slate-200 rounded px-2 py-1 bg-white outline-none"
                      value={pageSize}
                      onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    >
                      {[10, 25, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4"/><ChevronLeft className="w-4 h-4 ml-[-8px]"/></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4"/></Button>
                    <div className="px-3 flex items-center font-medium">Page {currentPage} of {totalPages}</div>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4"/></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4"/><ChevronRight className="w-4 h-4 ml-[-8px]"/></Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
