const fs = require('fs');

let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// The user is saying "i want to be like so a advisor can just click at box and able to type in"
// They are likely looking at the BUILDER (screenshot shows builder) and thinking "Why can't I just click these boxes and type in them right here?"
// OR they are talking about the ADVISOR side (ContractingHub.tsx) where they can click and type.
// But the screenshot they uploaded is the W-9 form inside CarrierFormBuilder (the ADMIN side). 
// The boxes look perfectly aligned (they must have clicked Auto-Detect and it successfully pulled the W-9's native AcroForm fields perfectly!).
// 
// "make the auto deduct so good to deduct everything with filliable" -> "Make the auto detect so good it detects everything that is fillable"
// It looks like the Auto Detect worked PERFECTLY on the W-9 form! (See the screenshot, the boxes map exactly to the W-9 fields).
// They are just asking: "I want the advisor to just click at the box and be able to type in."
// Wait, the advisor CAN already do that in ContractingHub.tsx.
// Perhaps they want the ADMIN to be able to type in the box to set the "Field Name" instead of using the right sidebar?
// OR maybe they tested the advisor side and the boxes were too small or hard to click?
// In ContractingHub.tsx, the inputs are absolutely positioned over the PDF.

// Let's check ContractingHub.tsx to ensure the inputs are perfectly clickable.
let hub = fs.readFileSync('pages/crm/ContractingHub.tsx', 'utf8');

// Enhance the input fields in ContractingHub.tsx so they are extremely obvious and easy to click/type into.
// We'll change the background to a more obvious "fillable" color, add a nice border on hover, and make sure z-index is high.
hub = hub.replace(
  /className="w-full h-full bg-blue-50\/70 border-b-2 border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium text-gray-900 px-1 absolute inset-0 z-20 outline-none transition-colors"/,
  `className="w-full h-full bg-blue-100/40 hover:bg-blue-100/60 border border-blue-400 focus:bg-yellow-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-gray-900 px-1 absolute inset-0 z-40 outline-none transition-all shadow-sm rounded-sm"`
);

// Checkbox styling (currently text input, let's make sure it handles checkbox type natively if it's a checkbox)
hub = hub.replace(
  /<input\n\s*type="text"\n\s*placeholder=\{field\.name\}/,
  `{field.type === 'checkbox' ? (
                        <div 
                          className="w-full h-full absolute inset-0 z-40 flex items-center justify-center cursor-pointer border border-blue-400 bg-blue-100/40 hover:bg-blue-100/60 focus-within:ring-2 focus-within:ring-blue-600 rounded-sm"
                          onClick={() => setFormValues({...formValues, [field.id]: formValues[field.id] === 'true' ? 'false' : 'true'})}
                        >
                          {formValues[field.id] === 'true' && <Check className="w-4 h-4 text-blue-700" />}
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder={field.name}`
);

hub = hub.replace(
  /className="w-full h-full bg-blue-100\/40 hover:bg-blue-100\/60 border border-blue-400 focus:bg-yellow-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-gray-900 px-1 absolute inset-0 z-40 outline-none transition-all shadow-sm rounded-sm"\n\s*\/>/,
  `className="w-full h-full bg-blue-100/40 hover:bg-blue-100/60 border border-blue-400 focus:bg-yellow-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-gray-900 px-1 absolute inset-0 z-40 outline-none transition-all shadow-sm rounded-sm"
                        />
                      )}`
);

// Ensure Lucide icons Check is imported if we use it
if (!hub.includes('Check, ')) {
  hub = hub.replace(/import \{ (.*?) \} from 'lucide-react';/, "import { $1, Check } from 'lucide-react';");
}

fs.writeFileSync('pages/crm/ContractingHub.tsx', hub);
console.log('Patched ContractingHub to make typing in boxes better');
