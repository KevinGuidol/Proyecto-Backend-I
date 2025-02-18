import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: 'Sin descripción' },
  price: { type: Number, required: true },
  category: { type: String, default: 'Otros' },
  code: { type: Number, required: true, unique: true },
  thumbnails: [{ type: String, required: true }],
  status: { type: Boolean, required: true, default: true },
  stock: { type: Number, required: true, default: 0 },
});

productSchema.plugin(mongoosePaginate);

export const productModel = model('Product', productSchema);