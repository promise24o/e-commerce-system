import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/enums/role.enum";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ApproveProductDto } from "./dto/approve-product.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Authenticated users can create products
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: any
  ) {
    const userId = req.user.userId;
    return this.productsService.create(createProductDto, userId);
  }

  // Authenticated users can update their own products
  @Put(":id")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any
  ) {
    const userId = req.user.userId; // Extract userId from JWT
    const product = await this.productsService.findOne(id, true);

    // Ensure that only the owner can update their product
    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    if (product.ownerId.toString() !== userId) {
      throw new ForbiddenException(
        "You are not allowed to update this product."
      );
    }

    return this.productsService.update(id, updateProductDto, userId);
  }

  // Authenticated users can delete their own products
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async delete(@Param("id") id: string, @Request() req: any) {
    const userId = req.user.userId; // Extract userId from JWT
    const product = await this.productsService.findOne(id, true);

    // Ensure that only the owner can delete their product
    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    if (product.ownerId.toString() !== userId) {
      throw new ForbiddenException(
        "You are not allowed to delete this product."
      );
    }

    return this.productsService.delete(id, userId);
  }

  @Put(":id/approve")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async approveProduct(
    @Param("id") id: string,
    @Body() approveProductDto: ApproveProductDto
  ) {
    return this.productsService.approveProduct(
      id,
      approveProductDto.isApproved
    );
  }

  // Unauthenticated and authenticated users can view all approved products
  @Get()
  async findAll(@Query("approved") approved: string, @Request() req: any) {
    const isAuthenticated = req.user && req.user.userId;
    const approvedAsBoolean = approved === "true";

    if (approvedAsBoolean && !isAuthenticated) {
      // If not authenticated and requesting approved products
      return this.productsService.findAll(true);
    }

    if (!approvedAsBoolean && isAuthenticated) {
      // If authenticated and requesting non-approved products (admin or owner)
      return this.productsService.findAll(false);
    }

    // Default case: return only approved products if authenticated or not
    return this.productsService.findAll(true);
  }

  // Unauthenticated and authenticated users can view a single approved product
  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req: any) {
    const isAuthenticated = req.user && req.user.userId;
    const userId = isAuthenticated ? req.user.userId : null;
    const product = await this.productsService.findOne(id);

    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    // Allow owners to view their products regardless of approval status
    if (product.ownerId.toString() === userId) {
      return product;
    }

    // Forbid access if the product is not approved and the user is not authenticated
    if (!product.isApproved && !isAuthenticated) {
      throw new ForbiddenException(
        "You are not authorized to view this product."
      );
    }

    return product;
  }
}
