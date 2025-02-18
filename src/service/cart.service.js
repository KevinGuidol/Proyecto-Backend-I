import { cartModel } from "../models/cart.model.js";
import { productModel } from "../models/products.model.js";
import { io } from "../server.js";

class cartService {
  async getAll() {
    return await cartModel.populate('products.productId');
  }
  async getById(id) {
    return await cartModel.findById(id).populate('products.productId');
  }
  async create(cart) {

    try {
      const newCart = new cartModel({products : [], totalPrice: 0});
      await newCart.save();
      return newCart;
    }catch(err) {
      throw new Error('Error al crear el carrito');
    }
  }

  async addProduct( cid, pid, quantity) {
    if (quantity <= 0) { throw new Error('La cantidad debe ser mayor a 0') }
    const cart = await cartModel.findById(cid);
    if (!cart) {
      throw new Error('El carrito no existe')
    }
    const productId = new mongoose.Types.ObjectId(pid);
    const product = await productModel.findById(pid);
    if (!product) {
      throw new Error('El producto no existe')
    }
    const existProduct = cart.products.find(p=> p.productId.equals(productId));
    if (existProduct) {
      existProduct.quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }
    await cart.calculateTotalPrice();
    return await cart.save();
  }

  async updateProduct(cid, pid, quantity) {
    if (quantity <= 0) { throw new Error('La cantidad debe ser mayor a 0') }
    const cart = await cartModel.findById(cid);
    if (!cart) {
      return null;
    }
    const product = cart.products.find(p=> p.productId.equals(pid));
    if (!product) {
      return null;
    }
    product.quantity = quantity;
    await cart.calculateTotalPrice();
    return await cart.save();
  }

  async removeProduct(cid, pid) {
    const cart = await cartModel.findById(cid);
    if (!cart) {
      return { message: 'El carrito no existe' };
    }
    const productIndex = cart.products.findIndex(p=> p.productId.equals(pid));
    if (productIndex === -1) {
      return { message: 'El producto no existe' };
    }

    cart.products.splice(productIndex, 1);
    await cart.calculateTotalPrice();
    await cart.save();
    return { message: 'Producto eliminado correctamente' };
  }

  async deleteCart(cid) {
    const cartToDelete = await cartModel.findByIdAndDelete(cid);
    if (!cartToDelete) {
      return null;
    }
    return { message: 'Carrito eliminado correctamente' };
  }

  async confirmPurchase({cid}) {
    const cart = await cartModel.findById(cid).populate('products.productId');
    if (!cart) {
      return { message: 'El carrito no existe' };
    }
    const total = cart.products.reduce((acc, product) => {
      return acc + product.product.price * product.quantity;
    }, 0);

    cart.totalPrice = total;
    cart.products = [];
    await cart.save();
    return { message: 'Compra confirmada correctamente', total };
  }
}

export const cartsService = new CartService();