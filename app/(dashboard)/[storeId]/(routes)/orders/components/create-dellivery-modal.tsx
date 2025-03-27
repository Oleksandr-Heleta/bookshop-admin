import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { OrderColumn } from "./columns";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import axios from "axios";
import toast from "react-hot-toast";

interface OverlookModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderColumn;
}

const phoneRegex = /^\+380\d{9}$/;

const orderSchema = z.object({
  orderId: z.string().min(1),
  name: z.string().min(1),
  surname: z.string().min(1),
  phone: z.string().refine((value) => phoneRegex.test(value), {
    message: "Телефон повинен бути у форматі +380000000000",
  }),
  cityId: z.string().min(1),
  addressId: z.string().min(1),
  orderState: z.string().min(1),
  weight: z.string().min(1),
  width: z.optional(z.string().min(1)),
  height: z.optional(z.string().min(1)),
  length: z.optional(z.string().min(1)),
  payerType: z.string().min(1),
  cargoType: z.string().min(1),
  delivery: z.string().min(1),
  date: z.date({
    required_error: "Дата відправлення обовязкова.",
  }),
  totalPrice: z.string().min(1),
});

type CreateDelliveryValues = z.infer<typeof orderSchema>;

const cleanTotalPrice = (price: string): string => {
  return price.split(",")[0].replace(/[^\d]/g, ""); // Обрізає все після коми і видаляє всі нечислові символи
};

const CreateDelliveryModal: React.FC<OverlookModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [ttn, setTtn] = useState<string | undefined>(order.ttnumber);

  const form = useForm<CreateDelliveryValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderId: order.id,
      name: order.name,
      surname: order.surname,
      phone: order.phone,
      cityId: order.cityId,
      addressId: order.addressId,
      orderState: order.orderState,
      weight: undefined,
      width: undefined,
      height: undefined,
      length: undefined,
      payerType:
        Number(cleanTotalPrice(String(order.totalPrice))) > 1500
          ? "Sender"
          : "Recipient",
      cargoType: "Documents",
      delivery: order.delivery,
      date: new Date(),
      totalPrice: cleanTotalPrice(String(order.totalPrice)),
    },
  });

  const isPoshtomat = order.address.match(/Поштомат/);

  const onSubmit = async (data: CreateDelliveryValues) => {
    // console.log(data);
    try {
      setLoading(true);

      const ttnumber = await axios.post(
        `/api/${params.storeId}/new-post/create-delivery`,
        data
      );
      // console.log(ttnumber);
      toast.success(
        `Відправлення створено успішно! ТТН: ${ttnumber.data.data}`
      );
      setTtn(ttnumber.data.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // console.log(error.response.data);
        toast.error(String(error.response.data));
      } else {
        // console.log(error);
        toast.error("Помилка при створенні відправлення");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Замовлення ${order.id}`}
      description="Створити відправлення"
      isOpen={isOpen}
      onClose={onClose}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="flex-col space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="text-sm font-semibold">П.І.Б:</div>
                <div>
                  {order.name} {order.surname}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Телефон:</div>
                <div>{order.phone}</div>
              </div>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Оціночна вартість:</FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            min="200"
                            type="number"
                            step="1"
                            defaultValue={field.value}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 items-end gap-8">
            <FormField
              control={form.control}
              name="payerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Платник</FormLabel>
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
                          placeholder="Виберіть хто платить"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Sender">Відправник</SelectItem>
                      <SelectItem value="Recipient">Одержувач</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cargoType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип вантажу</FormLabel>
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
                          placeholder="Виберіть тип вантажу"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Documents">Документи</SelectItem>
                      <SelectItem value="Parcel">Посилка</SelectItem>
                      <SelectItem value="Cargo" disabled={!!isPoshtomat}>
                        Вантаж
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Дата відправлення</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-auto pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd.MM.yyyy")
                          ) : (
                            <span>Оберіть дату</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        className="w-full"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0); // Обнулити час у поточній даті
                          const selectedDate = new Date(date);
                          selectedDate.setHours(0, 0, 0, 0); // Обнулити час у вибраній даті
                          return !(selectedDate >= today);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {/* <FormDescription>
                Виберіть дату коли буде здійснено відправлення.
              </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 items-end gap-8">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Висота</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        min="1"
                        max={isPoshtomat ? "30" : undefined}
                        type="number"
                        step="1"
                        disabled={
                          loading || form.getValues("cargoType") === "Documents"
                        }
                        defaultValue={field.value}
                        {...field}
                      />
                      см
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ширина</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        min="1"
                        max={isPoshtomat ? "40" : undefined}
                        type="number"
                        step="1"
                        disabled={
                          loading || form.getValues("cargoType") === "Documents"
                        }
                        defaultValue={field.value}
                        {...field}
                      />
                      см
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Довжина</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        min="1"
                        max={isPoshtomat ? "60" : undefined}
                        type="number"
                        step="1"
                        disabled={
                          loading || form.getValues("cargoType") === "Documents"
                        }
                        defaultValue={field.value}
                        {...field}
                      />
                      см
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Вага</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        min="0.5"
                        type="number"
                        step="0.5"
                        max={
                          form.getValues("cargoType") === "Documents"
                            ? "1"
                            : "30"
                        }
                        disabled={loading}
                        defaultValue={field.value}
                        {...field}
                      />
                      кг
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {order.orderState === "afterrecive" && (
            <div className="text-red-500">
              Відправлення буде здійснено накладеним платежем
            </div>
          )}
          <div className="flex justify-end">
            <Button
              disabled={loading || !!ttn}
              type="submit"
              className="w-full"
            >
              {ttn ? `Вже створено ${ttn} ` : "Створити"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};

export default CreateDelliveryModal;
