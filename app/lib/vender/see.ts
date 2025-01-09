/**
 * sse.ts - A flexible EventSource polyfill/replacement.
 * https://github.com/mpetazzoni/sse.js
 *
 * Copyright (C) 2016-2024 Maxime Petazzoni.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

type SSEOptions = {
    headers?: Record<string, string>;
    payload?: string;
    method?: string;
    withCredentials?: boolean;
    start?: boolean;
    debug?: boolean;
  };
  
  interface EventWithDetails extends Event {
    id?: string;
    data?: string;
    retry?: string;
    event?: string;
    responseCode?: number;
    lastEventId?: string;
    readyState?: ReadyState;
  }
  
  enum ReadyState {
    INITIALIZING = -1,
    CONNECTING = 0,
    OPEN = 1,
    CLOSED = 2
  }
  
  class SSE {
    private xhr: XMLHttpRequest | null = null;
    private readyState: ReadyState = ReadyState.INITIALIZING;
    private progress: number = 0;
    private chunk: string = '';
    private lastEventId: string = '';
    private FIELD_SEPARATOR: string = ':';
    private listeners: Record<string, Function[]> = {};
    private headers: Record<string, string>;
    private payload: string;
    private method: string;
    private withCredentials: boolean;
    private debug: boolean;
  
    public onmessage: ((event: EventWithDetails) => void) | null = null;
    public onerror: ((event: EventWithDetails) => void) | null = null;
    public onopen: ((event: EventWithDetails) => void) | null = null;
  
    constructor(private url: string, private options: SSEOptions = {}) {
      this.headers = options.headers || {};
      this.payload = options.payload !== undefined ? options.payload : '';
      this.method = options.method || (this.payload != '' ? 'POST' : 'GET');
      this.withCredentials = !!options.withCredentials;
      this.debug = !!options.debug;
  
      if (options.start === undefined || options.start) {
        this.stream();
      }
    }
  
    public addEventListener(type: string, listener: EventListener): void {
      if (!this.listeners[type]) {
        this.listeners[type] = [];
      }
  
      if (!this.listeners[type].includes(listener)) {
        this.listeners[type].push(listener);
      }
    }
  
    public removeEventListener(type: string, listener: EventListener): void {
      if (!this.listeners[type]) {
        return;
      }
  
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
  
    private dispatchEvent(event: EventWithDetails): boolean {
      if (!event) return true;
  
      if (this.debug) console.debug(event);
  
      const onHandler = `on${event.type}` as keyof this;
      if (this[onHandler] instanceof Function) {
        (this[onHandler] as Function).call(this, event);
        if (event.defaultPrevented) return false;
      }
  
      if (this.listeners[event.type]) {
        return this.listeners[event.type].every(callback => {
          callback(event);
          return !event.defaultPrevented;
        });
      }
      return true;
    }
  
    private markClosed(): void {
      this.xhr = null;
      this.setReadyState(ReadyState.CLOSED);
    }
  
    private onStreamFailure(event: ProgressEvent): void {
      const e = new CustomEvent('error') as EventWithDetails;
      e.responseCode = this.xhr?.status || 0;
      e.data = this.xhr?.response || '';
      this.dispatchEvent(e);
      this.markClosed();
    }
  
    private parseEventChunk(chunk: string): EventWithDetails {
      const e: Partial<EventWithDetails> = {};
      if (!chunk || chunk.length === 0) return e as EventWithDetails;
  
      if (this.debug) console.debug(chunk);
  
      chunk.split(/\n|\r\n|\r/).forEach((line: string) => {
        const index = line.indexOf(this.FIELD_SEPARATOR);
        let field: string;
        let value: string;
  
        if (index === 0) return; // Skip comments
  
        if (index > 0) {
          const skip = line[index + 1] === ' ' ? 2 : 1;
          field = line.substring(0, index);
          value = line.substring(index + skip);
        } else {
          field = line; // Interpret the entire line as field
          value = '';
        }
  
        if (['id', 'event', 'data', 'retry'].includes(field)) {
          if (field === 'data' && e[field]) {
            e['data'] = e['data'] + '\n' + value;
          } else {
            (e as any)[field] = value;
          }
        }
      });
  
      if (e.id !== null) {
        this.lastEventId = e.id || '';
      }
  
      const event = new CustomEvent(e.event || 'message') as EventWithDetails;
      event.id = e.id;
      event.data = e.data || '';
      event.lastEventId = this.lastEventId;
      return event;
    }
  
    private onStreamProgress(e: ProgressEvent): void {
      if (!this.xhr) return;
  
      const data = this.xhr.responseText.substring(this.progress);
      this.progress += data.length;
  
      const parts = (this.chunk + data).split(/(\r\n\r\n|\r\r|\n\n)/);
      this.chunk = parts.pop() || '';
      parts.forEach((part: string) => {
        if (part.trim().length > 0) {
          this.dispatchEvent(this.parseEventChunk(part));
        }
      });
    }
  
    public stream(): void {
      if (this.xhr) return; // Already connected
  
      this.setReadyState(ReadyState.CONNECTING);
  
      this.xhr = new XMLHttpRequest();
      this.xhr.addEventListener('progress', this.onStreamProgress.bind(this));
      this.xhr.addEventListener('load', this.onStreamProgress.bind(this)); // Treat 'load' as a final progress event
      this.xhr.addEventListener('error', this.onStreamFailure.bind(this));
      this.xhr.addEventListener('abort', this.markClosed.bind(this));
  
      this.xhr.open(this.method, this.url, true);
      for (const header in this.headers) {
        this.xhr.setRequestHeader(header, this.headers[header]);
      }
  
      if (this.lastEventId) {
        this.xhr.setRequestHeader('Last-Event-ID', this.lastEventId);
      }
  
      this.xhr.withCredentials = this.withCredentials;
      this.xhr.send(this.payload);
    }
  
    public close(): void {
      if (this.readyState === ReadyState.CLOSED) return;
      this.xhr?.abort();
    }
  
    private setReadyState(state: ReadyState): void {
      const event = new CustomEvent('readystatechange') as EventWithDetails;
      event.readyState = state;
      this.readyState = state;
      this.dispatchEvent(event);
    }
  }
  
  export { SSE };