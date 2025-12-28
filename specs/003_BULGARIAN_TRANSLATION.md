# Specification: Bulgarian Translation & Internationalization

**ID**: SPEC-003
**Created**: 2025-12-28
**Author**: Architect
**Status**: Ready for Implementation

## 1. Objective
Implement a comprehensive internationalization (i18n) system to translate all user-facing content from English to Bulgarian, establishing ReCoffee as a Bulgarian-first brand while maintaining the flexibility to add additional languages in the future.

## 2. Architecture Overview

### 2.1 Translation System Design
- **Pattern**: Centralized JSON-based translation files
- **Default Language**: Bulgarian (`bg`)
- **Fallback Language**: English (`en`)
- **Storage Location**: `src/lib/translations/`

### 2.2 File Structure
```
src/
├── lib/
│   ├── translations/
│   │   ├── bg.json          # Bulgarian translations (primary)
│   │   ├── en.json          # English translations (fallback)
│   │   └── index.js         # Translation utility/hook
│   └── utils.js
```

## 3. Implementation Strategy

### 3.1 Translation Utility
Create a lightweight translation system without external dependencies:

**File**: `src/lib/translations/index.js`
```javascript
import bg from './bg.json';
import en from './en.json';

const translations = { bg, en };
const defaultLang = 'bg';

export const useTranslation = () => {
  const lang = defaultLang; // Can be extended to use context/state
  
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || translations['en']?.[key] || key;
  };
  
  return { t, lang };
};
```

### 3.2 Translation Key Structure
Organize translations by component/section for maintainability:

```json
{
  "header": {
    "nav": {
      "shop": "...",
      "subscription": "...",
      "wholesale": "...",
      "locations": "...",
      "learn": "...",
      "account": "..."
    }
  },
  "hero": {
    "badge": "...",
    "title": "...",
    "subtitle": "...",
    "description": "...",
    "cta_primary": "...",
    "cta_secondary": "...",
    "roast_intensity": "...",
    "roast_level": "..."
  },
  "footer": {
    "newsletter_text": "...",
    "newsletter_placeholder": "...",
    "newsletter_button": "...",
    "copyright": "..."
  }
}
```

## 4. Content Inventory & Translation Map

### 4.1 Header Component
| English | Bulgarian | Key |
|---------|-----------|-----|
| Shop | Магазин | `header.nav.shop` |
| Subscription | Абонамент | `header.nav.subscription` |
| Wholesale | Едро | `header.nav.wholesale` |
| Locations | Локации | `header.nav.locations` |
| Learn | Научи повече | `header.nav.learn` |
| Account | Профил | `header.nav.account` |

### 4.2 Hero Section
| English | Bulgarian | Key |
|---------|-----------|-----|
| Freshly Roasted | Прясно изпечено | `hero.badge` |
| ReCoffee - Restart Your Senses! | ReCoffee - Рестартирай сетивата си! | `hero.title` |
| Experience the boldest flavors... | Изпитай най-смелите вкусове и занаятчийско печене... | `hero.description` |
| Shop Our Roast | Нашето печене | `hero.cta_primary` |
| View All Blends | Всички смеси | `hero.cta_secondary` |
| Roast Intensity | Интензивност на печене | `hero.roast_intensity` |
| Bold & Smooth | Смело и гладко | `hero.roast_level` |

### 4.3 Marquee
| English | Bulgarian | Key |
|---------|-----------|-----|
| Free shipping on orders over $50 | Безплатна доставка за поръчки над 100 лв | `marquee.free_shipping` |
| Roasted fresh in Annapolis | Прясно изпечено в София | `marquee.fresh_roasted` |
| Sustainably Sourced | Устойчиво снабдяване | `marquee.sustainable` |

### 4.4 Shop Favorites
| English | Bulgarian | Key |
|---------|-----------|-----|
| Curated Selection | Избрана селекция | `shop.badge` |
| Weekly Favorites | Седмични фаворити | `shop.title` |
| Shop All Coffee | Всички кафета | `shop.cta` |
| Single Origin | Единичен произход | `shop.badge_single` |
| Blend | Смес | `shop.badge_blend` |
| Limited | Ограничено | `shop.badge_limited` |

### 4.5 Philosophy Section
| English | Bulgarian | Key |
|---------|-----------|-----|
| Our Philosophy | Нашата философия | `philosophy.badge` |
| Sourcing with Intentionality | Снабдяване с намерение | `philosophy.title` |
| We travel the globe... | Пътуваме по света... | `philosophy.description` |
| Direct Trade | Директна търговия | `philosophy.direct_trade` |
| Building equity in the supply chain | Изграждане на справедливост... | `philosophy.direct_trade_desc` |
| Precision Roasting | Прецизно печене | `philosophy.precision` |
| Small batches, meticulously profiled | Малки партиди... | `philosophy.precision_desc` |
| Read Our Story | Нашата история | `philosophy.cta` |

### 4.6 Subscription Section
| English | Bulgarian | Key |
|---------|-----------|-----|
| ReCaffe Refills | ReCoffee Зареждания | `subscription.title` |
| Artisan coffee delivered... | Занаятчийско кафе... | `subscription.description` |
| Start Subscription | Започни абонамент | `subscription.cta_primary` |
| Gift a Box | Подари кутия | `subscription.cta_secondary` |

### 4.7 Visit Us
| English | Bulgarian | Key |
|---------|-----------|-----|
| Locations | Локации | `visit.badge` |
| Visit Our Cafes | Посети нашите кафенета | `visit.title` |
| View All 7 Locations | Виж всички 7 локации | `visit.cta` |

### 4.8 Footer
| English | Bulgarian | Key |
|---------|-----------|-----|
| Join our community... | Присъедини се към нашата общност... | `footer.newsletter_text` |
| Email Address | Имейл адрес | `footer.newsletter_placeholder` |
| Join | Присъедини се | `footer.newsletter_button` |
| All Coffee | Всички кафета | `footer.links.all_coffee` |
| Subscriptions | Абонаменти | `footer.links.subscriptions` |
| Equipment | Оборудване | `footer.links.equipment` |
| Merch | Стоки | `footer.links.merch` |
| Our Story | Нашата история | `footer.links.our_story` |
| Careers | Кариери | `footer.links.careers` |
| Contact | Контакт | `footer.links.contact` |
| Partner with Us | Партньорство | `footer.links.partner` |
| Client Login | Вход за клиенти | `footer.links.client_login` |
| Training | Обучение | `footer.links.training` |
| Privacy Policy | Политика за поверителност | `footer.legal.privacy` |
| Terms of Service | Условия за ползване | `footer.legal.terms` |
| © 2024 ReCaffe Coffee | © 2024 ReCoffee Кафе | `footer.copyright` |

## 5. Implementation Steps

### Step 5.1: Create Translation Infrastructure
1. Create `src/lib/translations/` directory
2. Implement translation utility in `src/lib/translations/index.js`
3. Create `bg.json` with all Bulgarian translations
4. Create `en.json` with all English translations (for reference)

### Step 5.2: Component Refactoring Priority
Refactor components in this order (highest user visibility first):
1. **Header** - Always visible
2. **Hero** - First impression
3. **Footer** - Always visible
4. **Marquee** - High visibility
5. **ShopFavorites** - Core content
6. **Subscription** - CTA section
7. **Philosophy** - Brand messaging
8. **VisitUs** - Location information

### Step 5.3: Refactoring Pattern
For each component:
1. Import `useTranslation` hook
2. Replace hardcoded strings with `t('key.path')`
3. Verify all text is extracted
4. Test rendering with Bulgarian content

## 6. Quality Assurance

### 6.1 Validation Criteria
- [ ] All user-facing text uses translation keys
- [ ] No hardcoded English strings remain in components
- [ ] Bulgarian translations are grammatically correct
- [ ] Text fits within UI constraints (no overflow)
- [ ] Cyrillic characters render correctly
- [ ] Fallback to English works for missing keys

### 6.2 Typography Considerations
- Ensure font stack supports Cyrillic characters
- Current fonts (Inter, Playfair Display) support Cyrillic ✓
- Test letter-spacing with Cyrillic text (may need adjustment)

## 7. Future Extensibility

### 7.1 Language Switcher (Future)
Reserve space in Header for future language toggle:
```jsx
<button onClick={() => setLang(lang === 'bg' ? 'en' : 'bg')}>
  {lang.toUpperCase()}
</button>
```

### 7.2 Additional Languages
To add a new language:
1. Create `src/lib/translations/{lang}.json`
2. Add to translations object in `index.js`
3. Update language switcher options

## 8. SEO Considerations
- Update `index.html` `lang` attribute to `bg`
- Update meta descriptions to Bulgarian
- Consider `hreflang` tags for future multi-language support
