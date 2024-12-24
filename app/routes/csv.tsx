import React, { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import {
  Wallet,
  Upload,
  Loader2,
  FileText,
  Info,
  FileDown,
} from "lucide-react";
import { Header } from "~/components/header";
import { cn } from "~/lib/utils";

export default function PreparePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setCurrentFile(file);
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

      if (uniqueTransactions.size < 200) {
        throw new Error(
          `Not enough  transactions. Found ${uniqueTransactions.size}, need at least 200.`
        );
      }

      // If validation passes, continue with processing
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadError(
        error instanceof Error ? error.message : "Error processing file"
      );
      setCurrentFile(null);
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

    const file = e.dataTransfer.files[0];
    if (file?.type === "text/csv") {
      handleFile(file);
    }
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
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!currentFile) return;

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", currentFile);

      const response = await fetch("http://localhost:8787/upload-csv", {
        method: "POST",
        body: formData,
      });

      if (response.status === 200) {
        console.log("Raw response:", response);
      }

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const jsonResponse = await response.json();
      console.log("Upload response:", jsonResponse);

      // Handle successful upload
      setCurrentFile(null);
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
    <>
      <Header />
      <div className="prepare-page p-6 container max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload transactions</h1>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-400" />
            <p className="text-sm text-blue-700">
              Your CSV file must contain at least 200 transactions for accurate
              analysis.
            </p>
          </div>
        </div>
        <div className="space-y-4 mb-8">
          <Card
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={handleDownloadExample}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <FileDown className="w-12 h-12 text-primary" />
              <div className="flex-1">
                <CardTitle className="text-xl text-blue-600 underline">
                  Download Example CSV
                </CardTitle>
                <CardDescription>
                  See how to format and structure your transactions
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
          {currentFile ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <FileText className="w-12 h-12 text-primary" />
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      {currentFile.name}
                    </CardTitle>
                    <CardDescription>
                      {(currentFile.size / 1024).toFixed(2)} KB
                    </CardDescription>
                  </div>
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Processing...
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </CardHeader>
              </Card>

              {uploadError && (
                <p className="text-sm text-red-500 mt-2">{uploadError}</p>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload File"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Card>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    "cursor-pointer",
                    isUploading && "opacity-50 pointer-events-none"
                  )}
                  onClick={handleClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Wallet className="w-12 h-12 text-primary" />
                    <div>
                      <CardTitle className="text-xl">
                        {isDragActive
                          ? "Drop your CSV file here"
                          : "Drag your CSV file here"}
                      </CardTitle>
                      <CardDescription>
                        You can find this in your bank's online banking portal.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <div
                    className={cn(
                      "p-8 border-t border-dashed flex flex-col items-center justify-center gap-4 transition-colors",
                      isDragActive && "bg-primary/5"
                    )}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">
                          Uploading your file...
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag and drop your CSV file here, or click to select a
                          file
                        </p>
                        <Button variant="secondary" size="sm">
                          Select File
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
