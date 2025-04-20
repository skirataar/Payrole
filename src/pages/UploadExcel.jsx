import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

const UploadExcel = ({ setUploadedData }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setUploadStatus(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/upload_excel_by_position', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload file');
      }

      const data = await response.json();
      setUploadedData(data);
      setUploadStatus('success');
      
      // Save to localStorage
      localStorage.setItem('uploadedData', JSON.stringify(data));
      localStorage.setItem('lastUploadTime', new Date().toISOString());
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload');
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      setError(null);
      setUploadStatus(null);
    } else {
      setError('Please upload an Excel file (.xlsx or .xls)');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Excel</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload size={48} className="text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Excel File</h3>
            <p className="text-gray-500 mb-4">Drag and drop your file here, or click to browse</p>
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Browse Files
            </label>
            
            {file && (
              <div className="mt-4 text-sm text-gray-600">
                Selected file: <span className="font-medium">{file.name}</span>
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}
        
        {uploadStatus === 'success' && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
            <CheckCircle size={20} className="mr-2" />
            File uploaded successfully!
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`px-4 py-2 rounded-md ${
              !file || isUploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Upload Instructions</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Upload an Excel file (.xlsx or .xls) containing employee data</li>
          <li>The file should have columns for Employee ID, Name, Attendance, Daily Rate, etc.</li>
          <li>Each sheet in the Excel file will be treated as a separate company</li>
          <li>Empty cells will be treated as zero values</li>
          <li>The system will automatically calculate salaries based on the uploaded data</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadExcel;
