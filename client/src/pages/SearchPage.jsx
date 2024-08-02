import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import InPageNavigation from "../components/InPageNavigation";
import Loader from "../components/Loader";
import AnimationWrapper from "../common/AnimationWrapper";
import BlogPost from "../components/BlogPost";
import NoData from "../components/NoData";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";

const SearchPage = () => {
  let { query } = useParams();
  const [blogs, setBlogs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce function to limit the rate of API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const searchBlogs = async ({ page = 1, create_new_arr = false }) => {
    setLoading(true);
    setError(null); // Reset error state before a new request
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",
        { query, page }
      );

      const formattedData = await filterPaginationData({
        state: blogs,
        data: response.data.blogs,
        page,
        countRoute: "/search-blogs-count",
        data_to_send: { query },
        create_new_arr,
      });

      setBlogs(formattedData);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch blogs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of searchBlogs
  const debouncedSearchBlogs = debounce(searchBlogs, 300);

  useEffect(() => {
    debouncedSearchBlogs({ page: 1 });
  }, [query]); // Re-run the effect if query changes

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`search result for "${query}"`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
        >
          <>
            {loading ? (
              <Loader />
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : blogs?.results?.length ? (
              blogs.results.map((blog, i) => (
                <AnimationWrapper
                  transition={{ duration: 1, delay: i * 0.1 }}
                  key={i}
                >
                  <BlogPost content={blog} author={blog.author.personal_info} />
                </AnimationWrapper>
              ))
            ) : (
              <NoData message={"No blog Published"} />
            )}
            {/* <LoadMoreData state={blogs} fetchDataFun={searchBlogs} /> */}
          </>
        </InPageNavigation>
      </div>
    </section>
  );
};

export default SearchPage;
