import { Button } from '@/components/ui/button';
import { ChangeId } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const changeIdFormShema = z.object({
  oldId: z.string().min(1),
  newId: z.string().min(1),
  table: z.union([
    z.literal('category'),
    z.literal('ageGroup'),
    z.literal('publishing'),
    z.literal('series'),
  ]),
});

type changeIdFormValues = z.infer<typeof changeIdFormShema>;

const tables = [
  { id: 'category', name: 'Категорії' },
  { id: 'ageGroup', name: 'Вік' },
  { id: 'publishing', name: 'Видавництва' },
  { id: 'series', name: 'Серії' },
];

const ChangeIdForm = () => {
  const [loading, setLoading] = useState(false);
  const changeIdform = useForm<changeIdFormValues>({
    resolver: zodResolver(changeIdFormShema),
    defaultValues: {
      oldId: '',
      newId: '',
      table: 'category',
    },
  });

  const onChangeId = async (data: changeIdFormValues) => {
    try {
      console.log(data);
      setLoading(true);
      await ChangeId(data.oldId, data.newId, data.table);
      toast.success('ID успішно змінено!');
    } catch (error) {
      toast.error('Щось пішло не так!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...changeIdform}>
      <form
        onSubmit={changeIdform.handleSubmit(onChangeId)}
        className="space-y-8 w-full"
      >
        <h3 className="text-xl font-semibold">Зміна ID</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <FormField
            control={changeIdform.control}
            name="table"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Таблиця</FormLabel>
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
                        placeholder="Виберіть таблицю для зміни ID"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        {table.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={changeIdform.control}
            name="oldId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Попередній ID</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Введіть попередній ID"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={changeIdform.control}
            name="newId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Новий ID</FormLabel>
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
        </div>
        <Button disabled={loading} className="ml-auto" type="submit">
          Змінити ID
        </Button>
      </form>
    </Form>
  );
};

export default ChangeIdForm;
