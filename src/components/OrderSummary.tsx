
import { OrderItemType, LanguageType } from "@/types/cafeTypes";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Trash } from "lucide-react";

interface OrderSummaryProps {
  orderItems: OrderItemType[];
  language: LanguageType;
  currency: string;
  confirmOrder: () => void;
  clearOrder: () => void;
}

const OrderSummary = ({ 
  orderItems, 
  language, 
  currency, 
  confirmOrder, 
  clearOrder 
}: OrderSummaryProps) => {
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="w-full md:w-80 bg-card rounded-lg shadow-md p-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-4">
        {language === "fr" ? "Commande en cours" : "Current Order"}
      </h2>
      
      {orderItems.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-muted-foreground">
          <p>{language === "fr" ? "Panier vide" : "Cart empty"}</p>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-grow h-[calc(100vh-400px)]">
            <ul className="space-y-3">
              {orderItems.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name[language]} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-grow">
                    <p className="font-medium">{item.name[language]}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {currency}{item.price.toFixed(2)} x {item.quantity}
                      </span>
                      <span className="font-bold">
                        {currency}{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between font-bold mb-4">
              <span>{language === "fr" ? "Total" : "Total"}</span>
              <span>{currency}{total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
      
      <div className="flex gap-2 mt-4">
        <Button 
          className="flex-1"
          variant="destructive"
          onClick={clearOrder}
          disabled={orderItems.length === 0}
        >
          <X className="mr-1" size={18} />
          {language === "fr" ? "Annuler" : "Cancel"}
        </Button>
        
        <Button 
          className="flex-1"
          onClick={confirmOrder}
          disabled={orderItems.length === 0}
        >
          <Check className="mr-1" size={18} />
          {language === "fr" ? "Confirmer" : "Confirm"}
        </Button>
      </div>
    </div>
  );
};

export default OrderSummary;
