/**
 * E2E Test Helper: WebSocket Helper
 * File: tests/e2e/helpers/wsHelper.mjs
 * 
 * Helper for testing real-time WebSocket communication on /ws:
 * - Subscribes to LEAD_QUALIFIED events and custom types
 * - Collects received WebSocket messages
 * - Supports mock fallback socket when offline or during test simulations
 */

import WebSocket from 'ws';

let defaultWsUrl = process.env.TEST_WS_URL || 'ws://localhost:3001/ws';

export class WsTestClient {
  constructor(url = defaultWsUrl, options = {}) {
    this.url = url;
    this.socket = null;
    this.messages = [];
    this.subscribers = new Set();
    this.isConnected = false;
    this.isMock = options.mock || false;
    this.connectionTimeoutMs = options.timeoutMs || 1000;
  }

  /**
   * Connect to WebSocket server with automatic mock fallback
   */
  async connect() {
    if (this.isMock) {
      this.isConnected = true;
      return true;
    }

    return new Promise((resolve) => {
      let resolved = false;

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          // Fall back to mock mode if server connection times out
          this.isMock = true;
          this.isConnected = true;
          resolve(true);
        }
      }, this.connectionTimeoutMs);

      try {
        this.socket = new WebSocket(this.url);

        this.socket.on('open', () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            this.isConnected = true;
            resolve(true);
          }
        });

        this.socket.on('message', (raw) => {
          try {
            const data = JSON.parse(raw.toString());
            this.messages.push(data);
            this.notifySubscribers(data);
          } catch (err) {
            const textMsg = raw.toString();
            this.messages.push({ raw: textMsg });
            this.notifySubscribers({ raw: textMsg });
          }
        });

        this.socket.on('error', (err) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            this.isMock = true;
            this.isConnected = true;
            resolve(true);
          }
        });

        this.socket.on('close', () => {
          this.isConnected = false;
        });
      } catch (err) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          this.isMock = true;
          this.isConnected = true;
          resolve(true);
        }
      }
    });
  }

  /**
   * Subscribe to incoming messages
   * @param {string|function} filter Event type string (e.g. 'LEAD_QUALIFIED') or filter function
   * @param {function} callback
   */
  subscribe(filter, callback) {
    let fn = callback;
    let predicate = filter;

    if (typeof filter === 'string') {
      predicate = (msg) => msg?.type === filter;
    } else if (typeof filter === 'function' && !callback) {
      predicate = () => true;
      fn = filter;
    }

    const sub = { predicate, callback: fn };
    this.subscribers.add(sub);

    return () => {
      this.subscribers.delete(sub);
    };
  }

  notifySubscribers(data) {
    for (const sub of this.subscribers) {
      try {
        if (sub.predicate(data)) {
          sub.callback(data);
        }
      } catch (err) {
        console.warn('[WsTestClient Subscriber Error]:', err.message);
      }
    }
  }

  /**
   * Get buffered messages, optionally filtered by event type
   */
  getMessages(eventType = null) {
    if (!eventType) return [...this.messages];
    return this.messages.filter(m => m?.type === eventType);
  }

  /**
   * Clear buffered messages
   */
  clearMessages() {
    this.messages = [];
  }

  /**
   * Wait for a message matching a condition or event type
   */
  async waitForMessage(predicateOrEventType, timeoutMs = 2000) {
    const predicate = typeof predicateOrEventType === 'string' 
      ? (m) => m?.type === predicateOrEventType 
      : (predicateOrEventType || (() => true));

    // Check if already in buffer
    const existing = this.messages.find(predicate);
    if (existing) return existing;

    return new Promise((resolve) => {
      let unsubscribe = null;
      const timer = setTimeout(() => {
        if (unsubscribe) unsubscribe();
        resolve(null);
      }, timeoutMs);

      unsubscribe = this.subscribe(predicate, (msg) => {
        clearTimeout(timer);
        if (unsubscribe) unsubscribe();
        resolve(msg);
      });
    });
  }

  /**
   * Send a message to the WebSocket server (or buffer if mock)
   */
  send(data) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
    } else if (this.isMock) {
      // In mock mode, reflect or buffer mock outgoing
      const parsed = typeof data === 'string' ? { text: data } : data;
      this.messages.push({ direction: 'outbound', ...parsed });
    }
  }

  /**
   * Simulate an incoming WebSocket broadcast (for mock testing / offline simulation)
   */
  broadcastMockEvent(eventData) {
    const payload = typeof eventData === 'string' ? JSON.parse(eventData) : eventData;
    this.messages.push(payload);
    this.notifySubscribers(payload);
  }

  /**
   * Disconnect and clean up
   */
  close() {
    if (this.socket) {
      try {
        this.socket.close();
      } catch (err) {}
      this.socket = null;
    }
    this.isConnected = false;
    this.subscribers.clear();
  }
}

/**
 * Singleton / helper wrapper methods
 */
let globalClient = null;

export async function connectWs(url = defaultWsUrl, options = {}) {
  if (!globalClient) {
    globalClient = new WsTestClient(url, options);
  }
  await globalClient.connect();
  return globalClient;
}

export function subscribeWs(eventType, callback) {
  if (!globalClient) globalClient = new WsTestClient();
  return globalClient.subscribe(eventType, callback);
}

export function getWsMessages(eventType) {
  if (!globalClient) return [];
  return globalClient.getMessages(eventType);
}

export function waitForWsMessage(predicateOrEventType, timeoutMs) {
  if (!globalClient) {
    globalClient = new WsTestClient();
    globalClient.connect();
  }
  return globalClient.waitForMessage(predicateOrEventType, timeoutMs);
}

export function broadcastMockWsEvent(eventData) {
  if (!globalClient) {
    globalClient = new WsTestClient(defaultWsUrl, { mock: true });
    globalClient.connect();
  }
  globalClient.broadcastMockEvent(eventData);
}

export function closeWs() {
  if (globalClient) {
    globalClient.close();
    globalClient = null;
  }
}

export default {
  WsTestClient,
  connectWs,
  subscribeWs,
  getWsMessages,
  waitForWsMessage,
  broadcastMockWsEvent,
  closeWs
};
