import React from 'react'
import Navbar from "./components/Navbar"
import Section from "./components/Section"
import Category from './components/Category'
import Newly_arrived from './components/Newly_arrived'
import Footer from './components/Footer'
import Trending from './components/Trending'
import Looking_for from './components/Looking_for'
import Shop_faster from './components/Shop_faster'
import Recent_blog from './components/Recent_blog'
import Discount from './components/Discount'
import Banners from './components/Banners'
import Best_selling from './components/Best_selling'
import Just_arrived from './components/Just_arrived'

const App = () => {
  return (
    <div className=''>
    <Navbar />
    <Section />
    <Category />
    <Newly_arrived />
    <Trending />
    <Banners />
    <Best_selling />
    <Discount />
    <Just_arrived />
    <Recent_blog />
    <Shop_faster />
    <Looking_for />
    <Footer />    

    </div>
    
  )
}

export default App