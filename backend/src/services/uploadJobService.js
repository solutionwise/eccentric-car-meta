const crypto = require('crypto');

class UploadJobService {
  constructor() {
    this.jobs = new Map(); // Store active jobs
    this.completedJobs = new Map(); // Store completed jobs for history
    this.maxHistorySize = 100; // Keep last 100 completed jobs
  }

  // Create a new upload job
  createJob(type, metadata = {}) {
    const jobId = crypto.randomUUID();
    const job = {
      id: jobId,
      type, // 'csv-import', 'single-upload', 'multiple-upload'
      status: 'pending', // 'pending', 'running', 'completed', 'cancelled', 'failed'
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      results: [],
      errors: [],
      skipped: [],
      metadata,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      cancelled: false,
      cancellationReason: null
    };

    this.jobs.set(jobId, job);
    console.log(`📋 Created upload job: ${jobId} (${type})`);
    return job;
  }

  // Get job by ID
  getJob(jobId) {
    return this.jobs.get(jobId) || this.completedJobs.get(jobId);
  }

  // Update job status
  updateJobStatus(jobId, status, additionalData = {}) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    job.status = status;
    
    if (status === 'running' && !job.startedAt) {
      job.startedAt = new Date();
    }
    
    if (status === 'completed' || status === 'cancelled' || status === 'failed') {
      job.completedAt = new Date();
      // Move to completed jobs
      this.completedJobs.set(jobId, { ...job });
      this.jobs.delete(jobId);
      
      // Clean up old completed jobs
      if (this.completedJobs.size > this.maxHistorySize) {
        const oldestKey = this.completedJobs.keys().next().value;
        this.completedJobs.delete(oldestKey);
      }
    }

    // Update additional data
    Object.assign(job, additionalData);
    
    console.log(`📊 Job ${jobId} status updated: ${status}`);
    return job;
  }

  // Update job progress
  updateProgress(jobId, processedItems, totalItems = null) {
    const job = this.jobs.get(jobId);
    if (!job) {
      return;
    }

    job.processedItems = processedItems;
    if (totalItems !== null) {
      job.totalItems = totalItems;
    }
    
    if (job.totalItems > 0) {
      job.progress = Math.round((processedItems / job.totalItems) * 100);
    }

    console.log(`📈 Job ${jobId} progress: ${job.progress}% (${processedItems}/${job.totalItems})`);
    return job;
  }

  // Add result to job
  addResult(jobId, result) {
    const job = this.jobs.get(jobId);
    if (!job) {
      return;
    }

    job.results.push(result);
    return job;
  }

  // Add error to job
  addError(jobId, error) {
    const job = this.jobs.get(jobId);
    if (!job) {
      return;
    }

    job.errors.push(error);
    return job;
  }

  // Add skipped item to job
  addSkipped(jobId, skipped) {
    const job = this.jobs.get(jobId);
    if (!job) {
      return;
    }

    job.skipped.push(skipped);
    return job;
  }

  // Cancel a job
  cancelJob(jobId, reason = 'User requested cancellation') {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found or already completed`);
    }

    if (job.status === 'completed' || job.status === 'cancelled' || job.status === 'failed') {
      throw new Error(`Cannot cancel job ${jobId} - already ${job.status}`);
    }

    job.cancelled = true;
    job.cancellationReason = reason;
    job.status = 'cancelled';
    job.completedAt = new Date();

    // Move to completed jobs
    this.completedJobs.set(jobId, { ...job });
    this.jobs.delete(jobId);

    console.log(`❌ Job ${jobId} cancelled: ${reason}`);
    return job;
  }

  // Check if job is cancelled
  isJobCancelled(jobId) {
    const job = this.jobs.get(jobId);
    return job ? job.cancelled : false;
  }

  // Get all active jobs
  getActiveJobs() {
    return Array.from(this.jobs.values());
  }

  // Get all completed jobs
  getCompletedJobs(limit = 50) {
    const jobs = Array.from(this.completedJobs.values());
    return jobs
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, limit);
  }

  // Get job statistics
  getJobStats() {
    const active = this.jobs.size;
    const completed = this.completedJobs.size;
    const activeJobs = Array.from(this.jobs.values());
    
    const running = activeJobs.filter(job => job.status === 'running').length;
    const pending = activeJobs.filter(job => job.status === 'pending').length;

    return {
      active,
      completed,
      running,
      pending,
      total: active + completed
    };
  }

  // Clean up old jobs (called periodically)
  cleanup() {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [jobId, job] of this.completedJobs.entries()) {
      if (job.completedAt && job.completedAt < cutoffDate) {
        this.completedJobs.delete(jobId);
      }
    }
    
    console.log(`🧹 Cleaned up old jobs. Active: ${this.jobs.size}, Completed: ${this.completedJobs.size}`);
  }
}

module.exports = new UploadJobService();
