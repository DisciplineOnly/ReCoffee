import React from 'react';
import { useTranslation } from '../../lib/translations';
import LegalPage from '../../components/ui/LegalPage';
import { privacyContent, LEGAL_LAST_UPDATED } from '../../data/legalContent';

export default function Privacy() {
    const { t } = useTranslation();
    return (
        <LegalPage
            title={t('footer.legal.privacy')}
            lastUpdated={LEGAL_LAST_UPDATED}
            sections={privacyContent}
            seoDescription="Политика за поверителност на ReCoffee — как събираме, използваме и защитаваме личните ви данни съгласно GDPR."
        />
    );
}
