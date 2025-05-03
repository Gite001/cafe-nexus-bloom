
import { ProductType, LanguageType } from "@/types/cafeTypes";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: ProductType[];
  addToOrder: (product: ProductType) => void;
  language: LanguageType;
  currency: string;
}

const ProductGrid = ({ products, addToOrder, language, currency }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p className="text-xl">
          {language === "fr" 
            ? "Aucun produit dans cette catégorie" 
            : "No products in this category"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card
          key={product.id}
          className={cn(
            "overflow-hidden transition-all hover:shadow-lg cursor-pointer group",
            "hover:-translate-y-1 duration-300"
          )}
          onClick={() => addToOrder(product)}
        >
          <div className="relative p-2">
            <AspectRatio ratio={1 / 1} className="bg-muted rounded-full overflow-hidden mb-2 mx-auto w-3/4">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name[language]}
                  className="object-cover h-full w-full transition-transform group-hover:scale-110 duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted-foreground/20 text-muted-foreground">
                  {language === "fr" ? "Aucune image" : "No image"}
                </div>
              )}
            </AspectRatio>
            
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold text-lg mb-1">{product.name[language]}</h3>
              <p className="font-bold text-xl">{currency}{product.price.toFixed(2)}</p>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
