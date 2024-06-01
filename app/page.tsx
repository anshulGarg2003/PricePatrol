import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import Searchbar from "@/components/Searchbar";
import { getAllProducts } from "@/lib/actions";
import Image from "next/image";
import React from "react";
import SendMailButton from "@/components/SendingMail";

const Home = async () => {
  const allProducts = await getAllProducts();

  return (
    <>
      <section className="px-6 md:px-20 py-10">
        <div className="flex max-md:flex-col gap-10">
          <div className="flex flex-col justify-center">
            <p className="small-text">
              Smart Shopping Starts Here:
              <Image
                src="/assets/icons/arrow-right.svg"
                alt="right-arrow"
                width={16}
                height={16}
              />
            </p>
            <h1 className="head-text">
              Harness the Power of
              <span className="text-primary"> PricePatrol</span>
            </h1>
            <p className="mt-6">
              Discover the ultimate price tracker that empowers you to monitor
              and track product prices effortlessly. Stay ahead of deals, save
              money, and make informed purchasing decisions with our powerful,
              self-serve analytics. Enhance your shopping experience today!
            </p>
            <Searchbar />
          </div>
          <HeroCarousel />
        </div>
      </section>
      <section className="trending-section">
        <h2 className="section-text">Trending</h2>
        <div className="flex justify-center w-[100%]">
          <div className="flex flex-wrap gap-x-8 gap-y-16 justify-start">
            {allProducts?.map((item) => (
              <div>
                <ProductCard key={item._id} product={item} />
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* <SendMailButton /> */}
    </>
  );
};

export default Home;
