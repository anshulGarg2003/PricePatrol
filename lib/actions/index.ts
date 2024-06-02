"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/productModels";
import { connectDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scrapper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../NodeMailer";

export async function scrapeAndStoreProduct(productURL: string) {
  if (!productURL) return;

  try {
    console.log("Calling connectDB...");
    await connectDB();

    const scrapedProduct = await scrapeAmazonProduct(productURL);
    if (!scrapedProduct) return;

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: await getLowestPrice(updatedPriceHistory),
        highestPrice: await getHighestPrice(updatedPriceHistory),
        averagePrice: await getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: product.url },
      product,
      { upsert: true, new: true, runValidators: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    console.error("Failed to create/Update Products:", error);
  }
}

export async function getProductById(productId: string) {
  try {
    await connectDB();

    const product = await Product.findOne({ _id: productId });

    return product;
  } catch (error) {}
}

export async function getAllProducts() {
  try {
    connectDB();

    const AllProducts = await Product.find();

    return AllProducts;
  } catch (error) {
    console.log("Error in fetching the products", error);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    await connectDB(); // Ensure the DB connection is established

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId }, // $ne is the correct operator to exclude the current product
      category: currentProduct.category, // Assuming similar products are in the same category
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log("Error in fetching the products", error);
  }
}

export async function addUserEmailToProduct(
  productId: string,
  userEmail: string
) {
  try {
    const product = await Product.findById(productId);
    if (!product) return;

    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    );

    if (!userExists) {
      product.users.push({ email: userEmail });
      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");
      console.log("Start");
      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log("Error while sending email to user", error);
  }
}

export async function cronProduct() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Ensure your base URL is correct
  const response = await fetch(`${baseUrl}/api/cron`, {
    method: "GET", // Specify method if needed
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  return response.json(); // Assuming the API returns JSON
}
