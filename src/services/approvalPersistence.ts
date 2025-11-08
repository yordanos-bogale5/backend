import * as fs from 'fs';
import * as path from 'path';

/**
 * Simple JSON file-based persistence for review approval state
 * Stores a map of review IDs to their approval status
 */
export class ApprovalPersistenceService {
  private filePath: string;
  private approvals: Map<string, boolean> = new Map();

  constructor(dataDir: string = './data') {
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.filePath = path.join(dataDir, 'approvals.json');
    this.loadApprovals();
  }

  /**
   * Load approvals from JSON file
   */
  private loadApprovals(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(data);
        this.approvals = new Map(Object.entries(parsed));
        console.log(`Loaded ${this.approvals.size} approval states from ${this.filePath}`);
      } else {
        console.log('No existing approval data found, starting fresh');
      }
    } catch (error) {
      console.error('Error loading approvals:', error);
      this.approvals = new Map();
    }
  }

  /**
   * Save approvals to JSON file
   */
  private saveApprovals(): void {
    try {
      const data = Object.fromEntries(this.approvals);
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving approvals:', error);
    }
  }

  /**
   * Get approval status for a review
   */
  getApprovalStatus(reviewId: string): boolean {
    return this.approvals.get(reviewId) || false;
  }

  /**
   * Set approval status for a review
   */
  setApprovalStatus(reviewId: string, isApproved: boolean): void {
    this.approvals.set(reviewId, isApproved);
    this.saveApprovals();
  }

  /**
   * Toggle approval status for a review
   */
  toggleApprovalStatus(reviewId: string): boolean {
    const currentStatus = this.getApprovalStatus(reviewId);
    const newStatus = !currentStatus;
    this.setApprovalStatus(reviewId, newStatus);
    return newStatus;
  }

  /**
   * Get all approved review IDs
   */
  getApprovedReviewIds(): string[] {
    return Array.from(this.approvals.entries())
      .filter(([_, isApproved]) => isApproved)
      .map(([id, _]) => id);
  }

  /**
   * Clear all approvals (useful for testing)
   */
  clearApprovals(): void {
    this.approvals.clear();
    this.saveApprovals();
  }

  /**
   * Get total count of approvals
   */
  getApprovalCount(): number {
    return Array.from(this.approvals.values()).filter(v => v).length;
  }
}

