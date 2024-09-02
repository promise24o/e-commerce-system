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
  Request,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Product } from "src/schemas/product.schema";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/enums/role.enum";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ApproveProductDto } from "./dto/approve-product.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@ApiBearerAuth()
@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: "Create a product" })
  @ApiResponse({
    status: 201,
    description: "The product has been successfully created.",
    type: Product,
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: any
  ) {
    const userId = req.user.userId;
    return this.productsService.create(createProductDto, userId);
  }

  @ApiOperation({ summary: "Update a product" })
  @ApiResponse({
    status: 200,
    description: "The product has been successfully updated.",
    type: Product,
  })
  @ApiResponse({ status: 404, description: "Product not found." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard)
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any
  ) {
    const userId = req.user.userId;
    const product = await this.productsService.findOne(id, userId, true);

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

  @ApiOperation({ summary: "Delete a product" })
  @ApiResponse({
    status: 200,
    description: "The product has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Product not found." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async delete(@Param("id") id: string, @Request() req: any) {
    const userId = req.user.userId;
    const product = await this.productsService.findOne(id, userId, true);

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

  @ApiOperation({ summary: "Approve or disapprove a product" })
  @ApiResponse({
    status: 200,
    description: "The product has been successfully approved or disapproved.",
    type: Product,
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Put(":id/approve")
  async approveProduct(
    @Param("id") id: string,
    @Body() approveProductDto: ApproveProductDto
  ) {
    return this.productsService.approveProduct(
      id,
      approveProductDto.isApproved
    );
  }

  @ApiOperation({ summary: "Find all products" })
  @ApiResponse({
    status: 200,
    description: "List of products.",
    type: [Product],
  })
  @Get("public")
  async findAllPublic() {
    return this.productsService.findAll(true);
  }

  @ApiOperation({
    summary: "Find all products with optional filter for approved products",
  })
  @ApiResponse({
    status: 200,
    description: "List of products.",
    type: [Product],
  })
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    const user = req.user;
    const isAdmin = user && user.role === "admin";

    if (isAdmin) {
      return this.productsService.findAll();
    }

    const userId = user?.userId;
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.productsService.findByUser(userId);
  }

  @ApiOperation({ summary: "Find a single product by ID" })
  @ApiResponse({
    status: 200,
    description: "The product details.",
    type: Product,
  })
  @ApiResponse({ status: 404, description: "Product not found." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async findOne(@Param("id") id: string, @Request() req: any) {
    const user = req.user;
    const userId = user ? user.userId : null;
    const isAdmin = user && user.role === Role.Admin; // Check if user is an admin

    // Fetch product with additional check for admin role
    const product = await this.productsService.findOne(id, userId, isAdmin, false);

    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    // Admin can access any product
    if (isAdmin) {
      return product;
    }

    // If the user is the owner of the product, they can view it regardless of its approval status
    if (product.ownerId.toString() === userId) {
      return product;
    }

    // If the user is not the owner, check if the product is approved
    if (!product.isApproved) {
      throw new ForbiddenException(
        "You are not authorized to view this product."
      );
    }

    return product;
  }
}
