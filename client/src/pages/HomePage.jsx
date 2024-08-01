import { useEffect, useState } from "react";
import AnimationWrapper from "../common/AnimationWrapper";
import InPageNavigation, { activeTab } from "../components/InPageNavigation";
import axios from "axios";
import Loader from "../components/Loader";
import BlogPost from "../components/BlogPost";
import MinimalBlogPost from "../components/MinimalBlogPost";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const categories = ["All", "Tech", "Business", "Sport", "Health", "Science", "Entertainment", "Programming","Tourism", "World", "Economy", "Politics", "Education", "Science"];
const [pageState, setPageState] = useState("home");

  const fetchLatestBlog = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs");
      setBlogs(response.data.blogs);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTrendingBlog = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs");
      setTrendingBlogs(response.data.blogs);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    activeTab.current.click()
    if (pageState === "home") {
      fetchTrendingBlog();
    }
    if(!trendingBlogs){
      fetchLatestBlog();
    }
  }, [pageState]);

  const loadBlogByCategory = async (e) => {
    const category = e.target.innerText.toLowerCase()
    setBlogs(null);
    if (pageState === category) {
      setPageState("home")
      return;
      
    }
    setPageState(category)
  }
  
  return (
    <AnimationWrapper>
      <section className="h-cover h-full justify-center gap-10 flex">
        <div className="w-full">
        <InPageNavigation
        routes={[pageState, "trending blog"]}
        defaultHidden={["trending blog"]}
      >
        <>
          {blogs == null ? (
            <Loader />
          ) : (
            blogs.map((blog, i) => (
              <AnimationWrapper transition={{duration:1, delay:i*.1}} key={i}>
                <BlogPost content={blog} author={blog.author.personal_info} />
              </AnimationWrapper>
            ))
          )}
        </>
          {trendingBlogs == null ? (
            <Loader />
          ) : (
            trendingBlogs.map((blog, i) => (
              <AnimationWrapper transition={{duration:1, delay:i*.1}} key={i}>
                <MinimalBlogPost blog={blog} index={i}/>
              </AnimationWrapper>
            ))
          )}
      </InPageNavigation> 
        </div>
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-[#0000FF] pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div className="">
            <h1 className="font-medium text-xl mb-8">Stories from all interests</h1>
            <div className="flex gap-3 flex-wrap">
              {
                categories.map((category, i) => (
                  <button
                    key={i}
                    className={"tag " + (pageState === category ? " bg-black text-white " : " ")}
                    onClick={loadBlogByCategory}
                  >
                    {category}
                  </button>
                ))
              }
            </div>
          
          </div>
          <div className="">
            <h1 className="font-medium text-xl mb-8">Trending <i className="fi fi-rr-arrow-trend-up"></i> </h1>
            {trendingBlogs == null ? (
            <Loader />
          ) : (
            trendingBlogs.map((blog, i) => (
              <AnimationWrapper transition={{duration:1, delay:i*.1}} key={i}>
                <MinimalBlogPost blog={blog} index={i}/>
              </AnimationWrapper>
            ))
          )}
          </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
