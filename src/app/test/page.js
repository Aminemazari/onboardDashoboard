"use client";
import { useState } from "react";

export default function UploadPDF() {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Please select a PDF file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    setError("");
    setUrl("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "pdf_uploads"); // Replace with your actual preset
      formData.append("resource_type", "raw"); // Important for PDFs

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/ddidbfyvq/raw/upload", // Replace YOUR_CLOUD_NAME
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      
      if (!res.ok) {
        console.error("Cloudinary error details:", data);
        throw new Error(`Upload failed (${res.status}): ${data.error?.message || res.statusText}`);
      }
      console.log("Cloudinary response:", data);

      if (data.secure_url) {
        setUrl(data.secure_url);
      } else {
        throw new Error("No URL returned from Cloudinary");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload PDF to Cloudinary</h2>
      
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      {uploading && (
        <div className="mt-4 flex items-center text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Uploading...
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          ❌ {error}
        </div>
      )}
      
      {url && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 mb-2">✅ Upload successful!</p>
          <p className="text-sm text-gray-600 mb-2">PDF URL:</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
          >
            {url}
          </a>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        <p className="font-semibold mb-1">Setup Instructions:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Go to your Cloudinary Dashboard → Settings → Upload</li>
          <li>Create a new Upload Preset or edit existing one:</li>
          <li className="ml-4">• Set "Signing Mode" to "Unsigned"</li>
          <li className="ml-4">• Set "Resource Type" to "Auto" or "Raw"</li>
          <li className="ml-4">• Add allowed formats: pdf (or leave empty for all)</li>
          <li>Replace "YOUR_CLOUD_NAME" with your actual cloud name</li>
          <li>Replace "YOUR_UNSIGNED_PRESET" with your preset name</li>
        </ol>
        
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="font-semibold text-yellow-700">Common 400 Error Causes:</p>
          <ul className="list-disc list-inside text-yellow-600 mt-1">
            <li>Upload preset doesn't exist or is signed (not unsigned)</li>
            <li>Wrong cloud name in URL</li>
            <li>Upload preset doesn't allow PDF files</li>
            <li>File size exceeds preset limits</li>
          </ul>
        </div>
      </div>
    </div>
  );
}