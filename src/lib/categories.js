/**
 * Product taxonomy.
 *
 * The catalog is two levels deep: a top-level group (coffee / machines) and a
 * leaf category stored on `products.category`. Legacy leaves from the original
 * beans-only catalog are still valid values in the DB, so everything goes
 * through `normalizeCategory` before it is compared or filtered.
 */

export const CATEGORY_TREE = [
    {
        id: 'coffee',
        labelKey: 'shop.group_coffee',
        children: [
            { id: 'capsules', labelKey: 'shop.badge_capsules' },
            { id: 'grains', labelKey: 'shop.badge_grains' }
        ]
    },
    {
        id: 'machines',
        labelKey: 'shop.group_machines',
        children: [
            { id: 'machines-personal', labelKey: 'shop.badge_machines_personal' },
            { id: 'machines-professional', labelKey: 'shop.badge_machines_professional' }
        ]
    }
];

/** Leaves of the current taxonomy, in display order. */
export const LEAF_CATEGORIES = CATEGORY_TREE.flatMap(g => g.children.map(c => c.id));

/** Old beans-only categories mapped onto the current taxonomy. */
const LEGACY_CATEGORY_MAP = {
    'single-origin': 'grains',
    'blend': 'grains',
    'limited': 'grains',
    'decaf': 'grains',
    'equipment': 'machines-personal',
    'consumables': 'capsules'
};

const GROUP_BY_LEAF = CATEGORY_TREE.reduce((acc, group) => {
    group.children.forEach(child => { acc[child.id] = group.id; });
    return acc;
}, {});

/** Translation key for a badge, keeping the legacy labels where they exist. */
const BADGE_KEYS = {
    'single-origin': 'shop.badge_single_origin',
    'blend': 'shop.badge_blend',
    'limited': 'shop.badge_limited',
    'decaf': 'shop.badge_decaf',
    'equipment': 'shop.badge_equipment',
    'capsules': 'shop.badge_capsules',
    'grains': 'shop.badge_grains',
    'machines-personal': 'shop.badge_machines_personal',
    'machines-professional': 'shop.badge_machines_professional'
};

/** Map any stored category value onto a leaf of the current taxonomy. */
export function normalizeCategory(category) {
    if (!category) return null;
    if (GROUP_BY_LEAF[category]) return category;
    return LEGACY_CATEGORY_MAP[category] || null;
}

/** 'coffee' | 'machines' | null */
export function getCategoryGroup(category) {
    const leaf = normalizeCategory(category);
    return leaf ? GROUP_BY_LEAF[leaf] : null;
}

/** Machines have no roast level, no grind and no flavour notes. */
export function isMachine(product) {
    return getCategoryGroup(product?.category) === 'machines';
}

/** True for anything brewed — capsules and beans alike. */
export function isCoffee(product) {
    return getCategoryGroup(product?.category) === 'coffee';
}

/** Beans are the only thing we can grind to order. */
export function hasGrindOptions(product) {
    return normalizeCategory(product?.category) === 'grains';
}

/** Grind value stored on cart items / order items that cannot be ground. */
export const NO_GRIND = 'none';

export function categoryBadgeKey(category) {
    return BADGE_KEYS[category] || BADGE_KEYS[normalizeCategory(category)] || null;
}
