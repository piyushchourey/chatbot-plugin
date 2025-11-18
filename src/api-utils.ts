/**
 * ChatBot Plugin - API Utilities
 * Standalone API utilities for chatbot communication
 */

export interface FormUpdateResponse {
  success: boolean;
  response: string;
  field: string;
  value: any;
}

export interface FormUpdateRequest {
  field: string;
  value: any;
  sessionId: string;
  socketId: string;
}

/**
 * Send form field update to the LLM via the form-update API endpoint
 */
export const sendFormFieldUpdate = async (
  field: string,
  value: any,
  sessionId: string,
  socketId: string,
  apiEndpoint: string
): Promise<FormUpdateResponse> => {
  try {
    const formUpdateUrl = apiEndpoint.replace('/api/chat', '/api/form-update');
    
    const response = await fetch(formUpdateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        field,
        value,
        sessionId,
        socketId,
        emission: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending form field update:', error);
    throw error;
  }
};

/**
 * Send a chat message to the LLM via the chat API endpoint
 */
export const sendChatMessage = async (
  message: string,
  sessionId: string,
  socketId: string | null,
  apiEndpoint: string,
  flowType: 'loan-application' | 'loan-offer' | string = 'loan-application',
  interestRate?: number
): Promise<{ response: string }> => {
  try {
    if (!socketId) {
      throw new Error('Socket ID is required 123');
    }

    const payload: any = {
      message,
      sessionId,
      socketId,
      flowType,
    };
    
    if (interestRate !== undefined) {
      payload.interestRate = interestRate;
    }
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

