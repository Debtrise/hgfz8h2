import React, { useEffect, useState } from "react";
import { Table, Button, Input, Upload, message, Tooltip, Space, Switch, Modal, Select, Form, Typography, Radio, Divider, Popconfirm, Spin, Card } from "antd";
import { 
  SearchOutlined, 
  UploadOutlined, 
  ImportOutlined, 
  SoundOutlined, 
  PlayCircleFilled, 
  PauseCircleFilled, 
  EllipsisOutlined, 
  RobotOutlined, 
  FileTextOutlined, 
  AudioOutlined, 
  DownloadOutlined, 
  DeleteOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  FileExcelOutlined,
  FilterOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import "../styles/Recordings.css";
import "../Dashboard.css"; // Import dashboard styles

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

// API base URL
const API_BASE_URL = "http://35.202.92.164:8080";

// Template examples for common recording scenarios
const RECORDING_TEMPLATES = [
  { 
    id: 'greeting', 
    name: 'Greeting', 
    text: 'Welcome to Workforce Wireless. How may we help you today?',
    filename: 'greeting'
  },
  { 
    id: 'hold', 
    name: 'Hold Message', 
    text: 'Thank you for your patience. Your call is important to us. Please stay on the line.',
    filename: 'hold_message'
  },
  { 
    id: 'voicemail', 
    name: 'Voicemail', 
    text: 'You have reached our voicemail. Please leave your name, number, and a brief message, and we will get back to you as soon as possible.',
    filename: 'voicemail'
  },
  { 
    id: 'closed', 
    name: 'Closed Message', 
    text: 'We are currently closed. Our business hours are Monday to Friday, 9 AM to 5 PM. Please call back during these hours or leave a message.',
    filename: 'closed_message'
  },
  { 
    id: 'transfer', 
    name: 'Transfer Message', 
    text: 'Please hold while we transfer your call to the appropriate department.',
    filename: 'transfer_message'
  },
  { 
    id: 'custom', 
    name: 'Custom Message', 
    text: '',
    filename: 'custom_message'
  }
];

function Recordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [ttsModalVisible, setTtsModalVisible] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [form] = Form.useForm();
  const [audioElement, setAudioElement] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecordings();
    fetchVoices();
    
    // Create an audio element when the component mounts
    const audio = document.createElement('audio');
    audio.setAttribute('controls', 'controls');
    audio.style.display = 'none';
    document.body.appendChild(audio);
    
    // Set up event listeners
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    
    audio.addEventListener('error', () => {
      setIsPlaying(false);
    });
    
    setAudioElement(audio);
    
    // Clean up on unmount
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.removeEventListener('ended', () => {});
        audio.removeEventListener('error', () => {});
        document.body.removeChild(audio);
      }
    };
  }, []);

  const fetchRecordings = () => {
    setLoading(true);
    setRefreshing(true);
    console.log(`Fetching recordings from: ${API_BASE_URL}/api/recordings/local`);
    
    // Fetch existing recordings from API using the new local endpoint
    fetch(`${API_BASE_URL}/api/recordings/local`)
      .then((res) => {
        console.log('API response status:', res.status);
        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Recordings data received:', data);
        
        // Access the files array from the response
        const files = data.files || [];
        console.log('Files array:', files);
        
        // Add key property to each record for table
        const recordingsWithKeys = files.map(file => ({
          ...file,
          key: file.id || file.filename,
          // Ensure we have the required fields for the table
          name: file.name || file.filename,
          type: file.type || 'Audio',
          date: file.date || file.created_at || new Date().toISOString().split('T')[0],
          // Create a URL to the file for playback
          url: `${API_BASE_URL}/api/recordings/files/${file.filename}`
        }));
        
        console.log('Processed recordings:', recordingsWithKeys);
        setRecordings(recordingsWithKeys);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        console.error('Error fetching recordings:', err);
        message.error(`Failed to load recordings: ${err.message}`);
        setLoading(false);
        setRefreshing(false);
        setRecordings([]); // Set empty array instead of mock data
      });
  };

  const fetchVoices = () => {
    fetch(`${API_BASE_URL}/api/recordings/voices`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.voices) {
          setAvailableVoices(data.voices);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch voices:", err);
        message.error("Failed to load voices");
      });
  };

  const handleUpload = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
      fetchRecordings(); // Refresh the list
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handlePlay = (record) => {
    if (currentAudio === record.id && isPlaying) {
      // Pause current audio
      stopAudio();
    } else {
      // Make sure we have a URL to play
      let audioUrl = record.url;
      
      // If we only have a filename, construct the URL
      if (!audioUrl && record.filename) {
        audioUrl = `${API_BASE_URL}/api/recordings/files/${record.filename}`;
      }
      
      if (!audioUrl) {
        message.error("No audio URL available for this recording");
        return;
      }
      
      console.log(`Playing recording: ${record.name}, URL: ${audioUrl}`);
      playAudio(audioUrl);
      setCurrentAudio(record.id || record.filename);
    }
  };

  const playAudio = (audioUrl) => {
    if (!audioElement) {
      return;
    }
    
    try {
      // For local files, use the correct MIME type based on extension
      let audioType = 'audio/mpeg'; // Default
      if (audioUrl.toLowerCase().endsWith('.wav')) {
        audioType = 'audio/wav';
      } else if (audioUrl.toLowerCase().endsWith('.mp3')) {
        audioType = 'audio/mpeg';
      }
      
      // Create a new object URL using fetch and blob for better format support
      fetch(audioUrl)
        .then(response => {
          if (!response.ok) {
            return;
          }
          return response.blob();
        })
        .then(blob => {
          if (!blob) return;
          
          // Create a new blob with the correct type if needed
          let audioBlob = blob;
          if (blob.type === '' || blob.type === 'application/octet-stream') {
            audioBlob = new Blob([blob], { type: audioType });
          }
          
          // Create object URL from blob
          const objectUrl = URL.createObjectURL(audioBlob);
          
          // Set source
          audioElement.src = objectUrl;
          
          // Start playback
          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
                
                // Revoke the object URL when playback ends to free memory
                audioElement.onended = () => {
                  URL.revokeObjectURL(objectUrl);
                  setIsPlaying(false);
                };
              })
              .catch(() => {
                URL.revokeObjectURL(objectUrl);
                setIsPlaying(false);
              });
          }
        });
    } catch (err) {
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  const handlePreviewPlay = () => {
    if (isPlaying) {
      stopAudio();
    } else if (previewAudio) {
      playAudio(previewAudio);
    } else if (generatedAudio) {
      playAudio(generatedAudio);
    }
  };

  const handleStatusChange = (checked, record) => {
    // Update recording status
    setRecordings(prev => 
      prev.map(item => 
        item.id === record.id ? { ...item, active: checked } : item
      )
    );
    
    // API call would go here
    message.success(`${record.name} ${checked ? 'activated' : 'deactivated'}`);
  };

  const showTtsModal = () => {
    setTtsModalVisible(true);
    setPreviewAudio(null);
    setGeneratedAudio(null);
    
    // Set default voice if available
    if (availableVoices && availableVoices.length > 0) {
      form.setFieldsValue({ voiceId: availableVoices[0].voice_id });
    }
  };

  const handleTtsCancel = () => {
    // Stop any playing audio
    if (audioPlayer && isPlaying) {
      audioPlayer.pause();
      setIsPlaying(false);
    }
    
    setTtsModalVisible(false);
    setPreviewAudio(null);
    setGeneratedAudio(null);
    setSelectedTemplate('custom');
    form.resetFields();
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    const selectedTemplate = RECORDING_TEMPLATES.find(t => t.id === templateId);
    if (selectedTemplate) {
      form.setFieldsValue({
        text: selectedTemplate.text,
        filename: selectedTemplate.filename
      });
    }
  };

  const handlePreviewVoice = () => {
    // Don't do anything if already previewing
    if (previewing) return;
    
    // Validate only the required fields for preview
    form.validateFields(['voiceId', 'text']).then(values => {
      // Stop any playing audio
      stopAudio();
      
      setPreviewing(true);
      
      // Encode the text for the URL
      const encodedText = encodeURIComponent(values.text);
      
      // Create the preview URL
      const previewUrl = `${API_BASE_URL}/api/recordings/preview.mp3?voiceId=${values.voiceId}&text=${encodedText}`;
      console.log("Preview URL:", previewUrl);
      
      // Test direct fetch of the audio to check for CORS issues
      fetch(previewUrl, { method: 'GET' })
        .then(response => {
          console.log('Preview fetch response status:', response.status);
          console.log('Preview content type:', response.headers.get('content-type'));
          
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          
          // Set the preview URL
          setPreviewAudio(previewUrl);
          
          setTimeout(() => {
            setPreviewing(false);
            playAudio(previewUrl);
          }, 300);
        })
        .catch(err => {
          console.error('Error fetching preview audio:', err);
          setPreviewing(false);
          message.error(`Could not load preview: ${err.message}`);
        });
    }).catch(err => {
      console.error("Validation error:", err);
      setPreviewing(false);
      message.error("Please select a voice and enter text to preview");
    });
  };

  const handleGenerateAudio = () => {
    form.validateFields().then(values => {
      setGenerating(true);
      
      fetch(`${API_BASE_URL}/api/recordings/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          voiceId: values.voiceId,
          text: values.text,
          filename: values.filename
        })
      })
        .then(res => res.json())
        .then(data => {
          console.log("TTS API response:", data);
          setGenerating(false);
          
          if (data.success) {
            // Parse the response from the server
            // The filename is returned directly, but we need to get the correct path
            let audioFilename = data.filename || values.filename;
            
            // If we have a complete file path, extract just the filename
            if (audioFilename.includes('/')) {
              audioFilename = audioFilename.split('/').pop();
            }
            
            // Add .wav extension if not present
            if (!audioFilename.includes('.')) {
              audioFilename = `${audioFilename}.wav`;
            }
            
            console.log("Using audio filename:", audioFilename);
            
            // Construct the URL to access the file
            const audioUrl = `${API_BASE_URL}/api/recordings/files/${audioFilename}`;
            console.log("Final audio URL:", audioUrl);
            
            // Set the audio URL immediately
            setGeneratedAudio(audioUrl);
            message.success("Audio generated and saved successfully!");
          } else {
            message.error(data.error || "Failed to generate audio");
          }
        })
        .catch(err => {
          console.error("Error generating audio:", err);
          setGenerating(false);
          message.error("Failed to generate audio");
        });
    });
  };

  /* Handle form field changes to update character count in real-time */
  const handleTextChange = (e) => {
    // Get the current text length
    const textLength = e.target.value ? e.target.value.length : 0;
    
    // Update the UI with the character count
    const textFieldLabel = document.querySelector('.character-count');
    if (textFieldLabel) {
      textFieldLabel.innerText = `${textLength} characters`;
    }
  };

  /* Get formatted date for new recordings */
  const getFormattedDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const handlePublishAudio = () => {
    // In a real implementation, you would send a request to the server
    // to update the status of the recording or perform additional actions
    
    // For now, we'll simulate adding the new recording to the list
    if (generatedAudio) {
      const audioFilename = generatedAudio.split('/').pop();
      const newRecording = {
        id: `temp-${Date.now()}`, // Temporary ID until server assigns one
        key: `temp-${Date.now()}`,
        name: form.getFieldValue('filename'),
        type: 'TTS',
        duration: '00:00', // Would come from the server in a real implementation
        date: getFormattedDate(),
        size: '0.0 MB', // Would come from the server in a real implementation
        url: generatedAudio,
        active: true
      };
      
      // Add the new recording to the list
      setRecordings(prev => [newRecording, ...prev]);
      
      message.success("Recording published successfully!");
      
      // Close the modal and reset state
      setTtsModalVisible(false);
      setPreviewAudio(null);
      setGeneratedAudio(null);
      setSelectedTemplate('custom');
      form.resetFields();
    } else {
      message.error("No recording to publish. Please generate a recording first.");
    }
  };
  
  /* Add keyboard shortcut for previewing */
  const handleKeyDown = (e) => {
    // Check if Ctrl+Space or Cmd+Space is pressed to preview
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 32) {
      e.preventDefault();
      handlePreviewVoice();
    }
  };

  const handleDownload = (filename) => {
    // Create a hidden anchor element for downloading
    const downloadUrl = `${API_BASE_URL}/api/recordings/download/${filename}`;
    
    console.log(`Downloading file from: ${downloadUrl}`);
    
    // Either open in a new tab or use an anchor element
    window.open(downloadUrl, '_blank');
  };

  // Function to handle deleting a recording
  const handleDelete = (filename) => {
    console.log(`Deleting file: ${filename}`);
    setLoading(true);
    
    fetch(`${API_BASE_URL}/api/recordings/${filename}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to delete recording: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Delete response:', data);
        message.success(`"${filename}" has been deleted successfully`);
        fetchRecordings(); // Refresh the list
      })
      .catch(error => {
        console.error('Error deleting recording:', error);
        message.error(`Failed to delete recording: ${error.message}`);
        setLoading(false);
      });
  };

  const filteredRecordings = recordings.filter(record => {
    return record.name.toLowerCase().includes(searchText.toLowerCase());
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SoundOutlined style={{ marginRight: 8, color: '#3797ce' }} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Audio', value: 'Audio' },
        { text: 'TTS', value: 'TTS' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (text) => text || '—', // Show dash if no duration
    },
    {
      title: 'Upload Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      defaultSortOrder: 'descend',
      render: (text) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
          {text}
        </span>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (text) => text || '—', // Show dash if no size
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={currentAudio === record.id && isPlaying ? "Pause" : "Play"}>
            <Button 
              type="text"
              icon={currentAudio === record.id && isPlaying ? <PauseCircleFilled style={{ color: '#3797ce' }} /> : <PlayCircleFilled style={{ color: '#3797ce' }} />}
              onClick={() => handlePlay(record)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button 
              type="text"
              icon={<DownloadOutlined style={{ color: '#3797ce' }} />}
              onClick={() => handleDownload(record.filename)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Recording"
            description={`Are you sure you want to delete "${record.name || record.filename}"?`}
            onConfirm={() => handleDelete(record.filename)}
            okText="Yes, delete it"
            cancelText="Cancel"
            placement="left"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button 
                type="text" 
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    name: 'file',
    action: `${API_BASE_URL}/api/recordings/upload`,
    headers: {
      authorization: 'Bearer ' + localStorage.getItem('token'),
    },
    onChange: handleUpload,
    accept: 'audio/*',
    showUploadList: false,
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <Title level={2}>Recordings</Title>
          <div className="dashboard-actions">
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchRecordings}
              loading={refreshing}
              style={{ marginRight: 8 }}
            >
              Refresh
            </Button>
            <Button 
              icon={<RobotOutlined />}
              onClick={showTtsModal}
              style={{ marginRight: 8 }}
            >
              Text to Speech
            </Button>
            <Upload {...uploadProps}>
              <Button 
                type="primary" 
                icon={<UploadOutlined />}
              >
                Upload Recording
              </Button>
            </Upload>
          </div>
        </div>

        <Card className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              Audio Recordings
              <Tooltip title="Manage audio files for your IVR system">
                <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 14, color: '#8c8c8c' }} />
              </Tooltip>
            </h3>
            <div className="chart-actions">
              <Input
                placeholder="Search recordings..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: 250, marginRight: 8 }}
              />
              <Tooltip title="Export recordings">
                <Button icon={<FileExcelOutlined />} style={{ marginRight: 8 }}>
                  Export
                </Button>
              </Tooltip>
              <Tooltip title="Filter recordings">
                <Button icon={<FilterOutlined />} />
              </Tooltip>
            </div>
          </div>

          <Spin spinning={loading}>
            <Table
              dataSource={filteredRecordings}
              columns={columns}
              pagination={{ 
                pageSize: 10,
                position: ['bottomRight'],
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50']
              }}
              size="middle"
              bordered={false}
              rowKey="id"
              className="recordings-table"
            />
          </Spin>
        </Card>

        {/* Text to Speech Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RobotOutlined style={{ marginRight: 8, color: '#3797ce' }} />
              <span>Generate Recording with Text-to-Speech</span>
            </div>
          }
          open={ttsModalVisible}
          onCancel={handleTtsCancel}
          footer={null}
          width={700}
          className="modal-container"
        >
          <Form
            form={form}
            layout="vertical"
            className="form-container"
          >
            <Form.Item label="Select Template">
              <Radio.Group 
                onChange={handleTemplateChange} 
                value={selectedTemplate}
                className="template-selector"
                buttonStyle="solid"
              >
                {RECORDING_TEMPLATES.map(template => (
                  <Radio.Button key={template.id} value={template.id}>
                    {template.name}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="voiceId"
              label={
                <span>
                  <AudioOutlined style={{ marginRight: 8 }} />
                  Select Voice
                </span>
              }
              rules={[{ required: true, message: 'Please select a voice' }]}
            >
              <Select placeholder="Select a voice">
                {availableVoices.map(voice => (
                  <Option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name} ({voice.labels?.accent} {voice.labels?.gender})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="text"
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    Message Text
                  </span>
                  <Text type="secondary" className="character-count">
                    {form.getFieldValue('text')?.length || 0} characters
                  </Text>
                </div>
              }
              rules={[{ required: true, message: 'Please enter message text' }]}
            >
              <TextArea
                rows={4}
                placeholder="Enter the text for your message..."
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                maxLength={500}
                showCount
              />
            </Form.Item>
            
            <Button
              onClick={handlePreviewVoice}
              icon={<AudioOutlined />}
              loading={previewing}
              style={{ marginBottom: 16 }}
            >
              Preview Voice <Text type="secondary" style={{ fontSize: 12 }}>(Ctrl+Space)</Text>
            </Button>
            
            <Divider />
            
            <Form.Item
              name="filename"
              label={
                <span>
                  <SaveOutlined style={{ marginRight: 8 }} />
                  Save As (Filename)
                </span>
              }
              rules={[{ required: true, message: 'Please enter a filename' }]}
            >
              <Input 
                placeholder="Enter filename (without extension)" 
                suffix=".wav"
              />
            </Form.Item>

            <div style={{ marginTop: 24 }}>
              <Button
                onClick={handleGenerateAudio}
                type="primary"
                loading={generating}
                disabled={!!generatedAudio}
                icon={<RobotOutlined />}
                block
              >
                Generate Recording
              </Button>
              
              {(previewAudio || generatedAudio) && (
                <Card style={{ marginTop: 16 }} className="stat-card">
                  <Title level={5}>
                    {generatedAudio ? "Generated Recording" : "Voice Preview"}
                  </Title>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <Button
                      icon={isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
                      onClick={handlePreviewPlay}
                      type="primary"
                      ghost
                    >
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    
                    {generatedAudio && (
                      <Button
                        type="primary"
                        onClick={handlePublishAudio}
                        icon={<CheckCircleOutlined />}
                      >
                        Publish
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default Recordings;
