import { Schema, model } from "mongoose";

const cartSchema = new Schema({
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Products", required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  totalPrice: { type: Number, default: 0 }
});

cartsSchema.methods.calculateTotalPrice = async () => {
  await this.populate("products.productId");
  this.totalPrice = this.products.reduce((acc, product) => {
    return acc + product.product.price * product.quantity;
  }, 0);
  return this;

};

export const cartModel = model("Cart", cartSchema);