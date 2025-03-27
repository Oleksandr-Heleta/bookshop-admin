import prismadb from "@/lib/prismadb";
import { statPeriodsType } from "@/lib/utils";
import { getStartDates } from "@/lib/utils";

export const getProductSales = async (
  storeId: string,
  period: statPeriodsType = "all"
) => {
  try {
    const { startDate } = getStartDates(period);

    // Виконуємо запит до бази даних для отримання інформації про замовлення та продукти
    const orders = await prismadb.order.findMany({
      where: {
        storeId,
        isPaid: true,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Створюємо об'єкт для зберігання інформації про продажі продуктів
    const productSales: {
      [productId: string]: { name: string; quantity: number };
    } = {};

    // Обробляємо результати запиту
    orders.forEach((order) => {
      order.orderItems.forEach((orderItem) => {
        if (orderItem.product) {
          const productId = orderItem.product.id;
          const productName = orderItem.product.name;
          const quantity = orderItem.quantity;

          if (productSales[productId]) {
            productSales[productId].quantity += quantity;
          } else {
            productSales[productId] = { name: productName, quantity };
          }
        }
      });
    });

    // Перетворюємо об'єкт productSales в масив об'єктів
    const productSalesArray = Object.keys(productSales)
      .map((productId) => ({
        id: productId,
        name: productSales[productId].name,
        quantity: productSales[productId].quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity);

    return productSalesArray;
  } catch (error) {
    console.error("Error fetching product sales:", error);
    throw error;
  }
};
