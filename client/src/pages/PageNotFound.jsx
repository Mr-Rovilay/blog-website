import { Link } from "react-router-dom"
import notFound from "../imgs/404.png"
const PageNotFound = () => {
  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
        <img src={notFound} alt="" className="select-none border-2 border-grey w-72 aspect-square object-cover rounded"/>
        <h1 className="text-4xl font-gelasio leading-7">Page not Found</h1>
        <p className="text-dark-grey text-xl leading-7 -mt-4">the page you are looking for does not exist. Head back to <Link to={"/"} className="text-black underline">home page</Link></p>
        <div className="mt-auto">
            <img src="/Chelsea_FC.svg" alt="" className="h-8 object-contain block mx-auto select-none"/>
            <p className="mt-5 text-dark-grey">Read millions of football stories around the world</p>
        </div>

    </section>
  )
}

export default PageNotFound