import { useEffect } from "react";
import { useRef, useState } from "react";

const InPageNavigation = ({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
}) => {
  let activeTabLine = useRef();
  let activeTab = useRef();
  let [InPageNavigation, setInPageNavigation] = useState(defaultActiveIndex);
  const changePageState = (btn, i) => {
    let { offsetWidth, offsetLeft } = btn;
    activeTabLine.current.style.width = offsetWidth + "px";
    activeTabLine.current.style.left = offsetLeft + "px";
    setInPageNavigation(i);
  };

  useEffect(() => {
    changePageState(activeTab.current, defaultActiveIndex);
  }, []);
  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-wrap overflow-x-auto">
        {routes.map((route, i) => {
          return (
            <button
              ref={i == defaultActiveIndex ? activeTab : null}
              key={i}
              className={
                "p-4 px-5 capitalize " +
                (InPageNavigation == i ? "text-black " : "text-dark-grey ") +
                (defaultHidden.includes(route) ? " md:hidden " : " ")
              }
              onClick={(e) => {
                changePageState(e.target, i);
              }}
            >
              {route}
            </button>
          );
        })}

        <hr ref={activeTabLine} className="absolute bottom-0 duration-300" />
      </div>
    </>
  );
};

export default InPageNavigation;
