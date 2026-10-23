const cashierPages = ["Asosiy oyna", "Mahsulotlar", "Savdo", "Kassa"];
export const canAccessPage = (role, page) => role === "admin" || (role === "cashier" ? cashierPages.includes(page) : role === "worker" && page === "Ishlab chiqarish");
export const ownShiftSales = (sales, shifts, userId) => {
  const shift = shifts.find((item) => item.userId === userId && !item.closedAt);
  return shift ? sales.filter((item) => item.cashierId === userId && item.shiftId === shift.id) : [];
};
export const canCompleteOrder = (user, order) => Boolean(order && (user.role === "admin" || (user.role === "worker" && order.assigneeId === user.id)));
