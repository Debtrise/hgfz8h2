// Mock data service for RealTimeAgentDashboard
const MockDataService = {
  listeners: {},
  intervalId: null,
  
  // Generate random agent stats
  generateAgentStats() {
    const statuses = ['available', 'busy', 'break', 'training', 'meeting'];
    const agents = [
      { id: 1, name: 'John Smith' },
      { id: 2, name: 'Emily Davis' },
      { id: 3, name: 'Michael Johnson' },
      { id: 4, name: 'Sarah Wilson' },
      { id: 5, name: 'David Brown' },
      { id: 6, name: 'Jessica Martinez' },
      { id: 7, name: 'Robert Taylor' },
      { id: 8, name: 'Jennifer Anderson' },
      { id: 9, name: 'Christopher Thomas' },
      { id: 10, name: 'Lisa Jackson' },
      { id: 11, name: 'Matthew Harris' },
      { id: 12, name: 'Amanda White' }
    ];
    
    // Generate agent stats with realistic metrics
    const agentStats = agents.map(agent => {
      const callsHandled = Math.floor(Math.random() * 50) + 10;
      const avgHandleTime = Math.floor(Math.random() * 300) + 60; // 60-360 seconds
      const successRate = Math.floor(Math.random() * 30) + 70; // 70-100%
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        ...agent,
        callsHandled,
        avgHandleTime,
        successRate,
        status,
        currentCall: status === 'busy' ? {
          phoneNumber: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          duration: Math.floor(Math.random() * 600) + 1, // 1-600 seconds
          callType: Math.random() > 0.5 ? 'inbound' : 'outbound'
        } : null
      };
    });
    
    // Calculate overall stats
    const activeAgents = agentStats.filter(a => a.status === 'available' || a.status === 'busy').length;
    const totalCalls = agentStats.reduce((sum, agent) => sum + agent.callsHandled, 0);
    const avgHandleTime = Math.floor(agentStats.reduce((sum, agent) => sum + agent.avgHandleTime, 0) / agentStats.length);
    const successRate = Math.floor(agentStats.reduce((sum, agent) => sum + agent.successRate, 0) / agentStats.length);
    
    return {
      type: 'agentStats',
      agents: agentStats,
      overall: {
        activeAgents,
        totalCalls,
        avgHandleTime,
        successRate,
        callsInQueue: Math.floor(Math.random() * 8),
        longestWaitTime: Math.floor(Math.random() * 300) + 1, // 1-300 seconds
        abandonRate: Math.floor(Math.random() * 5) + 1, // 1-5%
        serviceLevel: Math.floor(Math.random() * 10) + 90, // 90-100%
      },
      queueStats: [
        {
          id: 1,
          name: 'Sales',
          waitingCalls: Math.floor(Math.random() * 5),
          avgWaitTime: Math.floor(Math.random() * 120) + 10,
          sla: Math.floor(Math.random() * 10) + 85
        },
        {
          id: 2,
          name: 'Support',
          waitingCalls: Math.floor(Math.random() * 6),
          avgWaitTime: Math.floor(Math.random() * 140) + 20,
          sla: Math.floor(Math.random() * 15) + 80
        },
        {
          id: 3,
          name: 'Customer Service',
          waitingCalls: Math.floor(Math.random() * 4),
          avgWaitTime: Math.floor(Math.random() * 90) + 15,
          sla: Math.floor(Math.random() * 5) + 90
        },
        {
          id: 4,
          name: 'VIP Clients',
          waitingCalls: Math.floor(Math.random() * 2),
          avgWaitTime: Math.floor(Math.random() * 60) + 5,
          sla: Math.floor(Math.random() * 3) + 95
        }
      ],
      callVolumeByHour: [
        { hour: '9:00', calls: Math.floor(Math.random() * 30) + 40 },
        { hour: '10:00', calls: Math.floor(Math.random() * 40) + 50 },
        { hour: '11:00', calls: Math.floor(Math.random() * 50) + 60 },
        { hour: '12:00', calls: Math.floor(Math.random() * 30) + 40 },
        { hour: '13:00', calls: Math.floor(Math.random() * 20) + 30 },
        { hour: '14:00', calls: Math.floor(Math.random() * 40) + 50 },
        { hour: '15:00', calls: Math.floor(Math.random() * 50) + 60 },
        { hour: '16:00', calls: Math.floor(Math.random() * 40) + 45 },
        { hour: '17:00', calls: Math.floor(Math.random() * 30) + 35 }
      ]
    };
  },

  // Connect to the mock data service
  connect() {
    console.log('Connected to mock data service');
    // Update data every 5 seconds
    this.intervalId = setInterval(() => {
      this.emit('agentDashboard', this.generateAgentStats());
    }, 5000);
    
    // Initial data
    setTimeout(() => {
      this.emit('agentDashboard', this.generateAgentStats());
    }, 500);
  },

  // Disconnect from the mock data service
  disconnect() {
    console.log('Disconnected from mock data service');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },

  // Add event listener
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },

  // Remove event listener
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  },

  // Emit event
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

export default MockDataService; 