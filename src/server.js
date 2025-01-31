import express from 'express';
import __dirname from './utils.js';
import handlebars from 'express-handlebars';
import { productsRoutes } from './routes/products.routes.js';
import { cartsRoutes } from './routes/cart.routes.js';
import path from 'path';
import { Server } from 'socket.io';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from "url";

const app = express();

const PORT = 8080;

// Definimos el path al archivo de productos
const __filename = fileURLToPath(import.meta.url);
const __dirnamePath = path.dirname(__filename);
const filePathProducts = path.resolve(__dirnamePath, "./db/products.json");

// Definimos la función saveOnFile
function saveOnFile(products) {
  try {
    fs.writeFileSync(filePathProducts, JSON.stringify(products, null, 2));
  } catch (error) {
    throw new Error('Error al guardar el archivo');
  }
}

// Express config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Handlebars config
app.engine(
  'hbs',
  handlebars.engine({
    defaultLayout: 'main',
    extname: '.hbs',
  })
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Routes
app.use('/', productsRoutes);

app.use('/carts', cartsRoutes);

// Referencia a nuestro servidor HTTP
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Creamos nuestro servidor de WebSocket 
const io = new Server(httpServer);

// Server de WebSocket
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado" + socket.id);

  socket.on("newProduct", (productData) => {
    try {
      // Leer productos desde el archivo
      const products = JSON.parse(fs.readFileSync(filePathProducts, "utf-8")) || [];
      const newProduct = {
        id: uuid(),
        title: productData.title,
        price: productData.price,
        category: productData.category,
        stock: productData.stock
      };
      products.push(newProduct);
      saveOnFile(products);
      io.emit("updateProducts", products);
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  });

  socket.on("deleteProduct", (id) => {
    try {
      let products = JSON.parse(fs.readFileSync(filePathProducts, "utf-8")) || [];
      products = products.filter(product => product.id !== id);
      saveOnFile(products);
      io.emit("updateProducts", products);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  });
});
