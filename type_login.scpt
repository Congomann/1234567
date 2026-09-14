tell application "Google Chrome"
    activate
    open location "https://newhollandfinancial.com/login"
end tell

delay 3

tell application "System Events"
    keystroke "info@newhollandfinancial.com"
    keystroke tab
    keystroke "NewHollandAdmin@2025"
    keystroke return
end tell
