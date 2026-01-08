import React, { useState } from 'react';
import { XOutlined, UserOutlined, BuildOutlined, MailOutlined, LinkOutlined, FileTextOutlined, SaveOutlined } from '@ant-design/icons';

const NewLead = ({ showModel, setShowModel, setLeads, leads, handleSubmit, loading }) => {
  const [errors, setErrors] = useState({});

  if (!showModel) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!leads.firstName?.trim()) newErrors.firstName = 'Full name is required';
    if (!leads.companyName?.trim()) newErrors.companyName = 'Company name is required';
    if (!leads.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leads.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!leads.source?.trim()) newErrors.source = 'Source is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      handleSubmit();
    }
  };

  const handleCancel = () => {
    setShowModel(false);
    setErrors({});
  };

  const handleChange = (field, value) => {
    setLeads(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="relative p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <UserOutlined className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add New Lead</h2>
                <p className="text-sm text-gray-600">Fill in the lead details below</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <XOutlined />
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            <div className="space-y-2">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <UserOutlined className="text-blue-500" />
                  Full Name *
                </label>
                <input
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  type="text"
                  value={leads?.firstName ?? ''}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Enter full name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <BuildOutlined className="text-blue-500" />
                  Company Name *
                </label>
                <input
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.companyName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  type="text"
                  value={leads?.companyName ?? ''}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MailOutlined className="text-blue-500" />
                  Email Address *
                </label>
                <input
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  type="email"
                  value={leads?.email ?? ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Source */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <LinkOutlined className="text-blue-500" />
                  Source *
                </label>
                <select
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none ${
                    errors.source ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  value={leads?.source ?? ''}
                  onChange={(e) => handleChange('source', e.target.value)}
                >
                  <option value="">Select source</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Email Campaign">Email Campaign</option>
                  <option value="Event">Event</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Other">Other</option>
                </select>
                {errors.source && (
                  <p className="mt-1 text-sm text-red-600">{errors.source}</p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileTextOutlined className="text-blue-500" />
                  Notes
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 min-h-[100px] resize-none"
                  value={leads?.note ?? ''}
                  onChange={(e) => handleChange('note', e.target.value)}
                  placeholder="Add any additional notes about this lead..."
                  rows="3"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6  border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 text-white font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-sm shadow-blue-500/30 hover:shadow-blue-600/40 transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveOutlined />
                    Save Lead
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLead;