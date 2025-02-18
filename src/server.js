import express from 'express';
import { productsRoutes } from './routes/products.routes.js';
import { cartsRoutes } from './routes/cart.routes.js';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import path from 'path';
import {viewRouter} from './routes/views.routes.js';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { productModel } from './models/products.model.js';

const app = express();
const PORT = 8080;

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

//Mongoose connection

mongoose.connect('mongodb+srv://kevinguidolinkg:Kevin1234@practicaintegradora.j6qtn.mongodb.net/?retryWrites=true&w=majority&appName=practicaIntegradora')
  .then(() => {
    console.log('Conectado a la base de datos')
  })
  .catch((err) => {
    console.log('Error al conectar a la base de datos: ', err)
  })

// Routes
app.use('/api/products', productsRoutes);

app.use('/carts', cartsRoutes);

// Referencia a nuestro servidor HTTP
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Creamos nuestro servidor de WebSocket 
const io = new Server(httpServer);

// Server de WebSocket
io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado" + socket.id);

  socket.on("newProduct", async (productData) => {
    try {
      const products = await productModel.find({});
      const newProduct = {
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
