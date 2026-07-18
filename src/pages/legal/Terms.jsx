import React from 'react';
import { useTranslation } from '../../lib/translations';
import LegalPage from '../../components/ui/LegalPage';
import { termsContent, LEGAL_LAST_UPDATED } from '../../data/legalContent';

export default function Terms() {
    const { t } = useTranslation();
    return (
        <LegalPage
            title={t('footer.legal.terms')}
            lastUpdated={LEGAL_LAST_UPDATED}
            sections={termsContent}
            seoDescription="Общи условия за ползване на онлайн магазина на ReCoffee — поръчки, доставка, право на отказ и рекламации."
        />
    );
}
