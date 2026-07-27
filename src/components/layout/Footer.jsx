import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Check } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { siteConfig } from '../../lib/siteConfig';
import logo from '../../assets/logo.jpg';

const footerLinkClass = 'text-sm text-slate-600 hover:text-brand-primary transition-colors';

export default function Footer() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'already' | 'error' | 'invalid'

    const handleSubscribe = async (e) => {
        e.preventDefault();
        const value = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setStatus('invalid');
            return;
        }
        setStatus('loading');
        const { error } = await supabase
            .rpc('subscribe_newsletter', { p_email: value });

        if (!error) {
            setStatus('success');
            setEmail('');
        } else if (error.code === '23505') {
            // unique violation — already subscribed. NOTE: this branch is the
            // subscriber-enumeration leak T11 removes; it is left in place here
            // so T10 changes only the transport, not the behaviour.
            setStatus('already');
        } else if (error.message === 'RATE_LIMITED') {
            setStatus('rate_limited');
        } else {
            console.error('Newsletter subscription failed:', error);
            setStatus('error');
        }
    };

    const statusMessage = {
        success: { text: t('newsletter.success'), className: 'text-green-600' },
        already: { text: t('newsletter.already'), className: 'text-slate-500' },
        error: { text: t('newsletter.error'), className: 'text-red-600' },
        invalid: { text: t('newsletter.invalid'), className: 'text-red-600' },
        rate_limited: { text: t('newsletter.rate_limited'), className: 'text-red-600' },
    }[status];

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
                        <form className="flex border-b border-slate-300 pb-2 max-w-xs" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setStatus(null); }}
                                placeholder={t('footer.newsletter_placeholder')}
                                className="bg-transparent w-full outline-none text-sm placeholder:text-slate-400 text-slate-900"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="text-xs font-bold uppercase tracking-widest text-slate-900 hover:text-brand-primary disabled:opacity-50 flex items-center gap-1"
                            >
                                {status === 'success' ? <Check className="w-4 h-4 text-green-600" /> : t('footer.newsletter_button')}
                            </button>
                        </form>
                        {statusMessage && (
                            <p className={`mt-2 text-xs ${statusMessage.className}`}>{statusMessage.text}</p>
                        )}
                        <div className="mt-8 text-xs text-slate-400 space-y-1">
                            <p>{siteConfig.legalName} · {siteConfig.vatNumber}</p>
                            <p>{siteConfig.address}</p>
                            <p>
                                <a href={siteConfig.phoneHref} className="hover:text-brand-primary transition-colors">{siteConfig.phone}</a>
                                {' · '}
                                <a href={`mailto:${siteConfig.email}`} className="hover:text-brand-primary transition-colors">{siteConfig.email}</a>
                            </p>
                        </div>
                    </div>

                    {/* Links 1: Shop */}
                    <div className="md:col-span-2 md:col-start-7">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-brand-secondary mb-6">{t('header.nav.shop')}</h4>
                        <ul className="space-y-4">
                            <li><Link to="/shop" className={footerLinkClass}>{t('footer.links.all_coffee')}</Link></li>
                            <li><Link to="/shop?category=grains" className={footerLinkClass}>{t('shop.badge_grains')}</Link></li>
                            <li><Link to="/shop?category=capsules" className={footerLinkClass}>{t('shop.badge_capsules')}</Link></li>
                            <li><Link to="/shop?category=machines-personal" className={footerLinkClass}>{t('shop.badge_machines_personal')}</Link></li>
                            <li><Link to="/shop?category=machines-professional" className={footerLinkClass}>{t('shop.badge_machines_professional')}</Link></li>
                            <li><Link to="/subscription" className={footerLinkClass}>{t('footer.links.subscriptions')}</Link></li>
                            <li><Link to="/wishlist" className={footerLinkClass}>{t('footer.links.wishlist')}</Link></li>
                        </ul>
                    </div>

                    {/* Links 2: Company */}
                    <div className="md:col-span-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-brand-secondary mb-6">{t('footer.company_group')}</h4>
                        <ul className="space-y-4">
                            <li><Link to="/about" className={footerLinkClass}>{t('footer.links.our_story')}</Link></li>
                            <li><Link to="/learn" className={footerLinkClass}>{t('footer.links.learn')}</Link></li>
                            <li><Link to="/contact" className={footerLinkClass}>{t('footer.links.contact')}</Link></li>
                        </ul>
                    </div>

                    {/* Links 3: Wholesale */}
                    <div className="md:col-span-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-brand-secondary mb-6">{t('header.nav.wholesale')}</h4>
                        <ul className="space-y-4">
                            <li><Link to="/wholesale" className={footerLinkClass}>{t('footer.links.partner')}</Link></li>
                            <li><Link to="/account" className={footerLinkClass}>{t('footer.links.client_login')}</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 gap-6">
                    <div className="flex gap-6">
                        <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-brand-primary transition-colors"><Instagram className="w-5 h-5" /></a>
                        <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-slate-400 hover:text-brand-primary transition-colors"><Facebook className="w-5 h-5" /></a>
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[10px] uppercase tracking-widest text-slate-400">
                        <Link to="/privacy" className="hover:text-brand-secondary">{t('footer.legal.privacy')}</Link>
                        <Link to="/terms" className="hover:text-brand-secondary">{t('footer.legal.terms')}</Link>
                        <Link to="/cookies" className="hover:text-brand-secondary">{t('footer.legal.cookies')}</Link>
                        <span>{t('footer.copyright')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
