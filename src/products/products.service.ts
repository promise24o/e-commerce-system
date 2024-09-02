import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product } from "../schemas/product.schema";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>
  ) {}

  // Create a new product with the authenticated user as the owner
  async create(
    createProductDto: CreateProductDto,
    userId: string
  ): Promise<Product> {
    const createdProduct = new this.productModel({
      ...createProductDto,
      ownerId: userId,
    });

    return createdProduct.save();
  }

  // Update a product, ensuring that only the owner can update it
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string
  ): Promise<Product> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Ensure the user requesting the update is the owner of the product
    if (product.ownerId.toString() !== userId) {
      throw new ForbiddenException(
        "You are not authorized to update this product."
      );
    }

    return this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
  }

  // Delete a product, ensuring that only the owner can delete it
  async delete(id: string, userId: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Ensure the user requesting the deletion is the owner of the product
    if (product.ownerId.toString() !== userId) {
      throw new ForbiddenException(
        "You are not authorized to delete this product."
      );
    }

    return this.productModel.findByIdAndDelete(id).exec();
  }

  // Approve or disapprove a product, only accessible by admin
  async approveProduct(id: string, isApproved: boolean): Promise<Product> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException("Product not found");
    }
    product.isApproved = isApproved;
    return product.save();
  }

  // Find all products with an optional filter for approved products
  async findAll(approvedOnly?: boolean): Promise<Product[]> {
    const query: any = {};

    if (approvedOnly !== undefined) {
      query.isApproved = approvedOnly;
    }

    return this.productModel.find(query).exec();
  }

  async findByUser(userId: string): Promise<Product[]> {
    return this.productModel.find({ ownerId: userId }).exec();
  }

  // Find a single product by its ID
  async findOne(
    id: string,
    userId: string | null,
    isAdmin: boolean = false,
    allowUnapproved: boolean = false
  ): Promise<Product | null> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Admin can access any product
    if (isAdmin) {
      return product;
    }

    const isOwner = product.ownerId.toString() === userId;

    // If the product is not approved and the user is neither admin nor owner
    if (!product.isApproved && !allowUnapproved && !isOwner) {
      throw new ForbiddenException(
        "You are not authorized to view this product."
      );
    }

    return product;
  }
}
