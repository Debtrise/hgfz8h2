import React, { useState, useEffect, useRef } from 'react';
import { 
  FiSearch, 
  FiSend, 
  FiPaperclip, 
  FiPhone, 
  FiInfo, 
  FiUser, 
  FiMessageCircle,
  FiMail,
  FiCalendar,
  FiClock,
  FiFileText
} from 'react-icons/fi';
import './styles/SMSMessaging.css';

const SMSMessaging = () => {
  // State for contacts, messages, and UI
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState({});
  const [activities, setActivities] = useState({});
  const endOfMessagesRef = useRef(null);
  
  // Template responses
  const templateResponses = [
    "Thanks for reaching out! I'll get back to you shortly.",
    "Yes, that works for me. Let's proceed.",
    "Could we schedule a call to discuss this further?",
    "I've sent the information to your email.",
    "Can you provide more details about this request?"
  ];

  // Fetch mock contacts on component mount
  useEffect(() => {
    const mockContacts = [
      { id: 1, name: 'John Doe', phone: '+1 (555) 123-4567', unread: 2, lastMessage: 'I need more information about...', lastMessageTime: '10:25 AM' },
      { id: 2, name: 'Sarah Johnson', phone: '+1 (555) 234-5678', unread: 0, lastMessage: 'Thanks for your help!', lastMessageTime: 'Yesterday' },
      { id: 3, name: 'Michael Brown', phone: '+1 (555) 345-6789', unread: 5, lastMessage: 'Can we schedule a call?', lastMessageTime: '2 days ago' },
      { id: 4, name: 'Jessica Wilson', phone: '+1 (555) 456-7890', unread: 0, lastMessage: "I'll get back to you soon.", lastMessageTime: 'Jan 15' },
      { id: 5, name: 'David Martinez', phone: '+1 (555) 567-8901', unread: 0, lastMessage: 'Perfect, that works for me.', lastMessageTime: 'Jan 10' },
      { id: 6, name: 'Amanda Taylor', phone: '+1 (555) 678-9012', unread: 1, lastMessage: 'Do you have availability next week?', lastMessageTime: 'Jan 7' },
      { id: 7, name: 'Robert Anderson', phone: '+1 (555) 789-0123', unread: 0, lastMessage: 'Let me know when the update is ready.', lastMessageTime: 'Dec 28' },
      { id: 8, name: 'Emily Thomas', phone: '+1 (555) 890-1234', unread: 0, lastMessage: 'I appreciate your quick response.', lastMessageTime: 'Dec 22' },
      { id: 9, name: 'Daniel Jackson', phone: '+1 (555) 901-2345', unread: 0, lastMessage: 'The proposal looks great!', lastMessageTime: 'Dec 18' },
      { id: 10, name: 'Olivia White', phone: '+1 (555) 012-3456', unread: 3, lastMessage: 'Please call me back when you can.', lastMessageTime: 'Dec 15' },
    ];
    
    setContacts(mockContacts);
    
    // Set first contact as selected by default
    if (mockContacts.length > 0) {
      setSelectedContact(mockContacts[0]);
      fetchConversation(mockContacts[0].id);
      fetchActivities(mockContacts[0].id);
    }
  }, []);

  // Scroll to bottom of messages when conversation changes
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, selectedContact]);

  // Fetch conversation for a contact
  const fetchConversation = (contactId) => {
    // Mock conversation data
    const mockConversations = {
      1: [
        { id: 1, text: 'Hi John, this is Sarah from Marketing Solutions. I wanted to follow up on our conversation about the new marketing campaign.', sender: 'user', timestamp: '10:00 AM' },
        { id: 2, text: 'Hi Sarah, thanks for reaching out. I was just reviewing the materials you sent over.', sender: 'contact', timestamp: '10:15 AM' },
        { id: 3, text: 'Great! Do you have any questions I can help with?', sender: 'user', timestamp: '10:17 AM' },
        { id: 4, text: 'I need more information about the pricing structure and timeline.', sender: 'contact', timestamp: '10:25 AM' },
      ],
      2: [
        { id: 1, text: "Hello Sarah, I'm following up on the demo we had yesterday. Do you have any feedback?", sender: 'user', timestamp: 'Yesterday, 2:30 PM' },
        { id: 2, text: "Hi there! Yes, the demo was very helpful. I showed it to my team and they're interested.", sender: 'contact', timestamp: 'Yesterday, 4:15 PM' },
        { id: 3, text: "That's wonderful news! Would you like to schedule a follow-up call to discuss next steps?", sender: 'user', timestamp: 'Yesterday, 4:30 PM' },
        { id: 4, text: 'Thanks for your help!', sender: 'contact', timestamp: 'Yesterday, 5:45 PM' },
      ],
      3: [
        { id: 1, text: 'Michael, I noticed you signed up for our newsletter. Would you like more information about our services?', sender: 'user', timestamp: '3 days ago, 1:15 PM' },
        { id: 2, text: "Yes, I'm interested in your consulting packages.", sender: 'contact', timestamp: '3 days ago, 2:20 PM' },
        { id: 3, text: "Great! I'll send over our brochure right away. Are there specific areas you're most interested in?", sender: 'user', timestamp: '2 days ago, 9:00 AM' },
        { id: 4, text: 'Primarily interested in the marketing automation and CRM integration.', sender: 'contact', timestamp: '2 days ago, 11:30 AM' },
        { id: 5, text: "Perfect, I'll highlight those sections for you. Would you like to discuss these in more detail?", sender: 'user', timestamp: '2 days ago, 12:00 PM' },
        { id: 6, text: 'Can we schedule a call?', sender: 'contact', timestamp: '2 days ago, 2:45 PM' },
      ],
    };
    
    // Set conversation for the selected contact
    setConversations(prev => ({
      ...prev,
      [contactId]: mockConversations[contactId] || []
    }));
  };

  // Fetch activities for a contact
  const fetchActivities = (contactId) => {
    // Mock activity data
    const mockActivities = {
      1: [
        { id: 1, type: 'email', title: 'Sent email about marketing campaign', date: 'Today', time: '9:30 AM' },
        { id: 2, type: 'call', title: 'Outbound call (3:45)', date: 'Yesterday', time: '2:15 PM' },
        { id: 3, type: 'note', title: 'Added to "High Priority Leads" campaign', date: 'Jan 15, 2023', time: '11:00 AM' },
      ],
      2: [
        { id: 1, type: 'demo', title: 'Product demonstration', date: 'Yesterday', time: '1:00 PM' },
        { id: 2, type: 'email', title: 'Sent follow-up resources', date: 'Yesterday', time: '3:30 PM' },
        { id: 3, type: 'note', title: 'Interested in Enterprise plan', date: 'Jan 10, 2023', time: '4:45 PM' },
      ],
      3: [
        { id: 1, type: 'email', title: 'Sent product brochure', date: '2 days ago', time: '9:15 AM' },
        { id: 2, type: 'call', title: 'Missed call (0:00)', date: '4 days ago', time: '10:30 AM' },
        { id: 3, type: 'meeting', title: 'Initial consultation scheduled', date: 'Jan 25, 2023', time: '2:00 PM' },
      ],
    };
    
    // Set activities for the selected contact
    setActivities(prev => ({
      ...prev,
      [contactId]: mockActivities[contactId] || []
    }));
  };

  // Handle contact selection
  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    fetchConversation(contact.id);
    fetchActivities(contact.id);
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact) return;

    const newMessage = {
      id: Date.now(),
      text: messageInput,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add message to conversation
    setConversations(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage]
    }));

    // Clear input
    setMessageInput('');
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  // Handle key press for sending message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'email':
        return <FiMail />;
      case 'call':
        return <FiPhone />;
      case 'meeting':
        return <FiCalendar />;
      case 'note':
        return <FiFileText />;
      case 'demo':
        return <FiMessageCircle />;
      default:
        return <FiInfo />;
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setMessageInput(template);
  };

  return (
    <div className="sms-messaging-container">
      {/* Left Sidebar - Contacts */}
      <div className="contacts-sidebar">
        <div className="contacts-header">
          <h2>Contacts</h2>
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="contacts-list">
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              className={`contact-item ${selectedContact && selectedContact.id === contact.id ? 'selected' : ''}`}
              onClick={() => handleContactSelect(contact)}
            >
              <div className="contact-avatar">
                <FiUser size={24} />
              </div>
              <div className="contact-info">
                <div className="contact-name-row">
                  <h3 className="contact-name">{contact.name}</h3>
                  <span className="contact-time">{contact.lastMessageTime}</span>
                </div>
                <p className="contact-last-message">{contact.lastMessage}</p>
              </div>
              {contact.unread > 0 && <div className="unread-badge">{contact.unread}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Center - Messaging Area */}
      <div className="messaging-area">
        {selectedContact ? (
          <>
            <div className="messaging-header">
              <div className="contact-avatar">
                <FiUser size={20} />
              </div>
              <div className="selected-contact-info">
                <h3>{selectedContact.name}</h3>
                <p>{selectedContact.phone}</p>
              </div>
              <div className="messaging-actions">
                <button className="action-button">
                  <FiPhone />
                </button>
                <button className="action-button">
                  <FiInfo />
                </button>
              </div>
            </div>
            
            <div className="messages-container">
              {conversations[selectedContact.id]?.map(message => (
                <div 
                  key={message.id}
                  className={`message ${message.sender === 'user' ? 'sent' : 'received'}`}
                >
                  <div className="message-bubble">
                    <p>{message.text}</p>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))}
              <div ref={endOfMessagesRef} />
            </div>
            
            <div className="message-input-container">
              <button className="attachment-button">
                <FiPaperclip />
              </button>
              <textarea
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="message-input"
              />
              <button 
                className="send-button"
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
              >
                <FiSend />
              </button>
            </div>
          </>
        ) : (
          <div className="no-selection">
            <FiMessageCircle size={48} />
            <p>Select a contact to start messaging</p>
          </div>
        )}
      </div>

      {/* Right Sidebar - Activity/Info */}
      <div className="activity-sidebar">
        {selectedContact && (
          <>
            <div className="activity-header">
              <h2>Recent Activity</h2>
            </div>
            
            <div className="contact-details">
              <h3>Contact Details</h3>
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedContact.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedContact.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Contacted:</span>
                <span className="detail-value">{selectedContact.lastMessageTime}</span>
              </div>
            </div>
            
            <div className="activity-list">
              <h3>Timeline</h3>
              {activities[selectedContact.id]?.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">{activity.title}</p>
                    <div className="activity-time">
                      <FiClock size={12} />
                      <span>{activity.date} at {activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="template-responses">
              <h3>Quick Responses</h3>
              {templateResponses.map((template, index) => (
                <div 
                  key={index} 
                  className="template-item"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {template}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SMSMessaging; 