
-- 1. Create Services Table
CREATE TABLE IF NOT EXISTS services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name_bg text NOT NULL,
    name_en text,
    description_bg text,
    description_en text,
    price numeric,
    duration_minutes integer,
    image_url text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add columns to Products Table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_service boolean DEFAULT false;

-- 3. Enable RLS for Services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Services (Public Read, Admin Write)
-- Note: Adjust 'authenticated' to specific role if needed, but for now authenticated = admin per spec context
CREATE POLICY "Enable read access for all users" ON services FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON services FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON services FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON services FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Update Policies for Products & Product Flavors
-- Products Policies
CREATE POLICY "Enable insert for authenticated users only" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Product Flavors Policies (Fix for "new row violates RLS" error)
ALTER TABLE product_flavors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON product_flavors FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON product_flavors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON product_flavors FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON product_flavors FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Storage Bucket & Policies
-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public Read Access
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Policy: Authenticated Upload Access
CREATE POLICY "Authenticated Insert Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- Policy: Authenticated Update Access
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- Policy: Authenticated Delete Access
CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );
