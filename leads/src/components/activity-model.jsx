import React, { useState } from 'react';
import { Modal, Button, Form, Input, Select, Timeline, Tag, message, Spin } from 'antd';
import { 
  PhoneOutlined, 
  MailOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  PlusOutlined,
  CheckOutlined,
  HistoryOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const ActivityModal = ({ visible, onCancel, leadId, onActivityAdded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Fetch activities when modal opens
  React.useEffect(() => {
    if (visible && leadId) {
      fetchActivities();
    }
  }, [visible, leadId]);

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await axios.get(`http://localhost:5000/api/lead/${leadId}`);
      if (res.data.success && res.data.data.activities) {
        setActivities(res.data.data.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/lead/activity', {
        id: leadId,
        type: values.type,
        description: values.description
      });

      if (res.data.success) {
        message.success('Activity added successfully!');
        form.resetFields();
        
        await fetchActivities();
        
        if (onActivityAdded) {
          onActivityAdded();
        }
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      message.error('Failed to add activity');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Called':
        return <PhoneOutlined style={{ color: '#3b82f6' }} />;
      case 'Emailed':
        return <MailOutlined style={{ color: '#10b981' }} />;
      case 'Meeting':
        return <CalendarOutlined style={{ color: '#8b5cf6' }} />;
      case 'Note':
        return <FileTextOutlined style={{ color: '#f59e0b' }} />;
      default:
        return <FileTextOutlined style={{ color: '#6b7280' }} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'Called':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Emailed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Meeting':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Note':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActivityIconBg = (type) => {
    switch (type) {
      case 'Called':
        return 'bg-blue-50';
      case 'Emailed':
        return 'bg-emerald-50';
      case 'Meeting':
        return 'bg-purple-50';
      case 'Note':
        return 'bg-amber-50';
      default:
        return 'bg-gray-50';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <HistoryOutlined className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 m-0">Activity Log</h2>
            <p className="text-gray-500 text-sm m-0">Track and manage lead activities</p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="activity-modal"
      styles={{
        content: {
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: 0,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
        header: {
          backgroundColor: 'transparent',
          borderBottom: '1px solid #F3F4F6',
          padding: '24px',
        },
        body: {
          padding: '24px',
          backgroundColor: 'transparent',
        }
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Activity Form */}
        <div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border border-blue-100">
                <PlusOutlined className="text-blue-600 text-lg" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold text-lg m-0">Log New Activity</h3>
                <p className="text-gray-500 text-sm m-0">Record your interaction</p>
              </div>
            </div>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="type"
                label={<span className="text-gray-700 font-medium">Activity Type</span>}
                rules={[{ required: true, message: 'Please select activity type' }]}
              >
                <Select
                  placeholder="Select activity type"
                  className="w-full"
                  size="large"
                  dropdownStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '8px'
                  }}
                >
                  <Option value="Called">
                    <div className="flex items-center gap-3 py-2 hover:bg-blue-50 rounded-lg px-2 transition-colors">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                        <PhoneOutlined className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">Called</div>
                        <div className="text-xs text-gray-500">Phone conversation</div>
                      </div>
                    </div>
                  </Option>
                  <Option value="Emailed">
                    <div className="flex items-center gap-3 py-2 hover:bg-emerald-50 rounded-lg px-2 transition-colors">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
                        <MailOutlined className="text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">Emailed</div>
                        <div className="text-xs text-gray-500">Email communication</div>
                      </div>
                    </div>
                  </Option>
                  <Option value="Meeting">
                    <div className="flex items-center gap-3 py-2 hover:bg-purple-50 rounded-lg px-2 transition-colors">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100">
                        <CalendarOutlined className="text-purple-600" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">Meeting</div>
                        <div className="text-xs text-gray-500">In-person or virtual meeting</div>
                      </div>
                    </div>
                  </Option>
                  <Option value="Note">
                    <div className="flex items-center gap-3 py-2 hover:bg-amber-50 rounded-lg px-2 transition-colors">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                        <FileTextOutlined className="text-amber-600" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">Note</div>
                        <div className="text-xs text-gray-500">General note or comment</div>
                      </div>
                    </div>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-gray-700 font-medium">Description</span>}
                rules={[{ 
                  required: true, 
                  message: 'Please enter activity description' 
                }, {
                  min: 10,
                  message: 'Description should be at least 10 characters'
                }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter activity details..."
                  className="w-full border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  showCount
                  maxLength={500}
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<CheckOutlined />}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 transition-all duration-300"
                  size="large"
                >
                  Add Activity
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <div className="bg-white rounded-xl p-6 border  border-gray-200 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg flex items-center justify-center border border-emerald-100">
                <ClockCircleOutlined className="text-emerald-600 text-lg" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold text-lg m-0">Activity Timeline</h3>
                <p className="text-gray-500 text-sm m-0">Recent interactions</p>
              </div>
            </div>
            
            {loadingActivities ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Spin size="large" />
                  <p className="text-gray-500 mt-2">Loading activities...</p>
                </div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 w-full">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <FileTextOutlined className="text-gray-400 text-3xl" />
                </div>
                <h4 className="text-gray-600 font-medium">No activities yet</h4>
                <p className="text-gray-400 text-sm mt-2">Start by adding your first activity</p>
                <Button 
                  type="primary" 
                  ghost
                  icon={<PlusOutlined />}
                  onClick={() => form.scrollToField('type')}
                  className="mt-4"
                >
                  Add First Activity
                </Button>
              </div>
            ) : (
              <div className="max-h-[400px]   w-full overflow-y-auto pr-2 custom-scrollbar">
                <Timeline className="custom-timeline-white p-4">
                  {activities
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((activity, index) => (
                      <Timeline.Item 
                        key={index} 
                        dot={
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center border ${getActivityIconBg(activity.type)}`}
                          >
                            {getActivityIcon(activity.type)}
                          </div>
                        }
                        className="mb-6 last:mb-0"
                      >
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all duration-200 group hover:shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getActivityColor(activity.type)}`}>
                                {activity.type}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-500 font-medium">
                                {formatTime(activity.timestamp)}
                              </span>
                              <div className="text-xs text-gray-400">
                                {getTimeAgo(activity.timestamp)}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed mb-3">
                            {activity.description}
                          </p>
                          <div className="flex items-center justify-between">
                            {activity.type === 'Called' && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-gray-500">Duration: 15 mins</span>
                              </div>
                            )}
                            <span className="text-xs text-gray-400">
                              {activity.type === 'Emailed' ? 'Email sent' : 
                               activity.type === 'Meeting' ? 'Meeting scheduled' : 'Note added'}
                            </span>
                          </div>
                        </div>
                      </Timeline.Item>
                    ))}
                </Timeline>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F9FAFB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }
        
        .custom-timeline-white .ant-timeline-item-tail {
          background-color: #E5E7EB;
        }
        
        .custom-timeline-white .ant-timeline-item-head {
          background-color: transparent;
          border-color: transparent;
        }
        
        .custom-timeline-white .ant-timeline-item {
          padding-bottom: 0;
        }
      `}</style>
    </Modal>
  );
};

export default ActivityModal;