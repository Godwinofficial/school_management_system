Setup & Deployment steps for Supabase integration

1) Create Supabase project
   - Visit https://app.supabase.com and create a new project.
   - Note the Project URL and ANON key.

2) Create Storage bucket
   - Create a bucket named `birth-certificates` (set public as needed or use signed URLs).

3) Run SQL schema
   - Open the SQL editor in Supabase and run `src/db/supabase_schema.sql`.

4) Deploy Edge Function (create-user)
   - Place `supabase-functions/create-user/index.js` into your Supabase Functions directory.
   - Set environment variable `SUPABASE_SERVICE_ROLE_KEY` to your service role key in function config.
   - Deploy function using Supabase CLI or Console.
   - Note the deployed function URL and set `VITE_ADMIN_CREATE_USER_URL` in your frontend env variables.

5) Configure frontend env
   - Create a `.env` file in the project root with:
     VITE_SUPABASE_URL=https://<your-project>.supabase.co
     VITE_SUPABASE_ANON_KEY=<anon-public-key>
     VITE_ADMIN_CREATE_USER_URL=<deployed-edge-function-url>

6) Install client lib
   - npm install @supabase/supabase-js

7) Test flow
   - Start dev server: `npm run dev` or `pnpm dev`.
   - Create a school from the UI (if you integrated school creation form to call `SupabaseService.createSchoolWithProfiles`).
   - Confirm `schools` and `profiles` rows exist in Supabase, and auth users created via Edge Function.

Security notes
- Do NOT put the service role key in frontend code. Use Edge Functions or server-side code for privileged operations.
- Use RLS policies linked to `auth.uid()` and the `profiles` table to enforce row-level access.

Next steps
- I can add a UI hook to create schools using `SupabaseService.createSchoolWithProfiles`.
- I can implement file uploads for birth certificates to Supabase Storage and show download links.
- I can add example RLS policies tailored to roles like `head_teacher`, `class_teacher`, and `provincial_*`.
