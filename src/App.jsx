import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import ShopFavorites from './components/ShopFavorites';
import Philosophy from './components/Philosophy';
import Subscription from './components/Subscription';
import VisitUs from './components/VisitUs';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero />
      <Marquee />
      <ShopFavorites />
      <Philosophy />
      <Subscription />
      <VisitUs />
      <Footer />
    </div>
  );
}

export default App;
