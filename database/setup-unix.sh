#!/bin/bash

# PlaceIT Database Setup Script for Linux/Mac
# Requires MySQL to be installed

echo "=========================================="
echo "PlaceIT Database Setup"
echo "=========================================="
echo ""

# Default MySQL root password
MYSQL_ROOT_PASSWORD="sumu123"

echo "Using MySQL root password: $MYSQL_ROOT_PASSWORD"
echo ""

# Function to run SQL file
run_sql() {
    local file=$1
    local description=$2
    local database=$3
    echo "Creating $description..."
    if [ -z "$database" ]; then
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" < "$file" 2>/dev/null
    else
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$database" < "$file" 2>/dev/null
    fi
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create $description"
        echo "Please verify MySQL is running and password is correct"
        exit 1
    fi
    echo "✓ $description created successfully"
}

# Run all SQL scripts in order
run_sql "00-init-databases.sql" "databases and user" ""
run_sql "01-auth-service.sql" "Auth Service schema" "placeit_auth"
run_sql "02-student-service.sql" "Student Service schema" "placeit_student"
run_sql "03-company-service.sql" "Company Service schema" "placeit_company"
run_sql "04-placement-service.sql" "Placement Service schema" "placeit_placement"
run_sql "05-notification-service.sql" "Notification Service schema" "placeit_notification"

echo ""
read -p "Do you want to insert seed data? (y/n): " SEED_DATA

if [ "$SEED_DATA" = "y" ] || [ "$SEED_DATA" = "Y" ]; then
    run_sql "06-seed-data.sql" "seed data" ""
fi

echo ""
echo "=========================================="
echo "Database setup completed successfully!"
echo "=========================================="
echo ""
echo "MySQL Configuration:"
echo "  Username: root"
echo "  Password: sumu123"
echo ""
echo "Email Configuration:"
echo "  Email: sumukhasumukhaacharya@gmail.com"
echo "  Gmail App Password: jiqozibjkptxtkab"
echo ""
echo "Databases created:"
echo "  - placeit_auth"
echo "  - placeit_student"
echo "  - placeit_company"
echo "  - placeit_placement"
echo "  - placeit_notification"
echo ""
echo "Test users (password: Password@123):"
echo "  - admin@placeit.com (ADMIN)"
echo "  - tpo@university.edu (TPO)"
echo "  - recruiter@company.com (RECRUITER)"
echo "  - student@university.edu (STUDENT)"
echo ""
