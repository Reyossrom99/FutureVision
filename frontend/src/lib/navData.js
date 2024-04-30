import { SlPicture, SlLayers, SlUser} from "react-icons/sl";
export const navData = [
   
    {
        id: 0,
        text: "datasets",
        link: "datasets", 
        icon: <SlPicture style={{fontSize: '16px'}}/>
    },
    {
        id: 1,
        text: "projects",
        link: "projects", 
        icon: <SlLayers style={{fontSize: '16px'}}/>
    }, 
    {
        id: 2,
        text: "profile",
        link: "user", 
        icon: <SlUser style={{fontSize: '16px'}}/>
    },
]