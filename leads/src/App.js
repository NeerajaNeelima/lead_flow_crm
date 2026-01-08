import './App.css';
import { useState, useEffect } from 'react';
import { Tabs, Button, Card, Tag, Input, Modal, Badge, Select, Dropdown, Menu, message } from 'antd';
import { 
  PlusOutlined, 
  MailOutlined, 
  UserOutlined, 
  LinkOutlined, 
  EditOutlined, 
  EyeOutlined, 
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  BuildOutlined,
  DashboardOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  PhoneOutlined,
  GlobalOutlined,
  ArrowRightOutlined,
  MoreOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  SyncOutlined,
  CloseOutlined
} from '@ant-design/icons';
import NewLead from './components/new-lead';
import axios from 'axios';
import ActivityModal from './components/activity-model';

function App() {
  const { TabPane } = Tabs;

  const onChange = (key) => { 
    console.log(key); 
    setActiveTab(key);
  };

  const [activeTab, setActiveTab] = useState('1');
  const [leadsList, setLeadsList] = useState([]);
  const [form, setForm] = useState({
    firstName: '',
    companyName: '',
    email: '',
    source: '',
    note: '',
  });

  const [model, setModel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [selectedLeadForActivity, setSelectedLeadForActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingLead, setUpdatingLead] = useState(null);
  const [filterSource, setFilterSource] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const handleClick = () => setModel(true);

  /* ---------------- FETCH LEADS ---------------- */
  const fetchLeads = async () => {
    try {
      const res = await axios.get('https://lead-flow-crm.onrender.com/api/lead/leads');
      if (res.data.success) {
        setLeadsList(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  /* ---------------- CREATE LEAD ---------------- */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        'https://lead-flow-crm.onrender.com/api/lead/create',
        form
      );

      if (res.data.success) {
        message.success('Lead added successfully!');
        console.log('Lead saved successfully:', res.data.data);
        setLeadsList(prev => [...prev, res.data.data]);
        setForm({
          firstName: '',
          companyName: '',
          email: '',
          source: '',
          note: '',
        });
        setModel(false);
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      message.error('Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UPDATE LEAD STATUS ---------------- */
  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      setUpdatingLead(leadId);
      const res = await axios.patch(`https://lead-flow-crm.onrender.com/api/lead/${leadId}/status`, {
        status: newStatus
      });

      if (res.data.success) {
        message.success(`Lead moved to ${newStatus}`);
        
        // Update leads list
        setLeadsList(prev => prev.map(lead => 
          lead._id === leadId ? { ...lead, status: newStatus } : lead
        ));
        
        // Update selected lead if it's the same
        if (selectedLead && selectedLead._id === leadId) {
          setSelectedLead({ ...selectedLead, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      message.error('Failed to update lead status');
    } finally {
      setUpdatingLead(null);
    }
  };

  const showLeadDetails = (lead) => {
    setSelectedLead(lead);
    setIsModalVisible(true);
  };

  const showActivityModal = (lead) => {
    setSelectedLeadForActivity(lead);
    setIsActivityModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return '#3B82F6'; // Blue
      case 'Contacted': return '#8B5CF6'; // Purple
      case 'Qualified': return '#10B981'; // Green
      default: return '#6B7280'; // Gray
    }
  };

  const getStatusLightColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'Contacted': return 'bg-purple-50 border-purple-100 text-purple-700';
      case 'Qualified': return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      default: return 'bg-gray-50 border-gray-100 text-gray-700';
    }
  };

  const getStatusOptions = (currentStatus) => {
    const allStatuses = ['New', 'Contacted', 'Qualified'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const getNextStatus = (currentStatus) => {
    switch(currentStatus) {
      case 'New': return 'Contacted';
      case 'Contacted': return 'Qualified';
      case 'Qualified': return 'Converted';
      default: return 'New';
    }
  };

  const getPrevStatus = (currentStatus) => {
    switch(currentStatus) {
      case 'Contacted': return 'New';
      case 'Qualified': return 'Contacted';
      case 'Converted': return 'Qualified';
      default: return 'New';
    }
  };

  const getNextStatusButton = (currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    return {
      text: `Move to ${nextStatus}`,
      icon: <ArrowRightOutlined />,
      color: nextStatus === 'Contacted' ? 'purple' : 
             nextStatus === 'Qualified' ? 'emerald' : 'green'
    };
  };

  const getPrevStatusButton = (currentStatus) => {
    const prevStatus = getPrevStatus(currentStatus);
    return {
      text: `Move to ${prevStatus}`,
      icon: <ArrowLeftOutlined />,
      color: prevStatus === 'New' ? 'blue' : 'purple'
    };
  };

  // Filter leads based on search term and source filter
  const filteredLeads = leadsList.filter(lead => {
    // Search filter (Name OR Company OR Email)
    const matchesSearch = searchTerm === '' || 
      (lead.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       lead.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Source filter
    const matchesSource = filterSource === 'All' || lead.source === filterSource;
    
    return matchesSearch && matchesSource;
  });

  // Get unique sources for filter dropdown
  const sourceOptions = ['All', 'LinkedIn', 'Referral', 'Website', 'Other', 'Email Campaign', 'Social Media', 'Event', 'Cold Call'];

  const newLeadsCount = leadsList.filter(lead => !lead.status || lead.status === 'New').length;
  const contactedLeadsCount = leadsList.filter(lead => lead.status === 'Contacted').length;
  const qualifiedLeadsCount = leadsList.filter(lead => lead.status === 'Qualified').length;

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterSource('All');
  };

  // Check if any filter is active
  const hasActiveFilters = searchTerm !== '' || filterSource !== 'All';

  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              LeadFlow
            </h1>
            
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleClick}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transition-all duration-300"
              size="large"
            >
              Add Lead
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{leadsList.length}</p>
                <p className="text-xs text-gray-500 mt-1">All time leads</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <TeamOutlined className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600 text-sm font-medium">New Leads</p>
                  <Badge count="+2" style={{ backgroundColor: '#10B981', fontSize: '10px' }} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">{newLeadsCount}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting contact</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <MailOutlined className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Contacted</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{contactedLeadsCount}</p>
                <p className="text-xs text-gray-500 mt-1">In communication</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <CalendarOutlined className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Qualified</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{qualifiedLeadsCount}</p>
                <p className="text-xs text-gray-500 mt-1">Ready for conversion</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircleOutlined className="text-emerald-500 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Card 
          className="bg-white border border-gray-200 rounded-2xl shadow-sm"
          bodyStyle={{ padding: 0 }}
        >
          <Tabs 
            defaultActiveKey="1" 
            onChange={onChange}
            className="custom-tabs"
            tabBarStyle={{ 
              padding: '0 24px',
              margin: 0,
              background: 'white',
              borderBottom: '1px solid #E5E7EB'
            }}
          >
            <TabPane 
              tab={
                <span className="text-gray-700 hover:text-blue-600 font-medium">
                  <UserOutlined className="mr-2" />
                  New Leads
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {newLeadsCount}
                  </span>
                </span>
              } 
              key="1"
            >
              <div className="p-6">
                {filteredLeads.filter(lead => !lead.status || lead.status === 'New').length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserOutlined className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-gray-500 font-medium">No new leads</h3>
                    <p className="text-gray-400 text-sm mt-1">Start by adding your first lead</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeads.filter(lead => !lead.status || lead.status === 'New').map((lead) => (
                      <LeadCard 
                        key={lead._id} 
                        lead={lead} 
                        onView={() => showLeadDetails(lead)}
                        onActivity={showActivityModal}
                        statusColorClass={getStatusLightColor(lead.status || 'New')}
                        updateLeadStatus={updateLeadStatus}
                        updatingLead={updatingLead}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span className="text-gray-700 hover:text-purple-600 font-medium">
                  <MailOutlined className="mr-2" />
                  Contacted
                  <span className="ml-2 bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {contactedLeadsCount}
                  </span>
                </span>
              } 
              key="2"
            >
              <div className="p-6">
                {filteredLeads.filter(lead => lead.status === 'Contacted').length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MailOutlined className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-gray-500 font-medium">No contacted leads</h3>
                    <p className="text-gray-400 text-sm mt-1">Start contacting your new leads</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeads.filter(lead => lead.status === 'Contacted').map((lead) => (
                      <LeadCard 
                        key={lead._id} 
                        lead={lead} 
                        onView={() => showLeadDetails(lead)}
                        onActivity={showActivityModal}
                        statusColorClass={getStatusLightColor('Contacted')}
                        updateLeadStatus={updateLeadStatus}
                        updatingLead={updatingLead}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span className="text-gray-700 hover:text-emerald-600 font-medium">
                  <CheckCircleOutlined className="mr-2" />
                  Qualified
                  <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {qualifiedLeadsCount}
                  </span>
                </span>
              } 
              key="3"
            >
              <div className="p-6">
                {filteredLeads.filter(lead => lead.status === 'Qualified').length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircleOutlined className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-gray-500 font-medium">No qualified leads</h3>
                    <p className="text-gray-400 text-sm mt-1">Move contacted leads to qualified</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeads.filter(lead => lead.status === 'Qualified').map((lead) => (
                      <LeadCard 
                        key={lead._id} 
                        lead={lead} 
                        onView={() => showLeadDetails(lead)}
                        onActivity={showActivityModal}
                        statusColorClass={getStatusLightColor('Qualified')}
                        updateLeadStatus={updateLeadStatus}
                        updatingLead={updatingLead}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabPane>
          </Tabs>
        </Card>

        {/* All Leads Grid */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Leads</h2>
              <p className="text-gray-500 text-sm mt-1">Manage all your leads in one place</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search leads..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-1 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 pl-11 shadow-sm transition-all duration-300 hover:border-gray-400"
                />
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <CloseOutlined />
                  </button>
                )}
              </div>
              
              {/* Filter Dropdown */}
              <div className='relative'>
              <Button
  icon={<FilterOutlined />}
  onClick={() => setShowFilters((prev) => !prev)}
  className={`border-gray-300 text-gray-700 bg-white flex items-center gap-2 ${
    hasActiveFilters ? 'border-blue-300 bg-blue-50 text-blue-700' : ''
  }`}
>
  Filter
  {filterSource !== 'All' && (
    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
      {filterSource}
    </span>
  )}
</Button>
{showFilters && (
  <div className="absolute z-50 mt-2 w-64 right-1/4 rounded-lg bg-white shadow-lg border border-gray-200">
    <div className="px-4 py-2 border-b border-gray-200">
      <p className="text-sm font-medium text-gray-700">Filter by Source</p>
    </div>

    {sourceOptions.map((source) => (
      <div
        key={source}
        onClick={() => {
          setFilterSource(source);
          setShowFilters(false);
        }}
        className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50 ${
          filterSource === source ? 'bg-blue-50' : ''
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            filterSource === source ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        />
        <span
          className={
            filterSource === source
              ? 'text-blue-600 font-medium'
              : 'text-gray-700'
          }
        >
          {source}
        </span>

        {filterSource === source && (
          <CheckOutlined className="ml-auto text-blue-500" />
        )}
      </div>
    ))}

    {hasActiveFilters && (
      <>
        <div className="border-t border-gray-200 my-1" />
        <div
          onClick={() => {
            clearFilters();
            setShowFilters(false);
          }}
          className="px-4 py-2 text-red-600 cursor-pointer hover:bg-red-50"
        >
          <CloseOutlined className="mr-2" />
          Clear All Filters
        </div>
      </>
    )}
  </div>
)}


              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FilterOutlined className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Active Filters</p>
                    <div className="flex items-center gap-2 mt-1">
                      {searchTerm && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm">
                          Search: "{searchTerm}"
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <CloseOutlined className="text-xs" />
                          </button>
                        </span>
                      )}
                      {filterSource !== 'All' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm">
                          Source: {filterSource}
                          <button 
                            onClick={() => setFilterSource('All')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <CloseOutlined className="text-xs" />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <CloseOutlined />
                  Clear All
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Showing {filteredLeads.length} of {leadsList.length} leads
              </p>
            </div>
          )}
          
          {filteredLeads.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchOutlined className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-gray-700 font-medium text-lg">
                {hasActiveFilters ? 'No matching leads found' : 'No leads found'}
              </h3>
              <p className="text-gray-500 mt-2">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search term'
                  : 'Start by adding your first lead'
                }
              </p>
              {hasActiveFilters ? (
                <Button 
                  onClick={clearFilters}
                  className="mt-4 border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400"
                  icon={<CloseOutlined />}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleClick}
                  className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0"
                >
                  Add New Lead
                </Button>
              )}
            </div>
          ) : (
            <>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredLeads.map((lead) => (
                  <LeadCard 
                    key={lead._id} 
                    lead={lead} 
                    onView={() => showLeadDetails(lead)}
                    onActivity={showActivityModal}
                    statusColorClass={getStatusLightColor(lead.status || 'New')}
                    updateLeadStatus={updateLeadStatus}
                    updatingLead={updatingLead}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      <NewLead
        showModel={model}
        setShowModel={setModel}
        leads={form}
        setLeads={setForm}
        handleSubmit={handleSubmit}
        loading={loading}
      />

      {/* Lead Details Modal */}
      <Modal
        title={<span className="text-gray-900 text-lg font-semibold">Lead Details</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="lead-details-modal"
        width={600}
      >
        {selectedLead && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedLead.firstName}</h3>
                <p className="text-gray-600 mt-1">{selectedLead.companyName}</p>
              </div>
              <div className={`px-4 py-1.5 rounded-full border font-medium ${getStatusLightColor(selectedLead.status || 'New')}`}>
                {selectedLead.status || 'New'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-1">Email</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <MailOutlined className="text-blue-500" /> {selectedLead.email}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-1">Source</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <LinkOutlined className="text-purple-500" /> {selectedLead.source}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-1">Created</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <CalendarOutlined className="text-emerald-500" /> 
                    {new Date(selectedLead.createdAt || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-1">Last Contact</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <PhoneOutlined className="text-amber-500" /> 
                    {selectedLead.lastContacted || 'Not contacted yet'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stage Movement Buttons */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-700 font-medium mb-3">Move to Another Stage</p>
              <div className="flex gap-3">
                {getStatusOptions(selectedLead.status || 'New').map((status) => (
                  <Button
                    key={status}
                    onClick={() => updateLeadStatus(selectedLead._id, status)}
                    className={`flex items-center gap-2 ${
                      status === 'New' ? 'border-blue-300 text-blue-700 hover:bg-blue-50' :
                      status === 'Contacted' ? 'border-purple-300 text-purple-700 hover:bg-purple-50' :
                      'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                    }`}
                    icon={<ArrowRightOutlined />}
                  >
                    Move to {status}
                  </Button>
                ))}
              </div>
            </div>
            
            {selectedLead.note && (
              <div className="space-y-3">
                <p className="text-gray-500 text-sm font-medium">Notes</p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-gray-800">{selectedLead.note}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                {selectedLead.status !== 'New' && (
                  <Button
                    onClick={() => updateLeadStatus(selectedLead._id, getPrevStatus(selectedLead.status))}
                    className="border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400"
                    icon={<ArrowLeftOutlined />}
                  >
                    {getPrevStatusButton(selectedLead.status).text}
                  </Button>
                )}
                {selectedLead.status !== 'Qualified' && (
                  <Button
                    type="primary"
                    onClick={() => updateLeadStatus(selectedLead._id, getNextStatus(selectedLead.status))}
                    className={`bg-gradient-to-r ${
                      selectedLead.status === 'New' ? 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' :
                      selectedLead.status === 'Contacted' ? 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' :
                      'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    } border-0`}
                    icon={<ArrowRightOutlined />}
                  >
                    {getNextStatusButton(selectedLead.status).text}
                  </Button>
                )}
              </div>
              
            </div>
          </div>
        )}
      </Modal>

      <ActivityModal
        visible={isActivityModalVisible}
        onCancel={() => setIsActivityModalVisible(false)}
        leadId={selectedLeadForActivity?._id}
      />
      
      {/* Footer */}
      <footer className="mt-12 py-4 border-t border-gray-200 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
              <h3 className="font-semibold text-gray-900">LeadFlow CRM</h3>
            </div>
            <p className="text-gray-500 text-sm">
              {new Date().getFullYear()} • Manage your leads efficiently.
            </p>
            
          </div>
        </div>
      </footer>
    </div>
  );
}

// Lead Card Component
const LeadCard = ({ lead, onView, onActivity, statusColorClass, updateLeadStatus, updatingLead }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const statusOptions = [
    { value: 'New', label: 'New', color: 'blue' },
    { value: 'Contacted', label: 'Contacted', color: 'purple' },
    { value: 'Qualified', label: 'Qualified', color: 'emerald' },
  ];

  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-200 overflow-hidden group">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
              <span className="text-xl font-bold text-blue-600">
                {lead.firstName?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {lead.firstName}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <BuildOutlined className="text-xs" /> {lead.companyName}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColorClass}`}>
              {lead.status || 'New'}
            </div>
            <div className="relative">
  <Button
    size="small"
    type="text"
    icon={<MoreOutlined />}
    className="text-gray-400 hover:text-gray-600"
    onClick={() => setShowDropdown((prev) => !prev)}
  />

  {showDropdown && (
    <div className="absolute right-0 top-8 z-50 w-48 rounded-lg bg-white shadow-lg border border-gray-200">
      
      {/* Move to Stage */}
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b">
        Move to Stage
      </div>

      {statusOptions
        .filter(option => option.value !== lead.status)
        .map(option => (
          <button
            key={option.value}
            disabled={updatingLead === lead._id}
            onClick={() => {
              updateLeadStatus(lead._id, option.value);
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                option.color === 'blue'
                  ? 'bg-blue-500'
                  : option.color === 'purple'
                  ? 'bg-purple-500'
                  : 'bg-emerald-500'
              }`}
            />
            Move to {option.label}
            {updatingLead === lead._id && (
              <SyncOutlined spin className="ml-auto text-gray-400" />
            )}
          </button>
        ))}

      <div className="border-t my-1" />

      <button
        onClick={() => {
          onView(lead);
          setShowDropdown(false);
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
      >
        <EyeOutlined /> View Details
      </button>

      <button
        onClick={() => {
          onActivity(lead);
          setShowDropdown(false);
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
      >
        <CalendarOutlined /> Activity
      </button>
    </div>
  )}
</div>

          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MailOutlined className="text-gray-400" />
            <span className="text-gray-700 truncate">{lead.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <LinkOutlined className="text-gray-400" />
            <span className="text-gray-700 truncate">{lead.source}</span>
          </div>
        </div>

        {lead.note && (
          <div className="mt-3 mb-4">
            <p className="text-xs text-gray-500 mb-1 font-medium">Note</p>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {lead.note.length > 100 ? `${lead.note.substring(0, 100)}...` : lead.note}
            </div>
          </div>
        )}

        {/* Status Selector */}
        <div className="mb-4">
          <Select
            value={lead.status || 'New'}
            onChange={(value) => updateLeadStatus(lead._id, value)}
            className="w-full"
            size="small"
            loading={updatingLead === lead._id}
            disabled={updatingLead === lead._id}
          >
            <Select.Option value="New">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                New
              </div>
            </Select.Option>
            <Select.Option value="Contacted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Contacted
              </div>
            </Select.Option>
            <Select.Option value="Qualified">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Qualified
              </div>
            </Select.Option>
          </Select>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Added: {new Date(lead.createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
          <div className="flex gap-2">
            <Button 
              size="small" 
              className="border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400"
              icon={<EyeOutlined />}
              onClick={() => onView(lead)}
            >
              View
            </Button>
            <Button 
              size="small" 
              className="border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400"
              icon={<CalendarOutlined />}
              onClick={() => onActivity(lead)}
            >
              Activity
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;