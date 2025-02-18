import { productModel } from "../models/products.model.js";

class productsService {
  async getAll() {
    return await productModel.find({});
  }
  async getById(id) {
    return await productModel.findById(id);
  }

  async create({title, price, description, category, code, status, stock}) {
    const product = new productModel({
      title,
      price,
      description,
      category,
      code,
      status: status !== undefined ? status : true,
      stock
    });
    return await product.save();
  }

  async update({id, title, price, description, category, code, status, stock}) {
    const updatedProduct = await productModel.findByIdAndUpdate(id, {
      title,
      price,
      description,
      category,
      code,
      status: status !== undefined ? status : true,
      stock
    }, { new: true });
    return updatedProduct;
  }

  async delete ({id}) {
    return await productModel.findByIdAndDelete(id);
  }

  async getPaginate({page = 1, limit = 10}) {
    const options = {
      page,
      limit,
    };
    return await productModel.paginate({}, options);
  }
}

export const productsService = new ProductsService();