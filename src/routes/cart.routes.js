import { Router } from "express";
import {CartService} from "../service/cart.service.js";

// Router de Express
export const cartsRoutes = Router();
//
// GET "/"
//

cartsRoutes.get("/", async (req, res) => {
  try {
    const carts = await cartService.getAll();
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los carritos" });
  }
});

//
// GET "/:cid" (Obtener un carrito por su cid)
//

cartsRoutes.get("/:cid", async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await cartService.getById(cid);
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el carrito" });
  }
});

//
// POST "/" (Crear un nuevo carrito)
//

cartsRoutes.post("/", async (req, res) => {
  try {
    const newCart = await cartService.create();
    if (!newCart) {
      return res.status(500).json({ message: "Error al crear el carrito" });
    }
    res.status(201).json(newCart);
  }catch(err) {
    res.status(500).json({ message: "Error al crear el carrito" });
  }
});

//
// POST "/:cid/product/:pid" (Agregar un producto a un carrito)
//

cartsRoutes.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const cartToUpdate = await cartService.addProduct(cid, pid, quantity);
    if (!cartToUpdate) {
      return res.status(404).json({ message: "El carrito no existe" });
    }
    res.status(200).json(cartToUpdate);
  }catch(err) {
    res.status(500).json({ message: "Error al agregar el producto al carrito" });
  }
});

//
// PUT "/:cid/product/:pid" (Actualizar la cantidad de un producto en un carrito)
//
cartsRoutes.put("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const cartToUpdate = await cartService.updateProduct(cid, pid, quantity);
    if (!cartToUpdate) {
      return res.status(404).json({ message: "El carrito no existe" });
    }
    res.status(200).json(cartToUpdate);
  }catch(err) {
    res.status(500).json({ message: "Error al actualizar el producto al carrito" });
  }
});

//
// DELETE "/:cid/product/:pid" (Eliminar un producto de un carrito)
//

cartsRoutes.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cartToUpdate = await cartService.removeProduct(cid, pid);
    if (!cartToUpdate) {
      return res.status(404).json({ message: "El carrito no existe" });
    }
    res.status(200).json(cartToUpdate);
  }catch(err) {
    res.status(500).json({ message: "Error al eliminar el producto al carrito" });
  }
});

//
// DELETE "/:cid" (Eliminar un carrito)
//

cartsRoutes.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cartToDelete = await cartService.deleteCart(cid);
    if (!cartToDelete) {
      return res.status(404).json({ message: 'El carrito no existe' });
    }
    res.status(200).json({message: 'Carrito eliminado correctamente'});
  }catch(err) {
    res.status(500).json({ message: 'Error al eliminar el carrito' });
  }
});