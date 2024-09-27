'use client';

import {
  Category,
  Publishing,
  Image,
  Seria,
  Product,
  AgeGroup,
  AgeGroupToProduct,
  CategoriesToProduct,
} from '@prisma/client';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { AlertModal } from '@/components/modals/alert-modal';
import ImageUpload from '@/components/ui/image-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MultipleSelector from '@/components/ui/multi-select';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUploading } from '@/components/image-uploading';
import { Decimal } from '@prisma/client/runtime/library';
import { auth } from '@clerk/nextjs';

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const formShema = z.object({
  name: z.string().min(1),
  author: z.string().optional(),
  images: z.object({ url: z.string().url() }).array(),
  price: z.coerce.number().positive().min(1),
  quantity: z.coerce.number().min(0),
  categories: z.array(optionSchema).min(1),
  publishingId: z.string().min(1),
  seriaId: z.string().optional(),
  ageGroups: z.array(optionSchema).min(1),
  description: z.string().min(1),
  isNew: z.boolean().default(false).optional(),
  isSale: z.boolean().default(false).optional(),
  sale: z.coerce.number().nonnegative().default(0),
  isLowQuantity: z.boolean().default(false).optional(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  sheets: z.coerce.number().positive().min(1),
  size: z.string().min(1),
  titleSheet: z.string().min(1),
  isbn: z.string().optional(),
  titleSeo: z.string().optional(),
  descriptionSeo: z.string().optional(),
  video: z.string().optional(),
  suggestionProducts: z.array(optionSchema).optional(),
});

type ProductFormValues = z.infer<typeof formShema>;

type InitialDataType = {
  id: string;
  storeId: string;
  name: string;
  description: string;
  author: string;
  sheets: number;
  size: string;
  titleSheet: string;
  quantity: number;
  video: string;
  publishingId: string;
  seriaId: string;
  isFeatured: boolean;
  isArchived: boolean;
  isNew: boolean;
  isSale: boolean;
  isbn: string;
  titleSeo: string;
  descriptionSeo: string;
  images: Image[];
  suggestionProducts: Product[];
  ageGroups: AgeGroupToProduct[];
  categories: CategoriesToProduct[];
  price: number;
} | null;

interface ProductFormProps {
  initialData: InitialDataType;
  categories: Category[];
  ageGroups: AgeGroup[];
  publishings: Publishing[];
  serias: Seria[];
  products: Product[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  ageGroups,
  publishings,
  products,
  serias,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Редагування товару' : 'Створення товару';
  const description = initialData ? 'Редагувани товар' : 'Додати новий товар';
  const toastMessage = initialData ? 'Продукт оновлено.' : 'Продукт створено.';
  const action = initialData ? 'Зберегти зміни' : 'Створити';

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formShema),
    defaultValues: initialData
      ? {
          ...initialData,
          price: parseFloat(String(initialData?.price)),
          ageGroups: initialData?.ageGroups
            ? initialData.ageGroups.map((coll: AgeGroupToProduct) => {
                return { label: coll.ageGroupName, value: coll.ageGroupId };
              })
            : [],
          categories: initialData?.categories
            ? initialData.categories.map((coll: CategoriesToProduct) => {
                return { label: coll.categoryName, value: coll.categoryId };
              })
            : [],
          suggestionProducts: initialData?.suggestionProducts
            ? initialData.suggestionProducts.map((product) => ({
                label: product.name,
                value: product.id,
              }))
            : [],
        }
      : {
          name: '',
          description: '',
          author: undefined,
          images: [],
          suggestionProducts: [],
          quantity: 0,
          price: 0,
          isNew: false,
          isSale: false,
          sale: 0,
          isLowQuantity: false,
          categories: [],
          publishingId: '',
          seriaId: undefined,
          ageGroups: [],
          isFeatured: false,
          isArchived: false,
          sheets: 0,
          size: '',
          titleSheet: '',
          video: '',
          isbn: '',
          titleSeo: '',
          descriptionSeo: '',
        },
  });

  const onSubmit = async (data: ProductFormValues, goOut: boolean = true) => {
    // console.log(data);
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/products/${params.productId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);
      }
      router.refresh();
      if (goOut) {
        if (initialData) {
          router.back();
        } else {
          router.push(`/${params.storeId}/products`);
        }
      }
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
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success('Продукт видалено.');
    } catch (error) {
      toast.error('Щось пішло не так!');
      // console.error(error);
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
          onSubmit={form.handleSubmit((data) => onSubmit(data))}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Зображення</FormLabel>
                <FormControl>
                  <ImageUploading
                    value={field.value.map((image) => image.url)}
                    disabled={loading}
                    multipe
                    onChange={(urls) => {
                      const newImages = urls.map((url) => ({ url }));
                      field.onChange(newImages);
                      initialData &&
                        onSubmit(
                          { ...form.getValues(), images: newImages },
                          false
                        );
                    }}
                    onRemove={(url) => {
                      const newImages = form
                        .getValues('images')
                        .filter((current) => current.url != url);
                      field.onChange([
                        ...field.value.filter((current) => current.url != url),
                      ]);
                      // console.log(newImages);
                      initialData &&
                        newImages.length &&
                        onSubmit(
                          { ...form.getValues(), images: newImages },
                          false
                        );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                      placeholder="Назва книги"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Автор</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Ім'я автора"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ціна</FormLabel>
                  <FormControl>
                    <Input
                      min="0"
                      type="number"
                      disabled={loading}
                      placeholder="9.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Кількість</FormLabel>
                  <FormControl>
                    <Input
                      min="0"
                      type="number"
                      disabled={loading}
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категорія</FormLabel>
                  <MultipleSelector
                    hidePlaceholderWhenSelected
                    value={field.value}
                    disabled={loading}
                    onChange={field.onChange}
                    defaultOptions={categories.map((category) => {
                      return { value: category.id, label: category.name };
                    })}
                    placeholder="Оберіть категорії"
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
              name="ageGroups"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Вік</FormLabel>
                  <MultipleSelector
                    hidePlaceholderWhenSelected
                    value={field.value}
                    disabled={loading}
                    onChange={field.onChange}
                    defaultOptions={ageGroups.map((ageGroup) => {
                      return { value: ageGroup.id, label: ageGroup.name };
                    })}
                    placeholder="Оберіть вікові групи"
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
              name="publishingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Видавництво</FormLabel>
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
                          placeholder="Виберіть видавництво"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {publishings.map((publishing) => (
                        <SelectItem key={publishing.id} value={publishing.id}>
                          {publishing.name}
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
              name="seriaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Серія</FormLabel>
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
                          placeholder="Виберіть серію"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serias.map((seria) => (
                        <SelectItem key={seria.id} value={seria.id}>
                          {seria.name}
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
              name="suggestionProducts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Рекомендовані товари</FormLabel>
                  <MultipleSelector
                    hidePlaceholderWhenSelected
                    value={field.value}
                    disabled={loading}
                    onChange={field.onChange}
                    defaultOptions={products.map((product) => {
                      return { value: product.id, label: product.name };
                    })}
                    placeholder="Оберіть товари які будуть рекомендовані на сторінці"
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
              name="sheets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Кількість сторінок</FormLabel>
                  <FormControl>
                    <Input
                      min="0"
                      type="number"
                      disabled={loading}
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Розмір</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Розміри книги"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="titleSheet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Обкладинка</FormLabel>
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
                          placeholder="Виберіть обкладинку "
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Solid">Тверда</SelectItem>
                      <SelectItem value="Soft">Мягка</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col items-start  space-y-0 rounded-md border ">
              <FormField
                control={form.control}
                name="isNew"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Новинка</FormLabel>
                      <FormDescription>
                        Цей товар буде отримає відмітку{' '}
                        <span className="bg-red-700 rounded-xl text-white p-2 text-xs">
                          НОВИНКА
                        </span>
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isLowQuantity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Закінчується</FormLabel>
                      <FormDescription>
                        Цей товар буде отримає відмітку{' '}
                        <span className="bg-amber-200 rounded-xl text-white p-2 text-xs">
                          ЗАКІНЧУЄТЬСЯ
                        </span>
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col items-start  space-y-0 rounded-md border">
              <FormField
                control={form.control}
                name="isSale"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Акція</FormLabel>
                      <FormDescription>
                        Цей товар отримає відмітку{' '}
                        <span className="bg-orange-500 rounded-xl text-white p-2 text-xs">
                          АКЦІЯ
                        </span>
                      </FormDescription>
                    </div>
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
                        min="0"
                        type="number"
                        disabled={loading}
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col items-start  space-y-0 rounded-md border">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Просувати</FormLabel>
                      <FormDescription>
                        Цей товар буде на головній сторінці магазину
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isArchived"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>В архів</FormLabel>
                      <FormDescription>
                        Цей товар не зявиться в магазині
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Опис</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Опис книги"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="video"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Відео</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="URL відео"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isbn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="ISBN книги"
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
                  <FormLabel>Опис книги для SEO</FormLabel>
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
