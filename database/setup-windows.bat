@echo off
REM PlaceIT Database Setup Script for Windows
REM Requires MySQL to be installed and in PATH

echo ==========================================
echo PlaceIT Database Setup
echo ==========================================
echo.

REM Use default MySQL password
if not defined MYSQL_ROOT_PASSWORD set MYSQL_ROOT_PASSWORD=sumu123

echo Using MySQL root password from env: MYSQL_ROOT_PASSWORD
echo.
echo Creating databases...
mysql -u root -p%MYSQL_ROOT_PASSWORD% < 00-init-databases.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create databases
    echo Please verify MySQL is running and the MYSQL_ROOT_PASSWORD env var is correct
    pause
    exit /b 1
)

echo Creating Auth Service schema...
mysql -u root -p%MYSQL_ROOT_PASSWORD% placeit_auth < 01-auth-service.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create Auth Service schema
    pause
    exit /b 1
)

echo Creating Student Service schema...
mysql -u root -p%MYSQL_ROOT_PASSWORD% placeit_student < 02-student-service.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create Student Service schema
    pause
    exit /b 1
)

echo Creating Company Service schema...
mysql -u root -p%MYSQL_ROOT_PASSWORD% placeit_company < 03-company-service.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create Company Service schema
    pause
    exit /b 1
)

echo Creating Placement Service schema...
mysql -u root -p%MYSQL_ROOT_PASSWORD% placeit_placement < 04-placement-service.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create Placement Service schema
    pause
    exit /b 1
)

echo Creating Notification Service schema...
mysql -u root -p%MYSQL_ROOT_PASSWORD% placeit_notification < 05-notification-service.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create Notification Service schema
    pause
    exit /b 1
)

echo.
set /p SEED_DATA=Do you want to insert seed data? (y/n): 
if /i "%SEED_DATA%"=="y" (
    echo Inserting seed data...
    mysql -u root -p%MYSQL_ROOT_PASSWORD% < 06-seed-data.sql
    if %ERRORLEVEL% NEQ 0 (
        echo WARNING: Failed to insert seed data
    )
)

echo.
echo ==========================================
echo Database setup completed successfully!
echo ==========================================
echo.
echo MySQL Configuration:
echo   Username: root
echo   Password: [set via MYSQL_ROOT_PASSWORD env var]
echo.
echo Email Configuration:
echo   Email: [set via GMAIL_USERNAME env var]
echo   Gmail App Password: [set via GMAIL_PASSWORD env var]
echo.
echo Databases created:
echo   - placeit_auth
echo   - placeit_student
echo   - placeit_company
echo   - placeit_placement
echo   - placeit_notification
echo.
echo Test users (password: Password@123):
echo   - admin@placeit.com (ADMIN)
echo   - tpo@university.edu (TPO)
echo   - recruiter@company.com (RECRUITER)
echo   - student@university.edu (STUDENT)
echo.
pause
