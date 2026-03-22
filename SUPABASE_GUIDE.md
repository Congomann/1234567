# Supabase Setup Guide: Step-by-Step

Follow these steps to transition your New Holland Financial Group CRM backend and database to Supabase.

## Step 1: Create a Supabase Project
1.  Go to [Supabase](https://supabase.com/) and sign in.
2.  Click **New Project** and select your organization.
3.  Set the **Name** to `NHFG-CRM`.
4.  Set a secure **Database Password** (Save this! You will need it).
5.  Select the **Region** closest to you and click **Create New Project**.

## Step 2: Configure the Database Schema
1.  Once the project is ready, go to the **SQL Editor** in the left sidebar.
2.  Click **New Query**.
3.  Open the file [supabase_setup.sql](file:///Users/newholland/1234567/backend/supabase_setup.sql) on your computer.
4.  **Copy the entire contents** of that file and paste it into the Supabase SQL Editor.
5.  Click **Run**. You should see "Success" for all operations.

## Step 3: Connect your Backend
1.  In Supabase, go to **Project Settings** > **Database**.
2.  Under **Connection string**, select **Node.js**.
3.  Copy the connection string. It should look like:
    `postgres://postgres:[YOUR-PASSWORD]@[HOST]:6543/postgres`
4.  Open your local `.env` file at `/Users/newholland/1234567/backend/.env`.
5.  Update the `DATABASE_URL` variable with the string you copied (ensure you replace `[YOUR-PASSWORD]` with your actual password).
    ```env
    DATABASE_URL=postgres://postgres:YourPassword@db.xyz.supabase.co:6543/postgres
    ```

## Step 4: Verify Connection
1.  Restart your backend server:
    ```bash
    npm run dev:backend
    ```
2.  Check the logs to ensure the database connected successfully.
3.  Log in to the CRM. Your sessions and data should now be handled by Supabase.

## Step 5: (Optional) Row Level Security (RLS)
The schema I provided includes **Forced RLS**. This means that by default, advisors can only see their own data.
-   If you need to adjust these rules, go to **Authentication** > **Policies** in Supabase.
-   You can visually see and edit the "Isolation Policies" I've implemented.

---
**Need help?** If any step fails, please let me know the error message and I will help you troubleshoot immediately.
