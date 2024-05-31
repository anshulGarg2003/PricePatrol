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

// export const maxDuration = 60;
// export const dynamic = "force-dynamic";

// export async function GET() {
//   try {
//     connectDB();

//     const products = await Product.find({});
//     if (!products) throw new Error("No Products found");

//     const updatedProducts = await Promise.all(
//       products.map(async (currentProduct) => {
//         const scrappedProduct = await scrapeAmazonProduct(currentProduct.url);

//         if (!scrappedProduct) throw new Error("No Product found");

//         const updatedPriceHistory = [
//           ...currentProduct.priceHistory,
//           { price: scrappedProduct.currentPrice },
//         ];

//         const product = {
//           ...scrappedProduct,
//           priceHistory: updatedPriceHistory,
//           lowestPrice: getLowestPrice(updatedPriceHistory),
//           highestPrice: getHighestPrice(updatedPriceHistory),
//           averagePrice: getAveragePrice(updatedPriceHistory),
//         };

//         const updatedProduct = await Product.findOneAndUpdate(
//           { url: product.url },
//           product,
//           { upsert: true, new: true }
//         );

//         const emailNotifType = getEmailNotifType(
//           scrappedProduct,
//           currentProduct
//         );

//         if (emailNotifType && updatedProduct.users.length > 0) {
//           const productInfo = {
//             title: updatedProduct.title,
//             url: updatedProduct.url,
//           };

//           const emailContent = generateEmailBody(productInfo, emailNotifType);

//           const userEmails = updatedProduct.users.map(
//             (user: any) => user.email
//           );

//           await sendEmail(emailContent, userEmails);
//         }

//         return updatedProduct;
//       })
//     );

//     return NextResponse.json({
//       message: "Ok",
//       data: updatedProducts,
//     });
//   } catch (error) {
//     console.log("Error in GET:", error);
//   }
// }

export async function GET() {
  try {
    await connectDB(); // Ensure the DB connection is established

    const products = await Product.find({});
    if (!products) throw new Error("No Products found");

    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrappedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrappedProduct) throw new Error("No Product found");

        const priceHistory = Array.isArray(currentProduct.priceHistory)
          ? currentProduct.priceHistory
          : [];
        const updatedPriceHistory = [
          ...priceHistory,
          { price: scrappedProduct.currentPrice, date: new Date() }, // Ensure date is recorded
        ];

        const product = {
          ...scrappedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const updatedProduct = await Product.findOneAndUpdate(
          { url: product.url },
          product,
          { upsert: true, new: true }
        );

        const emailNotifType = getEmailNotifType(
          scrappedProduct,
          currentProduct
        );

        if (
          emailNotifType &&
          updatedProduct.users &&
          updatedProduct.users.length > 0
        ) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };

          const emailContent = generateEmailBody(productInfo, emailNotifType);

          const userEmails = updatedProduct.users.map(
            (user: any) => user.email
          );

          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });
  } catch (error: any) {
    console.log("Error in GET:", error);
    return NextResponse.json({
      message: "Error",
      error: error.message,
    });
  }
}
