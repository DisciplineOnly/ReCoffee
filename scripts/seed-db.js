import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config({ path: '.env.local' });
// Fallback if .env.local doesn't exist or isn't picked up (e.g. typical vite naming)
if (!process.env.VITE_SUPABASE_URL) {
    dotenv.config({ path: '.env' });
}

const SUPPORTED_LOCALES = ['bg', 'en'];
const DEFAULT_LOCALE = 'bg';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// Note: Ideally use SERVICE_ROLE key for seeding to bypass RLS, 
// but if RLS policies allow 'service_role' and we pass the Anon key, it usually fails write policies
// UNLESS the policies are 'public insert'. 
// However, 'products' has 'insert to service_role' only policy.
// So we REALLY need the service role key for this script.
// OR we assume the user has put the service role key in .env for this op, 
// OR we temporarily disable RLS, 
// OR we instruct user to put SERVICE_KEY in .env.service.
// Let's assume user might not have SERVICE_KEY in VITE_SUPABASE_ANON_KEY.
// Actually, `supabase start` provides service_role key. 
// For now, I will try with the provided key. If it fails, I'll log a helpful message.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env or .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsPath = path.join(__dirname, '../src/data/products.json');

async function seed() {
    console.log('🌱 Starting database seed...');

    // 1. Read JSON
    const rawData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(rawData);

    console.log(`📦 Found ${products.length} products to insert.`);

    for (const prod of products) {
        // Map JSON to DB Schema
        // JSON: 
        // { 
        //   "slug": "mass-appeal", "name": "Mass Appeal", "nameEn": "Mass Appeal",
        //   "description": "...", "descriptionEn": "...", "price": 45, "inStock": true,
        //   "featured": true, "category": "single-origin", "roastLevel": 2, ...
        //   "flavorNotes": ["Choc", "Caramel"] 
        // }

        const dbProduct = {
            slug: prod.slug,
            name_bg: prod.name, // using 'name' as BG default per JSON structure
            name_en: prod.nameEn || prod.name,
            description_bg: prod.description,
            description_en: prod.descriptionEn,
            price: prod.price,
            in_stock: prod.inStock,
            featured: prod.featured,
            category: prod.category,
            roast_level: prod.roastLevel,
            origin: prod.origin,
            process: prod.process,
            weight_grams: prod.weight || 250
        };

        // Insert Product
        const { data: insertedProduct, error: prodError } = await supabase
            .from('products')
            .upsert(dbProduct, { onConflict: 'slug' })
            .select() // return ID
            .single();

        if (prodError) {
            console.error(`❌ Error inserting product ${prod.slug}:`, prodError.message);
            if (prodError.message.includes('new row violates row-level security')) {
                console.error('   HINT: You are likely using the ANON KEY. Script requires SERVICE_ROLE KEY because products table is restricted.');
                console.error('   Update your .env with VITE_SUPABASE_ANON_KEY=<service_role_key> temporarily for seeding.');
            }
            continue;
        }

        console.log(`✅ Inserted/Updated product: ${prod.name} (${insertedProduct.id})`);

        // Insert Flavors
        // First delete existing notes for this product to avoid dupes on re-run
        await supabase.from('product_flavors').delete().eq('product_id', insertedProduct.id);

        if (prod.flavorNotes && prod.flavorNotes.length > 0) {
            const flavorInserts = prod.flavorNotes.map(note => ({
                product_id: insertedProduct.id,
                flavor_name_bg: note,
                flavor_name_en: note // defaulting to same if no translation in JSON
            }));

            const { error: flavorError } = await supabase
                .from('product_flavors')
                .insert(flavorInserts);

            if (flavorError) {
                console.error(`   ⚠️ Error inserting flavors for ${prod.slug}:`, flavorError.message);
            } else {
                console.log(`   Detailed flavors added.`);
            }
        }
    }

    console.log('✨ Data seeding completed.');
}

seed().catch(console.error);
