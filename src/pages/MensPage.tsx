import { useProducts } from '../contexts/ProductContext';
import ProductGrid from '../components/ProductGrid';
import ParallaxSection from '../components/ParallaxSection';

export default function MensPage() {
  const { products } = useProducts();
  const mensProducts = products.filter(product => product.category === 'Men');

  return (
    <ParallaxSection
      backgroundImage="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=3440&q=80"
      className="min-h-screen pt-16"
      speed={0.3}
    >
      <ProductGrid
        title="Men's Collection"
        description="Premium Fashion for Men"
        products={mensProducts}
      />
    </ParallaxSection>
  );
}