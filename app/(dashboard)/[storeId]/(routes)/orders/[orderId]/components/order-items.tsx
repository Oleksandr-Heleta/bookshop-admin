import { useFormContext } from "react-hook-form";
import { Trash, CheckIcon, ChevronDown, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OrderFormValues } from "./schemas";
import { ProductWithNumberPrice } from "./types";

interface OrderItemsProps {
  form: ReturnType<typeof useFormContext<OrderFormValues>>;
  products: ProductWithNumberPrice[];
  loading: boolean;
  orderItems?: OrderFormValues["orderItems"];
}

export const OrderItems: React.FC<OrderItemsProps> = ({
  form,
  orderItems,
  products,
  loading,
}) => {
  const router = useRouter();

  const addOrderItem = () => {
    form.setValue("orderItems", [
      ...(form.getValues("orderItems") || []),
      { productId: "", quantity: 1 },
    ]);
    router.refresh();
  };

  const removeOrderItem = (index: number) => {
    form.setValue(
      "orderItems",
      form.getValues("orderItems").filter((_, i) => i !== index)
    );
    router.refresh();
  };

  return (
    <div>
        {form.getValues("orderItems")?.map((item, index) => (
            <div
              key={index}
              className=" grid grid-cols-1 lg:grid-cols-3 items-end gap-8 mb-2"
            >
              <FormField
                control={form.control}
                name={`orderItems.${index}.productId`}
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-between">
                    <FormLabel>Товар</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? products.find(
                                  (product) => product.id === field.value
                                )?.name
                              : "Виберіть товар"}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Пошук товару..."
                            className="h-9"
                          />
                          <CommandEmpty>Продукт не знайдено.</CommandEmpty>
                          <CommandGroup>
                            {products.map(
                              (product) =>
                                !product.isArchived && (
                                  <CommandItem
                                    value={product.name}
                                    key={product.id}
                                    onSelect={() => {
                                      form.setValue(
                                        `orderItems.${index}.productId`,
                                        product.id
                                      );
                                    }}
                                  >
                                    {product.name}
                                    <CheckIcon
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        product.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                )
                            )}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`orderItems.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Кількість</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        max={
                          orderItems
                            ? (products.find(
                                (product) => product.id === item.productId
                              )?.quantity ?? 0) +
                              Number(
                                orderItems.find(
                                  (orderItem) =>
                                    orderItem.productId == item.productId
                                )?.quantity
                              )
                            : products.find(
                                (product) => product.id === item.productId
                              )?.quantity
                        }
                        disabled={loading}
                        value={field.value.toString()}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                onClick={() => removeOrderItem(index)}
                variant="destructive"
                size="icon"
              >
                {" "}
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
      <Button type="button" onClick={addOrderItem}>
        <Plus className="mr-2 h-4 w-4" />
        Додати
      </Button>
    </div>
  );
};
