import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import { Search, ArrowRight, Star, ShoppingBag, Stethoscope, Pill, Syringe, Leaf } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DomesticAnimalsBackground from '@/components/DomesticAnimalsBackground';

interface Product {
  id: string;
  name_en: string;
  name_rk: string | null;
  name_rn: string | null;
  description_en: string | null;
  description_rk: string | null;
  description_rn: string | null;
  price: number;
  category: string;
  image_url: string | null;
  in_stock: boolean;
}

// Rich static fallback catalog shown when DB returns 0 products
const FALLBACK_PRODUCTS: Product[] = [
  // ── Vaccines ──────────────────────────────────────────────────────────────
  {
    id: 'f1', name_en: 'FMD Vaccine (Foot & Mouth)', name_rk: 'Omunyu gw\'Ebigere', name_rn: null,
    description_en: 'Multi-strain inactivated FMD vaccine for cattle, goats and sheep. 50ml vial = 25 doses.',
    description_rk: 'Omuti gw\'omunyu gw\'ebigere ebitaabu era amagi.', description_rn: null,
    price: 85000, category: 'Vaccines', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
  },
  {
    id: 'f2', name_en: 'PPR Vaccine (Goat Plague)', name_rk: 'Omunyu gw\'Embuzi', name_rn: null,
    description_en: 'Thermostable live attenuated PPR vaccine. Protects small ruminants for 3 years.',
    description_rk: null, description_rn: null,
    price: 45000, category: 'Vaccines', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80',
  },
  {
    id: 'f3', name_en: 'Newcastle Disease Vaccine', name_rk: null, name_rn: null,
    description_en: 'I-2 thermotolerant ND vaccine for village poultry — no cold chain required.',
    description_rk: null, description_rn: null,
    price: 28000, category: 'Vaccines', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=600&q=80',
  },
  {
    id: 'f4', name_en: 'Anthrax Vaccine (Sterne Strain)', name_rk: null, name_rn: null,
    description_en: 'Live spore vaccine for cattle and sheep in anthrax-endemic areas of western Uganda.',
    description_rk: null, description_rn: null,
    price: 95000, category: 'Vaccines', in_stock: false,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
  },
  // ── Antiparasitics ────────────────────────────────────────────────────────
  {
    id: 'f5', name_en: 'Ivermectin 1% Injection', name_rk: 'Omuti gw\'Ebisowolo', name_rn: null,
    description_en: 'Broad-spectrum antiparasitic for roundworms, lungworms & mange mites. 50 ml bottle.',
    description_rk: 'Omuti ogukuuma ente okuva ku bisowolo.', description_rn: null,
    price: 62000, category: 'Antiparasitics', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80',
  },
  {
    id: 'f6', name_en: 'Albendazole Bolus 2500 mg', name_rk: null, name_rn: null,
    description_en: 'Oral bolus dewormer for cattle. Highly effective against liver fluke & tapeworms.',
    description_rk: null, description_rn: null,
    price: 18000, category: 'Antiparasitics', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
  },
  {
    id: 'f7', name_en: 'Acaricide Amitraz 12.5%', name_rk: 'Obusaasiro bw\'Ebisowolo', name_rn: null,
    description_en: 'Tick & mite pour-on / dip solution. 1-litre concentrate makes 50 litres dip.',
    description_rk: null, description_rn: null,
    price: 75000, category: 'Antiparasitics', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
  },
  // ── Antibiotics ───────────────────────────────────────────────────────────
  {
    id: 'f8', name_en: 'Oxytetracycline 20% LA', name_rk: 'Omusawo gw\'Obutwa', name_rn: null,
    description_en: 'Long-acting broad-spectrum antibiotic injection for cattle, pigs & poultry. 100 ml.',
    description_rk: 'Omuti ogulwanyisa obutwa obukakafu.', description_rn: null,
    price: 55000, category: 'Antibiotics', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80',
  },
  {
    id: 'f9', name_en: 'Amoxicillin 15% Injectable', name_rk: null, name_rn: null,
    description_en: 'Penicillin-group antibiotic for respiratory & urinary tract infections in livestock.',
    description_rk: null, description_rn: null,
    price: 48000, category: 'Antibiotics', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
  },
  {
    id: 'f10', name_en: 'Tylosin 20% Injectable', name_rk: null, name_rn: null,
    description_en: 'Macrolide antibiotic effective against mycoplasma & pneumonia in pigs and poultry.',
    description_rk: null, description_rn: null,
    price: 68000, category: 'Antibiotics', in_stock: false,
    image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
  },
  // ── Supplements ───────────────────────────────────────────────────────────
  {
    id: 'f11', name_en: 'Multivitamin Injection (ADE+B12)', name_rk: 'Vitamini z\'Ente', name_rn: null,
    description_en: 'Concentrated vitamins A, D3, E and B12 for deficiency prevention & improved fertility.',
    description_rk: 'Vitamini nzungu ez\'ente n\'embuzi.', description_rn: null,
    price: 38000, category: 'Supplements', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80',
  },
  {
    id: 'f12', name_en: 'Mineral Lick Block (10 kg)', name_rk: 'Omuyo gw\'Ebikande', name_rn: null,
    description_en: 'Salt + trace mineral block with selenium, zinc, copper & cobalt for grazing cattle.',
    description_rk: null, description_rn: null,
    price: 42000, category: 'Supplements', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&q=80',
  },
  // ── Equipment ─────────────────────────────────────────────────────────────
  {
    id: 'f13', name_en: 'Auto-Reset Drenching Gun (500 ml)', name_rk: null, name_rn: null,
    description_en: 'Durable stainless steel oral dosing gun for sheep, goats and small cattle. Adjustable dose.',
    description_rk: null, description_rn: null,
    price: 125000, category: 'Equipment', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=600&q=80',
  },
  {
    id: 'f14', name_en: 'Disposable Syringes 20 ml (100 pcs)', name_rk: null, name_rn: null,
    description_en: 'Sterile individually-packed syringes with 18G needles. Box of 100.',
    description_rk: null, description_rn: null,
    price: 35000, category: 'Equipment', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80',
  },
  {
    id: 'f15', name_en: 'Digital Livestock Thermometer', name_rk: null, name_rn: null,
    description_en: 'Fast-read rectal thermometer with alarm for abnormal temperatures. Waterproof.',
    description_rk: null, description_rn: null,
    price: 48000, category: 'Equipment', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=600&q=80',
  },
  // ── Feed & Nutrition ──────────────────────────────────────────────────────
  {
    id: 'f16', name_en: 'Calcium Borogluconate 40% (500 ml)', name_rk: null, name_rn: null,
    description_en: 'IV / subcutaneous solution for milk fever (hypocalcaemia) in dairy cows post-calving.',
    description_rk: null, description_rn: null,
    price: 52000, category: 'Supplements', in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&q=80',
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Vaccines: <Syringe className="h-3.5 w-3.5" />,
  Antibiotics: <Pill className="h-3.5 w-3.5" />,
  Antiparasitics: <Leaf className="h-3.5 w-3.5" />,
  Supplements: <Star className="h-3.5 w-3.5" />,
  Equipment: <Stethoscope className="h-3.5 w-3.5" />,
};

const Products = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const mappedProducts: Product[] = (data || []).map(p => ({
        id: p.id,
        name_en: p.name_en,
        name_rk: p.name_rk,
        name_rn: p.name_rn,
        description_en: p.description_en,
        description_rk: p.description_rk,
        description_rn: p.description_rn,
        price: p.price ?? 0,
        category: p.category ?? 'General',
        image_url: p.image_url,
        in_stock: p.in_stock ?? true,
      }));

      setDbProducts(mappedProducts);
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: 'Using offline catalog', description: error.message || 'Showing sample products.', variant: 'default' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Prefer DB products; fall back to static catalog if DB is empty
  const allProducts: Product[] = dbProducts.length > 0 ? dbProducts : FALLBACK_PRODUCTS;

  const categories = ['all', ...Array.from(new Set(allProducts.map(p => p.category)))];

  const getName = (p: Product) =>
    lang === 'en' ? p.name_en : (p.name_rk || p.name_rn || p.name_en);
  const getDesc = (p: Product) =>
    lang === 'en' ? p.description_en : (p.description_rk || p.description_rn || p.description_en);

  const filteredProducts = allProducts.filter(p => {
    const matchesSearch =
      p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.name_rk?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.name_rn?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOrderNow = (p: Product) => {
    const productName = getName(p);
    const productPrice = p.price.toLocaleString();
    const message = `Hello Kigezi Veterinary Services, I would like to order ${productName} (UGX ${productPrice}).`;
    const whatsappUrl = `https://wa.me/256793322520?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-6 relative overflow-hidden transition-colors duration-500">
      {/* Dynamic African Livestock Background */}
      <DomesticAnimalsBackground />

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 z-[1] bg-black/50 pointer-events-none" />

      <div className="container mx-auto relative z-10">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="mb-14 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="mb-5 px-8 py-2 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] bg-primary/10 text-primary border border-primary/20 shadow-sm backdrop-blur-md">
            <ShoppingBag className="h-3 w-3 mr-2 inline" />
            Veterinary Product Catalog
          </Badge>
          <h1 className="mb-5 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl uppercase leading-none">
            {t('nav.products', lang)}
          </h1>
          <p className="mx-auto max-w-xl text-lg font-medium text-foreground/40 md:text-xl leading-relaxed">
            High-grade veterinary solutions for modern Ugandan agriculture
          </p>
        </div>

        {/* ── Search + Filter ───────────────────────────────────────── */}
        <div className="mb-12 flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/30" />
            <Input
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 md:h-16 pl-16 pr-6 rounded-xl md:rounded-2xl bg-card border border-foreground/5 text-sm md:text-base font-medium text-foreground placeholder:text-foreground/25 focus:border-primary transition-all shadow-xl"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {categories.map(cat => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={[
                  'h-10 md:h-12 px-5 md:px-8 rounded-xl font-bold uppercase tracking-widest text-[9px] md:text-xs transition-all flex items-center gap-2',
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-lg border border-primary/20'
                    : 'bg-card text-foreground/50 border border-foreground/5 hover:border-primary/30 hover:text-primary',
                ].join(' ')}
              >
                {cat !== 'all' && CATEGORY_ICONS[cat]}
                {cat === 'all' ? 'All Products' : cat}
              </Button>
            ))}
          </div>
        </div>

        {/* ── Loading skeleton ──────────────────────────────────────── */}
        {loading && (
          <div className="grid gap-6 md:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-foreground/5 animate-pulse">
                <div className="aspect-square bg-muted/50" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Product Grid ──────────────────────────────────────────── */}
        {!loading && (
          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((p, idx) => (
              <div
                key={p.id}
                className="group relative bg-card rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl flex flex-col h-full border border-foreground/5"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Image */}
                <div className="aspect-square relative overflow-hidden bg-muted/20">
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&q=80'}
                    alt={getName(p)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&q=80';
                    }}
                  />
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 dark:bg-black/70 text-primary border-none font-bold uppercase tracking-widest shadow-md backdrop-blur-md text-[9px] flex items-center gap-1">
                      {CATEGORY_ICONS[p.category]}
                      {p.category}
                    </Badge>
                  </div>
                  {/* Stock badge */}
                  <div className="absolute top-3 right-3">
                    {p.in_stock ? (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-green-400/30 animate-pulse" title="In stock" />
                    ) : (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-400/30" title="Out of stock" />
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 md:p-6 flex flex-col flex-grow">
                  <h3 className="mb-2 text-base md:text-lg font-display font-bold text-foreground uppercase tracking-tight line-clamp-2 leading-snug">
                    {getName(p)}
                  </h3>

                  <p className="mb-4 text-[11px] md:text-xs font-medium text-foreground/40 line-clamp-3 leading-relaxed flex-grow">
                    {getDesc(p) || '—'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl md:text-2xl font-display font-bold text-primary tracking-tight">
                      UGX {p.price.toLocaleString()}
                    </span>
                    <Badge
                      variant="outline"
                      className={p.in_stock
                        ? 'text-[9px] uppercase tracking-widest border-green-500/40 text-green-500 bg-green-500/5'
                        : 'text-[9px] uppercase tracking-widest border-red-500/40 text-red-500 bg-red-500/5'
                      }
                    >
                      {p.in_stock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>

                  <Button
                    className="w-full h-11 md:h-12 rounded-xl font-bold uppercase tracking-[0.15em] bg-secondary hover:brightness-110 text-white shadow-lg transition-all active:scale-[0.98] text-[10px] md:text-xs"
                    disabled={!p.in_stock}
                    onClick={() => handleOrderNow(p)}
                  >
                    {p.in_stock ? (
                      <span className="flex items-center gap-2">
                        Order Now <ArrowRight className="h-4 w-4" />
                      </span>
                    ) : 'Out of Stock'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────── */}
        {!loading && filteredProducts.length === 0 && (
          <div className="py-28 text-center">
            <ShoppingBag className="mx-auto mb-5 h-12 w-12 text-foreground/10" />
            <p className="text-xl font-bold uppercase tracking-widest text-foreground/20">
              No Products Found
            </p>
            <p className="mt-2 text-sm text-foreground/30">Try a different search or category</p>
          </div>
        )}

        {/* Stats bar */}
        {!loading && (
          <p className="mt-14 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/20">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} · Kigezi Veterinary Catalog
          </p>
        )}
      </div>
    </div>
  );
};

export default Products;
