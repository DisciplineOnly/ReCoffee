-- 5. SEED DATA (Optional: Run this to populate data instead of using the Node script)

-- Products
INSERT INTO products (id, slug, name_bg, name_en, description_bg, description_en, price, in_stock, featured, category, roast_level, origin, process, weight_grams) VALUES
('b3c28581-2c09-4458-86d4-8d99805963cc', 'mass-appeal', 'Mass Appeal', 'Mass Appeal', 'Млечен шоколад, карамел, червена ябълка. Балансирано кафе с гладък вкус, идеално за всеки ден.', 'Milk chocolate, caramel, red apple. Balanced coffee with smooth taste, perfect for everyday.', 45.00, true, true, 'single-origin', 2, 'Colombia', 'Washed', 250),
('3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', 'thesis', 'Thesis', 'Thesis', 'Тъмен шоколад, печени ядки, меласа. Нашата фирмена смес със сезонни зърна.', 'Dark chocolate, roasted nuts, molasses. Our signature blend with seasonal beans.', 38.00, true, true, 'blend', 3, 'Signature Blend', 'Seasonal', 250),
('9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', 'gedeb-yirgacheffe', 'Gedeb Yirgacheffe', 'Gedeb Yirgacheffe', 'Боровинково конфитюр, лавандула, пчелен мед. Ограничено издание от Етиопия.', 'Blueberry jam, lavender, honeycomb. Limited edition from Ethiopia.', 52.00, true, true, 'limited', 1, 'Ethiopia', 'Natural', 250),
('f1e2d3c4-b5a6-9788-0912-345678901234', 'brazil-santos', 'Brazil Santos', 'Brazil Santos', 'Лешник, какао, карамелизирана захар. Класическо бразилско кафе с богат вкус.', 'Hazelnut, cocoa, caramelized sugar. Classic Brazilian coffee with rich flavor.', 42.00, true, false, 'single-origin', 3, 'Brazil', 'Pulped Natural', 250),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'espresso-blend', 'Espresso Blend', 'Espresso Blend', 'Тъмна череша, тъмен шоколад, бадем. Перфектна смес за еспресо.', 'Dark cherry, dark chocolate, almond. Perfect blend for espresso.', 40.00, true, false, 'blend', 4, 'Multi-Origin', 'Various', 250),
('0f1e2d3c-4b5a-6789-0123-456789abcdef', 'kenya-aa', 'Kenya AA', 'Kenya AA', 'Черна боровинка, грейпфрут, захарна тръстика. Ярко и живо кенийско кафе.', 'Blackcurrant, grapefruit, sugarcane. Bright and vibrant Kenyan coffee.', 48.00, true, false, 'single-origin', 2, 'Kenya', 'Washed', 250),
('12345678-90ab-cdef-1234-567890abcdef', 'decaf-colombia', 'Decaf Colombia', 'Decaf Colombia', 'Млечен шоколад, орех, мед. Безкофеиново кафе без компромис във вкуса.', 'Milk chocolate, walnut, honey. Decaf coffee without compromising taste.', 46.00, true, false, 'single-origin', 2, 'Colombia', 'Swiss Water', 250),
('87654321-fedc-ba09-8765-43210fedcba9', 'seasonal-microlot', 'Seasonal Microlot', 'Seasonal Microlot', 'Променящи се вкусови ноти. Ограничена серия от малки партиди.', 'Changing flavor notes. Limited series from small batches.', 58.00, false, false, 'limited', 2, 'Rotating', 'Various', 250);

-- Product Flavors
INSERT INTO product_flavors (product_id, flavor_name_bg, flavor_name_en) VALUES
-- Mass Appeal
('b3c28581-2c09-4458-86d4-8d99805963cc', 'Млечен шоколад', 'Млечен шоколад'),
('b3c28581-2c09-4458-86d4-8d99805963cc', 'Карамел', 'Карамел'),
('b3c28581-2c09-4458-86d4-8d99805963cc', 'Червена ябълка', 'Червена ябълка'),
-- Thesis
('3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', 'Тъмен шоколад', 'Тъмен шоколад'),
('3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', 'Печени ядки', 'Печени ядки'),
('3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', 'Меласа', 'Меласа'),
-- Gedeb
('9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', 'Боровинково конфитюр', 'Боровинково конфитюр'),
('9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', 'Лавандула', 'Лавандула'),
('9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', 'Пчелен мед', 'Пчелен мед'),
-- Brazil
('f1e2d3c4-b5a6-9788-0912-345678901234', 'Лешник', 'Лешник'),
('f1e2d3c4-b5a6-9788-0912-345678901234', 'Какао', 'Какао'),
('f1e2d3c4-b5a6-9788-0912-345678901234', 'Карамелизирана захар', 'Карамелизирана захар'),
-- Espresso Blend
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Тъмна череша', 'Тъмна череша'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Тъмен шоколад', 'Тъмен шоколад'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Бадем', 'Бадем'),
-- Kenya
('0f1e2d3c-4b5a-6789-0123-456789abcdef', 'Черна боровинка', 'Черна боровинка'),
('0f1e2d3c-4b5a-6789-0123-456789abcdef', 'Грейпфрут', 'Грейпфрут'),
('0f1e2d3c-4b5a-6789-0123-456789abcdef', 'Захарна тръстика', 'Захарна тръстика'),
-- Decaf
('12345678-90ab-cdef-1234-567890abcdef', 'Млечен шоколад', 'Млечен шоколад'),
('12345678-90ab-cdef-1234-567890abcdef', 'Орех', 'Орех'),
('12345678-90ab-cdef-1234-567890abcdef', 'Мед', 'Мед'),
-- Seasonal
('87654321-fedc-ba09-8765-43210fedcba9', 'Сезонни', 'Сезонни'),
('87654321-fedc-ba09-8765-43210fedcba9', 'Уникални', 'Уникални'),
('87654321-fedc-ba09-8765-43210fedcba9', 'Изненадващи', 'Изненадващи');
