"use client";

import { Collor} from "@prisma/client";
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
import ImageUpload from "@/components/ui/image-upload";

const formShema = z.object({
  name: z.string().min(1),
  value: z.string().min(4).regex(/^#/, {
    message: 'String must be a valid hex color',
  }),
});

interface CollorFormProps {
  initialData: Collor | null;
}

type CollorFormValues = z.infer<typeof formShema>;

export const CollorForm: React.FC<CollorFormProps> = ({
  initialData,
}) => {
  const params = useParams();
  const router = useRouter();
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit collor" : "Create collor";
  const description = initialData ? "Edit a collor" : "Add a new collor";
  const toastMessage = initialData
    ? "Collor updated."
    : "Collor created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<CollorFormValues>({
    resolver: zodResolver(formShema),
    defaultValues: initialData || {
      name: "",
      value: "",
    },
  });

  const onSubmit = async (data: CollorFormValues) => {
    try {
      setLoading(true);
      if(initialData) {
      await axios.patch(`/api/${params.storeId}/collors/${params.collorId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/collors`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/collors`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/collors/${params.collorId}`);
      router.refresh();
      router.push(`/${params.storeId}/collors`);
      toast.success("Collor deleted.");
    } catch (error) {
      toast.error("Make sure you removed all products using this collor first");
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
         
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Collor name"
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
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-x-4">
                    <Input
                      disabled={loading}
                      placeholder="Collor value"
                      {...field}
                    />
                    <div className=" p-4 rounded-full border" style={{backgroundColor: field.value}}></div>
                    </div>
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
