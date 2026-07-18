import React from 'react';
import { useTranslation } from '../../lib/translations';
import LegalPage from '../../components/ui/LegalPage';
import { cookiesContent, LEGAL_LAST_UPDATED } from '../../data/legalContent';

export default function Cookies() {
    const { t } = useTranslation();
    return (
        <LegalPage
            title={t('footer.legal.cookies')}
            lastUpdated={LEGAL_LAST_UPDATED}
            sections={cookiesContent}
            seoDescription="Политика за бисквитките на ReCoffee — какви технологии използва сайтът и как да ги управлявате."
        />
    );
}
