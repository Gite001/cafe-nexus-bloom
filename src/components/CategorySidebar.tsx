
import { CategoryType, LanguageType } from "@/types/cafeTypes";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategorySidebarProps {
  categories: CategoryType[];
  selectedCategory: string;
  setSelectedCategory: (categoryId: string) => void;
  language: LanguageType;
}

const CategorySidebar = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  language 
}: CategorySidebarProps) => {
  return (
    <div className="w-full md:w-72 bg-card rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">
        {language === "fr" ? "Catégories" : "Categories"}
      </h2>
      
      <ScrollArea className="h-[calc(100vh-240px)]">
        <div className="flex flex-col gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className="justify-start text-left"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name[language]}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CategorySidebar;
