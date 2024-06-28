"use client";

import { Billboard, MainBillboard, Store } from "@prisma/client";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import * as z from "zod";
import { set, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";
import  MultipleSelector  from "@/components/ui/multi-select";

interface SettingsFormProps {
  initialData: Store;
  billboards: Billboard[];
  mainbillboards: MainBillboard[];
}

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const formShema = z.object({
  name: z.string().min(1),
  mainbillboards:  z.array(optionSchema).min(1),
  sale: z.number().min(0).max(100),
});

type SettingsFormValues = z.infer<typeof formShema>;

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData, billboards, mainbillboards }) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formShema),
    defaultValues: {
      ...initialData,
      mainbillboards: mainbillboards,
    },
  });



  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true);
      console.log(data);
      await axios.patch(`/api/stores/${params.storeId}`, data);
      router.refresh();
      toast.success("Магазин успішно оновлено!");
    } catch (error) {
      toast.error("Щось пішло не так!");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeId}`);
      router.refresh();
      router.push("/");
      toast.success("Магазин видалено.");
    } catch (error) {
      toast.error("Переконайтесь що всі категорії видалені.");
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
        <Heading title="Налаштування" description="Налаштуй свій магазин тут" />
        <Button
          disabled={loading}
          variant="destructive"
          size="icon"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Назва</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Назва магазину"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="mainbillboards"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Головні Білборди</FormLabel>
                  <MultipleSelector
                    hidePlaceholderWhenSelected
                    value={field.value}
                    disabled={loading}
                    onChange={field.onChange}
                    defaultOptions={billboards.map((billboard) => {
                      return { value: billboard.id, label: billboard.label };
                    })}
                    placeholder="Оберіть білборди для головної сторінки"
                    emptyIndicator={
                      <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                        no results found.
                      </p>
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="sale"
                render={({ field }) => (
                  <FormItem className="space-x-3 space-y-0 p-4">
                    <FormLabel>Відсоток знижки</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          // Перетворення рядка в число
                          const value = e.target.value === "" ? "" : Number(e.target.value);
                          field.onChange(value); // Виклик onChange з перетвореним значенням
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Зберегти зміни
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        description={`${origin}/api/${params.storeId}`}
        variant="public"
      />
    </>
  );
};
