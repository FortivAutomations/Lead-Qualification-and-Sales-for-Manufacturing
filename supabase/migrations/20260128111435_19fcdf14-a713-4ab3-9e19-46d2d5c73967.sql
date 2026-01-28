-- Add new columns to appointment_details table
ALTER TABLE public.appointment_details
ADD COLUMN IF NOT EXISTS lead_name text,
ADD COLUMN IF NOT EXISTS lead_email text,
ADD COLUMN IF NOT EXISTS start_time text,
ADD COLUMN IF NOT EXISTS end_time text,
ADD COLUMN IF NOT EXISTS date date;

-- Enable RLS
ALTER TABLE public.appointment_details ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (since no auth is implemented)
CREATE POLICY "Allow public read access to appointment_details"
ON public.appointment_details
FOR SELECT
USING (true);