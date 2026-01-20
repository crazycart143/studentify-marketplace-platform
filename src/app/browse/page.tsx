import { createClient } from "@/lib/supabase-server";
import ListingCard from "@/components/ListingCard";
import { Search, Filter, SlidersHorizontal, PackageSearch, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Marketplace | Studentify",
  description: "Explore thousands of premium student listings. Search and filter to find exactly what you need.",
};

const CATEGORIES = [
  "All Categories", "Electronics", "Fashion", "Home & Garden", "Sports & Outdoors", 
  "Collectibles", "Books & Media", "Automotive", "Other"
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : "";
  const category = typeof params.category === 'string' ? params.category : "All Categories";
  const minPrice = typeof params.min === 'string' ? params.min : "";
  const maxPrice = typeof params.max === 'string' ? params.max : "";
  const sort = typeof params.sort === 'string' ? params.sort : "newest";
  
  const supabase = await createClient();

  let listingsQuery = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active');

  if (query) {
    listingsQuery = listingsQuery.ilike('title', `%${query}%`);
  }

  if (category && category !== "All Categories") {
    listingsQuery = listingsQuery.eq('category', category);
  }

  if (minPrice) {
    listingsQuery = listingsQuery.gte('price', parseFloat(minPrice));
  }
  if (maxPrice) {
    listingsQuery = listingsQuery.lte('price', parseFloat(maxPrice));
  }

  // Sorting logic
  if (sort === 'price_asc') {
    listingsQuery = listingsQuery.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    listingsQuery = listingsQuery.order('price', { ascending: false });
  } else {
    listingsQuery = listingsQuery.order('created_at', { ascending: false });
  }

  const { data: listings } = await listingsQuery;

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-20 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="max-w-xl text-left">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Explore the <span className="text-indigo-600">Market</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Discover unique items from trusted sellers curated for you.
            </p>
          </div>

          {/* Search Bar */}
          <form className="relative w-full lg:max-w-md group" action="/browse">
            <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
            <div className="relative bg-white border border-slate-200 rounded-[24px] p-2 shadow-sm flex items-center">
              <Search className="ml-4 text-slate-400 w-5 h-5" />
              <input 
                name="q"
                type="text" 
                defaultValue={query}
                placeholder="Search listings..." 
                className="w-full px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 font-medium"
              />
              <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                Search
              </button>
            </div>
            {category !== "All Categories" && <input type="hidden" name="category" value={category} />}
            {minPrice && <input type="hidden" name="min" value={minPrice} />}
            {maxPrice && <input type="hidden" name="max" value={maxPrice} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-10 text-left">
            {/* Sort Dropdown (Mobile visible) */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center space-x-2 mb-6">
                <ArrowUpDown className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Sort By</h2>
              </div>
              <div className="space-y-2">
                {SORT_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={`/browse?${query ? `q=${query}&` : ''}category=${category}&sort=${opt.value}${minPrice ? `&min=${minPrice}` : ''}${maxPrice ? `&max=${maxPrice}` : ''}`}
                    className={`block w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      sort === opt.value
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Categories</h2>
              </div>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/browse?${query ? `q=${query}&` : ''}category=${cat}${sort !== 'newest' ? `&sort=${sort}` : ''}${minPrice ? `&min=${minPrice}` : ''}${maxPrice ? `&max=${maxPrice}` : ''}`}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                      category === cat
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                        : "bg-white text-slate-500 border-slate-100 hover:border-indigo-100 hover:text-indigo-600"
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center space-x-2 mb-6">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Price Range</h2>
              </div>
              <form action="/browse" className="space-y-4">
                <input type="hidden" name="q" value={query} />
                <input type="hidden" name="category" value={category} />
                <input type="hidden" name="sort" value={sort} />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    name="min"
                    type="number" 
                    placeholder="Min" 
                    defaultValue={minPrice}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                  />
                  <input 
                    name="max"
                    type="number" 
                    placeholder="Max" 
                    defaultValue={maxPrice}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                  />
                </div>
                <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">
                  Apply Price
                </button>
                {(minPrice || maxPrice) && (
                  <Link href={`/browse?q=${query}&category=${category}&sort=${sort}`} className="block text-center text-xs font-bold text-indigo-600 mt-2">
                    Clear Price
                  </Link>
                )}
              </form>
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {!listings || listings.length === 0 ? (
              <div className="bg-white rounded-[40px] px-8 py-24 text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm">
                  <PackageSearch className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">No results found</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">
                  We couldn't find any listings matching your search criteria. Try a different keyword or category.
                </p>
                <Link href="/browse" className="mt-8 inline-block px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100">
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
