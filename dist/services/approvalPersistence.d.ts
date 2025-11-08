/**
 * Simple JSON file-based persistence for review approval state
 * Stores a map of review IDs to their approval status
 */
export declare class ApprovalPersistenceService {
    private filePath;
    private approvals;
    constructor(dataDir?: string);
    /**
     * Load approvals from JSON file
     */
    private loadApprovals;
    /**
     * Save approvals to JSON file
     */
    private saveApprovals;
    /**
     * Get approval status for a review
     */
    getApprovalStatus(reviewId: string): boolean;
    /**
     * Set approval status for a review
     */
    setApprovalStatus(reviewId: string, isApproved: boolean): void;
    /**
     * Toggle approval status for a review
     */
    toggleApprovalStatus(reviewId: string): boolean;
    /**
     * Get all approved review IDs
     */
    getApprovedReviewIds(): string[];
    /**
     * Clear all approvals (useful for testing)
     */
    clearApprovals(): void;
    /**
     * Get total count of approvals
     */
    getApprovalCount(): number;
}
//# sourceMappingURL=approvalPersistence.d.ts.map