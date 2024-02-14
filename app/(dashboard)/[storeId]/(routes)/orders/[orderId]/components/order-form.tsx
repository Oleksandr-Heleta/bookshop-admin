"use client";

import { Order, OrderItem, Image, Product } from "@prisma/client";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Trash, CheckIcon, ChevronDown, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import * as z from "zod";
import { set, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import ImageUpload from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
});

const orderSchema = z.object({
  name: z.string().min(1),
  orderStatus: z.string().min(1),
  phone: z.string().min(7),
  address: z.string().min(1),
  orderItems: z.array(orderItemSchema),
  isPaid: z.boolean().default(false),
});

interface OrderFormProps {
  initialData:
    | (Order & {
        orderItems: OrderItem[];
      })
    | null;

  products: Product[] & {
    images: Image[];
  };
}

type OrderFormValues = z.infer<typeof orderSchema>;

export const OrderForm: React.FC<OrderFormProps> = ({
  initialData,
  products,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const statuses = [
    { name: "Нове замовлення", value: "recived" },
    { name: "Оплачено", value: "paided" },
    { name: "Відправлено", value: "sended" },
    { name: "Відхилено", value: "canceled" },
  ];

  const title = initialData ? "Редагування замовлення" : "Створення замовлення";
  const description = initialData
    ? "Редагувати замовлення"
    : "Додати нове замовлення";
  const toastMessage = initialData
    ? "Замовлення оновлено."
    : "Замовлення створено.";
  const action = initialData ? "Зберегти зміни" : "Створити";

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          orderItems: initialData.orderItems?.map((orderItem)=> {return {productId: orderItem.productId,
            quantity: parseInt(String(orderItem.quantity))}}),
        }
      : {
          orderItems: [{ productId: "", quantity: 1 }],
          name: "",
          orderStatus: "",
          isPaid: false,
          phone: "",
          address: "",
        },
  });

  const addOrderItem = () => {
    form.setValue("orderItems", [
      ...(form.getValues("orderItems") || []),
      { productId: "", quantity: 1 },
    ]);
    router.refresh();
    console.log(form.getValues("orderItems"));
  };

  const removeOrderItem = (index: number) => {
    form.setValue(
      "orderItems",
      form.getValues("orderItems").filter((_, i) => i !== index)
    );
    router.refresh();
  };

  const onSubmit = async (data: OrderFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        console.log(data);
        console.log(data.orderItems.map((item)=>typeof item.quantity));
        await axios.patch(
          `/api/${params.storeId}/orders/${params.orderId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/orders`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/orders`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Щось пішло не так!");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/orders/${params.orderId}`);
      router.refresh();
      router.push(`/${params.storeId}/orders`);
      toast.success("Замовлення видалено.");
    } catch (error) {
      toast.error("Щось пішло не так!");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          {form.getValues("orderItems")?.map((item, index) => (
            <div key={index} className=" grid grid-cols-3 items-end gap-8 mb-2">
              <FormField
                control={form.control}
                name={`orderItems.${index}.productId`}
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-between">
                    <FormLabel>Продукт</FormLabel>
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
                            {products.map((product) => (
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
                            ))}
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
                      disabled={loading} 
                      value={field.value.toString()} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))} />
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

          <Separator />
          <div className="grid grid-cols-3 items-end gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>П.І.Б.</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Введіть Імя та Прізвище"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      disabled={loading}
                      placeholder="Введіть телефон"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адреса</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Введіть адресу"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Статус</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Виберіть статус"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        

          <Button disabled={loading} className="mx-auto ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
