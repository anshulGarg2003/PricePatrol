import { generateEmailBody, sendEmail } from "@/lib/NodeMailer";
import Product from "@/lib/models/productModels";
import { connectDB } from "@/lib/mongoose";
import { scrapeAmazonProduct } from "@/lib/scrapper";
import {
  getAveragePrice,
  getEmailNotifType,
  getHighestPrice,
  getLowestPrice,
} from "@/lib/utils";
import { User } from "@/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await connectDB();

    const products = await Product.find();
    if (!products) throw new Error("No product fetched");

    // SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct, index) => {
        try {
          // Scrape product
          const scrapedProduct = await scrapeAmazonProduct(currentProduct?.url);
          if (!scrapedProduct) {
            console.warn(`Product scrape failed for ${currentProduct?.url}`);
            return;
          }
          // console.log(currentProduct);

          const priceHistory = Array.isArray(currentProduct.priceHistory)
            ? currentProduct?.priceHistory
            : [];
          const updatedPriceHistory = [
            ...priceHistory,
            { price: scrapedProduct.currentPrice, date: new Date() },
          ];

          const product = {
            ...scrapedProduct,
            priceHistory: updatedPriceHistory,
            lowestPrice: await getLowestPrice(updatedPriceHistory),
            highestPrice: await getHighestPrice(updatedPriceHistory),
            averagePrice: await getAveragePrice(updatedPriceHistory),
          };

          // Update Product in DB
          const updatedProduct = await Product.findOneAndUpdate(
            { url: product.url },
            product,
            { upsert: true, new: true, runValidators: true }
          );

          if (!updatedProduct) {
            throw new Error("Failed to update product");
          }

          if (!updatedProduct) {
            console.warn(`Product update failed for ${product?.url}`);
            return;
          }
          // console.log(updatedProduct);
          // CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
          const emailNotifType = await getEmailNotifType(
            scrapedProduct,
            updatedProduct
          );

          if (
            emailNotifType &&
            Array.isArray(updatedProduct.users) &&
            updatedProduct?.users?.length > 0
          ) {
            const productInfo = {
              title: updatedProduct?.title,
              url: updatedProduct?.url,
            };
            // Construct emailContent
            const emailContent = await generateEmailBody(
              productInfo,
              emailNotifType
            );
            //  Get array of user emails
            const userEmails = updatedProduct?.users?.map(
              (user: User) => user?.email
            );
            // Send email notification
            await sendEmail(emailContent, userEmails);
          }

          // console.log(updatedProduct);
          return updatedProduct;
        } catch (innerError) {
          console.error(`Error processing product at index ${index}:`);
          return null;
        }
      })
    );

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts, // Filter out any undefined or null results
    });
  } catch (error: any) {
    console.error("Error in GET:", error);
    throw new error("Error while executing", error);
  }
}
