const fs = require('fs');

let file = fs.readFileSync('pages/website/BookingPage.tsx', 'utf8');

// 1. Add formatTime function inside the component or outside
file = file.replace(
  "export const BookingPage: React.FC = () => {",
  "const formatTime = (timeStr: string) => {\n  if (!timeStr) return '';\n  const [h, m] = timeStr.split(':');\n  const d = new Date();\n  d.setHours(parseInt(h, 10) || 0);\n  d.setMinutes(parseInt(m, 10) || 0);\n  return format(d, 'h:mm a');\n};\n\nexport const BookingPage: React.FC = () => {"
);

// 2. Replace format(new Date(...)) with formatTime(...)
file = file.replace(/format\(new Date\(\`2000-01-01T\$\{(.*?)\}\`\), 'h:mm a'\)/g, "formatTime($1)");

// 3. Add meetingLink state
file = file.replace(
  "const [formData, setFormData] = useState({ name: '', email: '' });",
  "const [formData, setFormData] = useState({ name: '', email: '' });\n  const [meetingLink, setMeetingLink] = useState<string | null>(null);"
);

// 4. Update the bookPublicEvent call to get the meeting link
file = file.replace(
  "await Backend.bookPublicEvent({",
  "const res = await Backend.bookPublicEvent({"
);
file = file.replace(
  "setStep(3);",
  "if (res && res.meetingLink) setMeetingLink(res.meetingLink);\n      setStep(3);"
);

// 5. Display the meeting link in Step 3
const step3Content = `
                <h3 className="text-3xl font-black text-slate-900 mb-4">You're Scheduled!</h3>
                <p className="text-slate-500 font-medium mb-6 max-w-sm">
                  Your meeting has been confirmed. A calendar invitation has been sent to your email address.
                </p>
                {meetingLink && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 w-full max-w-md text-left">
                    <p className="text-sm font-bold text-blue-900 mb-1">Video Meeting Link (Jitsi):</p>
                    <a href={meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 font-medium break-all hover:underline">
                      {meetingLink}
                    </a>
                  </div>
                )}
`;
file = file.replace(
  /<h3 className="text-3xl font-black text-slate-900 mb-4">You're Scheduled!<\/h3>\s*<p className="text-slate-500 font-medium mb-8 max-w-sm">\s*Your meeting has been confirmed\. A calendar invitation has been sent to your email address\.\s*<\/p>/,
  step3Content
);

fs.writeFileSync('pages/website/BookingPage.tsx', file);
console.log('Updated BookingPage.tsx');
