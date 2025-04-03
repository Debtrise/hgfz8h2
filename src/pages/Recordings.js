import React, { useEffect, useState } from "react";
import { Table, Button, Input, Upload, message, Tooltip, Space, Switch } from "antd";
import { SearchOutlined, UploadOutlined, ImportOutlined, SoundOutlined, PlayCircleFilled, PauseCircleFilled, EllipsisOutlined } from "@ant-design/icons";
import "../styles/Recordings.css";

function Recordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = () => {
    setLoading(true);
    // Fetch existing recordings from API
    fetch("/api/recordings")
      .then((res) => res.json())
      .then((data) => {
        // Add key property to each record for table
        const recordingsWithKeys = data.map(rec => ({
          ...rec,
          key: rec.id
        }));
        setRecordings(recordingsWithKeys);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        message.error("Failed to load recordings");
        setLoading(false);
        
        // For development/testing - remove in production
        const mockData = [
          { id: '1', key: '1', name: 'Voicemail Greeting', type: 'Voicemail', duration: '00:32', date: '2023-03-12', size: '0.8 MB', url: 'https://example.com/audio1.mp3', active: true },
          { id: '2', key: '2', name: 'Welcome Message', type: 'IVR', duration: '00:45', date: '2023-03-01', size: '1.2 MB', url: 'https://example.com/audio2.mp3', active: true },
          { id: '3', key: '3', name: 'Hold Music', type: 'System', duration: '03:22', date: '2023-02-15', size: '3.5 MB', url: 'https://example.com/audio3.mp3', active: true },
          { id: '4', key: '4', name: 'Sales Team Greeting', type: 'IVR', duration: '00:28', date: '2023-02-10', size: '0.6 MB', url: 'https://example.com/audio4.mp3', active: false },
          { id: '5', key: '5', name: 'After Hours Message', type: 'Voicemail', duration: '00:51', date: '2023-01-25', size: '1.4 MB', url: 'https://example.com/audio5.mp3', active: true },
        ];
        setRecordings(mockData);
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
      audioPlayer.pause();
      setIsPlaying(false);
    } else {
      // Stop previous audio if playing
      if (audioPlayer) {
        audioPlayer.pause();
      }
      
      // Play new audio
      const newPlayer = new Audio(record.url);
      newPlayer.addEventListener('ended', () => setIsPlaying(false));
      newPlayer.play();
      setAudioPlayer(newPlayer);
      setCurrentAudio(record.id);
      setIsPlaying(true);
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
        <div className="recording-name">
          <SoundOutlined className="sound-icon" />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Upload Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'status',
      render: (active, record) => (
        <Switch 
          checked={active} 
          size="small" 
          onChange={(checked) => handleStatusChange(checked, record)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={currentAudio === record.id && isPlaying ? "Pause" : "Play"}>
            <button 
              className="action-button"
              onClick={() => handlePlay(record)}
            >
              {currentAudio === record.id && isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
            </button>
          </Tooltip>
          <Tooltip title="More">
            <button className="action-button">
              <EllipsisOutlined />
            </button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    name: 'file',
    action: '/api/recordings/upload',
    headers: {
      authorization: 'Bearer ' + localStorage.getItem('token'),
    },
    onChange: handleUpload,
    accept: 'audio/*',
    showUploadList: false,
  };

  return (
    <div className="recordings-container">
      <div className="recordings-header">
        <div className="search-box">
          <Input
            placeholder="Search recordings..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            className="search-input"
          />
        </div>
        
        <div className="header-buttons">
          <Button className="import-button" icon={<ImportOutlined />}>
            Import
          </Button>
          <Upload {...uploadProps}>
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
              className="new-recording-button"
            >
              New Recording
            </Button>
          </Upload>
        </div>
      </div>
      
      <Table
        dataSource={filteredRecordings}
        columns={columns}
        loading={loading}
        pagination={{ 
          pageSize: 10,
          position: ['bottomRight'],
          showSizeChanger: false
        }}
        className="recordings-table"
        size="middle"
        bordered={false}
        rowKey="id"
      />
    </div>
  );
}

export default Recordings;
