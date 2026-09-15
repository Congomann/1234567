import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Building, Plus, FileUp, CheckCircle, Trash2, Edit } from 'lucide-react';
import { Backend } from '../../services/apiBackend';
import { DB } from '../../services/database';

export default function ContractingAdmin() {
  const [packages, setPackages] = useState<any[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  
  // Package form state
  const [carrierName, setCarrierName] = useState('Transamerica');
  const [packageName, setPackageName] = useState('');
  const [eligibility, setEligibility] = useState('Life Licensed Advisors');
  const [availability, setAvailability] = useState('Available');
  const [version, setVersion] = useState('2026.01');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      await Backend.deleteCarrierPackage(id);
      loadPackages();
    }
  };

  const handleView = async (pkg: any) => {
    const pdfId = `${pkg.carrier_name}-${pkg.version}`;
    const caches = (await DB.getAll('pdf_cache') as any[]) || [];
    const cached = caches.find(c => c.id === pdfId);
    if (cached && cached.data) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${cached.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    } else {
      alert("PDF not found in local cache.");
    }
  };

  const loadPackages = async () => {
    const pkgs = await Backend.getCarrierPackages();
    setPackages(pkgs || []);
  };

  const handleSaveAndPublish = async () => {
    if (!packageName || !uploadedFile) {
      alert("Package Name and File are required.");
      return;
    }

    const newPkg = {
      carrier_name: carrierName,
      package_name: packageName,
      eligibility,
      states: ['ALL'], // Simplified for now
      availability,
      version
    };

    const saved = await Backend.addCarrierPackage(newPkg);
    
    // Save PDF to cache using the package ID or carrier name
    // (CarrierFormBuilder uses carrier name to find it, so we'll store it by package_name to be precise, 
    // but to avoid breaking existing logic we'll store it by carrier_name + '-' + version)
    const pdfId = `${carrierName}-${version}`;
    
    const reader = new FileReader();
    reader.readAsDataURL(uploadedFile);
    reader.onload = async () => {
      await DB.save('pdf_cache', { id: pdfId, data: reader.result });
    };

    setShowWizard(false);
    setPackageName('');
    setUploadedFile(null);
    loadPackages();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CONTRACTING</h1>
          <p className="text-gray-500 text-sm mt-1">Manage carrier contracting packages and eligibility.</p>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Upload Carrier Package
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">AVAILABLE PACKAGES</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {packages.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              No carrier packages uploaded yet. Click "Upload Carrier Package" to begin.
            </li>
          ) : (
            packages.map((pkg) => (
              <li key={pkg.id}>
                <div className="px-4 py-4 flex items-center justify-between sm:px-6 hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pkg.carrier_name}</h3>
                    <p className="text-md text-blue-600 font-medium">{pkg.package_name}</p>
                    <p className="text-sm text-gray-500 mt-1">Version {pkg.version} • {pkg.availability}</p>
                    <p className="text-xs text-gray-400 mt-1">142 eligible advisors (Simulated)</p>
                  </div>
                  <div className="flex space-x-3">
                    <Link 
                      to={`/crm/admin/contracting/builder?carrier=${encodeURIComponent(pkg.carrier_name + '-' + pkg.version)}`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 shadow-sm transition"
                    >
                      Manage
                    </Link>
                    <button onClick={() => handleView(pkg)} className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 shadow-sm transition">
                      View
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} className="px-4 py-2 bg-white text-red-600 text-sm font-medium rounded border border-gray-300 hover:bg-red-50 shadow-sm transition">
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Upload Package Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowWizard(false)} />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              
              <h3 className="text-xl font-bold leading-6 text-gray-900 mb-6">UPLOAD CARRIER CONTRACTING PACKAGE</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                  <input 
                    type="text" 
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Transamerica"
                    value={carrierName}
                    onChange={e => setCarrierName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                  <input 
                    type="text" 
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                    placeholder="e.g. Life Insurance Contracting"
                    value={packageName}
                    onChange={e => setPackageName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                  <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={(e) => setUploadedFile(e.target.files?.[0] || null)} />
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm font-medium hover:bg-gray-200"
                    >
                      Choose PDF
                    </button>
                    <span className="text-sm text-gray-600">{uploadedFile ? uploadedFile.name : 'No file chosen'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility</label>
                  <div className="flex items-center">
                    <input type="checkbox" id="elig-life" checked={eligibility === 'Life Licensed Advisors'} onChange={() => setEligibility('Life Licensed Advisors')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="elig-life" className="ml-2 block text-sm text-gray-900">Life Licensed Advisors</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input type="radio" name="availability" checked={availability === 'Available'} onChange={() => setAvailability('Available')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                      <span className="ml-2 text-sm text-gray-900">Available</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="availability" checked={availability === 'Hidden'} onChange={() => setAvailability('Hidden')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                      <span className="ml-2 text-sm text-gray-900">Hidden</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                  <input 
                    type="text" 
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                    value={version}
                    onChange={e => setVersion(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button onClick={() => setShowWizard(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleSaveAndPublish} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  SAVE & PUBLISH
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
