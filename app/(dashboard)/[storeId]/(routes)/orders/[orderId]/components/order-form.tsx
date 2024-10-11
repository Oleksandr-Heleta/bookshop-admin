"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Trash, CheckIcon, ChevronDown, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { statuses, states } from "@/lib/utils";
import { OrderFormValues, orderSchema } from "./schemas";
import { OrderFormProps } from "./types";
import { OrderItems, CustomerDetails, DeliveryDetails } from "./index";

const phoneRegex = /^\+380\d{9}$/;

export const OrderForm: React.FC<OrderFormProps> = ({
  initialData,
  products,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
          orderItems: initialData.orderItems?.map((orderItem) => ({
            productId: orderItem.productId ?? "",
            quantity: parseInt(String(orderItem.quantity)),
          })),
        }
      : {
          orderItems: [{ productId: "", quantity: 1 }],
          name: "",
          surname: "",
          orderStatus: "",
          orderState: "",
          isPaid: false,
          phone: "+380",
          city: "",
          cityId: "",
          address: "",
          addressId: "",
          post: "new-post",
          delivery: "post",
        },
  });

  

  const onSubmit = async (data: OrderFormValues) => {
    try {
      setLoading(true);
      const totalPrice = data.orderItems.reduce((total, item) => {
        const product = products.find(
          (product) => product.id === item.productId
        );
        const lastPrice: number = product?.isSale
          ? (Number(product.price) * (100 - product.sale)) / 100
          : Number(product?.price) ?? 0;
        return total + lastPrice * Number(item.quantity);
      }, 0);

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/orders/${params.orderId}`, {
          ...data,
          totalPrice,
        });
      } else {
        await axios.post(`/api/${params.storeId}/orders`, {
          ...data,
          totalPrice,
        });
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
          <OrderItems
            form={form}
            orderItems={initialData?.orderItems?.map((item) => ({
              ...item,
              productId: item.productId ?? "",
            }))}
            products={products}
            loading={loading}
          />

          <Separator />
          <CustomerDetails form={form} loading={loading} />
          <Separator />

          <DeliveryDetails
            form={form}
            loading={loading}
            initialData={{
              delivery: initialData?.delivery,
              post: initialData?.post,
              city: initialData?.city,
              cityId: initialData?.cityId,
              address: initialData?.address,
              addressId: initialData?.addressId,
            }}
            
          />
          <Separator />
          <div className="grid grid-cols-1 lg:grid-cols-3 items-end gap-8">
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
            <FormField
              control={form.control}
              name="orderState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Оплата</FormLabel>
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
                          placeholder="Виберіть метод оплати"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col items-start  space-y-0 rounded-md border ">
              <FormField
                control={form.control}
                name="isPaid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Оплачено</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="call"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Зателефонувати</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button disabled={loading} className="mx-auto ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default OrderForm;
