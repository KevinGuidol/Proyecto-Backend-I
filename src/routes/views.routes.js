import { Router } from "express";
import { productsService } from "../service/products.service.js"; 
import {cartService} from "../service/cart.service.js";

export const viewsRouter = Router();

viewsRouter.get("/", async (req, res) => {
  try {
    const allProducts = await productsService.getAll();
    res.render("home", {title: "Inicio", products: allProducts});
  }catch(err) {
    res.status(500).send({message: "Error al obtener todos los productos"});
  }
});

viewsRouter.get("realTimeProducts", async (req, res) => {
  try {
    const allProducts = await productsService.getAll();
    res.render("realTimeProducts", {title: "Productos en tiempo real", products: allProducts});
  }catch(err) {
    res.status(500).send({message: "Error al obtener todos los productos"});
  }
});

viewsRouter.get("/carts", async (req, res) => {
  try {
    const carts = await cartService.getAll();
    if(carts.length === 0) {
      res.render("carts", {title: "Carritos", carts: []});
  }
  const cart = carts[0];

  res.render("carts",{  title: "Carritos",
      cart: {items: cart.products.map(
        item => ({product: {
          title: item.productId.title, price: item.productId.price},
          quantity: item.quantity, totalPrice: item.productId.price * item.quantity
        });
      )}
    });
  }catch(err) {
    res.status(500).send({message: "Error al obtener los carritos"});
  }
});
