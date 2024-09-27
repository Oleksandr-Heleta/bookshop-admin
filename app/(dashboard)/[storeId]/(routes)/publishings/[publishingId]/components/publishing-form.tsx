'use client';

import { Publishing } from '@prisma/client';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import * as z from 'zod';
import { set, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { AlertModal } from '@/components/modals/alert-modal';
import ImageUpload from '@/components/ui/image-upload';

const formShema = z.object({
  id: z.string().min(5),
  name: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional(),
  titleSeo: z.string().optional(),
  descriptionSeo: z.string().optional(),
});

interface PublishingFormProps {
  initialData: Publishing | null;
}

type PublishingFormValues = z.infer<typeof formShema>;

export const PublishingForm: React.FC<PublishingFormProps> = ({
  initialData,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData
    ? 'Редагування видавницта'
    : 'Створення видавництва';
  const description = initialData
    ? 'Редагувати видавництво'
    : 'Додати нове видавнийтво';
  const toastMessage = initialData
    ? 'видавництво оновлено'
    : 'видавництво створено';
  const action = initialData ? 'Зберегти зміни' : 'Створити';

  const form = useForm<PublishingFormValues>({
    resolver: zodResolver(formShema),
    defaultValues: initialData
      ? {
          ...initialData,
          description: initialData.description || undefined,
          titleSeo: initialData.titleSeo || undefined,
          descriptionSeo: initialData.descriptionSeo || undefined,
        }
      : {
          id: '',
          name: '',
          value: '',
          description: undefined,
          titleSeo: undefined,
          descriptionSeo: undefined,
        },
  });

  const onSubmit = async (data: PublishingFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/publishings/${params.publishingId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/publishings`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/publishings`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error('Щось пішло не так!');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.storeId}/publishings/${params.publishingId}`
      );
      router.refresh();
      router.push(`/${params.storeId}/publishings`);
      toast.success('Видавництво видалено.');
    } catch (error) {
      toast.error('Переконайтесь що видалені всі товари цього видавництва.');
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Назва</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Назва видавництва"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Видавництва</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Введіть новий ID"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Значення</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-x-4">
                      <Input
                        disabled={loading}
                        placeholder="Значення видавництва"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Опис</FormLabel>
                  <FormControl>
                    <Textarea
                      className="h-48"
                      disabled={loading}
                      placeholder="Опис видавництва"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="titleSeo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Назва для SEO</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="SEO title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descriptionSeo"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Опис категорії для SEO</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="SEO Description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
