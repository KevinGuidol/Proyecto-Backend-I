import { Router } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { v4 as uuid } from "uuid";
import { log } from "console";

export const productsRoutes = Router();

// Obtener el directorio actual de este archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta relativa al archivo JSON
const filePath = path.resolve(__dirname, "../db/products.json");

//
// GET /api/products
//
productsRoutes.get("/", async (req, res) => {

  if (fs.existsSync(filePath)) {
    try {
      // Si existe lo leemos y lo parseamos
      const products = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      //Retornamos los productos
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
//GET /api/products/:pid
//

productsRoutes.get("/:pid", async (req, res) => {
  const { pid } = req.params;
  try {
    // Obtenemos el producto con el id proporcionado
    const product = JSON.parse(fs.readFileSync(filePath, "utf-8")).find(
      (product) => product.id === pid
    );
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
    const products = []
    if (fs.existsSync(filePath)) {
      try {
        // Si existe lo leemos y lo parseamos redeclarando la constante
        products = JSON.parse(fs.readFileSync(filePath, "utf-8"));
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
      res.status(400).json({ message: "Ya existe un producto con ese id" }); res
      return;
    }

    // Si no existe, creamos un objeto con las propiedades
    /*     if (stock === 0) {
          status = false;
        } */
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

    // Guardamos el array actualizado en el archivo
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));

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
    const product = JSON.parse(fs.readFileSync(filePath, "utf-8")).find(
      (product) => product.id === pid
    );

    // Si el producto no existe, lanzamos un error
    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    } else {
      // Validamos que el producto no exista por code
      const products = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (products.find((prod) => prod.code === code && !product.code)) {
        res.status(400).json({ message: "Ya existe un producto con este código" });
        return;
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

    // Guardamos el array actualizado en el archivo
    try {
      productsRoutes.saveOnFile();
    } catch (error) {
      res.status(500).json({ message: "Error al guardar el producto" });
      return;
    }

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

  if (fs.existsSync(filePath)) {
    try {
      // Si existe, leemos y parseamos el archivo
      products = JSON.parse(fs.readFileSync(filePath, "utf-8"));
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

    // Guardamos el array actualizado en el archivo
    try {
      fs.writeFileSync(filePath, JSON.stringify(products));
    } catch (error) {
      return res.status(500).json({ message: "Error al guardar el archivo" });
    }

    // Retornamos el producto eliminado
    res.status(200).json({
      message: "Producto eliminado con éxito",
      product
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
});



//
// Guardar archivo
// 

productsRoutes.saveOnFile = async () => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(JSON.parse(fs.readFileSync(filePath, "utf-8")), null, 2));
  } catch (error) {
    console.error("Error al guardar el archivo:", error);
  }
};