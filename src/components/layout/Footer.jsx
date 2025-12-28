import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import logo from '../../assets/logo.jpg';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="bg-[#F0F2F4] pt-24 pb-12 border-t border-slate-200">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">

                    {/* Brand & Newsletter */}
                    <div className="md:col-span-4">
                        <img src={logo} alt="ReCaffe Logo" className="h-16 w-auto mb-6 object-contain" />
                        <p className="text-slate-500 mb-8 font-light text-sm leading-relaxed max-w-xs">
                            {t('footer.newsletter_text')}
                        </p>
                        <form className="flex border-b border-slate-300 pb-2 max-w-xs" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder={t('footer.newsletter_placeholder')} className="bg-transparent w-full outline-none text-sm placeholder:text-slate-400 text-slate-900" />
                            <button type="submit" className="text-xs font-bold uppercase tracking-widest text-slate-900 hover:text-brand-primary">{t('footer.newsletter_button')}</button>
                        </form>
                    </div>

                    {/* Links 1 */}
                    <div className="md:col-span-2 md:col-start-7">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-brand-secondary mb-6">{t('header.nav.shop')}</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-slate-600 hover:text-brand-primary transition-colors">{t('footer.links.all_coffee')}</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-brand-primary transition-colors">{t('footer.links.subscriptions')}</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-brand-primary transition-colors">{t('footer.links.equipment')}</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-brand-primary transition-colors">{t('footer.links.merch')}</a></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div className="md:col-span-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-brand-secondary mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-slate-600 hover:text-brand-primary transition-colors">{t('footer.links.our_story')}</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-brand-primary transition-colors">{t('header.nav.locations')}</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-brand-primary transition-colors">{t('footer.links.careers')}</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-brand-primary transition-colors">{t('footer.links.contact')}</a></li>
                        </ul>
                    </div>

                    {/* Links 3 */}
                    <div className="md:col-span-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-brand-secondary mb-6">{t('header.nav.wholesale')}</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-slate-600 hover:text-brand-primary transition-colors">{t('footer.links.partner')}</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-brand-primary transition-colors">{t('footer.links.client_login')}</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-brand-primary transition-colors">{t('footer.links.training')}</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 gap-6">
                    <div className="flex gap-6">
                        <a href="#" className="text-slate-400 hover:text-brand-primary transition-colors"><Instagram className="w-5 h-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-brand-primary transition-colors"><Facebook className="w-5 h-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-brand-primary transition-colors"><Twitter className="w-5 h-5" /></a>
                    </div>
                    <div className="flex gap-8 text-[10px] uppercase tracking-widest text-slate-400">
                        <a href="#" className="hover:text-brand-secondary">{t('footer.legal.privacy')}</a>
                        <a href="#" className="hover:text-brand-secondary">{t('footer.legal.terms')}</a>
                        <span>{t('footer.copyright')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
