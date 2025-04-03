import { MarkerType } from "reactflow";

export const saveJourney = async (journeyData) => {
  try {
    // In a real application, this would be an API call
    console.log("Saving journey data to API:", journeyData);

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          id: journeyData.id || "new-journey-" + Date.now(),
        });
      }, 500);
    });
  } catch (error) {
    console.error("Error saving journey:", error);
    throw error;
  }
};

export const loadJourney = async (journeyId) => {
  try {
    // In a real application, this would be an API call
    console.log("Loading journey data for ID:", journeyId);

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: journeyId,
          nodes: [
            {
              id: "trigger-1",
              type: "triggerNode",
              position: { x: 100, y: 50 },
              data: {},
            },
            {
              id: "call-1",
              type: "callNode",
              position: { x: 100, y: 150 },
              data: { vm: "default_vm", ivr: "standard_ivr", callTime: "business_hours" },
            },
            {
              id: "email-1",
              type: "emailNode",
              position: { x: 100, y: 300 },
              data: { template: "welcome_email", subject: "Welcome to our service", sendTime: "immediate" },
            },
            {
              id: "text-1",
              type: "textNode",
              position: { x: 300, y: 150 },
              data: { template: "greeting_sms", content: "Welcome to our service! Let us know if you have any questions." },
            },
            {
              id: "end-1",
              type: "endNode",
              position: { x: 300, y: 450 },
              data: {},
            },
          ],
          edges: [
            {
              id: "e-trigger-1-call-1",
              source: "trigger-1",
              target: "call-1",
              type: "smoothstep",
              markerEnd: { type: MarkerType.ArrowClosed },
            },
            {
              id: "e-call-1-email-1",
              source: "call-1",
              target: "email-1",
              type: "smoothstep",
              markerEnd: { type: MarkerType.ArrowClosed },
            },
            {
              id: "e-trigger-1-text-1",
              source: "trigger-1",
              target: "text-1",
              type: "smoothstep",
              markerEnd: { type: MarkerType.ArrowClosed },
            },
            {
              id: "e-email-1-end-1",
              source: "email-1",
              target: "end-1",
              type: "smoothstep",
              markerEnd: { type: MarkerType.ArrowClosed },
            },
          ],
        });
      }, 500);
    });
  } catch (error) {
    console.error("Error loading journey:", error);
    throw error;
  }
};
