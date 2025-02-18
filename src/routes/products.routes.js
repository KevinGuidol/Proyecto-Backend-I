import { Router } from "express";
import { productModel } from "../models/products.model.js";
import { io } from "../server.js";
import mongoose from "mongoose";

export const productsRoutes = Router();

//
//GET "/"
//
productsRoutes.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, title, price, category } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const query = {}
    if (title) query.title = { $regex: title, $options: "i" };
    if (price) query.price = { $lte: parseFloat(price) }
    if (category) query.category = category

    const products = await productModel.pagintate(query, { page, limit });
    if (products.docs.length === 0) {
      return res.status(404).json({ message: 'No hay productos que coincidan con los criterios' })
    }
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
});

//
// GET /:pid
//
productsRoutes.get("/:pid", async (req, res) => {
  const { pid } = req.params;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Id inválido" })
    }
    const product = await productModel.findById(pid);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el producto" });
  }
});

//
// POST /
//
productsRoutes.post("/", async (req, res) => {
  const { title, price, description, category, code, status, stock } = req.body;
  if (!title || !price || !description || !category || !code || !stock) {
    return res.status(400).json({ message: "Debe completar todos los campos antes de poder crear el producto" });
  }
  try {
    const newProduct = new productModel({
      title,
      price,
      description,
      category,
      code,
      status: status !== undefined ? status : true,
      stock
    });
    const savedProduct = await newProduct.save();

    io.emit("newProduct", savedProduct);
    res.status(201).json(savedProduct);
  } catch (err) {
    return res.status(500).json({ message: "Error al crear el producto: " + err.message });
  }
});

//
// PUT /:pid
//
productsRoutes.put("/:pid", async (req, res) => {
  const { pid } = req.params;
  const { title, price, description, category, code, status, stock } = req.body;
  if (!mongoose.isValidObjectId(pid)) {
    return res.status(404).json({ message: "Id inválido" });
  }
  try {
    const product = await productModel.findById(pid);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el producto" });
  }
});

//
// DELETE /:pid
//
productsRoutes.delete("/:pid", async (req, res) => {
  const { pid } = req.params;
  if (!mongoose.isValidObjectId(pid)) {
    return res.status(404).json({ message: "Id inválido" });
  }
  try {
    const product = await productModel.findByIdAndDelete(pid);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(200).end();
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
});