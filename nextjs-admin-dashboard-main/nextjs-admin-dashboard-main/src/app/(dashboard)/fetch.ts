import { getOrders } from "@/services/order.service";
import { getProducts } from "@/services/product.service";
import { getAllUsers } from "@/services/user.service";

export async function getOverviewData() {
  try {
    // Fetch data independently so one failure doesn't block the others
    const fetchOrders = getOrders().catch(err => {
      console.error("Orders fetch failed:", err);
      return [];
    });
    const fetchProducts = getProducts().catch(err => {
      console.error("Products fetch failed:", err);
      return [];
    });
    const fetchUsers = getAllUsers().catch(err => {
      console.error("Users fetch failed (Permission?):", err);
      return [];
    });

    const [orders, products, users] = await Promise.all([
      fetchOrders,
      fetchProducts,
      fetchUsers,
    ]);

    const totalProfit = orders
      .filter((o) => o.status === "DELIVERED")
      .reduce((acc, curr) => acc + curr.totalAmount, 0);

    return {
      views: {
        value: 0,
        growthRate: 0,
      },
      profit: {
        value: totalProfit,
        growthRate: 4.35,
      },
      products: {
        value: products.length,
        growthRate: 2.59,
      },
      users: {
        value: users.length,
        growthRate: -0.95,
      },
    };
  } catch (error: any) {
    console.error("Error fetching overview data:", error);

    // If it's an auth error, return 0s instead of crashing the page
    if (error.message === "Session expirée" || error.status === 401) {
      return {
        views: { value: 0, growthRate: 0, error: "Session expirée" },
        profit: { value: 0, growthRate: 0 },
        products: { value: 0, growthRate: 0 },
        users: { value: 0, growthRate: 0 },
      };
    }

    return {
      views: { value: 0, growthRate: 0 },
      profit: { value: 0, growthRate: 0 },
      products: { value: 0, growthRate: 0 },
      users: { value: 0, growthRate: 0 },
    };
  }
}

export async function getChatsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      name: "Jacob Jones",
      profile: "/images/user/user-01.png",
      isActive: true,
      lastMessage: {
        content: "See you tomorrow at the meeting!",
        type: "text",
        timestamp: "2024-12-19T14:30:00Z",
        isRead: false,
      },
      unreadCount: 3,
    },
    {
      name: "Wilium Smith",
      profile: "/images/user/user-03.png",
      isActive: true,
      lastMessage: {
        content: "Thanks for the update",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      name: "Johurul Haque",
      profile: "/images/user/user-04.png",
      isActive: false,
      lastMessage: {
        content: "What's up?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      name: "M. Chowdhury",
      profile: "/images/user/user-05.png",
      isActive: false,
      lastMessage: {
        content: "Where are you now?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 2,
    },
    {
      name: "Akagami",
      profile: "/images/user/user-07.png",
      isActive: false,
      lastMessage: {
        content: "Hey, how are you?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
  ];
}