// ============================================================
// Performance Monitor — Tick Timing & System Health
// ============================================================

export interface TickMetrics {
  tick: number;
  durationMs: number;
  timestamp: number;
  regions: number;
  characters: number;
  events: number;
}

export interface PerformanceSnapshot {
  avgTickMs: number;
  maxTickMs: number;
  minTickMs: number;
  p95TickMs: number;
  slowTicks: number;           // Ticks > slowThresholdMs
  totalTicks: number;
  memoryMB: number;
  uptimeSeconds: number;
}

export class PerformanceMonitor {
  private metrics: TickMetrics[] = [];
  private maxMetrics = 10000;
  private slowThresholdMs = 100;
  private startTime = Date.now();
  private alerts: PerformanceAlert[] = [];

  /** Record metrics for a tick */
  recordTick(tick: number, durationMs: number, regions: number, characters: number, events: number): void {
    this.metrics.push({ tick, durationMs, timestamp: Date.now(), regions, characters, events });

    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Alert on slow ticks
    if (durationMs > this.slowThresholdMs) {
      this.alerts.push({
        type: 'slow_tick',
        tick,
        message: `Tick ${tick} took ${durationMs.toFixed(1)}ms (threshold: ${this.slowThresholdMs}ms)`,
        timestamp: Date.now(),
        severity: durationMs > this.slowThresholdMs * 3 ? 'high' : 'medium',
      });
    }

    // Alert on high event count
    if (events > 50) {
      this.alerts.push({
        type: 'high_events',
        tick,
        message: `Tick ${tick} generated ${events} events`,
        timestamp: Date.now(),
        severity: events > 200 ? 'high' : 'medium',
      });
    }

    // Trim alerts
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(-500);
    }
  }

  /** Get performance snapshot */
  getSnapshot(): PerformanceSnapshot {
    if (this.metrics.length === 0) {
      return {
        avgTickMs: 0, maxTickMs: 0, minTickMs: 0, p95TickMs: 0,
        slowTicks: 0, totalTicks: 0, memoryMB: 0, uptimeSeconds: 0,
      };
    }

    const durations = this.metrics.map(m => m.durationMs);
    const sorted = [...durations].sort((a, b) => a - b);

    const sum = durations.reduce((a, b) => a + b, 0);
    const p95Index = Math.floor(sorted.length * 0.95);

    let memoryMB = 0;
    try {
      if (typeof process !== 'undefined' && process.memoryUsage) {
        memoryMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      }
    } catch { /* not available */ }

    return {
      avgTickMs: sum / durations.length,
      maxTickMs: sorted[sorted.length - 1],
      minTickMs: sorted[0],
      p95TickMs: sorted[p95Index] ?? sorted[sorted.length - 1],
      slowTicks: durations.filter(d => d > this.slowThresholdMs).length,
      totalTicks: this.metrics.length,
      memoryMB,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  /** Get recent metrics */
  getRecentMetrics(count: number = 100): TickMetrics[] {
    return this.metrics.slice(-count);
  }

  /** Get alerts */
  getAlerts(limit: number = 50): PerformanceAlert[] {
    return this.alerts.slice(-limit);
  }

  /** Get slow tick alerts only */
  getSlowTicks(): PerformanceAlert[] {
    return this.alerts.filter(a => a.type === 'slow_tick');
  }

  /** Set slow tick threshold */
  setSlowThreshold(ms: number): void {
    this.slowThresholdMs = ms;
  }

  /** Reset */
  clear(): void {
    this.metrics.length = 0;
    this.alerts.length = 0;
    this.startTime = Date.now();
  }
}

export interface PerformanceAlert {
  type: 'slow_tick' | 'high_events' | 'memory_warning';
  tick: number;
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}

export const performanceMonitor = new PerformanceMonitor();
