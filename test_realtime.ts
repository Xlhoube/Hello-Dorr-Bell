import { supabase } from './src/lib/supabase.js';

async function run() {
    console.log("Subscribing...");
    
    // fetch a valid unit
    const { data: units } = await supabase.from('units').select('*, property:properties(organization_id)').limit(1);
    if (!units || units.length === 0) {
        console.log("No units found");
        process.exit(1);
    }
    
    const unit = units[0];
    console.log("Found unit:", unit);
    
    // Simulate what the frontend does:
    // let's see what property looks like
    console.log("Property on unit looks like Array?", Array.isArray(unit.property), unit.property);
    
    const sub = supabase.channel('test_sub')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitors' }, (payload) => {
            console.log("RECEIVED PAYLOAD:", JSON.stringify(payload, null, 2));
            process.exit(0);
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                console.log("Subscribed. Inserting visitor...");
                const { data, error } = await supabase.from('visitors').insert([{
                    visitor_name: 'Test Visitor',
                    unit_id: unit.id,
                    organization_id: unit.property?.organization_id, // Here is where it might be undefined if property is an array
                    status: 'pending'
                }]).select();
                console.log("Inserted:", data, error);
            }
        });

    setTimeout(() => {
        console.log("Timeout.");
        process.exit(1);
    }, 5000);
}

run();
