import React from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { OrderColumn } from "./columns";
import { Separator } from '@/components/ui/separator';
import { statuses, states, posts, deliveries } from "@/lib/utils";

interface OverlookModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderColumn;
}

const OverlookModal: React.FC<OverlookModalProps> = ({ isOpen, onClose, order }) => {



    return (
        <Modal
        title={`Замовлення ${order.id}`}
        description="Огляд замовлення"
        isOpen={isOpen}
        onClose={onClose}
        >
        <div className="flex-col space-y-4">
            <div className="flex space-x-4">
            <div className="flex-1">
                <div className="text-sm font-semibold">П.І.Б:</div>
                <div>{order.name} {order.surname}</div>
            </div>
            <div className="flex-1">
                <div className="text-sm font-semibold">Телефон:</div>
                <div>{order.phone}</div>
                {order.call && <div>Зателефонувати</div>}
            </div>
            <div className="flex-1">
                <div className="text-sm font-semibold">Сума:</div>
                <div>{order.totalPrice}</div>
            </div>
            
            </div>
            <Separator/>
            <div className="">
                <div className="flex justify-start gap-2">
                    <div className="text-sm font-semibold">Доставка:</div>
                    <div>{posts.find(post => post.value === order.post)?.name}</div>
                    <div>{deliveries.find(delivery => delivery.value === order.delivery)?.name}</div>
                    </div>
            <div className="flex justify-start gap-2 ">
                <div className="text-sm font-semibold">Місто:</div>
                <div>{order.city}</div>
                </div>
                <div className="flex justify-start gap-2">
                <div className="text-sm font-semibold">Адреса:</div>
                <div>{order.address}</div>
            </div>
            {order.ttnumber && <div className="flex justify-start gap-2"> 
                `Відправлення за номером ${order.ttnumber}`
            </div>
                }
           
            </div>
            <Separator/>
            <div className="flex space-x-4">
            <div className="flex-1">
                <div className="text-sm font-semibold">Статус:</div>
                <div>{statuses.find(status => status.value === order.orderStatus)?.name}</div>
            </div>
            <div className="flex-1">
                <div className="text-sm font-semibold">Стан:</div>
                <div>{states.find(state => state.value === order.orderState)?.name}</div>
                <div>{order.isPaid ? "Сплачено" : "Несплачено"}</div>
            </div>
           
            <div className="flex-1">
                <div className="text-sm font-semibold">Дата:</div>
                <div>{order.createdAt}</div>
            </div>
            </div>
            <div className="flex space-x-4">
            <div className="flex-1">
                <div className="text-sm font-semibold">Продукти:</div>
                <ul>{order.products.map((product, i)=>(
                    <li key={i}>{product}</li>
                ))}</ul>
            </div>
            </div>
        </div>
           
        </Modal>
    );
};

export default OverlookModal;