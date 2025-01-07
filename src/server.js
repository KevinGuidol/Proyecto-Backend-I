import express from 'express';
import __dirname from './dirname.js';
import { productsRoutes } from './routes/products.routes.js';
import { cartsRoutes } from './routes/cart.routes.js';
import path from 'path';

const app = express();

const PORT = 8080;

//Express config

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Public folder

app.use(express.static(path.resolve(__dirname, '../public')));

//Routes

app.use("/api/products", productsRoutes);
app.use("/carts", cartsRoutes);

//App Listener
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
