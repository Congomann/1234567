const { Backend } = require('../services/apiBackend');

async function test() {
    try {
        console.log('Testing Job Application Submission...');
        const payload = {
            fullName: 'Test Applicant',
            personalEmail: 'test_' + Date.now() + '@example.com',
            phone: '555-9999',
            licenseInfo: 'LIC-12345',
            experience: 'Automated test submission.',
            address: '123 Test Lane',
            resumeData: 'data:text/plain;base64,VGhpcyBpcyBhIHRlc3QgcmVzdW1lLg==', // "This is a test resume."
            resumeName: 'test_resume.txt'
        };

        // Note: Backend.post is not available in node context directly without some setup
        // I will use fetch instead
        const res = await fetch('http://localhost:3001/api/onboarding/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('Response:', data);
        if (data.success) {
            console.log('✅ TEST PASSED');
        } else {
            console.log('❌ TEST FAILED:', data.error);
        }
    } catch (err) {
        console.error('❌ TEST ERRORED:', err.message);
    }
}

test();
