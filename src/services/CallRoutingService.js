class CallRoutingService {
  constructor() {
    this.agents = new Map();
    this.skillMatrix = new Map();
    this.routingQueue = [];
  }

  // Register an agent with their skills
  registerAgent(agentId, skills, maxConcurrentCalls = 1) {
    console.log(`Registering agent ${agentId} with skills: ${skills.join(', ')}`);
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
  }

  // Update agent status
  updateAgentStatus(agentId, status) {
    console.log(`Updating status for agent ${agentId} to ${status}`);
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      agent.status = status;
      this.agents.set(agentId, agent);
    }
  }

  // Update agent metrics after call
  updateAgentMetrics(agentId, callSuccess) {
    console.log(`Updating metrics for agent ${agentId}, call success: ${callSuccess}`);
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      agent.totalCalls++;
      if (callSuccess) agent.successfulCalls++;
      agent.successRate = (agent.successfulCalls / agent.totalCalls) * 100;
      agent.lastCallEndTime = Date.now();
      agent.currentCalls = Math.max(0, agent.currentCalls - 1);
      this.agents.set(agentId, agent);
    }
  }

  // Find best agent for a call based on required skills
  findBestAgent(requiredSkills = [], callPriority = 'normal') {
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
  queueCall(callData) {
    console.log(`Queuing call with data: ${JSON.stringify(callData)}`);
    this.routingQueue.push({
      ...callData,
      timestamp: Date.now()
    });
  }

  // Process queued calls
  processQueue() {
    console.log('Processing call queue');
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

export default new CallRoutingService(); 