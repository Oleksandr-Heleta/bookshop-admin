import { useFormContext } from "react-hook-form";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { OrderFormValues } from "./schemas";
import { Trash, CheckIcon, ChevronDown, Plus } from "lucide-react";
import {
  FormControl,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn, deliveries, posts } from "@/lib/utils";
import { useDebounce } from "@/components/ui/multi-select";

interface InitialsProps {
  post?: string;
  delivery?: string;
  city?: string;
  cityId?: string;
  address?: string;
  addressId?: string;
}

interface DeliveryDetailsProps {
  form: ReturnType<typeof useFormContext<OrderFormValues>>;
  loading: boolean;
  initialData: InitialsProps;
}

const cyrillicPattern = /^[\u0400-\u04FF0-9\s]+$/;

export const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({
  form,
  loading,
  initialData,
}) => {
  const params = useParams();

  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [postOffices, setPostOffices] = useState<
    { id: string; name: string }[]
  >([]);
  const [cityQuery, setCityQuery] = useState("");
  const [postOfficeQuery, setPostOfficeQuery] = useState("");
  const [postType, setPostType] = useState(initialData.post ?? "new-post");
  const [deliveryType, setDeliveryType] = useState(
    initialData.delivery ?? "post"
  );


  const debouncedCityQuery = useDebounce(cityQuery, 500);

  useEffect(() => {
    if (cityQuery && debouncedCityQuery && cyrillicPattern.test(cityQuery)) {
      const fetchCities = async () => {
        try {
          const response = await axios.get(
            `/api/${params.storeId}/${postType}/cities?cityNamePart=${cityQuery}`
          );
          setCities(response.data.data);
         
        } catch (error) {
          console.log(error);
        }
      };
      fetchCities();
    }
  }, [debouncedCityQuery, postType, params.storeId]);

  const debouncedPostOfficeQuery = useDebounce(postOfficeQuery, 500);

  useEffect(() => {
    const cityId = form.getValues("cityId");
    if (cityId && debouncedPostOfficeQuery && cyrillicPattern.test(postOfficeQuery)) {
      const fetchPostOffices = async () => {
        try {
          const response = await axios.get(
            `/api/${params.storeId}/${postType}/posts?city_id=${cityId}&postindex=${postOfficeQuery}`
          );
          if (response.data.data.length) {
            setPostOffices(response.data.data);
                    
          }
          // console.log("data", response.data.data);
        } catch (error) {
          console.log(error);
        }
      };
      fetchPostOffices();
    }
  }, [debouncedPostOfficeQuery, form.getValues("cityId"), postType, params.storeId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 items-end gap-8">
      <FormField
        control={form.control}
        name="post"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Пошта</FormLabel>
            <Select
              disabled={loading}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue("city", "");
                form.setValue("address", "");
                setPostType(value);
                setCities([]);
                setPostOffices([]);
              }}
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    defaultValue={field.value}
                    placeholder="Виберіть пошту"
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {posts.map((post) => (
                  <SelectItem key={post.value} value={post.value}>
                    {post.name}
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
        name="delivery"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Доставка</FormLabel>
            <Select
              disabled={loading}
              onValueChange={(value) => {
                field.onChange(value);
                setDeliveryType(value);
              }}
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    defaultValue={field.value}
                    placeholder="Виберіть спосіб доставки"
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {deliveries.map((delivery) => (
                  <SelectItem key={delivery.value} value={delivery.value}>
                    {delivery.name}
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
        name="cityId"
        render={({ field }) => (
          <FormItem className="flex flex-col justify-between">
            <FormLabel>Місто</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                   disabled={loading}
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? form.getValues("city") : "Виберіть місто"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command  filter={() => { return 1; }}>
                  <CommandInput
                    placeholder="Пошук міста..."
                    className="h-9"
                    onValueChange={(value) => setCityQuery(value)}
                    value={cityQuery}
                  />
                  <CommandEmpty>Місто не знайдено.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-scroll">
                    {cities.map((city) => (
                      <CommandItem
                        value={city.name}
                        key={city.id}
                        onSelect={() => {
                          form.setValue("city", city.name);
                          form.setValue("cityId", city.id);
                          form.setValue("addressId", "");
                          setPostOffices([]);
                          setPostOfficeQuery("");
                        }}
                      >
                        {city.name}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            city.id === field.value
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
      {deliveryType === "post" ? (
        <FormField
          control={form.control}
          name="addressId"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-between">
              <FormLabel>Відділення</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                     disabled={loading}
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? form.getValues("address")
                        : "Виберіть відділення"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command  filter={() => { return 1; }}>
                    <CommandInput
                      placeholder="Пошук відділення..."
                      className="h-9"
                      onValueChange={(value) => setPostOfficeQuery(value)}
                      value={postOfficeQuery}
                    />
                    <CommandEmpty>Відділення не знайдено.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-scroll">
                      {postOffices.map((postOffice) => (
                        <CommandItem
                          value={CSS.escape(postOffice.name)}
                          key={postOffice.id}
                          onSelect={() => {
                            form.setValue("address", postOffice.name);
                            form.setValue("addressId", postOffice.id);
                          }}
                        >
                          {postOffice.name}
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              postOffice.id === field.value
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
      ) : (
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
      )}
    </div>
  );
};