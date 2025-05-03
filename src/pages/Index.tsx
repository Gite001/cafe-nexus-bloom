
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import CafeHeader from "@/components/CafeHeader";
import ProductGrid from "@/components/ProductGrid";
import OrderSummary from "@/components/OrderSummary";
import CategorySidebar from "@/components/CategorySidebar";
import AdminPanel from "@/components/AdminPanel";
import { ProductType, CategoryType, OrderItemType, LanguageType } from "@/types/cafeTypes";

const Index = () => {
  const { toast } = useToast();
  const [language, setLanguage] = useState<LanguageType>("fr");
  const [cafeName, setCafeName] = useState<string>("Ma Cafétéria");
  const [currency, setCurrency] = useState<string>("€");
  const [categories, setCategories] = useState<CategoryType[]>([
    { id: "all", name: { fr: "Tous les produits", en: "All products" } }
  ]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentOrder, setCurrentOrder] = useState<OrderItemType[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("cafeLanguage");
    const savedCafeName = localStorage.getItem("cafeName");
    const savedCurrency = localStorage.getItem("cafeCurrency");
    const savedCategories = localStorage.getItem("cafeCategories");
    const savedProducts = localStorage.getItem("cafeProducts");
    const savedTheme = localStorage.getItem("cafeDarkMode");

    if (savedLanguage) setLanguage(savedLanguage as LanguageType);
    if (savedCafeName) setCafeName(savedCafeName);
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        if (Array.isArray(parsedCategories)) {
          // Ensure "All products" category always exists
          const allProductsCategory = parsedCategories.find(cat => cat.id === "all");
          if (!allProductsCategory) {
            parsedCategories.unshift({ 
              id: "all", 
              name: { fr: "Tous les produits", en: "All products" } 
            });
          }
          setCategories(parsedCategories);
        }
      } catch (e) {
        console.error("Error parsing categories:", e);
      }
    }
    
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        if (Array.isArray(parsedProducts)) {
          setProducts(parsedProducts);
        }
      } catch (e) {
        console.error("Error parsing products:", e);
      }
    }
    
    if (savedTheme === "dark") setIsDarkMode(true);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cafeLanguage", language);
    localStorage.setItem("cafeName", cafeName);
    localStorage.setItem("cafeCurrency", currency);
    localStorage.setItem("cafeCategories", JSON.stringify(categories));
    localStorage.setItem("cafeProducts", JSON.stringify(products));
    localStorage.setItem("cafeDarkMode", isDarkMode ? "dark" : "light");
  }, [language, cafeName, currency, categories, products, isDarkMode]);

  // Toggle theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Add product to order
  const addToOrder = (product: ProductType) => {
    setCurrentOrder(prevOrder => {
      const existingItem = prevOrder.find(item => item.productId === product.id);
      
      if (existingItem) {
        return prevOrder.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevOrder, { 
          productId: product.id, 
          name: product.name, 
          price: product.price, 
          quantity: 1,
          image: product.image
        }];
      }
    });

    toast({
      title: language === "fr" ? "Produit ajouté" : "Product added",
      description: `${product.name[language]} (${currency}${product.price})`,
      duration: 1500,
    });
  };

  // Clear the current order
  const clearOrder = () => {
    setCurrentOrder([]);
    toast({
      title: language === "fr" ? "Commande annulée" : "Order canceled",
      variant: "destructive",
      duration: 1500,
    });
  };

  // Confirm the order
  const confirmOrder = () => {
    // Here we would normally send the order to a backend
    // For now, just clear the order and show a success message
    
    const orderTotal = currentOrder.reduce(
      (sum, item) => sum + item.price * item.quantity, 
      0
    ).toFixed(2);
    
    toast({
      title: language === "fr" ? "Commande confirmée" : "Order confirmed",
      description: `${language === "fr" ? "Total" : "Total"}: ${currency}${orderTotal}`,
      duration: 3000,
    });
    
    // Save the order to history (could be expanded later)
    const orderHistory = JSON.parse(localStorage.getItem("cafeOrderHistory") || "[]");
    orderHistory.push({
      id: Date.now(),
      items: currentOrder,
      total: orderTotal,
      date: new Date().toISOString(),
    });
    localStorage.setItem("cafeOrderHistory", JSON.stringify(orderHistory));
    
    setCurrentOrder([]);
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(prev => prev === "fr" ? "en" : "fr");
    toast({
      title: language === "fr" ? "Language: English" : "Langue : Français",
      duration: 1500,
    });
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    toast({
      title: isDarkMode 
        ? (language === "fr" ? "Thème clair activé" : "Light theme enabled") 
        : (language === "fr" ? "Thème sombre activé" : "Dark theme enabled"),
      duration: 1500,
    });
  };

  // Filter products by selected category
  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.categoryId === selectedCategory);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? "dark" : ""}`}>
      <CafeHeader 
        cafeName={cafeName} 
        language={language}
        toggleLanguage={toggleLanguage}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />
      
      <div className="flex flex-col md:flex-row flex-grow p-4 gap-4">
        <CategorySidebar 
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          language={language}
        />
        
        <div className="flex-grow">
          <ProductGrid 
            products={filteredProducts} 
            addToOrder={addToOrder}
            language={language}
            currency={currency}
          />
        </div>
        
        <OrderSummary 
          orderItems={currentOrder}
          language={language}
          currency={currency}
          confirmOrder={confirmOrder}
          clearOrder={clearOrder}
        />
      </div>
      
      <AdminPanel
        language={language}
        cafeName={cafeName}
        setCafeName={setCafeName}
        currency={currency}
        setCurrency={setCurrency}
        categories={categories}
        setCategories={setCategories}
        products={products}
        setProducts={setProducts}
      />
    </div>
  );
};

export default Index;
