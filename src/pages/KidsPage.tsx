import { useProducts } from '../contexts/ProductContext';
import ProductGrid from '../components/ProductGrid';
import ParallaxSection from '../components/ParallaxSection';

export default function KidsPage() {
  const { products } = useProducts();
  const kidsProducts = products.filter(product => product.category === 'Kids');

  return (
    <ParallaxSection
      backgroundImage="https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=3440&q=80"
      className="min-h-screen pt-16"
      speed={0.3}
    >
      <ProductGrid
        title="Kids Collection"
        description="Playful and Comfortable Styles for Children"
        products={kidsProducts}
      />
    </ParallaxSection>
  );
}