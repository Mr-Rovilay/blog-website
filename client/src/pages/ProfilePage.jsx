import axios from "axios"
import { useContext, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import AnimationWrapper from "../common/AnimationWrapper"
import Loader from "../components/Loader"
import { UserContext } from "../App"
import AboutUser from "../components/AboutUser"

export const profileDataStructure = {
    personal_info: {
        fullname: "",
        username: "",
        profile_img: "",
        bio: "",
    },
    account_info: {
        total_posts: 0,
        total_blogs: 0,
    },
    social_links: {
     
    },
       joinAt: " "
}

const ProfilePage = () => {
    const {id: profileId} = useParams()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(profileDataStructure)
    const {personal_info: {fullname, username: profile_username, profile_img, bio}, account_info:{total_reads, total_posts}, social_links, joinedAt} = profile
    const {userAuth:{ username } } = useContext(UserContext) 
    console.log(username, profileId)
    const fetchUserProfile = async () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
            username: profileId 
        }).then(({data: user}) => {
            setProfile(user)
            setLoading(false)
        }).catch(error => {
            console.error(error)
            setLoading(false)
        })
    }
    useEffect(() => { 
        resetState();  // Reset state before a new request
        fetchUserProfile();
    }, [profileId])

    const resetState = () => {
        setProfile(profileDataStructure)
        setLoading(true)
    }
  return (
    <AnimationWrapper>
        {
            loading ? <Loader/> :
            <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
                <div className="flex flex-col max-md:items-center gap-5 min-w-[250px]">
                    <img src={profile_img} alt={profile_username} className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"/>
                    <h1 className="text-2xl font-medium">@{profile_username}</h1>
                    <p className="text-xl capitalize h-6">{fullname}</p>
                    <p>{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads </p>
                    <div className="flex gap-4 mt-2">
                        {
                            profileId === username ?
                        <Link to={"/settings/edit-profile"} className="btn-light rounded-md">
                        Edit Profile
                        </Link> : " "
                        }
                    </div>
                    <AboutUser className="max-md:hidden" bio={bio} social_links={social_links} joinedAt={joinedAt}/>
                </div>
            </section>
        }

    </AnimationWrapper>
  )
}

export default ProfilePage