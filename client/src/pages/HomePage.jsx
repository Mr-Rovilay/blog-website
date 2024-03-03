import AnimationWrapper from "../common/AnimationWrapper";
import InPageNavigation from "../components/InPageNavigation";

const HomePage = () => {
  return (
    <AnimationWrapper>
      <section className="h-cover h-full justify-center gap-10">
        <div className="w-full">
          <InPageNavigation
            routes={["home", "trending blog"]}
            defaultHidden={["trending blog"]}
          />
        </div>
        <div className="">hello</div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
