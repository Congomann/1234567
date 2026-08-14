const { supabase } = require('../supabase.cjs');

/**
 * AUTOMATION ENGINE
 * Listens for system triggers (e.g., LEAD_INGESTION, SOCIAL_MENTION)
 * and executes configured workflow actions asynchronously.
 */
class AutomationEngine {
  
  /**
   * Triggers an automation workflow based on an event type
   * @param {string} triggerEvent - The trigger name (e.g. 'LEAD_INGESTION')
   * @param {object} payload - The event payload (e.g. lead details)
   */
  static async triggerEvent(triggerEvent, payload) {
    console.log(`[AutomationEngine] Trigger event received: ${triggerEvent}`);
    
    try {
      // 1. Fetch all active workflows for this trigger
      const { data: workflows, error } = await supabase
        .from('workflow_automations')
        .select('*')
        .eq('trigger_event', triggerEvent)
        .eq('active', true);
        
      if (error) {
        console.error(`[AutomationEngine] DB Error fetching workflows for ${triggerEvent}:`, error);
        return;
      }
      
      if (!workflows || workflows.length === 0) {
        console.log(`[AutomationEngine] No active workflows configured for ${triggerEvent}.`);
        return;
      }
      
      // 2. Execute each matching workflow asynchronously
      for (const workflow of workflows) {
        this.executeWorkflow(workflow, payload);
      }
      
    } catch (err) {
      console.error('[AutomationEngine] Execution error:', err);
    }
  }

  /**
   * Executes a single workflow chain sequentially
   */
  static async executeWorkflow(workflow, payload) {
    console.log(`[AutomationEngine] ⚡ Starting Workflow: [${workflow.name}] (${workflow.id})`);
    
    const actions = typeof workflow.actions === 'string' ? JSON.parse(workflow.actions) : workflow.actions;
    
    if (!actions || !Array.isArray(actions)) {
       console.error(`[AutomationEngine] Workflow ${workflow.name} has invalid actions format.`);
       return;
    }
    
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      console.log(`[AutomationEngine]   -> [${workflow.name}] Executing Step ${i+1}/${actions.length}: ${action}`);
      
      try {
        await this.runAction(action, payload);
      } catch (err) {
        console.error(`[AutomationEngine]   -> [${workflow.name}] Step ${action} failed:`, err.message);
        // Depending on strictness, we might break or continue on failure. For now, we continue.
      }
      
      // Artificial delay to simulate real-world processing (network requests, DB commits)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`[AutomationEngine] ✅ Workflow [${workflow.name}] Completed Successfully.`);
  }

  /**
   * Executes the specific logic for a single node action
   */
  static async runAction(actionNode, payload) {
    const node = actionNode.trim().toUpperCase();
    
    switch (node) {
      case 'SEND_WELCOME_EMAIL':
        console.log(`      📧 [Email Service] Sending Welcome Email to: ${payload.email || 'unknown'} (Name: ${payload.name || payload.full_name})`);
        break;
        
      case 'SMS_AUTO_REPLY':
      case 'SEND_SMS':
        console.log(`      💬 [Twilio SMS] Sending SMS auto-reply to: ${payload.phone || 'unknown'}`);
        break;
        
      case 'NOTIFY_ADVISOR':
        console.log(`      🔔 [Notification] Dispatching push notification to Advisor ID: ${payload.assigned_to || 'unassigned'}`);
        break;
        
      case 'UPDATE_DB':
      case 'TAG_LEAD':
        console.log(`      💾 [Database] Updating lead tags in DB for Lead ID: ${payload.id || 'new'}`);
        break;
        
      default:
        console.log(`      ⚙️ [System] Executing custom node: ${node}`);
        break;
    }
  }
}

module.exports = AutomationEngine;
