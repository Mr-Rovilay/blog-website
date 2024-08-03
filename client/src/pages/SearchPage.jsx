import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import InPageNavigation from "../components/InPageNavigation";
import Loader from "../components/Loader";
import AnimationWrapper from "../common/AnimationWrapper";
import BlogPost from "../components/BlogPost";
import NoData from "../components/NoData";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreData from "../components/LoadMoreData";
import UserCard from "../components/UserCard";

const SearchPage = () => {
  const { query } = useParams();
  const [blogs, setBlogs] = useState(null);
  const [users, setUsers] = useState(null); 

  // Debounce function to limit the rate of API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const searchBlogs = async ({ page = 1, create_new_arr = false }) => {
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

    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query });
      console.log(data.users)
      setUsers(data.users);
    } catch (error) {
      console.error(error);
    }
  };

  // Debounced version of searchBlogs
  const debouncedSearchBlogs = debounce(searchBlogs, 300);

  useEffect(() => {
    resetState();
    fetchUsers(); // Fetch users matching the query
    debouncedSearchBlogs({ page: 1, create_new_arr: true });
  }, [query]); // Re-run the effect if query changes

  const resetState = () => {
    setBlogs(null);
    setUsers(null); // Reset users state before a new request
  };

  const UserCardWrapper = () => {
    return (
      <>
        {users === null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, i) => (
     <AnimationWrapper key={i} transition={{duration:1, delay: i*0.08}}>

        <UserCard user={user}/>

    </AnimationWrapper>
    
        
          ))
        ) : (
          <NoData message="No User Found" />
        )}
      </>
    );
  };

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`search result for "${query}"`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
        >
          <>
            {blogs === null ? (
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
            <LoadMoreData state={blogs} fetchDataFun={searchBlogs} />
          </>
          <UserCardWrapper />
        </InPageNavigation>
      </div>
      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
        <h1 className="font-medium text-xl mb-8">User Related to Search <i className="fi fi-rr-user mt-1"></i> </h1>
        <UserCardWrapper />
      </div>
    </section>
  );
};

export default SearchPage;
