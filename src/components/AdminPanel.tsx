
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategoryType, ProductType, LanguageType } from "@/types/cafeTypes";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Upload, Plus, Trash, Edit, X } from "lucide-react"; // Added the X icon import here
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface AdminPanelProps {
  language: LanguageType;
  cafeName: string;
  setCafeName: (name: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  categories: CategoryType[];
  setCategories: (categories: CategoryType[]) => void;
  products: ProductType[];
  setProducts: (products: ProductType[]) => void;
}

// Form schemas
const cafeSettingsSchema = z.object({
  cafeName: z.string().min(1, {
    message: "Cafe name cannot be empty",
  }),
  currency: z.string().min(1, {
    message: "Currency symbol cannot be empty",
  }),
});

const categorySchema = z.object({
  nameFr: z.string().min(1, {
    message: "Category name (FR) cannot be empty",
  }),
  nameEn: z.string().min(1, {
    message: "Category name (EN) cannot be empty",
  }),
});

const productSchema = z.object({
  nameFr: z.string().min(1, {
    message: "Product name (FR) cannot be empty",
  }),
  nameEn: z.string().min(1, {
    message: "Product name (EN) cannot be empty",
  }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  categoryId: z.string().min(1, {
    message: "Please select a category",
  }),
});

const AdminPanel = ({
  language,
  cafeName,
  setCafeName,
  currency,
  setCurrency,
  categories,
  setCategories,
  products,
  setProducts,
}: AdminPanelProps) => {
  const { toast } = useToast();
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);

  // Settings form
  const settingsForm = useForm<z.infer<typeof cafeSettingsSchema>>({
    resolver: zodResolver(cafeSettingsSchema),
    defaultValues: {
      cafeName: cafeName,
      currency: currency,
    },
  });

  // Category form
  const categoryForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nameFr: "",
      nameEn: "",
    },
  });

  // Product form
  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nameFr: "",
      nameEn: "",
      price: "",
      categoryId: categories.length > 1 ? categories[1].id : "all",
    },
  });

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: language === "fr" ? "Image trop volumineuse" : "Image too large",
        description: language === "fr" ? "L'image doit être inférieure à 5 Mo" : "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProductImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save cafe settings
  const onSettingsSave = (data: z.infer<typeof cafeSettingsSchema>) => {
    setCafeName(data.cafeName);
    setCurrency(data.currency);
    toast({
      title: language === "fr" ? "Paramètres sauvegardés" : "Settings saved",
      description: language === "fr" ? "Les paramètres ont été mis à jour" : "Settings have been updated",
    });
  };

  // Add or edit category
  const onCategorySave = (data: z.infer<typeof categorySchema>) => {
    if (editingCategory) {
      // Edit existing category
      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id
            ? {
                ...cat,
                name: { fr: data.nameFr, en: data.nameEn },
              }
            : cat
        )
      );
      
      toast({
        title: language === "fr" ? "Catégorie modifiée" : "Category modified",
        description: data.nameFr,
      });
    } else {
      // Add new category
      const newCategory: CategoryType = {
        id: `cat_${Date.now()}`,
        name: { fr: data.nameFr, en: data.nameEn },
      };
      
      setCategories([...categories, newCategory]);
      
      toast({
        title: language === "fr" ? "Catégorie ajoutée" : "Category added",
        description: data.nameFr,
      });
    }
    
    setOpenAddCategory(false);
    setEditingCategory(null);
    categoryForm.reset();
  };

  // Add or edit product
  const onProductSave = (data: z.infer<typeof productSchema>) => {
    if (!productImage && !editingProduct?.image) {
      toast({
        title: language === "fr" ? "Image requise" : "Image required",
        description: language === "fr" ? "Veuillez télécharger une image pour le produit" : "Please upload an image for the product",
        variant: "destructive",
      });
      return;
    }

    if (editingProduct) {
      // Edit existing product
      setProducts(
        products.map((prod) =>
          prod.id === editingProduct.id
            ? {
                ...prod,
                name: { fr: data.nameFr, en: data.nameEn },
                price: Number(data.price),
                categoryId: data.categoryId,
                image: productImage || editingProduct.image,
              }
            : prod
        )
      );
      
      toast({
        title: language === "fr" ? "Produit modifié" : "Product modified",
        description: data.nameFr,
      });
    } else {
      // Add new product
      const newProduct: ProductType = {
        id: `prod_${Date.now()}`,
        name: { fr: data.nameFr, en: data.nameEn },
        price: Number(data.price),
        categoryId: data.categoryId,
        image: productImage!,
      };
      
      setProducts([...products, newProduct]);
      
      toast({
        title: language === "fr" ? "Produit ajouté" : "Product added",
        description: data.nameFr,
      });
    }
    
    setOpenAddProduct(false);
    setEditingProduct(null);
    setProductImage(null);
    productForm.reset();
  };

  // Delete category
  const handleDeleteCategory = (categoryId: string) => {
    if (categoryId === "all") {
      toast({
        title: language === "fr" ? "Action impossible" : "Action not allowed",
        description: language === "fr" ? "Impossible de supprimer la catégorie par défaut" : "Cannot delete the default category",
        variant: "destructive",
      });
      return;
    }

    // Check if there are products in this category
    const hasProducts = products.some((prod) => prod.categoryId === categoryId);
    
    if (hasProducts) {
      toast({
        title: language === "fr" ? "Action impossible" : "Action not allowed",
        description: language === "fr" ? "Cette catégorie contient des produits" : "This category contains products",
        variant: "destructive",
      });
      return;
    }

    setCategories(categories.filter((cat) => cat.id !== categoryId));
    
    toast({
      title: language === "fr" ? "Catégorie supprimée" : "Category deleted",
      variant: "destructive",
    });
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((prod) => prod.id !== productId));
    
    toast({
      title: language === "fr" ? "Produit supprimé" : "Product deleted",
      variant: "destructive",
    });
  };

  // Edit category
  const handleEditCategory = (category: CategoryType) => {
    setEditingCategory(category);
    categoryForm.reset({
      nameFr: category.name.fr,
      nameEn: category.name.en,
    });
    setOpenAddCategory(true);
  };

  // Edit product
  const handleEditProduct = (product: ProductType) => {
    setEditingProduct(product);
    productForm.reset({
      nameFr: product.name.fr,
      nameEn: product.name.en,
      price: product.price.toString(),
      categoryId: product.categoryId,
    });
    setProductImage(product.image);
    setOpenAddProduct(true);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="absolute top-4 right-4">
            <Settings size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {language === "fr" ? "Paramètres de la cafétéria" : "Cafeteria Settings"}
            </SheetTitle>
            <SheetDescription>
              {language === "fr"
                ? "Gérez les paramètres, les catégories et les produits"
                : "Manage settings, categories and products"}
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="settings" className="mt-6">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="settings">
                {language === "fr" ? "Paramètres" : "Settings"}
              </TabsTrigger>
              <TabsTrigger value="categories">
                {language === "fr" ? "Catégories" : "Categories"}
              </TabsTrigger>
              <TabsTrigger value="products">
                {language === "fr" ? "Produits" : "Products"}
              </TabsTrigger>
            </TabsList>

            {/* Settings Tab */}
            <TabsContent value="settings" className="pt-4 space-y-4">
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSave)} className="space-y-4">
                  <FormField
                    control={settingsForm.control}
                    name="cafeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === "fr" ? "Nom de la cafétéria" : "Cafeteria Name"}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Ma Cafétéria" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={settingsForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{language === "fr" ? "Devise" : "Currency"}</FormLabel>
                        <FormControl>
                          <Input placeholder="€" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    {language === "fr" ? "Enregistrer" : "Save"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="pt-4 space-y-4">
              <Button onClick={() => {
                categoryForm.reset({ nameFr: "", nameEn: "" });
                setEditingCategory(null);
                setOpenAddCategory(true);
              }} className="w-full">
                <Plus size={18} className="mr-2" />
                {language === "fr" ? "Ajouter une catégorie" : "Add Category"}
              </Button>
              
              <div className="space-y-2">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{category.name[language]}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === "fr" ? category.name.en : category.name.fr}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        disabled={category.id === "all"}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={category.id === "all"}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="pt-4 space-y-4">
              <Button onClick={() => {
                productForm.reset({ 
                  nameFr: "", 
                  nameEn: "", 
                  price: "", 
                  categoryId: categories.length > 1 ? categories[1].id : "all" 
                });
                setEditingProduct(null);
                setProductImage(null);
                setOpenAddProduct(true);
              }} className="w-full">
                <Plus size={18} className="mr-2" />
                {language === "fr" ? "Ajouter un produit" : "Add Product"}
              </Button>
              
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <img 
                      src={product.image} 
                      alt={product.name[language]} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-grow">
                      <p className="font-medium">{product.name[language]}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {currency}{product.price.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">
                          {categories.find(c => c.id === product.categoryId)?.name[language]}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    {language === "fr" 
                      ? "Aucun produit. Ajoutez-en un pour commencer." 
                      : "No products. Add one to get started."}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openAddCategory} onOpenChange={setOpenAddCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory 
                ? (language === "fr" ? "Modifier une catégorie" : "Edit Category")
                : (language === "fr" ? "Ajouter une catégorie" : "Add Category")}
            </DialogTitle>
            <DialogDescription>
              {language === "fr" 
                ? "Entrez les détails de la catégorie en français et en anglais" 
                : "Enter category details in French and English"}
            </DialogDescription>
          </DialogHeader>

          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onCategorySave)} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="nameFr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === "fr" ? "Nom (Français)" : "Name (French)"}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Boissons" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={categoryForm.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === "fr" ? "Nom (Anglais)" : "Name (English)"}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Drinks" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">
                  {language === "fr" ? "Enregistrer" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <Dialog open={openAddProduct} onOpenChange={setOpenAddProduct}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct 
                ? (language === "fr" ? "Modifier un produit" : "Edit Product")
                : (language === "fr" ? "Ajouter un produit" : "Add Product")}
            </DialogTitle>
            <DialogDescription>
              {language === "fr" 
                ? "Entrez les détails du produit et téléchargez une image" 
                : "Enter product details and upload an image"}
            </DialogDescription>
          </DialogHeader>

          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(onProductSave)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "fr" ? "Image du produit" : "Product Image"}
                </label>
                <div className="flex flex-col items-center gap-2">
                  {productImage ? (
                    <div className="relative w-32 h-32">
                      <img 
                        src={productImage} 
                        alt="Product" 
                        className="w-full h-full object-cover rounded-full"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => setProductImage(null)}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <label htmlFor="product-image" className="cursor-pointer">
                      <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 text-sm rounded-md">
                        <Upload size={16} />
                        {language === "fr" ? "Télécharger" : "Upload"}
                      </div>
                      <input
                        id="product-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={productForm.control}
                  name="nameFr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === "fr" ? "Nom (Français)" : "Name (French)"}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Café" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={productForm.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === "fr" ? "Nom (Anglais)" : "Name (English)"}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Coffee" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={productForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "fr" ? "Prix" : "Price"}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0.01"
                        placeholder="2.50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={productForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === "fr" ? "Catégorie" : "Category"}
                    </FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        {...field}
                      >
                        {categories
                          .filter(cat => cat.id !== "all") // Exclude "All products" category
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name[language]}
                            </option>
                          ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">
                  {language === "fr" ? "Enregistrer" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;
