import React, { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import {
  Wallet,
  Upload,
  Loader2,
  FileText,
  Info,
  FileDown,
  Download,
} from "lucide-react";
import { Header } from "~/components/header";
import { cn } from "~/lib/utils";
import { useNavigate } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SEO } from "~/components/seo";
import { API_URL } from "~/lib/api";

const BANK_CONNECTIONS = {
  ANZ: 'conn_cjgaawozb000001nyd111xixr',
  ASB: 'conn_cjgaaqcna000001ldwof8tvj0',
  BNZ: 'conn_cjgaatd57000001pe1t1z0iy9',
  Heartland: 'conn_ck5rhsdbv0000ftx1bmdu9zas',
  Kiwibank: 'conn_cjgaac5at000001qi2yw8ftil',
  Rabobank: 'conn_ckydkmy3r000009mde2sx2i4d',
  'The Cooperative Bank': 'conn_cjgab1c8e000001pmyxrkhova',
  TSB: 'conn_cjgab6fis000001qsytf1semy',
  Westpac: 'conn_cjgaaozdo000001mrnqmkl1m0',
} as const;

type BankName = keyof typeof BANK_CONNECTIONS;

export default function PreparePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankName | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log("Processing file:", file.name);
      setIsProcessing(true);

      // Read and validate the CSV file
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim()); // Remove empty lines

      // Remove header row if it exists
      const transactions = lines.length > 0 ? lines.slice(1) : [];

      // Get unique transactions (removing duplicates)
      const uniqueTransactions = new Set(transactions);

      if (uniqueTransactions.size < 120) {
        throw new Error(
          `Not enough transactions in ${file.name}. Found ${uniqueTransactions.size}, need at least 200 transactions from 2024.`
        );
      }

      // If validation passes, add to current files
      setCurrentFiles((prev) => [...prev, file]);
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadError(
        error instanceof Error ? error.message : "Error processing file"
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    files.filter((file) => file.type === "text/csv").forEach(handleFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(handleFile);
  };

  const handleSubmit = async () => {
    if (!currentFiles.length) {
      toast({
        title: "No files selected",
        description: "Please select at least one CSV file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      console.log(`Sending ${currentFiles.length} files to server`);
      
      currentFiles.forEach((file) => {
        console.log(`Adding file: ${file.name}, size: ${file.size} bytes`);
        formData.append("files", file);
      });

      if (selectedBank) {
        formData.append("connection", BANK_CONNECTIONS[selectedBank]);
      }


      const response = await fetch(`${API_URL}/upload-csv`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const jsonResponse = await response.json();
      console.log("Upload response:", jsonResponse);

      // Navigate to results with the analytics data
      navigate("/results", { 
        state: { analytics: jsonResponse }
      });

      // Handle successful upload
      setCurrentFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadExample = () => {
    // Create CSV content with headers
    const headers = ["Amount", "Details", "Transaction Date"];
    const exampleData = [
      // Add a couple of example rows
      ["100.00", "Grocery Shopping", "2024-03-15"],
      ["-50.00", "ATM Withdrawal", "2024-03-14"],
      ["1250.00", "PB Tech", "2024-03-13"],
    ];

    const csvContent = [
      headers.join(","),
      ...exampleData.map((row) => row.join(",")),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "example-transactions.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Upload CSV Transaction Data"
        description="Upload your bank transaction data to generate your personalized Money Wrapped insights and financial year in review."
      />
      <Header />
      <main className="container mx-auto py-12 px-4 max-w-3xl">
        <div className="space-y-8">
          <div className="text-start space-y-2">
            <h1 className="text-4xl font-bold mb-2">Upload Your Bank Statement</h1>
            <p className="text-muted-foreground text-lg">
              We'll analyze your transactions to create your personalized Money Wrapped
            </p>
          </div>

          <Card className="relative">
            <CardHeader className=" border-b">
              <CardTitle className="text-2xl flex items-center gap-2 ">
                <FileText className="h-6 w-6" />
                CSV File Upload
              </CardTitle>
              <CardDescription>
                Export your bank transactions as a CSV file and upload it here
              </CardDescription>
            </CardHeader>
            <div className="m-6">
              <label className="block text-sm font-medium text-blue-600 hover:cursor-pointer" htmlFor="bank">Select Your Bank (Optional)<br/><p className="text-sm text-muted-foreground mb-2">This helps the system get you more accurate results</p></label>
              
              <Select
                onValueChange={(value) => setSelectedBank(value as BankName)}
                value={selectedBank ?? undefined}
              >
                <SelectTrigger id="bank" className="w-full">
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(BANK_CONNECTIONS).map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className={cn(
                "p-8 border-2 border-dashed rounded-lg m-6 transition-colors duration-200 ease-in-out",
                isDragActive
                  ? "border-primary bg-secondary/50"
                  : "border-muted-foreground/25",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
            >
              <div className="text-center space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleChange}
                  className="hidden"
                  disabled={isUploading}
                  multiple
                />
                <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <Upload className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-blue-600">
                    {isUploading
                      ? "Processing your file..."
                      : "Drag & drop your CSV files here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse your files
                  </p>
                </div>
              </div>
            </div>
            

            {uploadError && (
              <div className="mx-6 mb-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-2">
                <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{uploadError}</p>
              </div>
            )}

            {currentFiles.length > 0 && (
              <div className="mx-6 mb-6 space-y-4">
                <div className="text-sm font-medium">Uploaded Files:</div>
                {currentFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm flex-1">{file.name}</span>
                    <Button
                      variant="ghost"
                      className="text-red-500 hover:bg-red-100 hover:text-red-600"
                      size="sm"
                      onClick={() => {
                        setCurrentFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

       
            <div className="flex justify-end px-6 pb-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Analyze Transactions
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="">
            <CardHeader className="p-0">
              <CardTitle className="text-lg flex items-center gap-2 border-b p-4">
                <Info className="h-5 w-5" />
                How to export your transaction data
              </CardTitle>
              <CardDescription className="space-y-2 p-4 pt-3">
                <p>1. Log into your online banking portal</p>
                <p>2. Navigate to your transactions or account activity for each bank account you want to review</p>
                <p>3. Look for an "Export" or "Download" option</p>
                <p>4. Select CSV format and download your transactions</p>
                <p>5. For best results, include at least the last 12 months of transactions</p>
                <p>6. Make sure the CSV files are formatted in the same way as the demo CSV file - download link below</p>
              </CardDescription>
              <a className="text-blue-600 hover:underline p-4  border-t text-center flex items-center justify-center gap-2" href="/test.csv" download><Download className="h-4 w-4" />Download demo CSV file</a>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
