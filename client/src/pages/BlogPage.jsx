import { useParams } from "react-router-dom"


const BlogPage = () => {
    const {blog_id} = useParams()
  return (
    <div>BlogPage {blog_id}</div>
  )
}

export default BlogPage