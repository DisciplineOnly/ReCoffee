-- Catalog expansion: illy iperEspresso capsules + espresso machines.
--
-- The catalog is now two levels deep (see src/lib/categories.js):
--   coffee   -> capsules, grains
--   machines -> machines-personal, machines-professional
-- Legacy leaves (single-origin / blend / limited) are still valid values and
-- are mapped onto `grains` in the frontend, so existing rows are left alone.

-- image_url is written by the admin product form; make sure it exists.
alter table products add column if not exists image_url text;

-- Machines have no roast level; the existing check allows 1..5 only, so NULL is
-- the correct value for them (check constraints pass on NULL).

INSERT INTO products (id, slug, name_bg, name_en, description_bg, description_en, price, in_stock, featured, category, roast_level, origin, process, weight_grams, image_url) VALUES

-- ── COFFEE / CAPSULES ────────────────────────────────────────────────────────
('c1a10001-0000-4000-8000-000000000001', 'illy-iperespresso-classico-espresso',
 'illy iperEspresso Classico — Еспресо', 'illy iperEspresso Classico — Espresso',
 'Класическото печене на illy в капсула iperEspresso. 100% арабика от девет произхода, кадифена кремА и балансиран вкус на карамел и цветя. Кутия от 100 капсули за приготвяне на еспресо.',
 'illy''s classic roast in an iperEspresso capsule. 100% Arabica from nine origins, velvety crema and a balanced caramel-and-floral cup. Box of 100 espresso capsules.',
 79.00, true, true, 'capsules', 3, 'illy', 'iperEspresso', 690, null),

('c1a10001-0000-4000-8000-000000000002', 'illy-iperespresso-classico-lungo',
 'illy iperEspresso Classico — Лунго', 'illy iperEspresso Classico — Lungo',
 'Същата класическа смес, дозирана за дълга напитка. По-лек и ароматен профил, който запазва сладостта на арабиката при по-голям обем. Кутия от 100 капсули за лунго.',
 'The same classic blend, dosed for a longer drink. A lighter, aromatic profile that keeps the Arabica sweetness at a bigger volume. Box of 100 lungo capsules.',
 79.00, true, false, 'capsules', 2, 'illy', 'iperEspresso', 690, null),

('c1a10001-0000-4000-8000-000000000003', 'illy-iperespresso-decaffeinato',
 'illy iperEspresso Decaffeinato', 'illy iperEspresso Decaffeinato',
 'Безкофеиново без компромис. Същата смес от 100% арабика, декофеинирана по щадящ метод — пълно тяло и сладост, подходящо за следобед и вечер. Кутия от 100 капсули.',
 'Decaf without the compromise. The same 100% Arabica blend, gently decaffeinated — full body and sweetness, made for afternoons and evenings. Box of 100 capsules.',
 84.00, true, false, 'capsules', 2, 'illy', 'iperEspresso', 690, null),

('c1a10001-0000-4000-8000-000000000004', 'illy-iperespresso-intenso',
 'illy iperEspresso Intenso', 'illy iperEspresso Intenso',
 'Тъмно печене за тези, които обичат по-плътно еспресо. Наситени ноти на какао и препечен хляб, дълъг финал и гъста кремА. Кутия от 100 капсули.',
 'A bold roast for anyone who likes their espresso dense. Deep cocoa and toasted-bread notes, a long finish and thick crema. Box of 100 capsules.',
 79.00, true, true, 'capsules', 4, 'illy', 'iperEspresso', 690, null),

-- ── MACHINES / PERSONAL USE ──────────────────────────────────────────────────
('c1a10002-0000-4000-8000-000000000001', 'illy-easy-red',
 'illy Easy — Червена', 'illy Easy — Red',
 'Компактна капсулна машина за iperEspresso, широка колкото чаша. Две програмируеми дози (еспресо и лунго), загряване за под минута и автоматично изключване. Червено матово покритие.',
 'A compact iperEspresso capsule machine barely wider than a cup. Two programmable doses (espresso and lungo), under a minute to heat up and auto standby. Matte red finish.',
 249.00, true, true, 'machines-personal', null, 'illy', 'Капсули iperEspresso', null, null),

('c1a10002-0000-4000-8000-000000000002', 'illy-easy-black',
 'illy Easy — Черна', 'illy Easy — Black',
 'Същата компактна капсулна машина в матово черно. Двубутонно управление, резервоар от 0.75 л и автоматично изхвърляне на капсулата в контейнера.',
 'The same compact capsule machine in matte black. Two-button control, a 0.75 L tank and automatic capsule ejection into the collector.',
 249.00, true, false, 'machines-personal', null, 'illy', 'Капсули iperEspresso', null, null),

('c1a10002-0000-4000-8000-000000000003', 'saeco-royal-professional',
 'Saeco Royal Professional', 'Saeco Royal Professional',
 'Автоматична машина зърна-в-чаша за дома и малкия офис. Керамична мелачка, вградена система за пара и гореща вода, програмируеми рецепти и две чаши едновременно. Реновирана и тествана.',
 'A bean-to-cup automatic for the home and small office. Ceramic burrs, built-in steam and hot-water wand, programmable recipes and two cups at once. Refurbished and tested.',
 1890.00, true, true, 'machines-personal', null, 'Saeco', 'Кафе на зърна', null, null),

('c1a10002-0000-4000-8000-000000000004', 'fiorenzato-f64-grinder',
 'Fiorenzato F64 — Мелачка', 'Fiorenzato F64 — Grinder',
 'Мелачка на дозиране с плоски ножове 64 мм и дигитален таймер. Микрометрична регулация за прецизна настройка на еспресото и стъклен бункер за 1.5 кг зърна.',
 'An on-demand grinder with 64 mm flat burrs and a digital timer. Micrometric adjustment for dialling espresso in precisely, plus a 1.5 kg bean hopper.',
 1450.00, true, false, 'machines-personal', null, 'Fiorenzato', 'Кафе на зърна', null, null),

('c1a10002-0000-4000-8000-000000000005', 'la-piccola-sara',
 'La Piccola Sara', 'La Piccola Sara',
 'Малка италианска машина за хартиени дози ESE. Помпа от 15 бара, термоблок и тяло от неръждаема стомана — професионално еспресо на плота в кухнята, без мелачка и без почистване.',
 'A small Italian machine for ESE paper pods. A 15-bar pump, thermoblock and stainless body — proper espresso on a kitchen counter, with no grinder and no cleanup.',
 590.00, true, false, 'machines-personal', null, 'La Piccola', 'Дози ESE', null, null),

-- ── MACHINES / PROFESSIONAL ──────────────────────────────────────────────────
('c1a10003-0000-4000-8000-000000000001', 'la-spaziale-s2-2gr',
 'La Spaziale S2 EK — 2 групи', 'La Spaziale S2 EK — 2 Group',
 'Двугрупова професионална еспресо машина за заведения с постоянен оборот. Топлообменен бойлер 11 л, електронно дозиране на четири програми за група и две парни струи. Гръб от неръждаема стомана.',
 'A two-group commercial espresso machine for venues with steady throughput. An 11 L heat-exchange boiler, electronic dosing with four programs per group and two steam wands. Stainless steel body.',
 6900.00, true, true, 'machines-professional', null, 'La Spaziale', 'Смляно кафе', null, null),

('c1a10003-0000-4000-8000-000000000002', 'pro-2gr-ese-pod-machine',
 'Професионална машина за дози — 2 групи', 'Professional ESE Pod Machine — 2 Group',
 'Двугрупова машина, работеща с хартиени дози ESE — без мелачка, без темпериране и без утайка. Идеална за хотели, офиси и обекти, където всяко еспресо трябва да е еднакво, независимо кой го прави.',
 'A two-group machine built around ESE paper pods — no grinder, no tamping, no puck to knock out. Made for hotels, offices and sites where every espresso has to taste the same no matter who pulls it.',
 4200.00, true, false, 'machines-professional', null, 'Spectima', 'Дози ESE', null, null);

-- Flavour notes only apply to the coffee group.
INSERT INTO product_flavors (product_id, flavor_name_bg, flavor_name_en) VALUES
('c1a10001-0000-4000-8000-000000000001', 'Карамел', 'Caramel'),
('c1a10001-0000-4000-8000-000000000001', 'Шоколад', 'Chocolate'),
('c1a10001-0000-4000-8000-000000000001', 'Цветя', 'Floral'),
('c1a10001-0000-4000-8000-000000000002', 'Карамел', 'Caramel'),
('c1a10001-0000-4000-8000-000000000002', 'Печен хляб', 'Toasted bread'),
('c1a10001-0000-4000-8000-000000000002', 'Мед', 'Honey'),
('c1a10001-0000-4000-8000-000000000003', 'Млечен шоколад', 'Milk chocolate'),
('c1a10001-0000-4000-8000-000000000003', 'Бадем', 'Almond'),
('c1a10001-0000-4000-8000-000000000003', 'Карамел', 'Caramel'),
('c1a10001-0000-4000-8000-000000000004', 'Какао', 'Cocoa'),
('c1a10001-0000-4000-8000-000000000004', 'Препечен хляб', 'Toast'),
('c1a10001-0000-4000-8000-000000000004', 'Сушени плодове', 'Dried fruit');
