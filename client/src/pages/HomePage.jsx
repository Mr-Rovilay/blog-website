import { useEffect, useState } from "react";
import AnimationWrapper from "../common/AnimationWrapper";
import InPageNavigation, { activeTab } from "../components/InPageNavigation";
import axios from "axios";
import Loader from "../components/Loader";
import BlogPost from "../components/BlogPost";
import MinimalBlogPost from "../components/MinimalBlogPost";
import NoData from "../components/NoData";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreData from "../components/LoadMoreData";

const HomePage = () => {
  const [blogs, setBlogs] = useState({ results: [], totalDocs: 0, page: 1 });
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const categories = [
    "Tech", "Business", "Sport", "Health", "Science",
    "Entertainment", "Programming", "Tourism", "World",
    "Economy", "Politics", "Education"
  ];
  const [pageState, setPageState] = useState("home");

  const fetchLatestBlog = async ({ page = 1 }) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs",
        { page }
      );

      const formattedData = await filterPaginationData({
        state: blogs,
        data: response.data.blogs,
        page,
        countRoute: "/all-latest-blogs-count",
        data_to_send: {}
      });

      setBlogs(formattedData);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBlogCategory = async ({ page = 1 }) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",
        { tag: pageState, page }
      );

      const formattedData = await filterPaginationData({
        state: blogs,
        data: response.data.blogs,
        page,
        countRoute: "/search-blogs-count",
        data_to_send: { tag: pageState }
      });

      setBlogs(formattedData);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTrendingBlog = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs"
      );
      setTrendingBlogs(response.data.blogs || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeTab?.current) {
      activeTab.current.click();
    }
    if (pageState === "home") {
      fetchLatestBlog({ page: 1 });
    } else {
      fetchBlogCategory({ page: 1 });
    }
    if (!trendingBlogs.length) {
      fetchTrendingBlog();
    }
  }, [pageState]);

  const loadBlogByCategory = (e) => {
    const category = e.target.innerText.toLowerCase();
    setBlogs({ results: [], totalDocs: 0, page: 1 });
    if (pageState === category) {
      setPageState("home");
    } else {
      setPageState(category);
    }
  };

  return (
    <AnimationWrapper>
      <section className="h-cover h-full justify-center gap-10 flex">
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blog"]}
            defaultHidden={["trending blog"]}
          >
            <>
              {blogs.results.length === 0 ? (
                <Loader />
              ) : blogs.results.length ? (
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
              <LoadMoreData state={blogs} fetchDataFun={fetchLatestBlog} />
            </>
            <>
              {trendingBlogs.length === 0 ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                ))
              ) : (
                <NoData message={"No trending blogs available"} />
              )}
            </>
          </InPageNavigation>
        </div>
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div className="">
              <h1 className="font-medium text-xl mb-8">Stories from all interests</h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => (
                  <button
                    key={i}
                    className={"tag " + (pageState === category ? " bg-black text-white " : " ")}
                    onClick={loadBlogByCategory}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="">
              <h1 className="font-medium text-xl mb-8">
                Trending <i className="fi fi-rr-arrow-trend-up"></i>
              </h1>
              <>
                {trendingBlogs.length === 0 ? (
                  <Loader />
                ) : trendingBlogs.length ? (
                  trendingBlogs.map((blog, i) => (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  ))
                ) : (
                  <NoData message={"No trending blogs available"} />
                )}
              </>
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
``