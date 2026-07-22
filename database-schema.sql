-- Create students table
CREATE TABLE public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (students)
CREATE POLICY "Public profiles are viewable by everyone."
ON public.students FOR SELECT
USING ( true );

-- Create policy for public read access (payments)
CREATE POLICY "Payments are viewable by everyone."
ON public.payments FOR SELECT
USING ( true );

-- Create policy for authenticated admin full access (students)
CREATE POLICY "Authenticated users can insert students."
ON public.students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update students."
ON public.students FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete students."
ON public.students FOR DELETE TO authenticated USING (true);

-- Create policy for authenticated admin full access (payments)
CREATE POLICY "Authenticated users can insert payments."
ON public.payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update payments."
ON public.payments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete payments."
ON public.payments FOR DELETE TO authenticated USING (true);
