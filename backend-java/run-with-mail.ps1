# Run the backend with Gmail credentials so newsletter emails are sent.
# 1. Edit the two lines below: set your Gmail and App Password in QUOTES (16 chars, from https://myaccount.google.com/apppasswords)
# 2. If port 5000 is in use, stop the other backend first or run: Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
# 3. Run: .\run-with-mail.ps1

# Use quotes so PowerShell treats these as strings (required!)
$env:SPRING_MAIL_USERNAME = "artistaathi001@gmail.com"
# Must be in quotes — otherwise PowerShell treats the value as a command, not a string, and mail auth fails.
$env:SPRING_MAIL_PASSWORD = "onubhbaircdpcqdd"

Write-Host "Starting backend with mail as: $env:SPRING_MAIL_USERNAME"
mvn spring-boot:run
