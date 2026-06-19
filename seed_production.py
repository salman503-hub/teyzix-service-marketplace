import os
import sys
import subprocess

def run_seed():
    print("=== Teyzix Remote Database Seeder ===")
    print("This script will migrate and seed your live database on Railway.")
    
    db_url = input("\nPaste your Railway PostgreSQL DATABASE_URL: ").strip()
    if not db_url:
        print("Error: DATABASE_URL cannot be empty.")
        return

    # Set DATABASE_URL in environment variables
    os.environ["DATABASE_URL"] = db_url

    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
    python_executable = os.path.join(backend_dir, "venv", "Scripts", "python.exe")

    if not os.path.exists(python_executable):
        python_executable = "python" # Fallback to system python

    print("\n1. Running migrations on remote database...")
    migrate_res = subprocess.run([python_executable, "manage.py", "migrate"], cwd=backend_dir)
    
    if migrate_res.returncode != 0:
        print("\nError: Migrations failed. Check database URL and network connection.")
        return

    print("\n2. Seeding remote database with test data (admin, users, listings, requests)...")
    seed_res = subprocess.run([python_executable, "manage.py", "seed_db"], cwd=backend_dir)

    if seed_res.returncode == 0:
        print("\n🎉 Success! Your production database has been successfully migrated and seeded.")
        print("You can now log in as 'admin_root' with password 'adminpassword123'.")
    else:
        print("\nError: Seeding failed.")

if __name__ == "__main__":
    run_seed()
