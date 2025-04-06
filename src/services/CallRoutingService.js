import apiService from './apiService';

class CallRoutingService {
  constructor() {
    this.agents = new Map();
    this.skillMatrix = new Map();
    this.routingQueue = [];
  }

  // Register an agent with their skills
  async registerAgent(agentId, skills, maxConcurrentCalls = 1) {
    console.log(`Registering agent ${agentId} with skills: ${skills.join(', ')}`);
    
    try {
      // Update agent in the backend
      await apiService.callCenter.agents.update(agentId, {
        skills,
        maxConcurrentCalls,
        status: 'available'
      });
      
      // Update local state
      this.agents.set(agentId, {
        id: agentId,
        skills,
        currentCalls: 0,
        maxConcurrentCalls,
        status: 'available',
        lastCallEndTime: null,
        successRate: 0,
        totalCalls: 0,
        successfulCalls: 0,
      });

      // Update skill matrix
      skills.forEach(skill => {
        if (!this.skillMatrix.has(skill)) {
          this.skillMatrix.set(skill, new Set());
        }
        this.skillMatrix.get(skill).add(agentId);
      });
    } catch (error) {
      console.error('Error registering agent:', error);
      throw error;
    }
  }

  // Update agent status
  async updateAgentStatus(agentId, status) {
    console.log(`Updating status for agent ${agentId} to ${status}`);
    
    try {
      // Update agent status in the backend
      await apiService.callCenter.agents.updateStatus(agentId, status);
      
      // Update local state
      if (this.agents.has(agentId)) {
        const agent = this.agents.get(agentId);
        agent.status = status;
        this.agents.set(agentId, agent);
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
      throw error;
    }
  }

  // Update agent metrics after call
  async updateAgentMetrics(agentId, callSuccess) {
    console.log(`Updating metrics for agent ${agentId}, call success: ${callSuccess}`);
    
    try {
      // Update agent metrics in the backend
      await apiService.callCenter.agents.updateMetrics(agentId, {
        callSuccess,
        timestamp: new Date().toISOString()
      });
      
      // Update local state
      if (this.agents.has(agentId)) {
        const agent = this.agents.get(agentId);
        agent.totalCalls++;
        if (callSuccess) agent.successfulCalls++;
        agent.successRate = (agent.successfulCalls / agent.totalCalls) * 100;
        agent.lastCallEndTime = Date.now();
        agent.currentCalls = Math.max(0, agent.currentCalls - 1);
        this.agents.set(agentId, agent);
      }
    } catch (error) {
      console.error('Error updating agent metrics:', error);
      throw error;
    }
  }

  // Find best agent for a call based on required skills
  async findBestAgent(requiredSkills = [], callPriority = 'normal') {
    try {
      // Get best agent from the backend
      const response = await apiService.callCenter.routing.findBestAgent({
        requiredSkills,
        callPriority
      });
      
      return response.agent;
    } catch (error) {
      console.error('Error finding best agent:', error);
      
      // Fallback to local logic if backend fails
      const agent = this._getQualifiedAgents(requiredSkills);
      console.log(`Finding best agent for skills: ${requiredSkills.join(', ')} with priority: ${callPriority}`);
      if (agent.length === 0) return null;

      // Score each qualified agent
      const scoredAgents = agent.map(agent => ({
        agent,
        score: this._calculateAgentScore(agent, callPriority)
      }));

      // Sort by score (highest first)
      scoredAgents.sort((a, b) => b.score - a.score);
      return scoredAgents[0].agent;
    }
  }

  // Get all agents qualified for the required skills
  _getQualifiedAgents(requiredSkills) {
    if (requiredSkills.length === 0) {
      return Array.from(this.agents.values()).filter(
        agent => agent.status === 'available' && agent.currentCalls < agent.maxConcurrentCalls
      );
    }

    // Find agents that have all required skills
    const qualifiedAgentIds = requiredSkills.reduce((acc, skill) => {
      const agentsWithSkill = this.skillMatrix.get(skill) || new Set();
      if (acc === null) return new Set(agentsWithSkill);
      return new Set([...acc].filter(x => agentsWithSkill.has(x)));
    }, null);

    return Array.from(qualifiedAgentIds || [])
      .map(id => this.agents.get(id))
      .filter(agent => agent.status === 'available' && agent.currentCalls < agent.maxConcurrentCalls);
  }

  // Calculate score for agent selection
  _calculateAgentScore(agent, callPriority) {
    const baseScore = agent.successRate;
    const loadPenalty = (agent.currentCalls / agent.maxConcurrentCalls) * 20;
    
    // Add time since last call bonus (to distribute calls more evenly)
    const timeSinceLastCall = agent.lastCallEndTime 
      ? (Date.now() - agent.lastCallEndTime) / 1000 / 60 // minutes
      : 60; // default to 60 minutes if no previous calls
    const timeBonus = Math.min(timeSinceLastCall, 60) / 2; // max 30 points for 60 minutes

    // Priority multiplier
    const priorityMultiplier = callPriority === 'high' ? 1.5 : callPriority === 'low' ? 0.8 : 1;

    return (baseScore + timeBonus - loadPenalty) * priorityMultiplier;
  }

  // Queue a call if no agents are available
  async queueCall(callData) {
    console.log(`Queuing call with data: ${JSON.stringify(callData)}`);
    
    try {
      // Queue call in the backend
      await apiService.callCenter.routing.queueCall(callData);
      
      // Update local state
      this.routingQueue.push({
        ...callData,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error queuing call:', error);
      throw error;
    }
  }

  // Process queued calls
  async processQueue() {
    console.log('Processing call queue');
    
    try {
      // Process queue in the backend
      const response = await apiService.callCenter.routing.processQueue();
      return response.processedCalls;
    } catch (error) {
      console.error('Error processing queue:', error);
      
      // Fallback to local logic if backend fails
      const processedCalls = [];
      
      this.routingQueue.sort((a, b) => {
        // Sort by priority first, then by timestamp
        if (a.priority !== b.priority) {
          return a.priority === 'high' ? -1 : 1;
        }
        return a.timestamp - b.timestamp;
      });

      for (const call of this.routingQueue) {
        const agent = this.findBestAgent(call.requiredSkills, call.priority);
        if (agent) {
          processedCalls.push({ call, agent });
        }
      }

      // Remove processed calls from queue
      this.routingQueue = this.routingQueue.filter(
        call => !processedCalls.find(pc => pc.call === call)
      );

      return processedCalls;
    }
  }
}

export default new CallRoutingService(); 