
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LanguageType } from "@/types/cafeTypes";

interface CafeHeaderProps {
  cafeName: string;
  language: LanguageType;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const CafeHeader = ({ cafeName, language, toggleLanguage, toggleTheme, isDarkMode }: CafeHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString(language === "fr" ? "fr-FR" : "en-US", {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-poppins">{cafeName}</h1>
          <div className="flex items-center gap-2 text-sm opacity-80">
            <Clock size={16} />
            <span>{formattedDate} - {formattedTime}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-2 md:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleLanguage}
            className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            {language === "fr" ? "EN" : "FR"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            {isDarkMode 
              ? (language === "fr" ? "Mode Clair" : "Light Mode") 
              : (language === "fr" ? "Mode Sombre" : "Dark Mode")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CafeHeader;
