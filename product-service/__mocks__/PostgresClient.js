export const PostgresClient = {
  build: () => ({
    beginTransaction: async () => {},
    endTransaction: async () => {},
    rollbackTransaction: async () => {},
    insertProduct: async (title, description, price) => ({ id: "NEW_ID" }),
    insertStocks: async (productId, count) => {},
    fetchProductsList: async () => ({ ok: true, rows: [], rowsAffected: 1 }),
    fetchProductsById: async productId => {
      if (productId == "WRONG ID") return { ok: true, rows: [] };
      return { ok: true, rows: [{ id: productId }], rowsAffected: 1 };
    },
    close: async () => {},
  }),
};

export default PostgresClient;
