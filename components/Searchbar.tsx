"use client";
import { scrapeAndStoreProduct } from "@/lib/actions";
import { scrapeAmazonProduct } from "@/lib/scrapper";
import React, { FormEvent, useState } from "react";

const isValidAmazonProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if (
      hostname.includes("amazon.com") ||
      hostname.includes("amazon.") ||
      hostname.endsWith("amazon")
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }
};

const Searchbar = () => {
  const [searchStr, setSearchStr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isvalidLink = isValidAmazonProductURL(searchStr);

    if (!isvalidLink) return alert("Not a Valid Link");

    try {
      setLoading(true);

      const product = await scrapeAndStoreProduct(searchStr);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchStr}
        placeholder="Enter Product Link"
        className="searchbar-input"
        onChange={(e) => setSearchStr(e.target.value)}
      />
      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchStr === "" || loading == true}
      >
        {loading ? "Searching" : "Search"}
      </button>
    </form>
  );
};

export default Searchbar;
