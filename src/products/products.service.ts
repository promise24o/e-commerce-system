import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  // Create a new product with the authenticated user as the owner
  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    const createdProduct = new this.productModel({
      ...createProductDto,
      ownerId: userId,  
    });

    return createdProduct.save();
  }

  // Update a product, ensuring that only the owner can update it
  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Ensure the user requesting the update is the owner of the product
    if (product.ownerId.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to update this product.');
    }

    return this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
  }

  // Delete a product, ensuring that only the owner can delete it
  async delete(id: string, userId: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Ensure the user requesting the deletion is the owner of the product
    if (product.ownerId.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to delete this product.');
    }

    return this.productModel.findByIdAndDelete(id).exec();
  }

  // Approve or disapprove a product, only accessible by admin
  async approveProduct(id: string, isApproved: boolean): Promise<Product> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.isApproved = isApproved;
    return product.save();
  }

  // Find all products with an optional filter for approved products
  async findAll(approvedOnly = true): Promise<Product[]> {
    return this.productModel.find({ isApproved: approvedOnly }).exec();
  }

  // Find a single product by its ID
  async findOne(id: string, allowUnapproved = false): Promise<Product | null> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // If the product is not approved and the caller is not allowed to view unapproved products
    if (!product.isApproved && !allowUnapproved) {
      throw new ForbiddenException('You are not authorized to view this product.');
    }

    return product;
  }

  
}
