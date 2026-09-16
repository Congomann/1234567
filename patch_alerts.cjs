const fs = require('fs');
let content = fs.readFileSync('pages/crm/ContractingHub.tsx', 'utf8');

const oldSubmit = `      alert('Contract Generated & Submitted! The completed PDF has been automatically emailed to sales@newhollandfinancial.com and the Carrier Contracting Department.');
      setActiveApplication(null);
    } catch (e) {
      alert('Failed to generate and submit contract.');
    } finally {
      setIsSubmitting(false);
    }`;

const newSubmit = `      setSaveStatus('Contract Submitted Successfully!');
      setTimeout(() => {
         setActiveApplication(null);
      }, 2000);
    } catch (e) {
      setSaveStatus('Failed to submit contract.');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }`;

content = content.replace(oldSubmit, newSubmit);
fs.writeFileSync('pages/crm/ContractingHub.tsx', content);
console.log('Removed alerts from ContractingHub');
