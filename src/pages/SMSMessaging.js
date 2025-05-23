import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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

// API Configuration
const API_BASE_URL = 'https://sms-blaster-api-154842307047.us-central1.run.app'; // Updated with actual Cloud Run URL

const SMSMessaging = () => {
  // State for contacts, messages, and UI
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState({});
  const [activities, setActivities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const endOfMessagesRef = useRef(null);
  
  // Template responses (now linked to campaign creation)
  const templateResponses = [
    "Thanks for reaching out! I'll get back to you shortly.",
    "Yes, that works for me. Let's proceed.",
    "Could we schedule a call to discuss this further?",
    "I've sent the information to your email.",
    "Can you provide more details about this request?"
  ];

  // Fetch contacts from campaigns
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching contacts from:', `${API_BASE_URL}/api/campaigns`);
        
        // Fetch campaigns first
        const campaignsResponse = await axios.get(`${API_BASE_URL}/api/campaigns`);
        console.log('Campaigns response:', campaignsResponse.data);
        
        // Then fetch details for each campaign to get messages
        const campaignDetails = await Promise.all(
          campaignsResponse.data.map(campaign => 
            axios.get(`${API_BASE_URL}/api/campaigns/${campaign.id}`)
          )
        );
        
        // Transform campaign messages into contact list
        const contactList = campaignDetails.flatMap(response => {
          const campaign = response.data;
          return (campaign.recentMessages || []).map(message => ({
            id: message.id || message.case_id,
            name: message.f_name || 'Unknown Contact',
            phone: message.phone,
            unread: 0,
            lastMessage: message.content,
            lastMessageTime: new Date(message.sentAt).toLocaleString(),
            f_name: message.f_name
          }));
        });

        console.log('Processed contacts:', contactList);
        setContacts(contactList);
        
        // Select first contact if exists
        if (contactList.length > 0) {
          setSelectedContact(contactList[0]);
          fetchConversation(contactList[0].id);
          fetchActivities(contactList[0].id);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Fetch detailed conversation for a contact
  const fetchConversation = async (contactId) => {
    try {
      // Fetch all campaigns with detailed info
      const campaignsResponse = await axios.get(`${API_BASE_URL}/api/campaigns`);
      
      // Get details for each campaign
      const campaignDetails = await Promise.all(
        campaignsResponse.data.map(campaign => 
          axios.get(`${API_BASE_URL}/api/campaigns/${campaign.id}`)
        )
      );
      
      // Find messages that match this contact's ID or phone
      let messages = [];
      for (const response of campaignDetails) {
        const campaign = response.data;
        const matchingMessages = (campaign.recentMessages || []).filter(msg => 
          msg.id === contactId || msg.case_id === contactId
        );
        
        if (matchingMessages.length > 0) {
          messages = matchingMessages.map(msg => ({
            id: msg.messageSid || msg.id,
            text: msg.content,
            sender: msg.status === 'delivered' ? 'contact' : 'user',
            timestamp: new Date(msg.sentAt).toLocaleTimeString(),
            status: msg.status,
            campaignId: campaign.id,
            campaignName: campaign.name,
            createdAt: new Date(msg.sentAt).toLocaleString(),
            phone: msg.phone,
            f_name: msg.f_name || 'Unknown Contact'
          }));
          break;
        }
      }
      
      setConversations(prev => ({
        ...prev,
        [contactId]: messages
      }));
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  // Fetch activities for a contact
  const fetchActivities = async (contactId) => {
    try {
      // Fetch all campaigns with detailed info
      const campaignsResponse = await axios.get(`${API_BASE_URL}/api/campaigns`);
      
      // Get details for each campaign
      const campaignDetails = await Promise.all(
        campaignsResponse.data.map(campaign => 
          axios.get(`${API_BASE_URL}/api/campaigns/${campaign.id}`)
        )
      );
      
      // Find campaigns that have messages for this contact
      const activities = campaignDetails.flatMap(response => {
        const campaign = response.data;
        const hasMessages = (campaign.recentMessages || []).some(msg => 
          msg.id === contactId || msg.case_id === contactId
        );
        
        if (hasMessages) {
          return [{
            id: campaign.id,
            type: 'sms',
            title: `Campaign: ${campaign.name}`,
            date: new Date(campaign.createdAt).toLocaleDateString(),
            time: new Date(campaign.createdAt).toLocaleTimeString(),
            status: campaign.status,
            progress: campaign.progress,
            totalLeads: campaign.totalLeads,
            messageContent: campaign.messageContent,
            f_name: campaign.recentMessages.find(msg => 
              msg.id === contactId || msg.case_id === contactId
            )?.f_name || 'Unknown Contact'
          }];
        }
        return [];
      });

      setActivities(prev => ({
        ...prev,
        [contactId]: activities
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // Modify handleSendMessage to include f_name
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedContact) return;

    try {
      // Create a new campaign for this specific message
      const campaignResponse = await axios.post(`${API_BASE_URL}/api/campaigns`, {
        name: `Personal Message to ${selectedContact.f_name || selectedContact.name}`,
        minLeadAge: 1,
        maxLeadAge: 7,
        messageContent: messageInput,
        batchSize: 1,
        totalLeads: 1,
        smsPoolId: 'default'
      });

      const newMessage = {
        id: Date.now(),
        text: messageInput,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        campaignId: campaignResponse.data.id,
        f_name: selectedContact.f_name || selectedContact.name
      };

      // Update local conversation
      setConversations(prev => ({
        ...prev,
        [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage]
      }));

      // Clear input
      setMessageInput('');

      // Optional: Refresh activities or fetch response
      fetchActivities(selectedContact.id);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="sms-messaging-container">
      {loading ? (
        <div className="loading-container">
          <p className="loading-text">Loading messages...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <h3>Error Loading Messages</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <>
          {/* Contacts Sidebar */}
          <div className="contacts-sidebar">
            <div className="contacts-header">
              <h2>Contacts</h2>
              <div className="search-container">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="contacts-list">
              {contacts.length === 0 ? (
                <div className="no-contacts">
                  <FiUser size={48} />
                  <p>No contacts found</p>
                </div>
              ) : (
                contacts
                  .filter(contact => 
                    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    contact.phone.includes(searchTerm)
                  )
                  .map(contact => (
                    <div
                      key={contact.id}
                      className={`contact-item ${selectedContact?.id === contact.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedContact(contact);
                        fetchConversation(contact.id);
                        fetchActivities(contact.id);
                      }}
                    >
                      <div className="contact-avatar">
                        <FiUser />
                      </div>
                      <div className="contact-info">
                        <div className="contact-name-row">
                          <h3 className="contact-name">{contact.name}</h3>
                          <span className="contact-time">{contact.lastMessageTime}</span>
                        </div>
                        <p className="contact-last-message">{contact.lastMessage}</p>
                      </div>
                      {contact.unread > 0 && (
                        <div className="unread-badge">{contact.unread}</div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Messaging Area */}
          <div className="messaging-area">
            {selectedContact ? (
              <>
                <div className="messaging-header">
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
                <div className="messages-container" ref={endOfMessagesRef}>
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
                </div>
                <div className="message-input-container">
                  <button className="attachment-button">
                    <FiPaperclip />
                  </button>
                  <textarea
                    className="message-input"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
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
                <h3>Select a contact to start messaging</h3>
              </div>
            )}
          </div>

          {/* Activity Sidebar */}
          <div className="activity-sidebar">
            <div className="activity-header">
              <h2>Activity</h2>
            </div>
            {selectedContact && (
              <>
                <div className="contact-details">
                  <h3>Contact Details</h3>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedContact.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Message:</span>
                    <span className="detail-value">{selectedContact.lastMessageTime}</span>
                  </div>
                </div>
                <div className="activity-list">
                  <h3>Recent Activity</h3>
                  {activities[selectedContact.id]?.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'sms' ? <FiMessageCircle /> : <FiMail />}
                      </div>
                      <div className="activity-content">
                        <h4 className="activity-title">{activity.title}</h4>
                        <div className="activity-time">
                          <FiCalendar />
                          <span>{activity.date}</span>
                          <FiClock />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="template-responses">
                  <h3>Quick Responses</h3>
                  {templateResponses.map((response, index) => (
                    <div
                      key={index}
                      className="template-item"
                      onClick={() => setMessageInput(response)}
                    >
                      {response}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SMSMessaging;

// Add to package.json dependencies
// "axios": "^0.21.1"