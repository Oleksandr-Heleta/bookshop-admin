import { useFormContext } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OrderFormValues } from "./schemas";

interface CustomerDetailsProps {
  form: ReturnType<typeof useFormContext<OrderFormValues>>;
  loading: boolean;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  form,
  loading,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 items-end gap-8">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ім&apos;я</FormLabel>
            <FormControl>
              <Input disabled={loading} placeholder="Введіть Ім'я" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="surname"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Прізвище</FormLabel>
            <FormControl>
              <Input
                disabled={loading}
                placeholder="Введіть Прізвище"
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
    </div>
  );
};
