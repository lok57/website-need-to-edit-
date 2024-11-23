import { useProducts } from '../contexts/ProductContext';
import ProductGrid from '../components/ProductGrid';
import ParallaxSection from '../components/ParallaxSection';

export default function WomensPage() {
  const { products } = useProducts();
  const womensProducts = products.filter(product => product.category === 'Women');

  return (
    <ParallaxSection
      backgroundImage="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=3440&q=80"
      className="min-h-screen pt-16"
      speed={0.3}
    >
      <ProductGrid
        title="Women's Collection"
        description="Elegant Styles for Women"
        products={womensProducts}
      />
    </ParallaxSection>
  );
}