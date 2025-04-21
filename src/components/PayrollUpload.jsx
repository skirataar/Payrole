import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadPayrollExcel } from '../services/payrollApi';

const PayrollUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [reportMonth, setReportMonth] = useState(
    new Date().toISOString().slice(0, 10) // Default to today in YYYY-MM-DD format
  );

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setPreview(null);

    // Validate file type
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadPayrollExcel(file, reportMonth);
      console.log('Upload successful:', result);
      setFile(null);
      // Reset file input
      document.getElementById('payroll-file-upload').value = '';
      
      // Set preview data
      setPreview(result);
      
      // Call the success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      
      // Show success message
      alert(`File uploaded successfully! Processed ${result.length} employee records.`);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.detail || err.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-8">Upload Payroll Excel</h2>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Excel File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="payroll-file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="payroll-file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
            </div>
          </div>
          {file && (
            <div className="mt-2 text-sm text-gray-500">
              Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>

        {/* Report Month */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Month
          </label>
          <input
            type="date"
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            This will be used as the report month for all entries
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <p className="font-medium">Error:</p>
            </div>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!file || isUploading}
          className={`mt-6 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors w-full
            ${(!file || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? 'Processing...' : 'Upload and Process'}
        </button>
      </div>

      {/* Preview Section */}
      {preview && preview.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-lg font-medium">Upload Successful</h3>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-x-auto">
            <h4 className="text-md font-medium mb-3">Processed {preview.length} Records</h4>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTC</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.slice(0, 10).map((entry, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.card_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{entry.gross_salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{entry.deduction_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{entry.net_salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{entry.ctc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {preview.length > 10 && (
              <div className="mt-3 text-sm text-gray-500 text-center">
                Showing 10 of {preview.length} records
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollUpload;
