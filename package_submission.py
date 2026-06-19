import os
import shutil
import zipfile

def package_project():
    print("=== TEYZIX Internship Project Packager ===")
    task_no = input("Enter Task Number (e.g., 2): ").strip()
    ref_id = input("Enter Reference ID (e.g., TC-INT-20260422-001): ").strip()

    if not task_no or not ref_id:
        print("Error: Task Number and Reference ID are required.")
        return

    folder_name = f"Task-{task_no}_{ref_id}"
    zip_name = f"{folder_name}.zip"

    # Define source and destination directories
    root_dir = os.path.dirname(os.path.abspath(__file__))
    temp_dir = os.path.join(root_dir, folder_name)

    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)

    print(f"\n1. Creating temporary packaging folder: {folder_name}...")

    # Copy Backend
    src_backend = os.path.join(root_dir, "backend")
    dst_backend = os.path.join(temp_dir, "backend")
    if os.path.exists(src_backend):
        print("2. Copying Backend files (ignoring venv & sqlite database)...")
        shutil.copytree(src_backend, dst_backend, ignore=shutil.ignore_patterns('venv', 'db.sqlite3', '__pycache__', '*.pyc', '.pytest_cache'))

    # Copy Frontend
    src_frontend = os.path.join(root_dir, "frontend")
    dst_frontend = os.path.join(temp_dir, "frontend")
    if os.path.exists(src_frontend):
        print("3. Copying Frontend files (ignoring node_modules & dist)...")
        shutil.copytree(src_frontend, dst_frontend, ignore=shutil.ignore_patterns('node_modules', 'dist', '.env.local', '.env'))

    # Create README.txt
    print("4. Generating README.txt...")
    readme_content = f"""TEYZIX CORE Internship Program
Task: {task_no}
Reference ID: {ref_id}

Project Description:
Multi-Vendor Service Marketplace Platform built with Django REST Framework (Backend) and React + Vite + Tailwind CSS (Frontend).
Includes user auth (JWT), provider profiles, service listings, requests feed, contract status timeline, rated reviews, and DM chat workspace.

How to Run Locally:
1. Backend Setup:
   cd backend
   python -m venv venv
   # Activate venv:
   # On Windows: .\\venv\\Scripts\\activate
   # On macOS/Linux: source venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py seed_db
   python manage.py runserver

2. Frontend Setup:
   cd frontend
   npm install
   npm run dev
"""
    with open(os.path.join(temp_dir, "README.txt"), "w") as f:
        f.write(readme_content)

    # Zip the directory
    print(f"5. Compressing folder to {zip_name}...")
    zip_path = os.path.join(root_dir, zip_name)
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Compute relative path to store in zip
                arcname = os.path.relpath(file_path, temp_dir)
                # Put it under a folder with the folder_name inside the zip
                zipf.write(file_path, os.path.join(folder_name, arcname))

    # Clean up temp folder
    shutil.rmtree(temp_dir)
    print(f"\nSuccess! Your submission file is ready at:\n{zip_path}")
    print("You can upload this ZIP file directly to the Teyzix Google Form.")

if __name__ == "__main__":
    package_project()
