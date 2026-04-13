const { supabase } = require('../supabase.cjs');

/**
 * ASSIGN LEAD (Round Robin)
 * Maps incoming lead to an appropriate active advisor based on Lead Type.
 * Fallback to NULL if no eligible advisor found.
 */
async function assignLead(leadTypeId) {
  try {
    if (!leadTypeId) return null;

    // 1. Get eligible advisors specializing in this lead type
    const { data: eligibleSpecialties, error: specialtyError } = await supabase
      .from('advisor_specialties')
      .select('advisor_id, users!inner(id, role, deleted_at)')
      .eq('lead_type_id', leadTypeId)
      .eq('users.role', 'Advisor')
      .is('users.deleted_at', null)
      .order('advisor_id');

    if (specialtyError) {
      console.error('[RoutingEngine] Error fetching advisors:', specialtyError);
      return null;
    }

    if (!eligibleSpecialties || eligibleSpecialties.length === 0) {
      console.log(`[RoutingEngine] No eligible advisors found for LeadType ID: ${leadTypeId}. Falling back to unassigned.`);
      return null; 
    }

    // Extract unique advisor IDs
    const advisorIds = eligibleSpecialties.map(row => row.advisor_id);

    // 2. Get current routing state for this lead type
    let { data: state, error: stateError } = await supabase
      .from('routing_state')
      .select('*')
      .eq('lead_type_id', leadTypeId)
      .maybeSingle();

    if (stateError) {
      console.error('[RoutingEngine] Error fetching routing state:', stateError);
      return null;
    }

    if (!state) {
      // First time this lead type is being routed
      const { data: newState, error: insertError } = await supabase
        .from('routing_state')
        .insert([{ lead_type_id: leadTypeId, last_assigned_index: 0 }])
        .select()
        .single();
        
      if (insertError) {
        console.error('[RoutingEngine] Error creating routing state:', insertError);
        return null;
      }
      state = newState;
    }

    // 3. Compute Next Index
    const currentIndex = state.last_assigned_index;
    const nextIndex = (currentIndex + 1) % advisorIds.length;
    const selectedAdvisorId = advisorIds[nextIndex];

    // 4. Update the Routing State safely
    await supabase
      .from('routing_state')
      .update({ last_assigned_index: nextIndex })
      .eq('lead_type_id', leadTypeId);

    return selectedAdvisorId;

  } catch (err) {
    console.error('[RoutingEngine] Internal exception in assignLead:', err);
    return null;
  }
}

/**
 * NORMALIZE LEAD TYPE STRING TO UUID
 * Used by webhooks to match raw string 'mortgage' to the actual DB ID.
 */
async function getLeadTypeId(nameString) {
    const safeName = nameString.trim().toLowerCase();
    
    // Attempt lookup (case insensitive match if possible, but exact match first)
    const { data: types } = await supabase
        .from('lead_types')
        .select('id, name');
        
    if (!types) return null;
    
    const matched = types.find(t => t.name.toLowerCase() === safeName);
    if (matched) return matched.id;
    
    // Fallback: If no match, we can either return null or explicitly define synonyms
    // (For simplicity assuming exact spelling from webhook matches DB or mapping)
    console.log(`[RoutingEngine] Warning: Unrecognized Lead Type from Webhook payload -> ${nameString}`);
    return null;
}

module.exports = {
  assignLead,
  getLeadTypeId
};
