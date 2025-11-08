"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalPersistenceService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Simple JSON file-based persistence for review approval state
 * Stores a map of review IDs to their approval status
 */
class ApprovalPersistenceService {
    constructor(dataDir = './data') {
        this.approvals = new Map();
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
    loadApprovals() {
        try {
            if (fs.existsSync(this.filePath)) {
                const data = fs.readFileSync(this.filePath, 'utf-8');
                const parsed = JSON.parse(data);
                this.approvals = new Map(Object.entries(parsed));
                console.log(`Loaded ${this.approvals.size} approval states from ${this.filePath}`);
            }
            else {
                console.log('No existing approval data found, starting fresh');
            }
        }
        catch (error) {
            console.error('Error loading approvals:', error);
            this.approvals = new Map();
        }
    }
    /**
     * Save approvals to JSON file
     */
    saveApprovals() {
        try {
            const data = Object.fromEntries(this.approvals);
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('Error saving approvals:', error);
        }
    }
    /**
     * Get approval status for a review
     */
    getApprovalStatus(reviewId) {
        return this.approvals.get(reviewId) || false;
    }
    /**
     * Set approval status for a review
     */
    setApprovalStatus(reviewId, isApproved) {
        this.approvals.set(reviewId, isApproved);
        this.saveApprovals();
    }
    /**
     * Toggle approval status for a review
     */
    toggleApprovalStatus(reviewId) {
        const currentStatus = this.getApprovalStatus(reviewId);
        const newStatus = !currentStatus;
        this.setApprovalStatus(reviewId, newStatus);
        return newStatus;
    }
    /**
     * Get all approved review IDs
     */
    getApprovedReviewIds() {
        return Array.from(this.approvals.entries())
            .filter(([_, isApproved]) => isApproved)
            .map(([id, _]) => id);
    }
    /**
     * Clear all approvals (useful for testing)
     */
    clearApprovals() {
        this.approvals.clear();
        this.saveApprovals();
    }
    /**
     * Get total count of approvals
     */
    getApprovalCount() {
        return Array.from(this.approvals.values()).filter(v => v).length;
    }
}
exports.ApprovalPersistenceService = ApprovalPersistenceService;
//# sourceMappingURL=approvalPersistence.js.map