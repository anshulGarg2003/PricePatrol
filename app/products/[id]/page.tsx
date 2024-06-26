import Modal from "@/components/Modal";
import PriceInfoCard from "@/components/PriceInfoCard";
import ProductCard from "@/components/ProductCard";
import { getProductById, getSimilarProducts } from "@/lib/actions";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

type Props = {
  params: { id: string };
};

const ProductPage = async ({ params: { id } }: Props) => {
  const product = await getProductById(id);
  const similarproduct = await getSimilarProducts(id);
  if (!product) redirect("/");

  const formatNumber = (num: number = 0) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="product-container">
      <div className="flex gap-28 xl:flex-row flex-col">
        <div key={product.title} className="flex items-center justify-center">
          <Image
            src={product.image[0]}
            alt={product.title}
            width={550}
            height={400}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
            <div className="felx flex-col gap-3">
              <p className="text-[28px] text-secondary font-semibold">
                {product.title}
              </p>
              <Link
                href={product.url}
                target="_blank"
                className="text-base text-black opacity-50"
              >
                Visit Product
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="product-hearts">
                <Image
                  src="/assets/icons/red-heart.svg"
                  alt="heart"
                  width={20}
                  height={20}
                />
                <p className="text-base font-semibold text-[#D46F77]">
                  {product.reviewCount}
                </p>
              </div>
              <div className="p-2 bg-white-200 rounded-10">
                <Image
                  src="/assets/icons/bookmark.svg"
                  alt="bookmark"
                  width={20}
                  height={20}
                />
              </div>
              <div className="p-2 bg-white-200 rounded-10">
                <Image
                  src="/assets/icons/share.svg"
                  alt="share"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>
          <div className="product-info">
            <div className="flex felx-col items-center gap-2">
              <p className="text-[34px] text-secondary font-bold">
                {product.currency} {formatNumber(product.currentPrice)}
              </p>
              <p className="text-[21px] text-balck opacity-50 line-through">
                {product.currency} {formatNumber(product.originalPrice)}
              </p>
            </div>
            <div className="flex flex-row items-center gap-4">
              <div className="flex gap-3">
                <div className="product-stars">
                  <Image
                    src="/assets/icons/star.svg"
                    alt="start"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-primary-orange font-semibold">
                    {product.stars}
                  </p>
                </div>
                <div className="product-reviews">
                  <Image
                    src="/assets/icons/comment.svg"
                    alt="comment"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-secondary font-semibold">
                    {product.reviewsCount} Reviews
                  </p>
                </div>
              </div>
              <p className="text-sm text-black opacity-50">
                <span className="text-primary-green font-semibold">
                  {product.recommend === "" ? "Many" : product.recommend}
                </span>{" "}
                of buyers have remcommend this...
              </p>
            </div>
          </div>
          <div className="my-7 flex flex-col gap-5">
            <div className="flex gap-5 felx-wrap">
              <PriceInfoCard
                title="Current Price"
                iconSrc="/assets/icons/price-tag.svg"
                value={`${product.currency} ${formatNumber(
                  product.currentPrice
                )}`}
                borderColor="#b6dbff"
              />
              <PriceInfoCard
                title="Average Price"
                iconSrc="/assets/icons/chart.svg"
                value={`${product.currency} ${formatNumber(
                  product.averagePrice
                )}`}
                borderColor="#b6dbff"
              />
              <PriceInfoCard
                title="Highest Price"
                iconSrc="/assets/icons/arrow-up.svg"
                value={`${product.currency} ${formatNumber(
                  product.highestPrice
                )}`}
                borderColor="#b6dbff"
              />
              <PriceInfoCard
                title="Lowest Price"
                iconSrc="/assets/icons/arrow-down.svg"
                value={`${product.currency} ${formatNumber(
                  product.lowestPrice
                )}`}
                borderColor="#beffc5"
              />
            </div>
          </div>
          <Modal productId={id} />
        </div>
      </div>

      <div className="flex flex-col gap-16">
        <div className=" felx flex-col gap-5 ">
          <h3 className="text-2xl text-secondary font-semibold">
            Product Description
          </h3>

          <div className="flex flex-col gap-4">{product.description}</div>
        </div>

        <button className="btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px]">
          <Image
            src="/assets/icons/bag.svg"
            alt="check"
            width={22}
            height={22}
          />
          <Link href={product.url} className="text-base text-white">
            Buy Now
          </Link>
        </button>
      </div>
      {similarproduct && similarproduct?.length > 0 && (
        <div className="py-14 flex flex-col gap-2 w-full">
          <p className="section-text">Similar Products</p>

          <div className="flex flex-wrap gap-10 mt-7 w-full">
            {similarproduct.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
