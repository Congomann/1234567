const fs = require('fs');
const path = './services/apiBackend.ts';
let content = fs.readFileSync(path, 'utf8');

const inviteMethods = `
    async inviteUser(user: any): Promise<any> {
        return this.post('/admin/invite-user', user);
    }

    async setupAccount(data: any): Promise<any> {
        return this.post('/onboarding/setup-account', data);
    }
`;

if (!content.includes('inviteUser(')) {
    const target = "async saveUser(user: User): Promise<void> {";
    content = content.replace(target, inviteMethods + "\n    " + target);
    fs.writeFileSync(path, content);
    console.log("Successfully added inviteUser to apiBackend.ts");
}
