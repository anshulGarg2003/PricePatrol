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
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await connectDB();

    const products = await Product.find({});
    if (!products) throw new Error("No product fetched");

    // SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        // Scrape product
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
        if (!scrapedProduct) return;

        const priceHistory = Array.isArray(currentProduct.priceHistory)
          ? currentProduct.priceHistory
          : [];
        const updatedPriceHistory = [
          ...priceHistory,
          { price: scrapedProduct.currentPrice, date: new Date() },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        // Update Products in DB
        const updatedProduct = await Product.findOneAndUpdate(
          { url: product.url },
          product,
          { upsert: true, new: true }
        );

        if (!updatedProduct) return;

        // CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
        const emailNotifType = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );

        if (
          emailNotifType &&
          Array.isArray(updatedProduct.users) &&
          updatedProduct.users.length > 0
        ) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };
          // Construct emailContent
          const emailContent = generateEmailBody(productInfo, emailNotifType);
          // Get array of user emails
          const userEmails = updatedProduct.users.map(
            (user: any) => user.email
          );
          // Send email notification
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts.filter(Boolean), // Filter out any undefined results
    });
  } catch (error: any) {
    console.error("Error in GET:", error);
    return NextResponse.json({
      message: "Error",
      error: error.message,
    });
  }
}
