$services = @(
    "ConfigServer",
    "EurekaServer",
    "GatewayAPI",
    "UserService",
    "NotificationService",
    "ReportingService",
    "SiteService",
    "EventBookingService",
    "ProgramService",
    "ComplianceService",
    "TouristService"
)

Set-Location "d:\DEVELOP LIFE\presetationcode"

foreach ($service in $services) {
    if (Test-Path $service) {
        Write-Host "Starting $service..."
        Start-Process -FilePath ".\mvnw.cmd" -ArgumentList "spring-boot:run" -WorkingDirectory "d:\DEVELOP LIFE\presetationcode\$service" -WindowStyle Minimized
        Start-Sleep -Seconds 15 # Wait a bit to avoid CPU overload and give Config/Eureka time
    }
}
Write-Host "All services have been started in background windows."
