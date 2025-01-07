import { Router } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { v4 as uuid } from "uuid";

export const productsRoutes = Router();

// Obtener el directorio actual de este archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta relativa al archivo JSON
const filePathProducts = path.resolve(__dirname, "../db/products.json");

// Definimos la función saveOnFile
function saveOnFile(products) {
  try {
    fs.writeFileSync(filePathProducts, JSON.stringify(products, null, 2));
  } catch (error) {
    throw new Error('Error al guardar el archivo');
  }
}

//
// GET /api/products
//
productsRoutes.get("/", async (req, res) => {
  if (fs.existsSync(filePathProducts)) {
    try {
      // Si existe, leemos y parseamos el archivo
      const products = JSON.parse(fs.readFileSync(filePathProducts, "utf-8"));
      // Retornamos los productos
      res.status(200).json(products);
    } catch (error) {
      // Si hubo un error al leer el archivo, lo seteamos como vacío
      const products = [];
      res.status(200).json(products);
    }
  } else {
    // Si no existe el archivo, lo seteamos como vacío
    const products = [];
    res.status(200).json(products);
  }
});

//
// GET /api/products/:pid
//
productsRoutes.get("/:pid", async (req, res) => {
  const { pid } = req.params;
  try {
    // Obtenemos el producto con el id proporcionado
    const products = JSON.parse(fs.readFileSync(filePathProducts, "utf-8"));
    const product = products.find((product) => product.id === pid);
    // Si el producto no existe, lanzamos un error
    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }
    // Si existe, devolvemos el producto
    res.status(200).json(product);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ message: "Error al obtener el producto" });
  }
});

//
// POST /api/products
//
productsRoutes.post("/", async (req, res) => {
  try {
    // Obtenemos los datos del producto enviados
    const {
      title,
      price,
      description,
      thumbnails,
      category,
      code,
      status,
      stock
    } = req.body;

    // Si falta algún campo obligatorio, lanzamos un error
    if (!title || !price || !description || !category || !code || !stock) {
      res.status(400).json({ message: "Faltan campos obligatorios" });
      return;
    }
    let products = [];
    if (fs.existsSync(filePathProducts)) {
      try {
        // Si existe, leemos y parseamos el archivo
        products = JSON.parse(fs.readFileSync(filePathProducts, "utf-8"));
      } catch (error) {
        console.error(error);
      }
    }
    if (products.find(product => product.code === code)) {
      res.status(400).json({ message: "Ya existe un producto con este código" });
      return;
    }

    // Generamos un id para el producto
    const id = uuid();

    // Validamos que no haya un producto con el mismo id (poco probable, pero prevenido)
    if (products.find(product => product.id === id)) {
      res.status(400).json({ message: "Ya existe un producto con ese id" });
      return;
    }

    // Si no existe, creamos un objeto con las propiedades
    const product = {
      id,
      title,
      description,
      price,
      code,
      thumbnails: thumbnails ?? [],
      category,
      status: status ?? true,
      stock
    };

    // Lo agregamos al array de productos
    products.push(product);

    // Guardamos el array actualizado en el archivo usando saveOnFile
    saveOnFile(products);

    // Retornamos el producto creado
    res.status(201).json({
      message: "Producto creado con éxito",
      product
    });
  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ message: "Error al crear el producto" });
  }
});

//
// PUT /api/products/:pid
//
productsRoutes.put("/:pid", async (req, res) => {
  const { pid } = req.params;

  try {
    // Leemos el archivo y parseamos los productos
    const products = JSON.parse(fs.readFileSync(filePathProducts, "utf-8"));

    // Obtenemos los datos del producto enviados
    const {
      title,
      price,
      description,
      thumbnails,
      category,
      code,
      status,
      stock
    } = req.body;

    // Obtenemos el producto con el id proporcionado
    const product = products.find((product) => product.id === pid);

    // Si el producto no existe, lanzamos un error
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    } else {
      // Validamos que el producto no exista por code
      if (products.find((prod) => prod.code === code && prod.id !== pid)) {
        return res.status(400).json({ message: "Ya existe un producto con este código" });
      }
    }

    // Si existe, actualizamos las propiedades del producto, en caso de no estar declarada para actualizar, se dejará igual
    product.title = title ?? product.title;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.code = code ?? product.code;
    product.thumbnails = thumbnails ?? product.thumbnails;
    product.category = category ?? product.category;
    product.status = status ?? product.status;
    product.stock = stock ?? product.stock;

    // Guardamos el array actualizado en el archivo usando saveOnFile
    saveOnFile(products);

    // Retornamos el producto actualizado
    res.status(200).json({
      message: "Producto actualizado con éxito",
      product
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
});

//
// DELETE /api/products/:pid
//
productsRoutes.delete("/:pid", async (req, res) => {
  const { pid } = req.params;
  let products = [];

  if (fs.existsSync(filePathProducts)) {
    try {
      // Si existe, leemos y parseamos el archivo
      products = JSON.parse(fs.readFileSync(filePathProducts, "utf-8"));
    } catch (error) {
      return res.status(400).json({ message: "Error al leer el archivo" });
    }
  } else {
    return res.status(404).json({ message: "No existen productos que eliminar" });
  }

  try {
    // Obtenemos el producto con el id proporcionado
    const product = products.find((product) => product.id === pid);

    // Si el producto no existe, lanzamos un error
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado", pid });
    }

    // Si existe, eliminamos el producto
    const index = products.findIndex((product) => product.id === pid);
    products.splice(index, 1);

    // Guardamos el array actualizado en el archivo usando saveOnFile
    saveOnFile(products);

    // Retornamos el producto eliminado
    res.status(200).json({
      message: "Producto eliminado con éxito",
      product
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
});