import { useEffect, useState } from "react";
import AnimationWrapper from "../common/AnimationWrapper";
import InPageNavigation from "../components/InPageNavigation";
import axios from "axios";
import Loader from "../components/Loader";
import BlogPost from "../components/BlogPost";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);

  const fetchLatestBlog = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs");
      setBlogs(response.data.blogs);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchLatestBlog();
  }, []);
  
  return (
    <AnimationWrapper>
      <section className="h-cover h-full justify-center gap-10">
        <div className="w-full">
        <InPageNavigation
        routes={["home", "trending blog"]}
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
      </InPageNavigation>
           
        
        </div>
        {/* <div className="">filters</div> */}
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
