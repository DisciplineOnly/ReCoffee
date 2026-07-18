import React from 'react';
import Hero from '../components/sections/Hero';
import Marquee from '../components/sections/Marquee';
import ShopFavorites from '../components/sections/ShopFavorites';
import Philosophy from '../components/sections/Philosophy';
import Subscription from '../components/sections/Subscription';
import VisitUs from '../components/sections/VisitUs';
import { useSEO } from '../hooks/useSEO';

export default function Home() {
    useSEO({});
    return (
        <>
            <Hero />
            <Marquee />
            <ShopFavorites />
            <Philosophy />
            <Subscription />
            <VisitUs />
        </>
    );
}
