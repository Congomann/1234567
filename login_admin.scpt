tell application "Google Chrome"
    activate
    open location "https://newhollandfinancial.com/login"
    delay 4
    tell active tab of front window
        execute javascript "
            const emailInput = document.getElementById('email');
            if(emailInput) {
                emailInput.value = 'info@newhollandfinancial.com';
                emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            const passInput = document.getElementById('password');
            if(passInput) {
                passInput.value = 'NewHollandAdmin@2025';
                passInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            const btn = document.querySelector('button[type=\"submit\"]');
            if(btn) {
                btn.click();
            }
        "
    end tell
end tell
