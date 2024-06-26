"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { extractCurrency, extractDescription, extractPrice } from "../utils";
import { Average } from "next/font/google";

dotenv.config();

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };

  try {
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();
    const currency = await extractCurrency($(".a-price-symbol"));

    const inStock =
      $(".a-size-medium.a-color-success").text().trim().toLowerCase() ==
      "in stock";
    const image =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";

    const imageUrls = Object.keys(JSON.parse(image));

    const currentPrice = await extractPrice(
      $(".priceToPay span.a-price-whole"),
      $("a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base"),
      $(".a-price-whole")
    );

    const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");
    const originalPrice = await extractPrice(
      $("span.a-price.a-text-price > span.a-offscreen:first")
    );

    const starsText = $("span.a-size-base > span.a-color-base").text().trim();
    const starsMatch = starsText.match(/[\d.]+/); // Match one or more digits or periods

    let stars = "";
    if (starsMatch) {
      stars = starsMatch[0]; // The first match is the number we want
    }

    const boughtText = $("#social-proofing-faceout-title-tk_bought span")
      .text()
      .trim();
    const boughtNumber = boughtText.split(" ")[0];

    const reviewText = $("#acrCustomerReviewText").text().trim();
    const reviewNumber = reviewText.split(" ")[0].replace(/,/g, "");

    const productDescription = $("#productDescription span").text().trim();

    const data = {
      url,
      currency: currency || "$",
      image: imageUrls,
      title,
      currentPrice: Number(currentPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      description: productDescription,
      recommend: boughtNumber,
      category: "category",
      reviewsCount: Number(reviewNumber),
      stars: Number(stars),
      isOutOfStock: inStock ? false : true,
      lowestPrice: Number(currentPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice),
    };

    // console.log(data);
    return data;
  } catch (error: any) {
    throw new Error("Error", error);
  }
}
