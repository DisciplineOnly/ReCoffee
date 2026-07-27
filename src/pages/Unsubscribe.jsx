import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The unsubscribe link the privacy policy promises (§6 in
 * src/data/legalContent.js). The token is a uuid in the query string:
 * /unsubscribe?token=<unsubscribe_token>.
 *
 * The result is deliberately the same whether the token removed a row, was
 * already used, or never existed — `unsubscribe_newsletter()` returns void in
 * every case. Reporting "you were not subscribed" would turn this page into a
 * membership oracle, which is the leak T11 closed on the signup side.
 */
export default function Unsubscribe() {
    const { t } = useTranslation();
    const [params] = useSearchParams();
    const token = params.get('token');
    // Derived at render, not set from the effect: whether the URL carries a
    // well-formed token is knowable without asking the server, and setting it
    // in an effect is both a wasted render and a lint warning.
    const tokenValid = !!token && UUID_RE.test(token);
    const [state, setState] = useState(tokenValid ? 'working' : 'invalid');
    // React 18 StrictMode mounts effects twice in development; the RPC is
    // idempotent so a second call is harmless, but the guard keeps the network
    // tab honest.
    const sent = useRef(false);

    useSEO({ title: t('unsubscribe.title'), noindex: true });

    useEffect(() => {
        if (!tokenValid || sent.current) return;
        sent.current = true;

        supabase
            .rpc('unsubscribe_newsletter', { p_token: token })
            .then(({ error }) => {
                if (error) {
                    console.error('Unsubscribe failed:', error);
                    setState('error');
                } else {
                    setState('done');
                }
            });
    }, [token, tokenValid]);

    return (
        <div className="min-h-screen bg-[#F6F4F2] pt-16 pb-24">
            <div className="max-w-2xl mx-auto px-6 md:px-12">
                <div className="bg-white rounded-lg p-8 md:p-12 text-center">
                    {state === 'working' && (
                        <p className="text-slate-500">{t('common.loading')}</p>
                    )}

                    {state === 'done' && (
                        <>
                            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-5" aria-hidden="true" />
                            <h1 className="text-2xl md:text-3xl font-serif text-slate-900 mb-3">
                                {t('unsubscribe.done_title')}
                            </h1>
                            <p className="text-slate-600">{t('unsubscribe.done_message')}</p>
                        </>
                    )}

                    {(state === 'invalid' || state === 'error') && (
                        <>
                            <AlertTriangle className="w-12 h-12 text-brand-primary mx-auto mb-5" aria-hidden="true" />
                            <h1 className="text-2xl md:text-3xl font-serif text-slate-900 mb-3">
                                {t('unsubscribe.error_title')}
                            </h1>
                            <p className="text-slate-600">{t('unsubscribe.error_message')}</p>
                        </>
                    )}

                    <Link
                        to="/"
                        className="mt-8 inline-block bg-brand-primary text-white py-4 px-8 text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors"
                    >
                        {t('common.back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
