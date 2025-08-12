import { storage } from "./storage";

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

// In-memory storage for push subscriptions (in production, use database)
const userSubscriptions = new Map<string, PushSubscription[]>();

export class NotificationService {
  
  // Subscribe user to push notifications
  static async subscribe(userId: string, subscription: PushSubscription): Promise<void> {
    if (!userSubscriptions.has(userId)) {
      userSubscriptions.set(userId, []);
    }
    
    const subscriptions = userSubscriptions.get(userId)!;
    
    // Remove existing subscription with same endpoint
    const existingIndex = subscriptions.findIndex(sub => sub.endpoint === subscription.endpoint);
    if (existingIndex !== -1) {
      subscriptions.splice(existingIndex, 1);
    }
    
    subscriptions.push(subscription);
    console.log(`📱 User ${userId} subscribed to push notifications`);
  }
  
  // Unsubscribe user from push notifications
  static async unsubscribe(userId: string, endpoint: string): Promise<void> {
    const subscriptions = userSubscriptions.get(userId);
    if (!subscriptions) return;
    
    const index = subscriptions.findIndex(sub => sub.endpoint === endpoint);
    if (index !== -1) {
      subscriptions.splice(index, 1);
      console.log(`📱 User ${userId} unsubscribed from push notifications`);
    }
  }
  
  // Send notification to specific user
  static async sendToUser(userId: string, notification: NotificationPayload): Promise<boolean> {
    const subscriptions = userSubscriptions.get(userId);
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`📱 No subscriptions found for user ${userId}`);
      return false;
    }
    
    try {
      // In a real implementation, you would use a service like Firebase Cloud Messaging
      // or Web Push Protocol. For demo purposes, we'll simulate this.
      console.log(`📱 Sending push notification to user ${userId}:`, notification);
      
      // Simulate successful delivery
      return true;
    } catch (error) {
      console.error(`📱 Failed to send notification to user ${userId}:`, error);
      return false;
    }
  }
  
  // Send notification to all users with specific role
  static async sendToRole(role: string, notification: NotificationPayload, excludeUserId?: string): Promise<number> {
    try {
      // Get all users with the specified role
      const allUsers = [
        { id: "user-1", role: "lead" },
        { id: "user-2", role: "caregiver" },
        { id: "user-3", role: "caregiver" }
      ];
      
      const targetUsers = allUsers
        .filter(user => user.role === role && user.id !== excludeUserId)
        .map(user => user.id);
      
      let successCount = 0;
      
      for (const userId of targetUsers) {
        const success = await this.sendToUser(userId, notification);
        if (success) successCount++;
      }
      
      console.log(`📱 Sent notification to ${successCount}/${targetUsers.length} users with role ${role}`);
      return successCount;
    } catch (error) {
      console.error(`📱 Failed to send notification to role ${role}:`, error);
      return 0;
    }
  }
  
  // Notify about entry approval
  static async notifyEntryApproved(entryId: string, approvedBy: string): Promise<void> {
    try {
      const entry = await storage.getCareEntry(entryId);
      if (!entry) return;
      
      const resident = await storage.getResident(entry.residentId);
      const approver = await storage.getUser(approvedBy);
      
      const notification: NotificationPayload = {
        title: "Pflegebericht genehmigt ✅",
        body: `Ihr Bericht für ${resident?.name || 'Bewohner'} wurde von ${approver?.name || 'der Pflegeleitung'} genehmigt.`,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
        tag: `entry-approved-${entryId}`,
        data: {
          type: "entry_approved",
          entryId: entryId,
          residentId: entry.residentId
        }
      };
      
      await this.sendToUser(entry.authorId, notification);
    } catch (error) {
      console.error("Failed to send approval notification:", error);
    }
  }
  
  // Notify about entry rejection
  static async notifyEntryRejected(entryId: string, rejectedBy: string, reason: string): Promise<void> {
    try {
      const entry = await storage.getCareEntry(entryId);
      if (!entry) return;
      
      const resident = await storage.getResident(entry.residentId);
      const rejector = await storage.getUser(rejectedBy);
      
      const notification: NotificationPayload = {
        title: "Pflegebericht abgelehnt ❌",
        body: `Ihr Bericht für ${resident?.name || 'Bewohner'} wurde abgelehnt: ${reason.substring(0, 100)}`,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
        tag: `entry-rejected-${entryId}`,
        data: {
          type: "entry_rejected",
          entryId: entryId,
          residentId: entry.residentId,
          reason: reason
        }
      };
      
      await this.sendToUser(entry.authorId, notification);
    } catch (error) {
      console.error("Failed to send rejection notification:", error);
    }
  }
  
  // Notify management about new entry pending approval
  static async notifyNewEntryPending(entryId: string): Promise<void> {
    try {
      const entry = await storage.getCareEntry(entryId);
      if (!entry) return;
      
      const resident = await storage.getResident(entry.residentId);
      const author = await storage.getUser(entry.authorId);
      
      const notification: NotificationPayload = {
        title: "Neuer Bericht zur Freigabe 📋",
        body: `${author?.name || 'Pflegekraft'} hat einen Bericht für ${resident?.name || 'Bewohner'} zur Freigabe eingereicht.`,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
        tag: `entry-pending-${entryId}`,
        data: {
          type: "entry_pending",
          entryId: entryId,
          residentId: entry.residentId,
          authorId: entry.authorId
        }
      };
      
      // Send to all users with 'lead' role
      await this.sendToRole("lead", notification, entry.authorId);
    } catch (error) {
      console.error("Failed to send pending notification:", error);
    }
  }
}

// Email notification service (using SendGrid)
export class EmailService {
  private static isConfigured = false;
  
  static initialize() {
    this.isConfigured = !!process.env.SENDGRID_API_KEY;
    if (!this.isConfigured) {
      console.warn("📧 SendGrid not configured - email notifications disabled");
    }
  }
  
  static async sendApprovalEmail(entryId: string, approvedBy: string): Promise<boolean> {
    if (!this.isConfigured) return false;
    
    try {
      const entry = await storage.getCareEntry(entryId);
      if (!entry) return false;
      
      const author = await storage.getUser(entry.authorId);
      const resident = await storage.getResident(entry.residentId);
      const approver = await storage.getUser(approvedBy);
      
      if (!author?.email) return false;
      
      // In a real implementation, you would use SendGrid here
      console.log(`📧 Would send approval email to ${author.email} for entry ${entryId}`);
      return true;
    } catch (error) {
      console.error("Failed to send approval email:", error);
      return false;
    }
  }
  
  static async sendRejectionEmail(entryId: string, rejectedBy: string, reason: string): Promise<boolean> {
    if (!this.isConfigured) return false;
    
    try {
      const entry = await storage.getCareEntry(entryId);
      if (!entry) return false;
      
      const author = await storage.getUser(entry.authorId);
      const resident = await storage.getResident(entry.residentId);
      
      if (!author?.email) return false;
      
      // In a real implementation, you would use SendGrid here
      console.log(`📧 Would send rejection email to ${author.email} for entry ${entryId}: ${reason}`);
      return true;
    } catch (error) {
      console.error("Failed to send rejection email:", error);
      return false;
    }
  }
}

// Initialize email service
EmailService.initialize();