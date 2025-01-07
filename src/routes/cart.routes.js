import { Router } from "express";
import fs from "node:fs";
import { fileURLToPath } from "url";
import path from "path";

// Router de Express
export const cartsRoutes = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define la ruta del archivo donde se guardarán los datos de los carritos
const filePathCarts = path.resolve(__dirname, "../db/carts.json");
// Ruta del archivo products.json de donde van a ser extraídos los productos a agregar.
const filePathProducts = path.resolve(__dirname, "../db/products.json");

// Función para guardar los carritos en un archivo
function saveOnFile(carts) {
  try {
    fs.writeFileSync(filePathCarts, JSON.stringify(carts, null, 2));
  } catch (error) {
    console.error("Error al guardar el archivo", error);
  }
}

// Función para cargar los carritos desde un archivo
const loadCarts = () => {
  try {
    if (fs.existsSync(filePathCarts)) {
      return JSON.parse(fs.readFileSync(filePathCarts, "utf-8"));
    }
  } catch (error) {
    console.error("Error al leer el archivo", error);
  }
  return [];
};

// Inicializa la constante llamando a la función para cargar los carritos
const carts = loadCarts();

//
// POST "/" (Crear un nuevo carrito)
//

cartsRoutes.post("/", async (req, res) => {
  try {
    const cid = carts.length > 0 ? carts[carts.length - 1].cid + 1 : 1;
    const cart = {
      cid: cid,
      products: []
    };

    carts.push(cart);

    saveOnFile(carts);

    res.status(201).json({
      message: `Carrito ${cid} creado con éxito`,
      carts
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el carrito" });
  }
});

//
// GET "/:cid" (Obtener un carrito por su cid)
//

cartsRoutes.get("/:cid", async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = carts.find((cart) => cart.cid === parseInt(cid, 10));
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el carrito" });
  }
});

//
// POST "/:cid/product/:pid" (Agregar un producto a un carrito)
//

cartsRoutes.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = carts.find((cart) => cart.cid === parseInt(cid, 10));
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // Verificamos si el producto existe en el archivo products.json
    const products = JSON.parse(fs.readFileSync(filePathProducts, "utf-8"));
    const productExists = products.find((product) => product.id === pid);

    if (!productExists) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Checkeamos si el producto ya está en el carrito
    const productInCart = cart.products.find((product) => product.pid === pid);

    if (productInCart) {
      // Si el producto ya está en el carrito, incrementa la cantidad
      productInCart.quantity++;
    } else {
      // Si el producto no está en el carrito, lo agrega con "quantity" 1
      cart.products.push({ pid: pid, quantity: 1 });
    }

    saveOnFile(carts);

    res.status(200).json({
      message: "Producto agregado al carrito",
      carts
    });
  } catch (error) {
    console.error("Error:", error); // Línea de depuración
    res.status(500).json({ message: "Error al agregar el producto al carrito" });
  }
});
