"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderColumn } from "./columns";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreHorizontal, Trash, Eye, Package } from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";
import OverlookModal from "./overlook-modal";
import CreateDelliveryModal from "./create-dellivery-modal";

interface CellActionProps {
  data: OrderColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [overlookOpen, setOverlookOpen] = useState(false);
  const [createDeliveryOpen, setCreateDeliveryOpen] = useState(false);

  const onCopy = (data: OrderColumn) => {
    const text = `
    П.І.Б: ${data.name} ${data.surname}; 
    тел.: ${data.phone};
    адреса: ${data.city} ${data.address};
    товари: ${data.products.join('\n')};
    на суму: ${data.totalPrice}.`;
    navigator.clipboard.writeText(text);
    toast.success("Дані скопійовано.");
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.storeId}/orders/${data.id}`
      );
      router.refresh();
      toast.success("Замовлення видалено.");
    } catch (error) {
      toast.error(
        "Щось пішло не так."
      );
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
      <OverlookModal isOpen={overlookOpen} onClose={() => setOverlookOpen(false)} order={data} />
      <CreateDelliveryModal isOpen={createDeliveryOpen} onClose={() => setCreateDeliveryOpen(false)} order={data} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Дії</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data)}>
            <Copy className="mr-2 h-4 w-4" />
            Копіювати 
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOverlookOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Переглянути 
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/${params.storeId}/orders/${data.id}`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Редагувати
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCreateDeliveryOpen(true)}>
            <Package className="mr-2 h-4 w-4" />
            Створити відправлення
          </DropdownMenuItem>
          <DropdownMenuItem onClick={()=>setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Видалити
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
